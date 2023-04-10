import { useEffect } from "react";

import { api } from "~/utils/api";

import { LoadingPage, LoadingSpinner } from "./Loading";
import PostView from "./PostView";

const Feed = (props: { userID?: string }) => {
  const { userID } = props;
  const {
    data,
    isLoading: postsIsLoading,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: fetchingNextPosts,
  } = api.posts.list.useInfiniteQuery(
    { limit: 20, userID },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  useEffect(() => {
    const handleScroll = () => {
      if (postsIsLoading || fetchingNextPosts) return;

      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight &&
        hasNextPosts
      ) {
        void fetchNextPosts();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [postsIsLoading, hasNextPosts, fetchNextPosts, fetchingNextPosts]);

  if (postsIsLoading) {
    return <LoadingPage />;
  }

  if (!data) {
    return <div>Something went wrong.</div>;
  }

  return (
    <div
      className="flex flex-col items-center justify-center"
      onScroll={(e) => {
        if (postsIsLoading) return;

        const target = e.currentTarget;
        if (
          target.scrollHeight - target.scrollTop === target.clientHeight &&
          hasNextPosts
        ) {
          void fetchNextPosts();
        }
      }}
    >
      {data.pages.map((page) =>
        page.posts.map((post) => <PostView {...post} key={post.id} />)
      )}
      {fetchingNextPosts && <LoadingSpinner />}
    </div>
  );
};

export default Feed;
