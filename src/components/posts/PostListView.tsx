import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineHeart, AiOutlineRetweet } from "react-icons/ai";
import { BiBarChart } from "react-icons/bi";
import { FaRegComment} from "react-icons/fa";

dayjs.extend(relativeTime);

import { type RouterOutputs } from "~/utils/api";

type PostWithAuthor = RouterOutputs["posts"]["list"]["posts"][0];
type PostListViewProps = {
  post: PostWithAuthor;
  onReply: (postId: string) => void;
};

const PostListView = (props: PostListViewProps) => {
  const { post, onReply } = props;
  return (
    <Link
      href={`/post/${post.id}`}
      className="w-full items-center border-b border-slate-700 px-2 py-4 hover:bg-slate-950"
    >
      <div className="flex w-full gap-3">
        <Link href={`/@${post.author.username}`}>
          <Image
            src={post.author.profileImageUrl}
            alt={post.author.username}
            className="rounded-full"
            width={50}
            height={50}
          />
        </Link>
        <div className="flex w-full flex-col">
          <Link href={`/@${post.author.username}`} className="flex gap-2">
            {post.author.firstName && post.author.lastName && (
              <p className="font-bold hover:underline">
                {post.author.firstName} {post.author.lastName}
              </p>
            )}
            <div className="flex gap-1 font-light text-slate-500">
              <p>{`@${post.author.username}`}</p>
              <p>·</p>
              <span>{dayjs(post.createdAt).fromNow()}</span>
            </div>
          </Link>
          <p className="w-full whitespace-pre-line">{post.content}</p>
        </div>
      </div>
      <div className="ml-5 mt-2 flex max-w-xl items-center justify-around">
        <button
          onClick={(e) => {
            e.preventDefault();
            onReply(post.id);
          }}
          className="group relative flex gap-2 rounded-full align-middle text-slate-500"
        >
          <div className="absolute left-[-6px] top-[-4px] h-7 w-7 rounded-full transition-all group-hover:bg-blue-600 group-hover:bg-opacity-30" />
          <FaRegComment className="relative top-[2px] rounded-full transition-all group-hover:text-blue-400" />
          <span className="text-sm transition-all group-hover:text-blue-600">3726</span>
        </button>
        <div className="group relative flex gap-2 rounded-full align-middle text-slate-500">
          <div className="absolute left-[-6px] top-[-4px] h-7 w-7 rounded-full transition-all group-hover:bg-green-600 group-hover:bg-opacity-30" />
          <AiOutlineRetweet className="relative top-[2px] rounded-full transition-all group-hover:text-green-400" />
          <span className="text-sm transition-all group-hover:text-green-600">3726</span>
        </div>
        <div className="group relative flex gap-2 rounded-full align-middle text-slate-500">
          <div className="absolute left-[-6px] top-[-4px] h-7 w-7 rounded-full transition-all group-hover:bg-red-600 group-hover:bg-opacity-30" />
          <AiOutlineHeart className="relative top-[2px] rounded-full transition-all group-hover:text-red-400" />
          <span className="text-sm transition-all group-hover:text-red-600">3726</span>
        </div>
        <div className="group relative flex gap-2 rounded-full align-middle text-slate-500">
          <div className="absolute left-[-6px] top-[-4px] h-7 w-7 rounded-full transition-all group-hover:bg-blue-600 group-hover:bg-opacity-30" />
          <BiBarChart className="relative top-[2px] rounded-full transition-all group-hover:text-blue-400" />
          <span className="text-sm transition-all group-hover:text-blue-600">3726</span>
        </div>
      </div>
    </Link>
  );
};

export default PostListView;
