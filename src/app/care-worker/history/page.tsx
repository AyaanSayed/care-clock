"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Shift {
  id: number;
  organization: string;
  clockInTime: string;
  clockOutTime: string;
  clockInNote: string | null;
  clockOutNote: string | null;
  status: string | null;
  manager: {
    user: {
      username: string;
    };
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CareWorkerShiftHistory() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10; // rows per page

  const fetchShifts = async () => {
    try {
      setLoading(true);
      let url = `/api/shifts/history?page=${page}&limit=${limit}`;
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (params.toString()) url += `&${params.toString()}`;

      const res = await fetch(url);
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to fetch shift history");
        setShifts([]);
      } else {
        setShifts(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching shift history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 bg-white rounded-lg shadow">
      <h2 className="text-lg sm:text-xl font-semibold">Shift History</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 gap-3">
        <div className="flex flex-col w-full sm:w-auto">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col w-full sm:w-auto">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Button
          onClick={() => { setPage(1); fetchShifts(); }}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Loading..." : "Apply Filters"}
        </Button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border rounded-lg">
        <table className="min-w-[900px] w-full text-xs sm:text-sm text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 sm:px-4 py-2 border">Manager</th>
              <th className="px-2 sm:px-4 py-2 border">Organisation</th>
              <th className="px-2 sm:px-4 py-2 border">Clock In</th>
              <th className="px-2 sm:px-4 py-2 border">Clock Out</th>
              <th className="px-2 sm:px-4 py-2 border">Clock-In Note</th>
              <th className="px-2 sm:px-4 py-2 border">Clock-Out Note</th>
              <th className="px-2 sm:px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-2 border">{shift.manager?.user?.username || "-"}</td>
                  <td className="px-2 sm:px-4 py-2 border">{shift.organization}</td>
                  <td className="px-2 sm:px-4 py-2 border whitespace-nowrap">
                    {new Date(shift.clockInTime).toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border whitespace-nowrap">
                    {shift.clockOutTime ? new Date(shift.clockOutTime).toLocaleString() : "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border break-words max-w-[200px]">
                    {shift.clockInNote || "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border break-words max-w-[200px]">
                    {shift.clockOutNote || "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">{shift.status || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500 text-sm">
                  No shift history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            disabled={page === pagination.totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
