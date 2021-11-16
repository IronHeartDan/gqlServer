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
    setUpGql();
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

  const typeDefs = gql`
    input UserInput {
      userEmail: String!
      userPhone: String!
      userName: String!
      profilepicture: String
      bio: String
      visibility: Int
      deviceToken: [String]
      postCount: Int
      followerCount: Int
      followingCount: Int
    }

    input ConnectionInput {
      userName: String!
      who: String!
    }

    input PostInput {
      userName: String!
      caption: String
      hashTags: [String]
      type: Int!
      data: String!
    }

    type User {
      _id: String!
      userEmail: String
      userName: String
    }

    type Connection {
      _id: String!
      userName: String!
    }

    type Post {
      userName: String!
      likeCount: Int!
      commentCount: Int!
      caption: String
      hashTags: [String]
      type: Int!
      data: String!
    }

    type Query {
      user(userName: String!): User
      followers(userName: String!, skip: Int = 0, limit: Int = 2): [Connection]
      followings(userName: String!, skip: Int = 0, limit: Int = 2): [Connection]
      userPosts(userName: String!): [Post]
      homePosts(userName: String!): [Post]
    }

    type Mutation {
      insertUser(user: UserInput!): User
      followUser(connection: ConnectionInput!): Connection
      insertPost(post: PostInput!): Post
    }
  `;

  const resolvers = {
    Query: {
      user(parent, args, context, info) {
        console.log(parent);
        console.log(context);
        console.log(info);
        return getUser(args.userName);
      },

      followers(parent, args, context, info) {
        return getFollowers(args.userName, args.skip, args.limit);
      },

      followings(parent, args, context, info) {
        return getFollowings(args.userName, args.skip, args.limit);
      },

      userPosts(parent, args, context, info) {
        return getUserPosts(args.userName);
      },

      homePosts(parent, args, context, info) {
        return getUserHomePosts(args.userName);
      },
    },
  };

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
