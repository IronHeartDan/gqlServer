const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

//Models
const userModel = require("../models/UserModel");
const connectionModel = require("../models/ConnectionModel");
const postModel = require("../models/PostModel");

//Connect To DB
async function connectDB() {
  let dbConnection = null;
  dbConnection = await mongoose.connect(
    "mongodb+srv://inevitable:Danish1915.@cluster0.vcqka.mongodb.net/database?retryWrites=true&w=majority"
  );
  return dbConnection;
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

async function getConnection(data) {
  let connection = connectionModel(data.connection);
  return connection;
}

async function getFollowers(userId, skip, limit) {
  let connections = await connectionModel.aggregate([
    {
      $match: {
        userId: new ObjectId(`${userId}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "who",
        foreignField: "_id",
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

async function getFollowings(userId, skip, limit) {
  let connections = await connectionModel.aggregate([
    {
      $match: {
        who: `${userId}`,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
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

async function getUserHomePosts(userId) {
  let posts = await connectionModel.aggregate([
    {
      $match: {
        who: new ObjectId(userId),
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          userId: "$userId",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetail",
      },
    },
    {
      $unwind: {
        path: "$userDetail",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$userDetail",
      },
    },
    {
      $project: {
        userName: 1,
        userEmail: 1,
      },
    },
    {
      $unionWith: {
        coll: "users",
        pipeline: [
          {
            $match: {
              _id: new ObjectId(userId),
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                _id: "$_id",
                userName: "$userName",
                userEmail: "$userEmail",
              },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts",
      },
    },
    {
      $unwind: {
        path: "$posts",
      },
    },
    {
      $set: {
        posts: {
          userName: "$userName",
          userEmail: "$userEmail",
        },
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

module.exports = {
  connectDB,
  setUser,
  getUser,
  setConnection,
  getFollowers,
  getFollowings,
  addPost,
  getUserPosts,
  getUserHomePosts,
};
