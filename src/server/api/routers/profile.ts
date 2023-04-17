import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { profileEditSchema } from "~/components/profiles/EditProfileModal";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const dbUser = await ctx.prisma.user.findUnique({
        where: {
          username: input.username,
        },
        include: {
          _count: {
            select: {
              following: true,
              followedBy: true,
            },
          },
        },
      });

      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find user with that username",
        });
      }

      return dbUser;
    }),
  getUserByUsernameWithFollowers: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const dbUser = await ctx.prisma.user.findUnique({
        where: {
          username: input.username,
        },
        include: {
          followedBy: true,
        },
      });

      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find user with that username",
        });
      }

      return dbUser;
    }),
  getUserByUsernameWithFollowing: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const dbUser = await ctx.prisma.user.findUnique({
        where: {
          username: input.username,
        },
        include: {
          following: true,
        },
      });

      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find user with that username",
        });
      }

      return dbUser;
    }),
  getLoggedInUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return null;
    }

    const dbUser = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.userId,
      },
      include: {
        following: {
          select: {
            id: true,
          },
        },
      },
    });

    if (dbUser) {
      return dbUser;
    }

    const clerkUser = await clerkClient.users.getUser(ctx.userId);

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
      },
      include: {
        following: {
          select: {
            id: true,
          },
        },
      },
    });
  }),
  editUser: privateProcedure.input(profileEditSchema).mutation(async ({ ctx, input }) => {
    if (ctx.userId !== input.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to edit this user",
      });
    }

    return await ctx.prisma.user.update({
      where: {
        id: input.userId,
      },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        description: input.description,
      },
    });
  }),
  followUser: privateProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.userId === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        });
      }

      await Promise.all([
        ctx.prisma.user.update({
          where: {
            id: input.userId,
          },
          data: {
            followedBy: {
              connect: {
                id: ctx.userId,
              },
            },
          },
        }),
        ctx.prisma.user.update({
          where: {
            id: ctx.userId,
          },
          data: {
            following: {
              connect: {
                id: input.userId,
              },
            },
          },
        }),
      ]);
      return {};
    }),
  unfollowUser: privateProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.userId === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot unfollow yourself",
        });
      }

      await Promise.all([
        ctx.prisma.user.update({
          where: {
            id: input.userId,
          },
          data: {
            followedBy: {
              disconnect: {
                id: ctx.userId,
              },
            },
          },
        }),
        ctx.prisma.user.update({
          where: {
            id: ctx.userId,
          },
          data: {
            following: {
              disconnect: {
                id: input.userId,
              },
            },
          },
        }),
      ]);
      return {};
    }),
});
