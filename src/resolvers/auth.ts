import { ApolloError, ExpressContext } from "apollo-server-express";
import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from "type-graphql";
import bcrypt from "bcrypt";

import { ACCESS_TOKEN_COOKIE_NAME, IS_PRODUCTION } from "../config";
import { getValidationErrors } from "../utils/validation";
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

    const hashedPassword = await bcrypt.hash(args.password, 12);
    user = await User.create({ ...args, password: hashedPassword }).save();
    const token = user.generateAccessToken();
    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      maxAge: oneDay,
    });

    return user;
  }

  @Mutation(() => User)
  async login(@Args() args: LoginArgs, @Ctx() { res }: ExpressContext) {
    const schema = {
      email: "email|max:255",
      password: "string|min:6",
    };
    const errors = getValidationErrors(args, schema);
    if (errors) throw new ApolloError(JSON.stringify(errors));

    let user = await User.findOne({ where: { email: args.email } });
    if (!user) {
      throw new ApolloError("Invalid Email or Password");
    }

    const isValid = await bcrypt.compare(args.password, user.password);
    if (!isValid) {
      throw new ApolloError("Invalid Email or Password");
    }

    const token = user.generateAccessToken();
    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      maxAge: oneDay,
    });

    return user;
  }
}
