import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CareWorkerClockForm from "@/components/form/CareWorkerForm";
import ManagerDashboard from "@/components/ManagerDashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="text-center text-red-500 mt-10">Sign in to continue</div>;
  }

  if (session.user.role === "manager") {
    return (
      <div className="max-w-6xl mx-auto p-2 space-y-6">
        <h1 className="font-bold">Welcome {session.user.username}!</h1>
        <div className="flex gap-4 flex-wrap">
          <Link href="/profile" className={buttonVariants()}>
            Set Up Location & Organization
          </Link>
          <Link href="/manager/activeCareWorker" className={buttonVariants()}>
            Active Care Workers
          </Link>
        </div>
        <ManagerDashboard />
      </div>
    );
  }

  if (session.user.role === "care_worker") {
    return (
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-center font-bold">Welcome {session.user.username}!</h1>
        <CareWorkerClockForm />
      </div>
    );
  }

  return null;
}
