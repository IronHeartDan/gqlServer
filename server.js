const express = require("express");
const app = express();
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const userModel = require("./models/UserModel");

var dbConnection = null;

connectDB();

//Connect To DB
async function connectDB() {
  dbConnection = await mongoose.connect(
    "mongodb+srv://inevitable:Danish1915.@cluster0.vcqka.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
  );
  if (dbConnection) {
    setUpGql();
  } else {
    console.log(`Err:${dbConnection}`);
  }
}

async function getUser(userName) {
  return { userEmail: `${userName}@gmail.com`, userName: userName };
}

// Start Server
async function setUpGql() {
  let schema = buildSchema(`
input UserInput{
    userEmail:String!
    userName: String!,
}

type User{
  userEmail:String
  userName: String,
}

type Query{
    user(userName:String!):User
}

type Mutation{
  insertUser(user:UserInput!):User
}
`);

  let root = {
    user: ({ userName }) => getUser(userName),
    insertUser: (user) => console.log(user),
  };

  app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
    })
  );

  app.listen(4000, () => console.log("Now browse to localhost:4000/graphql"));
}
