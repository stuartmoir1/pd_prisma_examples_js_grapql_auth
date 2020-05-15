const { queryType, stringArg, idArg } = require('nexus');
const { getUserId } = require('../utils');

const Query = queryType({
  definition(t) {
    t.field('me', {
      type: 'User',
      nullable: true,
      resolve: (_parent, _args, ctx) => {
        const userId = getUserId(ctx)
        return ctx.prisma.user.findOne({
          where: { id: userId }
        })
      }
    })

    t.list.field('feed', {
      type: 'Post',
      resolve: (_parent, _args, ctx) => {
        return ctx.prisma.post.findMany({
          where: { published: true }
        })
      }
    })

    t.list.field('filterPosts', {
      type: 'Post',
      args: {
        searchString: stringArg({ nullable: true })
      },
      resolve: (_parent, { searchString }, ctx) => {
        return ctx.prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: searchString } },
              { content: { contains: searchString } }
            ]
          }
        })
      }
    })

    t.field('post', {
      type: 'Post',
      nullable: true,
      args: {
        id: idArg()
      },
      resolve: (_parent, { id }, ctx ) => {
        return ctx.prisma.post.findOne({
          where: { id: Number(id) }
        })
      }
    })
  }
});

module.exports = {
  Query
};
