import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import Feed from "~/components/Feed";
import Layout from "~/components/Layout";
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
    <div className="flex items-center justify-between gap-2 border-b border-slate-700 px-2 py-4">
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

const Home: NextPage = () => {
  const { isSignedIn } = useUser();

  return (
    <Layout>
      {isSignedIn && <CreatePostWizard />}
      <Feed />
    </Layout>
  );
};

export default Home;
