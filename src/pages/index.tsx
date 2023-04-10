import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { api, type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

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
    <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-700 px-2 py-4">
      <Image
        src={user.profileImageUrl}
        alt="User Profile"
        className="rounded-full"
        width={50}
        height={16}
      />
      <input
        placeholder="What's happening?"
        className="w-full grow border-none bg-transparent text-xl outline-none"
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
      <button
        className="h-9 rounded-full bg-blue-500 px-4 font-bold"
        onClick={() => mutate({ content: input })}
        disabled={postIsLoading || !input}
      >
        Tweet
      </button>
      {postIsLoading && <LoadingSpinner size={30} />}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getByID"];
const PostView = (post: PostWithUser) => {
  return (
    <div className="flex w-full items-center gap-3 border-b border-slate-700 px-2 pb-4">
      <Image
        src={post.author.profileImageUrl}
        alt={post.author.username}
        className="rounded-full"
        width={50}
        height={50}
      />
      <div className="flex max-w-xl flex-col">
        <div className="flex gap-2">
          <Link href={`/@${post.author.username}`}>
            <p className="font-bold">{`@${post.author.username}`}</p>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <p className="w-full break-words">{post.content}</p>
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
    <div className="flex flex-col items-center justify-center gap-4">
      {data.map((post) => (
        <PostView {...post} key={post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userIsLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if (!userIsLoaded) {
    return <div />;
  }

  return (
    <>
      <main>
        <div className="fixed bottom-5 left-5">
          <div className="rounded-full bg-slate-700 p-3">
            {isSignedIn ? (
              <SignOutButton>Sign Out</SignOutButton>
            ) : (
              <SignInButton>Sign In</SignInButton>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-2xl border-l border-r border-slate-700">
          {isSignedIn && <CreatePostWizard />}
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
