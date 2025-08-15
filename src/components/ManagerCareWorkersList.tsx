"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CareWorker {
  id: number;
  username: string | null;
  email: string | null;
  name: string | null;
  createdAt: string;
  totalHoursLastWeek?: number; 
}

interface Props {
  careWorkers?: CareWorker[];
}

export default function ManagerCareWorkersList({ careWorkers = [] }: Props) {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">Care Workers Under You</h2>

      <div className="w-full overflow-x-auto border rounded-lg">
        <table className="min-w-[800px] w-full text-xs sm:text-sm text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 sm:px-4 py-2 border">Name</th>
              <th className="px-2 sm:px-4 py-2 border">Email</th>
              <th className="px-2 sm:px-4 py-2 border">Joined On</th>
              <th className="px-2 sm:px-4 py-2 border">Total Hours (Last 7 Days)</th>
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
                    {worker.totalHoursLastWeek?.toFixed(1) || "0"} hrs
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">
                    <Button
                      onClick={() => router.push(`/manager/care-worker/${worker.id}`)}
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
                  No care workers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
