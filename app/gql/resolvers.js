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
      if (post) {
        // pubsub.publish("USER_CREATED", { userCreated: getUser(args.userName) });
        pubsub.publish("POST_ADDED", { postAdded: post });
      }
      return post;
    },
  },

  Query: {
    user(parent, args, context, info) {
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
        () => true
      ),
    },
  },
};

module.exports = resolvers;
