import { clerkClient } from "@clerk/nextjs/server";
import { type Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const addUsersToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  const postsWithUsers = posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author || !author.username) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find author for post or author has no username",
      });
    }
    return {
      ...post,
      author,
    };
  });

  return postsWithUsers;
};

export const addUserToPost = async (post: Post) => {
  const author = await clerkClient.users
    .getUser(post.authorId)
    .then(filterUserForClient);

  if (!author || !author.username) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not find author for post or author has no username",
    });
  }

  return {
    ...post,
    author,
  };
};
