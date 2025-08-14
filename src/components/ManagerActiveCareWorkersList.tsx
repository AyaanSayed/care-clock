"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CareWorker {
  id: number;
  username: string | null;
  email: string | null;
  name: string | null;
}

interface Shift {
  id: number;
  careWorkerId: number;
  clockInTime: string;
  status: string;
  careWorker: CareWorker;
}

export default function ManagerActiveShiftsList() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // default per page

  const fetchActiveShifts = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/manager/activeShifts?page=${pageNumber}&limit=${limit}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch active shifts");
        setShifts([]);
      } else {
        setShifts(data.shifts);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching active shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveShifts(page);
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">Active Shifts</h2>

      <div className="w-full overflow-x-auto border rounded-lg">
        <table className="min-w-[700px] w-full text-xs sm:text-sm text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 sm:px-4 py-2 border">Care Worker Name</th>
              <th className="px-2 sm:px-4 py-2 border">Email</th>
              <th className="px-2 sm:px-4 py-2 border">Clock In Time</th>
              <th className="px-2 sm:px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-2 border">
                    {shift.careWorker.username || "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">
                    {shift.careWorker.email || "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border whitespace-nowrap">
                    {new Date(shift.clockInTime).toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">{shift.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500 text-sm">
                  {loading ? "Loading..." : "No active shifts found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages >1 && (<div className="flex justify-center gap-2 pt-4">
        <Button
          size="sm"
          disabled={page === 1 || loading}
          onClick={() => setPage((prev) => prev - 1)}
          variant="outline"
        >
          Previous
        </Button>
        <span className="px-3 py-1 border rounded">
          Page {page} of {totalPages}
        </span>
        <Button
          size="sm"
          disabled={page === totalPages || loading}
          onClick={() => setPage((prev) => prev + 1)}
          variant="outline"
        >
          Next
        </Button>
      </div>)}
    </div>
  );
}


              