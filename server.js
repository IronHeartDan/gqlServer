// Server
const express = require("express");
const http = require("http");
const app = express();
const httpServer = http.createServer(app);


// Apollo
const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const  { execute, subscribe } =  require('graphql');
const { SubscriptionServer } =  require('subscriptions-transport-ws');
const { makeExecutableSchema } =  require('@graphql-tools/schema');

//gql
const typeDefs = require("./gql/typeDefs");
const resolvers = require("./gql/resolvers");

//Mongoose
const { connectDB } = require("./mongoose/DbOperations");

if (connectDB()) {
  startServer();
} else {
  console.log("Problem");
}

// Start Server
async function startServer() {
  app.get("/", (req, res) => {
    res.status(200).send("Server...");
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  const subscriptionServer = SubscriptionServer.create({
    // This is the `schema` we just created.
    schema,
    // These are imported from `graphql`.
    execute,
    subscribe,
 }, {
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // This `server` is the instance returned from `new ApolloServer`.
    path: server.graphqlPath,
 });

  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
