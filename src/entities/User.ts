import jwt from "jsonwebtoken";
import { APP_ACCESS_SECRET } from "../config";
import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";

@Entity({ name: "users" })
@ObjectType({ description: "A user" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID, { description: "Unique identifier for the user" })
  id: string;

  @CreateDateColumn({ name: "created_at" })
  @Field()
  createdAt: Date;

  @Column({ unique: true })
  @Field({ description: "The email of the user" })
  email: string;

  @Column({ length: 50 })
  @Field({ description: "The fullname of the user" })
  name: string;

  @Column("text")
  password: string;

  @OneToMany(() => Post, (post) => post.user, { eager: true, cascade: true })
  @Field(() => [Post])
  posts: Post[];

  @UpdateDateColumn({ name: "updated_at" })
  @Field()
  updatedAt: Date;

  generateAccessToken(): string {
    const { id, email } = this;

    return jwt.sign({ id, email }, APP_ACCESS_SECRET, { expiresIn: "1 day" });
  }
}
