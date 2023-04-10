import { api } from "~/utils/api";

import { LoadingPage } from "./Loading";
import PostView from "./PostView";

const getFeed = (userID?: string) => {
  if (userID) {
    return api.posts.getByUserID.useQuery({ userID });
  }
  return api.posts.getAll.useQuery();
};

const Feed = (props: { userID?: string }) => {
  const { userID } = props;
  const { data, isLoading: postsIsLoading } = getFeed(userID);

  if (postsIsLoading) {
    return <LoadingPage />;
  }
  if (!data) {
    return <div>Something went wrong.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {data.map((post) => (
        <PostView {...post} key={post.id} />
      ))}
    </div>
  );
};

export default Feed;
