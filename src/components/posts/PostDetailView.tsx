import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);

import { type RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["posts"]["getByID"];
const PostDetailView = (post: PostWithUser) => {
  return (
    <div className="flex w-full flex-col items-center gap-3 border-b border-slate-700 px-4 py-4 hover:bg-slate-950">
      <div className="flex w-full items-center justify-start gap-3">
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
            <div className="flex flex-col">
              {post.author.firstName && post.author.lastName && (
                <p className="font-bold hover:underline">
                  {post.author.firstName} {post.author.lastName}
                </p>
              )}
              <p className="text-sm text-slate-500">{`@${post.author.username}`}</p>
            </div>
          </Link>
        </div>
      </div>
      <p className="w-full break-words text-2xl">{post.content}</p>
      <div className="flex w-full items-center justify-start gap-1 text-slate-500">
        <p>{dayjs(post.createdAt).format("h:mm A")}</p>
        <p>·</p>
        <p>{dayjs(post.createdAt).format("MMM DD, YYYY")}</p>
      </div>
    </div>
  );
};

export default PostDetailView;
