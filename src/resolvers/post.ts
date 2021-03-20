import { ExpressContext } from "apollo-server-express";
import { User } from "../entities/User";
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";

import { Post, PostCategory } from "../entities/Post";
import { IsAuthenticated, IsAuthorized } from "../middewares/auth";
import { getValidationErrors } from "../utils/validation";

@ArgsType()
class CreatePostArgs {
  @Field()
  category: string;

  @Field()
  content: string;

  @Field()
  title: string;
}

@ArgsType()
class UpdatePostArgs extends CreatePostArgs {
  @Field()
  id: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts() {
    return await Post.find({ relations: ["user"] });
  }

  @UseMiddleware(IsAuthenticated)
  @Mutation(() => Post)
  async createPost(
    @Args() args: CreatePostArgs,
    @Ctx() { req }: ExpressContext
  ) {
    const { Education, Politics, Sport } = PostCategory;
    const schema = {
      category: { type: "enum", values: [Education, Politics, Sport] },
      content: "string|empty:false",
      title: "string|empty:false|max:255",
    };
    const errors = getValidationErrors(args, schema);
    if (errors) throw new Error(JSON.stringify(errors));

    let user = (req.user as unknown) as User;
    return await Post.create({ ...args, user }).save({ reload: true });
  }

  @UseMiddleware(IsAuthenticated, IsAuthorized)
  @Mutation(() => Post)
  async updatePost(@Args() args: UpdatePostArgs) {
    const { Education, Politics, Sport } = PostCategory;
    const schema = {
      category: { type: "enum", values: [Education, Politics, Sport] },
      content: "string|empty:false",
      title: "string|empty:false|max:255",
      id: "string|empty:false",
    };
    const errors = getValidationErrors(args, schema);
    if (errors) throw new Error(JSON.stringify(errors));

    const result = await Post.edit(args.id, args);

    return result.raw[0];
  }

  @UseMiddleware(IsAuthenticated, IsAuthorized)
  @Mutation(() => String)
  async deletePost(@Arg("id") id: string) {
    await Post.delete({ id });
    return "Success";
  }
}
