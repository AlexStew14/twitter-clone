import { type FetchNextPageOptions, type UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { api, type RouterOutputs } from "~/utils/api";

import { LoadingPage, LoadingSpinner } from "./Loading";
import PostListView from "./posts/PostListView";
import PostReplyModal from "./posts/PostReplyModal";

const useInfiniteScroll = (
  isLoading: boolean,
  hasNextPage: boolean | undefined,
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<UseInfiniteQueryResult>,
  isFetchingNextPage: boolean
) => {
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || isFetchingNextPage) return;

      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight &&
        hasNextPage
      ) {
        void fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading, hasNextPage, fetchNextPage, isFetchingNextPage]);
};

type LoggedInUser = RouterOutputs["users"]["getLoggedIn"];
type FeedProps = { loggedInUser?: LoggedInUser; authorId?: string };
const Feed = (props: FeedProps) => {
  const { authorId, loggedInUser: user } = props;

  const {
    data,
    isLoading: postsIsLoading,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: fetchingNextPosts,
  } = api.posts.list.useInfiniteQuery(
    { limit: 20, authorId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  useInfiniteScroll(postsIsLoading, hasNextPosts, fetchNextPosts, fetchingNextPosts);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyToPostId, setReplyToPostId] = useState<string>("");

  const onReply = (postId: string) => {
    setReplyToPostId(postId);
    setShowReplyModal(true);
  };

  if (postsIsLoading) {
    return <LoadingPage />;
  }

  if (!data) {
    return <div>Something went wrong.</div>;
  }

  return (
    <>
      {showReplyModal && (
        <PostReplyModal setIsOpen={setShowReplyModal} postId={replyToPostId} loggedInUser={user} />
      )}
      <div
        className="flex flex-col items-center justify-center"
        onScroll={(e) => {
          if (postsIsLoading) return;

          const target = e.currentTarget;
          if (target.scrollHeight - target.scrollTop === target.clientHeight && hasNextPosts) {
            void fetchNextPosts();
          }
        }}
      >
        {data.pages.map((page) =>
          page.posts.map((post) => <PostListView post={post} onReply={onReply} key={post.id} />)
        )}
        {fetchingNextPosts && <LoadingSpinner />}
      </div>
    </>
  );
};

export default Feed;
