import ManagerLocationForm from "@/components/form/ManagerLocationForm";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function ManagerSetupPage() {
  return (
    <>
      <div className="m-2 flex flex-col justify-center items-center gap-2">
        <Link href="/" className={`${buttonVariants({ variant: "outline" })} flex items-center justify-center`}>
          <div>←</div>
          <div>Back to dashboard</div>
        </Link>
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Setup Organisation
        </h1>

        <ManagerLocationForm />
      </div>
    </>
  );
}
