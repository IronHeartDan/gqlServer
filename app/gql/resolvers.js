const { PubSub, withFilter } = require("graphql-subscriptions");
const pubsub = new PubSub();

const {
  setUser,
  setConnection,
  addPost,
  getUser,
  getFollowers,
  getFollowings,
  getUserPosts,
  getUserHomePosts,
} = require("../mongoose/DbOperations");

const resolvers = {
  Mutation: {
    insertUser(parent, args, context, info) {
      return setUser(args);
    },

    followUser(parent, args, context, info) {
      return setConnection(args);
    },

    insertPost(parent, args, context, info) {
      let post = addPost(args);
      pubsub.publish("POST_ADDED", { postAdded: post });
      return post;
    },
  },

  Query: {
    user(parent, args, context, info) {
      return getUser(args.userId);
    },

    followers(parent, args, context, info) {
      console.log(args);
      return getFollowers(args.userId, args.skip, args.limit);
    },

    followings(parent, args, context, info) {
      return getFollowings(args.userId, args.skip, args.limit);
    },

    userPosts(parent, args, context, info) {
      return getUserPosts(args.userId);
    },

    homePosts(parent, args, context, info) {
      return getUserHomePosts(args.userId);
    },
  },

  Subscription: {
    userCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["USER_CREATED"]),
        async (payload, variables) => {
          let data = await payload.userCreated;
          return data.userName === "darknoon";
        }
      ),
    },

    postAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["POST_ADDED"]),
        (payload, variables) => {
          console.log(`Payload ${JSON.stringify(payload)}`);
          console.log(`Variables ${JSON.stringify(variables)}`);
          return true;
        }
      ),
    },
  },
};

module.exports = resolvers;
