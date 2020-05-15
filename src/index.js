const { GraphQLServer } = require('graphql-yoga');
const { PrismaClient } = require('@prisma/client');
const { makeSchema } = require('nexus');
const { nexusPrismaPlugin } = require('nexus-prisma');

const { permissions } = require('./permissions');
const types = require('./types');

const prisma = new PrismaClient();

const schema = makeSchema({
  types,
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts'
  }
});

new GraphQLServer({
  schema,
  middleswares: [permissions],
  context: request => ({ ...request, prisma })
}).start(() => console.log('Server ready at: http://localhost:4000'));
