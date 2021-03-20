import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "./User";

export enum PostCategory {
  Education = "Education",
  Sport = "Sport",
  Politics = "Politics",
}

@Entity({ name: "posts" })
@ObjectType({ description: "A post" })
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Unique identifier for the post" })
  id: string;

  @Column({
    type: "enum",
    enum: PostCategory,
  })
  @Field({ description: "The category of the post" })
  category: string;

  @Column("text")
  @Field({ description: "The content of the post" })
  content: string;

  @CreateDateColumn({ name: "created_at" })
  @Field()
  createdAt: Date;

  @Column()
  @Field({ description: "The title of the post" })
  title: string;

  @UpdateDateColumn({ name: "updated_at" })
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "user_id" })
  @Field(() => User)
  user: User;

  static edit(id: string, values: QueryDeepPartialEntity<Post>) {
    return this.createQueryBuilder()
      .update(Post)
      .set(values)
      .where("id = :id", { id })
      .returning("*")
      .execute();
  }
}
