const { rule, shield } = require('graphql-shield')
const { getUserId } = require('../utils')

const rules = {
  isAuthenticatedUser: rule()((_parent, _args, ctx) => {
    const userId = getUserId(ctx);
    return Boolean(userId);
  }),
  isPostOwner: rule()(async (_parent, { id }, ctx) => {
    const userId = getUserId(ctx);
    const author = await ctx.prisma.post
      .findOne({ where: { id: Number(id) } })
      .author();
    return userId === author.id;
  }),
}

const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser,
    filterPosts: rules.isAuthenticatedUser,
    post: rules.isAuthenticatedUser,
  },
  Mutation: {
    createDraft: rules.isAuthenticatedUser,
    deletePost: rules.isPostOwner,
    publish: rules.isPostOwner,
  },
});

module.exports = {
  permissions,
};
