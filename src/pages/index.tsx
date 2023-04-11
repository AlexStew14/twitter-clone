import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import Feed from "~/components/Feed";
import Layout from "~/components/Layout";
import { LoadingSpinner } from "~/components/Loading";
import useAutosizeTextArea from "~/server/helpers/useAutosizeTextArea";
import { api } from "~/utils/api";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { isSignedIn, user } = useUser();
  const [input, setInput] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, input);

  const ctx = api.useContext();

  const { mutate, isLoading: postIsLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.list.invalidate();
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
    <div className="w-full justify-between border-b border-slate-700 px-4 pb-2 pt-4">
      <Image
        src={user.profileImageUrl}
        alt="User Profile"
        className="rounded-full"
        width={50}
        height={16}
      />
      <div className="pb-2 pl-14 pr-1">
        <textarea
          placeholder="What's happening?"
          className="w-full resize-none break-all border-b border-b-slate-700 bg-transparent pb-4 text-xl text-slate-200 outline-none"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          ref={textAreaRef}
        />
      </div>
      <div className="ml-auto flex w-full justify-end">
        <div className="flex items-center gap-4">
          {input.length > 280 ? (
            <span className="text-sm text-red-500">{280 - input.length}</span>
          ) : (
            <span className="text-sm">{280 - input.length}</span>
          )}
          <div className="h-8 w-[1px] bg-slate-700" />
          <button
            className="ml-auto flex h-9 items-center justify-end rounded-full bg-blue-500 px-4 font-bold"
            onClick={() => mutate({ content: input })}
            disabled={postIsLoading || !input}
          >
            Tweet
          </button>
          {postIsLoading && <LoadingSpinner size={30} />}
        </div>
      </div>
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
