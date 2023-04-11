import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);

import { type RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["posts"]["getByID"];
const PostListView = (post: PostWithUser) => {
  return (
    <Link
      href={`/post/${post.id}`}
      className="flex w-full items-center gap-3 border-b border-slate-700 px-2 py-4 hover:bg-slate-950"
    >
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
        <p className="w-full break-all">{post.content}</p>
      </div>
    </Link>
  );
};

export default PostListView;
