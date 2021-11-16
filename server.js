// Server
const express = require("express");
const http = require("http");
const app = express();
const httpServer = http.createServer(app);
const mongoose = require("mongoose");

// Apollo
const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");

//Models
const userModel = require("./models/UserModel");
const connectionModel = require("./models/ConnectionModel");
const postModel = require("./models/PostModel");

//gql
const typeDefs = require("./gql/typeDefs");
const resolvers = require("./gql/resolvers");

var dbConnection = null;

connectDB();

//Connect To DB
async function connectDB() {
  try {
    dbConnection = await mongoose.connect(
      "mongodb+srv://inevitable:Danish1915.@cluster0.vcqka.mongodb.net/database?retryWrites=true&w=majority"
    );
  } catch (error) {
    console.error(error);
  }
  if (dbConnection) {
    try {
      setUpGql();
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log(`Err:${dbConnection}`);
  }
}

//Functions

//UserModel Functions

async function setUser(data) {
  let user = new userModel(data.user);
  await user.save();
  return user;
}

async function getUser(userName) {
  let user = await userModel.find({ userName: userName });
  return user[0];
}

//Connection Model Functions

async function setConnection(data) {
  let connection = new connectionModel(data.connection);
  await connection.save();
  return connection;
}

async function getFollowers(userName, skip, limit) {
  let connections = await connectionModel.aggregate([
    {
      $match: {
        userName: `${userName}`,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "who",
        foreignField: "userName",
        as: "userDetail",
      },
    },
    {
      $unwind: {
        path: "$userDetail",
      },
    },
    {
      $project: {
        "userDetail.userName": 1,
        "userDetail.userEmail": 1,
      },
    },
    {
      $addFields: {
        "userDetail._id": "$_id",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$userDetail",
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);
  return connections;
}

async function getFollowings(userName, skip, limit) {
  let connections = await connectionModel.aggregate([
    {
      $match: {
        who: `${userName}`,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userName",
        foreignField: "userName",
        as: "userDetail",
      },
    },
    {
      $unwind: {
        path: "$userDetail",
      },
    },
    {
      $project: {
        "userDetail.userName": 1,
        "userDetail.userEmail": 1,
      },
    },
    {
      $addFields: {
        "userDetail._id": "$_id",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$userDetail",
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);
  return connections;
}

// Post Methods

async function addPost(data) {
  let post = await new postModel(data.post);
  await post.save();
  return post;
}

async function getUserPosts(userName) {
  let posts = await postModel.find({ userName: userName });
  return posts;
}

async function getUserHomePosts(userName) {
  let posts = await connectionModel.aggregate([
    {
      $match: {
        who: `${userName}`,
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          userName: "$userName",
        },
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "userName",
        foreignField: "userName",
        as: "posts",
      },
    },
    {
      $unwind: {
        path: "$posts",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$posts",
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
  ]);

  return posts;
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
