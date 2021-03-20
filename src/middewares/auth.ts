import { ExpressContext } from "apollo-server-express";
import { MiddlewareFn } from "type-graphql";
import { Post } from "../entities/Post";
import { User } from "../entities/User";

export const IsAuthenticated: MiddlewareFn<ExpressContext> = async (
  { context: { req } },
  next
) => {
  if (!req.user) throw new Error("Unauthenticated");

  return next();
};

export const IsAuthorized: MiddlewareFn<ExpressContext> = async (
  { context: { req }, args },
  next
) => {
  if (!args.id) throw new Error("Unauthorized");

  const post = await Post.findOne(args.id, { relations: ["user"] });
  const user = (req.user as unknown) as User;

  if (!post) throw new Error("Not Found");

  if (post.user.id !== user.id) throw new Error("Unauthorized");

  return next();
};
