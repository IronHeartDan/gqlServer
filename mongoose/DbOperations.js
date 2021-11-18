const mongoose = require("mongoose");

//Models
const userModel = require("../models/UserModel");
const connectionModel = require("../models/ConnectionModel");
const postModel = require("../models/PostModel");

//Connect To DB
async function connectDB() {
  let dbConnection = null;
  try {
    dbConnection = await mongoose.connect(
      "mongodb+srv://inevitable:Danish1915.@cluster0.vcqka.mongodb.net/database?retryWrites=true&w=majority"
    );
  } catch (error) {
    console.error(error);
  }

  if (dbConnection) {
    return dbConnection;
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
      $unionWith: {
        coll: "users",
        pipeline: [
          {
            $match: {
              userName: "darknoon",
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                userName: "$userName",
              },
            },
          },
        ],
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
