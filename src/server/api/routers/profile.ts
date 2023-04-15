import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const dbUser = await ctx.prisma.user.findUnique({
        where: {
          username: input.username,
        },
      });

      if (dbUser) {
        return dbUser;
      }


      const [clerkUser] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!clerkUser || !clerkUser.username) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find user with that username",
        });
      }

      return await ctx.prisma.user.create({
        data: {
          id: clerkUser.id,
          username: clerkUser.username,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          profileImageUrl: clerkUser.profileImageUrl || "",
          description: "",
        }
      });
    })
});
