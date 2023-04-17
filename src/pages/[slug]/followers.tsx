import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";

dayjs.extend(relativeTime);

import { createServerSideHelpers } from "@trpc/react-query/server";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";
import superjson from "superjson";

import Layout from "~/components/Layout";
import { LoadingPage } from "~/components/Loading";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const ctx = api.useContext();
  const { data: loggedInUser, isLoading: loadingLoggedInUser } =
    api.profile.getLoggedInUser.useQuery();
  const { data: user } = api.profile.getUserByUsernameWithFollowers.useQuery({
    username,
  });

  if (loadingLoggedInUser) {
    return <LoadingPage />;
  }

  if (!user) {
    return <div>Not found</div>;
  }

  return (
    <>
      <Head>
        <title>{`People following ${user.username}`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="sticky inset-0 bg-black bg-opacity-75 backdrop-blur-md">
          <div className="flex h-12 w-full items-center gap-6 p-4">
            <Link href={`/@${user.username}`}>
              <AiOutlineArrowLeft className="text-xl" />
            </Link>
            {user.firstName && user.lastName && (
              <p className="text-xl font-bold">
                {user.firstName} {user.lastName}
              </p>
            )}
          </div>
          <div className="flex w-full justify-around border-b border-slate-700">
            <div className="flex w-full flex-col items-center justify-center pt-2 transition-all hover:bg-slate-200 hover:bg-opacity-10">
              <div className="font-semibold text-white">
                <h2>Followers</h2>
                <div className="mt-2 h-1 w-full rounded-full bg-blue-500" />
              </div>
            </div>
            <Link
              href={`/@${user.username}/following`}
              className="flex w-full flex-col items-center justify-center transition-all hover:bg-slate-200 hover:bg-opacity-10"
            >
              <div className="font-semibold text-white">
                <h2>Following</h2>
              </div>
            </Link>
          </div>
        </div>
        <div className="flex min-h-screen flex-col gap-2">
          {user.followedBy.map((follower) => (
            <div className="flex gap-4 p-4" key={follower.id}>
              <Image
                src={follower.profileImageUrl}
                alt={follower.username}
                className="h-[50px] w-[50px] rounded-full"
                width={50}
                height={50}
              />
              <div className="flex flex-col">
                <h3 className="font-semibold">
                  {follower.firstName} {follower.lastName}
                </h3>
                <p className="text-slate-500">@{follower.username}</p>
                <p>{follower.description}</p>
              </div>
            </div>
          ))}
        </div>
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
  await Promise.all([
    ssg.profile.getUserByUsernameWithFollowers.prefetch({
      username,
    }),
    ssg.profile.getLoggedInUser.prefetch(),
  ]);

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
