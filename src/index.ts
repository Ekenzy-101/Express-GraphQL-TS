import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";

import { DATABASE_URL, DB_CONNECTION, IS_PRODUCTION } from "./config";
import { createConnection } from "typeorm";
import { AuthResolver } from "./resolvers/auth";
import { User } from "./entities/User";
import { TestResolver } from "./resolvers/test";

const start = async () => {
  try {
    await createConnection({
      entities: [User],
      synchronize: true,
      logging: !IS_PRODUCTION,
      type: DB_CONNECTION,
      url: DATABASE_URL,
    });

    const app = express();

    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [TestResolver, AuthResolver],
        validate: false,
      }),
      context: ({ req, res }) => ({ req, res }),
    });

    server.applyMiddleware({ app, cors: false });

    app.listen(5000, () =>
      console.log(
        `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
      )
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
