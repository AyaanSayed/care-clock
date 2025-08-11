import ManagerLocationForm from "@/components/form/ManagerLocationForm";

export default function ManagerSetupPage() {
  return (
    <>
      <div className="m-2">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Setup Organisation
        </h1>
        <ManagerLocationForm />
      </div>
    </>
  );
}
