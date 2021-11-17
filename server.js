// Server
const express = require("express");
const http = require("http");
const app = express();
const httpServer = http.createServer(app);

// Apollo
const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");

//gql
const typeDefs = require("./gql/typeDefs");
const resolvers = require("./gql/resolvers");

//Mongoose
const { connectDB, getUser } = require("./mongoose/DbOperations");

if (connectDB()) {
  setUpGql();
} else {
  console.log("Problem");
}


// Start Server
async function setUpGql() {
  app.get("/", (req, res) => {
    res.status(200).send("Server...");
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
