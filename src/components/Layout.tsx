import { SignInButton, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { type PropsWithChildren } from "react";

import { api } from "~/utils/api";

const Layout = (props: PropsWithChildren) => {
  const { children } = props;
  const { isLoading: userIsLoading, data: user } = api.profile.getLoggedInUser.useQuery();
  const ctx = api.useContext();

  if (userIsLoading) {
    return <div />;
  }

  return (
    <>
      <main>
        <div className="fixed bottom-5 left-5">
          <div className="rounded-full bg-slate-700 p-3">
            {user ? (
              <div>
                <SignOutButton signOutCallback={() => ctx.profile.getLoggedInUser.invalidate()}>
                  Sign Out
                </SignOutButton>
              </div>
            ) : (
              <SignInButton redirectUrl="/profile" mode="modal">
                Sign In
              </SignInButton>
            )}
          </div>
        </div>
        <div className="absolute left-8 hidden max-w-xl xl:block">
          <nav className="w-full text-2xl">
            <ul className="mt-4 flex flex-col justify-between gap-6">
              <li>
                <Link href="/">T</Link>
              </li>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/">Explore</Link>
              </li>
              <li>
                <Link href="/">Notifications</Link>
              </li>
              <li>
                <Link href="/">Messages</Link>
              </li>
              <li>
                <Link href="/">Bookmarks</Link>
              </li>
              <li>
                <button
                  type="button"
                  className="rounded-full bg-blue-500 px-24 py-3 text-lg font-semibold"
                >
                  Tweet
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mx-auto max-w-2xl border-l border-r border-slate-700">{children}</div>
      </main>
    </>
  );
};

export default Layout;
