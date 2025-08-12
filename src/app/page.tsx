import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import User from "@/components/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CareWorkerClockForm from "@/components/form/CareWorkerForm";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Unauthorized</div>;
  }

  

  if(session.user.role === "manager"){
    return <div>
      <Link href="/manager" className={buttonVariants()}>
        Go to Manager Dashboard
      </Link>
      <Link href="/profile" className={buttonVariants()}>
        set up location and organization
      </Link>
    </div>
  }

  if(session.user.role === "care_worker"){
    return <div>
      <CareWorkerClockForm />
    </div>

  }
  
}
