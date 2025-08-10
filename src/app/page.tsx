
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import User from "@/components/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div>
    <h1 className="text-2xl">home</h1>
    <Link href="/admin" className={buttonVariants()}>
      Go to Admin Dashboard
    </Link>
    client session
      <User />
    server session
      <pre>{JSON.stringify(session)}</pre>

    </div>
  );
}
