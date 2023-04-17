import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

dayjs.extend(relativeTime);

import { createServerSideHelpers } from "@trpc/react-query/server";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";
import superjson from "superjson";

import Feed from "~/components/Feed";
import Layout from "~/components/Layout";
import { LoadingPage } from "~/components/Loading";
import EditProfileModal from "~/components/profiles/EditProfileModal";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const ctx = api.useContext();
  const { data: loggedInUser, isLoading: loadingLoggedInUser } = api.users.getLoggedIn.useQuery();
  const { data: user } = api.users.getByUsername.useQuery({
    username,
  });

  const { mutate: followUser } = api.users.follow.useMutation({
    onSuccess: () => {
      void ctx.users.getByUsername.invalidate({ username });
      void ctx.users.getLoggedIn.invalidate();
    },
  });
  const { mutate: unfollowUser } = api.users.unfollow.useMutation({
    onSuccess: () => {
      void ctx.users.getByUsername.invalidate({ username });
      void ctx.users.getLoggedIn.invalidate();
    },
  });

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  if (loadingLoggedInUser) {
    return <LoadingPage />;
  }

  if (!user) {
    return <div>Not found</div>;
  }

  const followingUser = loggedInUser?.following.some((u) => u.id === user.id);

  return (
    <>
      <Head>
        <title>{user.username}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          setIsOpen={setIsEditProfileModalOpen}
          user={user}
        />
        <div className="flex h-12 w-full items-center gap-6 p-4">
          <Link href="/">
            <AiOutlineArrowLeft className="text-xl" />
          </Link>
          {user.firstName && user.lastName && (
            <p className="text-xl font-bold">
              {user.firstName} {user.lastName}
            </p>
          )}
        </div>
        <div className="relative h-52 w-full">
          <Image src={user.profileImageUrl} alt={user.username} fill />
        </div>
        <div className="relative">
          <Image
            src={user.profileImageUrl}
            alt={user.username}
            className="absolute left-4 top-[-70px] rounded-full border-4 border-slate-950 bg-slate-950"
            width={140}
            height={140}
          />
        </div>
        {loggedInUser ? (
          loggedInUser.id === user.id ? (
            <>
              <div className="relative flex w-full items-center justify-end">
                <button
                  type="button"
                  className="mr-3 mt-3 rounded-full border border-slate-500 px-3 py-1 font-semibold transition-all hover:bg-slate-300 hover:bg-opacity-20"
                  onClick={() => setIsEditProfileModalOpen(true)}
                >
                  Edit Profile
                </button>
              </div>
              <div className="m-6" />
            </>
          ) : (
            <>
              <div className="relative flex w-full items-center justify-end">
                <button
                  type="button"
                  className="mr-3 mt-3 rounded-full  bg-slate-100 px-4 py-1 font-semibold text-black transition-all hover:bg-slate-300"
                  onClick={() =>
                    followingUser
                      ? unfollowUser({ userId: user.id })
                      : followUser({ userId: user.id })
                  }
                >
                  {followingUser ? "Unfollow" : "Follow"}
                </button>
              </div>
              <div className="m-6" />
            </>
          )
        ) : (
          <div className="m-16" />
        )}
        <div className="border-b border-slate-700 p-4">
          {user.firstName && user.lastName && (
            <p className="text-xl font-bold">
              {user.firstName} {user.lastName}
            </p>
          )}
          <p className="font-light text-slate-500">{`@${user.username}`}</p>
          <div className="mt-2 flex gap-4 text-sm">
            <Link
              href={`/@${user.username}/following`}
              className="flex items-center gap-1 hover:underline"
            >
              <span>{user._count.following}</span>
              <span className="text-slate-500">Following</span>
            </Link>
            <Link
              href={`/@${user.username}/followers`}
              className="flex items-center gap-1 hover:underline"
            >
              <span>{user._count.followedBy}</span>
              <span className="text-slate-500">Followers</span>
            </Link>
          </div>
        </div>
        <Feed loggedInUser={loggedInUser} authorId={user.id} />
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("No Slug");
  }

  const username = slug.replace("@", "");
  await ssg.users.getByUsername.prefetch({
    username,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
