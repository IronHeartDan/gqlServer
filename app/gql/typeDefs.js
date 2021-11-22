const { gql } = require("apollo-server-core");

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
    userId: String!
    who: String!
  }

  input PostInput {
    userId: String!
    caption: String
    hashTags: [String]
    type: Int!
    data: String!
  }

  input LikerInput {
    postId: String!
    who: String!
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
    userEmail: String!
    userId: String!
    likeCount: Int!
    commentCount: Int!
    caption: String
    hashTags: [String]
    type: Int!
    data: String!
  }

  type Liker {
    _id: String!
    who: String!
  }

  type Query {
    user(userId: String!): User
    followers(userId: String!, skip: Int = 0, limit: Int = 2): [Connection]
    followings(userId: String!, skip: Int = 0, limit: Int = 2): [Connection]
    userPosts(userId: String!): [Post]
    homePosts(userId: String!): [Post]
  }

  type Mutation {
    insertUser(user: UserInput!): User
    followUser(connection: ConnectionInput!): Connection
    insertPost(post: PostInput!): Post
    likePost(liker: LikerInput!): Liker
  }

  type Subscription {
    userCreated: User
    postAdded(userName: String!): Post
  }
`;

module.exports = typeDefs; 
