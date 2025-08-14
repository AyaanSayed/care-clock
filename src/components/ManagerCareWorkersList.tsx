"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CareWorker {
  id: number;
  username: string | null;
  email: string | null;
  name: string | null;
  createdAt: string;
}

export default function ManagerCareWorkersList() {
  const [careWorkers, setCareWorkers] = useState<CareWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCareWorkers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manager/care-workers");
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch care workers");
        setCareWorkers([]);
      } else {
        setCareWorkers(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching care workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareWorkers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">Care Workers Under You</h2>

      <div className="w-full overflow-x-auto border rounded-lg">
        <table className="min-w-[700px] w-full text-xs sm:text-sm text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 sm:px-4 py-2 border">Name</th>
              <th className="px-2 sm:px-4 py-2 border">Email</th>
              <th className="px-2 sm:px-4 py-2 border">Joined On</th>
              <th className="px-2 sm:px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {careWorkers.length > 0 ? (
              careWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-2 border">{worker.username || "-"}</td>
                  <td className="px-2 sm:px-4 py-2 border">{worker.email || "-"}</td>
                  <td className="px-2 sm:px-4 py-2 border whitespace-nowrap">
                    {new Date(worker.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">
                    <Button
                      onClick={() =>
                        router.push(`/manager/care-worker/${worker.id}`)
                      }
                      size="sm"
                    >
                      View Shifts
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500 text-sm">
                  {loading ? "Loading..." : "No care workers found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
