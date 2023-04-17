/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dialog } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";
import { z } from "zod";
dayjs.extend(relativeTime);

import { api, type RouterOutputs } from "~/utils/api";

export const postReplySchema = z.object({
  content: z.string().min(1).max(280),
  replyToId: z.string(),
});

type PostReplySchema = z.infer<typeof postReplySchema>;
type LoggedInUser = RouterOutputs["users"]["getLoggedIn"];
type EditProfileModalProps = {
  postId: string;
  loggedInUser: LoggedInUser | null | undefined;
  setIsOpen: (isOpen: boolean) => void;
};
const PostReplyModal = (props: EditProfileModalProps) => {
  const { postId, loggedInUser, setIsOpen } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostReplySchema>({
    resolver: zodResolver(postReplySchema),
    defaultValues: {
      content: "",
      replyToId: postId,
    },
  });

  const ctx = api.useContext();
  const { data: post, isLoading: postIsLoading } = api.posts.getById.useQuery({ id: postId });
  const { mutate } = api.posts.reply.useMutation({
    onSuccess: () => {
      setIsOpen(false);
    },
  });

  if (postIsLoading || !post) {
    return null;
  }

  if (!loggedInUser) {
    return (
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)} open={true}>
        <div className="fixed inset-0 overflow-y-auto bg-slate-300 bg-opacity-20">
          <div className="flex min-h-full items-center justify-center text-center">
            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-black text-left align-middle transition-all">
              <Dialog.Title as="div" className="m-3 flex items-center gap-7 text-xl font-bold">
                <button onClick={() => setIsOpen(false)}>
                  <AiOutlineClose />
                </button>
                <h1>Log in to reply</h1>
              </Dialog.Title>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    );
  }

  const submitDisabled = Object.keys(errors).length > 0;
  return (
    <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)} open={true}>
      <div className="fixed inset-0 overflow-y-auto bg-slate-300 bg-opacity-20">
        <div className="flex min-h-full items-center justify-center text-center">
          <Dialog.Panel className="w-full max-w-[600px] transform overflow-hidden rounded-2xl bg-black text-left align-middle transition-all">
            <form onSubmit={handleSubmit((values) => mutate(values))} className="px-4 pb-2 pt-4">
              <Dialog.Title
                as="div"
                className="mx-1 mb-6 flex items-center gap-7 text-xl font-bold"
              >
                <button onClick={() => setIsOpen(false)}>
                  <AiOutlineClose />
                </button>
              </Dialog.Title>
              <div className="flex">
                <div className="flex min-w-[50px] flex-col">
                  <Image
                    src={post.author.profileImageUrl}
                    alt={post.author.username}
                    className="h-[50px] w-[50px] rounded-full"
                    width={50}
                    height={50}
                  />
                  <div className="mx-auto my-2 h-full w-[2px] bg-slate-700" />
                </div>
                <div className="flex flex-col px-4 pb-4 pt-2">
                  <div className="flex gap-1 font-light text-slate-500">
                    <p className="font-bold text-white">
                      {post.author.firstName} {post.author.lastName}
                    </p>
                    <p>{`@${post.author.username}`}</p>
                    <p>·</p>
                    <span>{dayjs(post.createdAt).fromNow()}</span>
                  </div>
                  <p className="whitespace-pre-line">{post.content}</p>
                </div>
              </div>
              <div className="flex w-full gap-4">
                <Image
                  src={post.author.profileImageUrl}
                  alt={post.author.username}
                  className="h-[50px] w-[50px] rounded-full"
                  width={50}
                  height={50}
                />
                <div className="flex flex-col">
                  <input {...register("replyToId")} type="hidden" />
                  <input
                    placeholder="Tweet your reply"
                    {...register("content")}
                    className="grow rounded-md border border-slate-600 bg-black p-2"
                  />
                  <p className="ml-2 text-sm text-red-500">{errors.content?.message}</p>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className={`rounded-full bg-blue-500 px-4 py-2 font-bold ${
                    submitDisabled ? "opacity-50" : ""
                  }`}
                >
                  Reply
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default PostReplyModal;
