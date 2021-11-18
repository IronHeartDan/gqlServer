const { PubSub, withFilter } = require("graphql-subscriptions");

const pubsub = new PubSub();

const {
  getUser,
  getFollowers,
  getFollowings,
  getUserPosts,
  getUserHomePosts,
} = require("../mongoose/DbOperations");

const resolvers = {
  Query: {
    user(parent, args, context, info) {
      pubsub.publish("USER_CREATED", { userCreated: getUser(args.userName) });
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
  },
};

module.exports = resolvers;
