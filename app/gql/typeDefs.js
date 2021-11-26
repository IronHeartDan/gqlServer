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

  type ConnectionInserted {
    connectionId: String
    status: Boolean!
  }

  type Post {
    userName: String!
    profilepicture: String
    userId: String!
    likeCount: Int!
    commentCount: Int!
    caption: String
    hashTags: [String]
    type: Int!
    data: String!
  }

  type PostInserted {
    postId: String
    status: Boolean!
  }

  type Liker {
    _id: String!
    userName: String!
    profilepicture: String
  }

  type Query {
    user(userId: String!): User
    followers(userId: String!, skip: Int = 0, limit: Int = 2): [User]
    followings(userId: String!, skip: Int = 0, limit: Int = 2): [User]
    userPosts(userId: String!): [Post]
    homePosts(userId: String!): [Post]
    likers(postId: String!): [Liker]
  }

  type Mutation {
    insertUser(user: UserInput!): User
    followUser(connection: ConnectionInput!): ConnectionInserted
    insertPost(post: PostInput!): PostInserted
    likePost(liker: LikerInput!): [Liker]
  }

  type Subscription {
    userCreated: User
    postAdded(userName: String!): Post
  }
`;

module.exports = typeDefs; 
