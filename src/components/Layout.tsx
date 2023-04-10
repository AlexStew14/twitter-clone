import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type PropsWithChildren } from "react";

import { api } from "~/utils/api";

const Layout = (props: PropsWithChildren) => {
  const { children } = props;
  const { isLoaded: userIsLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if (!userIsLoaded) {
    return <div />;
  }

  return (
    <>
      <main>
        <div className="fixed bottom-5 left-5">
          <div className="rounded-full bg-slate-700 p-3">
            {isSignedIn ? (
              <SignOutButton>Sign Out</SignOutButton>
            ) : (
              <SignInButton>Sign In</SignInButton>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-2xl border-l border-r border-slate-700">
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
