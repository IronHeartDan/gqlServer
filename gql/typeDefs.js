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

  type Subscription {
    userCreated: User
    postAdded: Post
  }
`;

module.exports = typeDefs;
