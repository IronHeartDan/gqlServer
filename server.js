// Server
const express = require("express");
const app = express();
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

//Models
const userModel = require("./models/UserModel");
const connectionModel = require("./models/ConnectionModel");
const postModel = require("./models/PostModel");

var dbConnection = null;

connectDB();

//Connect To DB
async function connectDB() {
  dbConnection = await mongoose.connect(
    "mongodb+srv://inevitable:Danish1915.@cluster0.vcqka.mongodb.net/database?retryWrites=true&w=majority"
  );
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

async function getFollowing(userName, skip, limit) {
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
  let schema = buildSchema(`
input UserInput{
    userEmail:String!
    userPhone:String!
    userName: String!
    profilepicture:String
    bio:String
    visibility:Int
    deviceToken:[String]
    postCount:Int
    followerCount:Int
    followingCount:Int
}

input ConnectionInput{
  userName:String!
  who: String!
}


input PostInput{
  userName:String!
  caption:String
  hashTags:[String]
  type:Int!
  data:String!
}

type User{
  _id:String!,
  userEmail:String
  userName: String
}

type Connection{
  _id:String!
  userName:String!
}

type Post{
  userName:String!
  likeCount:Int!
  commentCount:Int!
  caption:String
  hashTags:[String]
  type:Int!
  data:String!
}

type Query{
    user(userName:String!):User
    followers(userName:String!,skip:Int=0,limit:Int=2):[Connection]
    following(userName:String!,skip:Int=0,limit:Int=2):[Connection]
    userPosts(userName:String!):[Post]
    homePosts(userName:String!):[Post]
}

type Mutation{
  insertUser(user:UserInput!):User
  followUser(connection:ConnectionInput!):Connection
  insertPost(post:PostInput!):Post
}
`);

  let root = {
    user: ({ userName }) => getUser(userName),
    insertUser: (data) => setUser(data),
    followUser: (data) => setConnection(data),
    followers: ({ userName, skip, limit }) =>
      getFollowers(userName, skip, limit),
    following: ({ userName, skip, limit }) =>
      getFollowing(userName, skip, limit),
    insertPost: (post) => addPost(post),
    userPosts: ({ userName }) => getUserPosts(userName),
    homePosts: ({ userName }) => getUserHomePosts(userName),
  };

  app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
    })
  );

  app.listen(4000, () => console.log("Now browse to localhost:4000/graphql"));
}
