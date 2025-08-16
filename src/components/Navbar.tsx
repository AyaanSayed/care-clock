import Link from "next/link";
import { Radar, Menu } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buttonVariants } from "./ui/button";
import UserAccountNav from "./UserAccountNav";

const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-zinc-100 py-2 border-b border-zinc-200 fixed w-full z-10 top-0">
      <div className="flex items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 font-bold">
          <Radar className="h-5 w-5" />
          <span>CARE CLOCK</span>
        </Link>

        {/* Hamburger (mobile only) */}
        <div className="sm:hidden">
          <input
            type="checkbox"
            id="menu-toggle"
            className="peer hidden"
          />
          <label htmlFor="menu-toggle" className="cursor-pointer">
            <Menu className="h-6 w-6" />
          </label>

          {/* Mobile menu */}
          <div className="absolute right-0 top-12 bg-white border rounded-md shadow-md w-48 hidden peer-checked:flex flex-col gap-2 p-3">
            {session?.user?.role === "care_worker" ? (
              <>
                <Link
                  href="/"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Home
                </Link>
                <Link
                  href="/care-worker/history"
                  className={buttonVariants({ variant: "outline" })}
                >
                  History
                </Link>
                <UserAccountNav />
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Home
                </Link>
                {session?.user ? (
                  <UserAccountNav />
                ) : (
                  <Link className={buttonVariants()} href="/sign-in">
                    Sign in
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden sm:flex gap-2 items-center">
          {session?.user?.role === "care_worker" ? (
            <>
              <Link
                href="/"
                className={buttonVariants({ variant: "outline" })}
              >
                Home
              </Link>
              <Link
                href="/care-worker/history"
                className={buttonVariants({ variant: "outline" })}
              >
                History
              </Link>
              <UserAccountNav />
            </>
          ) : (
            <>
              <Link
                href="/"
                className={buttonVariants({ variant: "outline" })}
              >
                Home
              </Link>
              {session?.user ? (
                <UserAccountNav />
              ) : (
                <Link className={buttonVariants()} href="/sign-in">
                  Sign in
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
