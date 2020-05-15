const { mutationType, stringArg, idArg } = require('nexus');
const { compare, hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');

const { APP_SECRET, getUserId } = require('../utils');

const Mutation = mutationType({
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        name: stringArg({ nullable: true }),
        email: stringArg(),
        password: stringArg()
      },
      resolve: async (_parent, { name, email, password }, ctx) => {
        const hashedPassword = await hash(password, 10)
        const user = await ctx.prisma.user.create({
          data: { name, email,
            password: hashedPassword
          }
        })
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user
        }
      }
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: stringArg(),
        password: stringArg()
      },
      resolve: async (_parent, { email, password }, ctx) => {
        const user = await ctx.prisma.user.findOne({
          where: { email }
        })
        if (!user) throw new Error(`No user for email: ${email}`)
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) throw new Error('Invalid password')
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user
        }
      }
    })

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        content: stringArg({ nullable: true })
      },
      resolve: (_parent, { title, content }, ctx) => {
        const userId = getUserId(ctx)
        return ctx.prisma.post.create({
          data: { title, content,
            published: false,
            author: { connect: { id: Number(userId) } }
          }
        })
      }
    })

    t.field('deletePost', {
      type: 'Post',
      nullable: true,
      args: { id: idArg() },
      resolve: (_parent, { id }, ctx) => {
        return ctx.prisma.post.delete({
          where: { id: Number(id) }
        })
      }
    })

    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: { id: idArg() },
      resolve: (_parent, { id }, ctx) => {
        return ctx.prisma.post.update({
          where: { id: Number(id) },
          data: { published: true }
        })
      }
    })
  }
});

module.exports = {
  Mutation
};
