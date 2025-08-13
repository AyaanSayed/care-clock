// columns.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";

export interface Shift {
  id: number;
  organization: string;
  clockInTime: string;
  clockOutTime?: string;
  clockInNote?: string;
  clockOutNote?: string;
  status: string;
  manager: { user: { username: string } };
}

export const columns: ColumnDef<Shift>[] = [
  { accessorKey: "organization", header: "Organisation" },
  { accessorFn: row => row.manager.user.username, id: "manager", header: "Manager" },
  { accessorKey: "clockInTime", header: "Clock In", cell: info => new Date(info.getValue() as string).toLocaleString() },
  { accessorKey: "clockOutTime", header: "Clock Out", cell: info => info.getValue() ? new Date(info.getValue() as string).toLocaleString() : "-" },
  { accessorKey: "clockInNote", header: "Clock-In Note" },
  { accessorKey: "clockOutNote", header: "Clock-Out Note" },
  { accessorKey: "status", header: "Status" },
];
