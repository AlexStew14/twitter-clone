import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";

const Profile = () => {
  const { data: user, isLoading: userIsLoading } = api.users.getLoggedIn.useQuery();

  if (userIsLoading) {
    return <LoadingPage />;
  }

  if (user) {
    window.location.replace(`/@${user.username}`);
  } else {
    window.location.replace(`/`);
  }

  return <LoadingPage />;
};

export default Profile;
