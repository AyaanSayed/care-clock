"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import ManagerCareWorkersList from "@/components/ManagerCareWorkersList";

interface DashboardData {
  avgHoursPerDay: { date: string; avgHours: number }[];
  peopleCountPerDay: { date: string; count: number }[];
}

interface CareWorker {
  id: number;
  username: string | null;
  email: string | null;
  name: string | null;
  createdAt: string;
  totalHoursLastWeek?: number;
}

export default function ManagerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [careWorkers, setCareWorkers] = useState<CareWorker[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manager/care-workers");
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to fetch dashboard data");
      } else {
        setData(json.dashboard);
        setCareWorkers(json.careWorkers || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>No dashboard data available</div>;

  // Today's key in local timezone 
  const todayKey = new Date().toLocaleDateString("en-CA"); // yyyy-MM-dd

  const todayAvgHours =
    data.avgHoursPerDay.find((d) => d.date === todayKey)?.avgHours || 0;
  const todayPeopleCount =
    data.peopleCountPerDay.find((d) => d.date === todayKey)?.count || 0;

  return (
    <div className="space-y-6">
      {/* data Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Avg Hours / Day (Today)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {todayAvgHours.toFixed(1)} hrs
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>People Clocked In Today</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {todayPeopleCount}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Avg Hours per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.avgHoursPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgHours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>People Clocking In</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.peopleCountPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      
      <ManagerCareWorkersList careWorkers={careWorkers} />
    </div>
  );
}
