import { useState } from "react";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import toast from "react-hot-toast";

const CreatePostWizard = () => {
  const { isSignedIn, user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();

  const { mutate, isLoading: postIsLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Try again later.");
      }
      console.error(err);
    },
  });

  if (!isSignedIn) return null;

  return (
    <div className="flex w-full gap-4 px-4">
      <Image
        src={user.profileImageUrl}
        alt="User Profile"
        className="rounded-full"
        width={64}
        height={16}
      />
      <input
        placeholder="What's on your mind?"
        className="w-full grow border-none bg-transparent outline-none"
        onChange={(e) => setInput(e.target.value)}
        disabled={postIsLoading}
        value={input}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            mutate({ content: input });
          }
        }}
      />
      {!postIsLoading && input && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {postIsLoading && <LoadingSpinner size={30} />}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex w-full flex-col gap-4 px-4">
      <div className="flex w-full gap-4">
        <Image
          src={author.profileImageUrl}
          alt={author.username}
          className="rounded-full"
          width={64}
          height={20}
        />
        <div className="flex w-full flex-col">
          <div className="flex w-full gap-2">
            <Link href={`/@${author.username}`}>
              <p className="font-bold">{author.username}</p>
            </Link>
            <Link href={`/post/${post.id}`}>
              <span className="font-thin">
                {dayjs(post.createdAt).fromNow()}
              </span>
            </Link>
          </div>
          <p>{post.content}</p>
        </div>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsIsLoading } = api.posts.getAll.useQuery();

  if (postsIsLoading) {
    return <LoadingPage />;
  }
  if (!data) {
    return <div>Something went wrong.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {data.map(({ post, author }) => (
        <PostView post={post} author={author} key={post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userIsLoaded, isSignedIn, user } = useUser();
  api.posts.getAll.useQuery();

  if (!userIsLoaded) {
    return <div />;
  }

  return (
    <>
      <main>
        {isSignedIn ? (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Hello {user.fullName}!</h1>
            <CreatePostWizard />
            <SignOutButton>Sign out</SignOutButton>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Hello!</h1>
            <p className="text-2xl font-medium">You are not signed in.</p>
            <SignInButton>Sign in</SignInButton>
          </div>
        )}
        <Feed />
      </main>
    </>
  );
};

export default Home;
