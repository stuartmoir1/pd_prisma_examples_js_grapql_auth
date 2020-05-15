const { objectType } = require('nexus');

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.name()
    t.model.posts(({ pagination: false }))
  }
});

module.exports = {
  User
};
