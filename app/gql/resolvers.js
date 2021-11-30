const { PubSub, withFilter } = require("graphql-subscriptions");
const pubsub = new PubSub();

const {
  setUser,
  setConnection,
  addPost,
  setLike,
  getLikers,
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

    async followUser(parent, args, context, info) {
      let connection = await setConnection(args);
      return {
        connectionId: connection._id,
        status: true,
      };
    },

    async insertPost(parent, args, context, info) {
      let post = await addPost(args);
      pubsub.publish("POST_ADDED", { postAdded: post });
      return {
        postId: post._id,
        status: true,
      };
    },

    likePost(parent, args, context, info) {
      return setLike(args);
    },
  },

  Query: {
    user(parent, args, context, info) {
      return getUser(args.userId);
    },

    profile(parent, args, context, info) {
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

    likers(parent, args, context, info) {
      return getLikers(args.postId);
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
