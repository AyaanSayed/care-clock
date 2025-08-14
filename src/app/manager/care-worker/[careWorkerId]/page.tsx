"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Shift {
  id: number;
  organization: string;
  clockInTime: string;
  clockOutTime: string | null;
  clockInNote: string | null;
  clockOutNote: string | null;
  status: string;
  manager: { user: { username: string } };
  careWorker: { username: string | null; email: string | null };
}

export default function CareWorkerShiftsPage() {
  const { careWorkerId } = useParams<{ careWorkerId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // const fetchShifts = async () => {
  //   try {
  //     if (!careWorkerId) return;

  //     setLoading(true);
  //     let url = `/api/manager/shifts?careWorkerId=${careWorkerId}&page=${page}&limit=10`;
  //     if (startDate) url += `&startDate=${startDate}`;
  //     if (endDate) url += `&endDate=${endDate}`;

  //     const res = await fetch(url, { credentials: "include" });
  //     const data = await res.json();

  //     if (!res.ok) {
  //       toast.error(data.error || "Failed to fetch shifts");
  //       setShifts([]);
  //     } else {
  //       setShifts(data.shifts || []);
  //       setTotalPages(data.totalPages || 1);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Something went wrong while fetching shifts");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
    const fetchShifts = async () => {
  try {
    setLoading(true);
    let url = `/api/manager/shifts?careWorkerId=${careWorkerId}&page=${page}&limit=10`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const res = await fetch(url, {
      credentials: "include", // sends cookies/session
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Try to detect if we got HTML instead of JSON
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Non-JSON response from API:", text);
      toast.error(`Unexpected response: ${res.status}`);
      setShifts([]);
      return;
    }

    if (!res.ok) {
      toast.error(data.error || "Failed to fetch shifts");
      setShifts([]);
    } else {
      setShifts(data.shifts || []);
      setTotalPages(data.totalPages || 1);
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong while fetching shifts");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchShifts();
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 bg-white rounded-lg shadow">
      {/* Back Button */}
      <Button variant="outline" onClick={() => router.push("/manager/care-worker")}>
        ← Back to Care Workers
      </Button>

      <h2 className="text-lg sm:text-xl font-semibold">
        Shift History for Care Worker #{careWorkerId}
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 gap-3">
        <div className="flex flex-col w-full sm:w-auto">
          <Label htmlFor="startDate">Start Date</Label>
          <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <Label htmlFor="endDate">End Date</Label>
          <Input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button onClick={() => { setPage(1); fetchShifts(); }} disabled={loading} className="w-full sm:w-auto">
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
                  <td className="px-2 sm:px-4 py-2 border break-words max-w-[200px]">{shift.clockInNote || "-"}</td>
                  <td className="px-2 sm:px-4 py-2 border break-words max-w-[200px]">{shift.clockOutNote || "-"}</td>
                  <td className="px-2 sm:px-4 py-2 border">{shift.status || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500 text-sm">
                  {loading ? "Loading..." : "No shifts found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </Button>
          <span className="px-3 py-1 border rounded">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
