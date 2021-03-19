import { ApolloError, ExpressContext } from "apollo-server-express";
import { getValidationErrors } from "../utils/validation";
import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from "type-graphql";

import { IS_PRODUCTION } from "../config";
import { User } from "../entities/User";

@ArgsType()
class LoginArgs {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ArgsType()
class RegisterArgs extends LoginArgs {
  @Field()
  name: string;
}

@Resolver()
export class AuthResolver {
  @Mutation(() => User)
  async register(@Args() args: RegisterArgs, @Ctx() { res }: ExpressContext) {
    const schema = {
      email: "email|max:255",
      password: "string|min:6",
      name: "string|min:1|max:50",
    };
    const errors = getValidationErrors(args, schema);
    if (errors) throw new ApolloError(JSON.stringify(errors));

    let user = await User.findOne({ where: { email: args.email } });

    if (user) {
      throw new ApolloError(JSON.stringify({ email: "Email already exists" }));
    }

    user = await User.create(args).save();
    const token = user.generateAccessToken();
    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie("token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      maxAge: oneDay,
    });

    return user;
  }
}
