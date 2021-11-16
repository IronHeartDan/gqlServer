const resolvers = {
  Query: {
    user(parent, args, context, info) {
      console.log(parent);
      console.log(context);
      console.log(info);
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
};

module.exports = resolvers;
