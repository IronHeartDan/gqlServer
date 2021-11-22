// Server
const express = require("express");
const http = require("http");
const app = express();
const httpServer = http.createServer(app);

// Apollo
const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");

//gql
const typeDefs = require("./gql/typeDefs");
const resolvers = require("./gql/resolvers");
 
//Mongoose
const { connectDB } = require("./mongoose/DbOperations");


connectDB()
  .then((connection) => {
    startServer();
  })
  .catch((err) => {
    console.error(err);
  });

// Start Server
async function startServer() {
  app.get("/", (req, res) => {
    res.status(200).send("Server...");
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    }
  );

  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
