import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { Radar } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signOut } from "next-auth/react";
import UserAccountNav from "./UserAccountNav";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className=" bg-zinc-100 py-2 border-b border-s-zinc-200 fixed w-full z-10 top-0">
      <div className="flex items-center justify-between px-4">
        <Link href="/">
          <Radar />
          <span>CARE CLOCK</span>
        </Link>
        {
          session?.user.role === "care_worker" ? (
            <Link href="/care-worker/history" className={buttonVariants()}>
              history
            </Link>
          ) : null
        }
        {session?.user ? (
          <UserAccountNav />
        ) : (
          <Link className={buttonVariants()} href="/sign-in">
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
