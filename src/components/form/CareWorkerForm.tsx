"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { set } from "zod";

interface ManagerData {
  id: number;
  username: string;
  manager: {
    id: number;
    organization: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
}

interface ActiveShift {
  id: number;
  organization: string;
  manager: {
    id: number;
    user: {
      username: string;
    };
  };
}

export default function CareWorkerClockForm() {
  const [managers, setManagers] = useState<ManagerData[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [submittingClockIn, setSubmittingClockIn] = useState<boolean>(false);
  const [submittingClockOut, setSubmittingClockOut] = useState<boolean>(false);

  // Fetch all managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await fetch("/api/manager/getAllManager");
        if (!res.ok) throw new Error("Failed to fetch managers");
        const data: ManagerData[] = await res.json();
        setManagers(data);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching managers");
      }
    };
    fetchManagers();
  }, []);

  // Auto-fill organisation when manager changes
  useEffect(() => {
    if (selectedManagerId) {
      const manager = managers.find(
        (m) => m.manager.id.toString() === selectedManagerId
      );
      if (manager) {
        setSelectedOrganisation(manager.manager.organization);
      } else {
        setSelectedOrganisation("");
      }
    } else {
      setSelectedOrganisation("");
    }
  }, [selectedManagerId, managers]);

  // Fetch active shift
  const fetchActiveShift = async () => {
    try {
      const res = await fetch("/api/shifts/active");
      if (!res.ok) return;
      const data = await res.json();
      setActiveShift(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActiveShift();
  }, []);

  const handleClockIn = () => {
    setSubmittingClockIn(true);

    if (!selectedManagerId || !selectedOrganisation) {
      toast.error("Please select both manager and organisation");
      setSubmittingClockIn(false);
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      setSubmittingClockIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/shifts/clock-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              managerId: Number(selectedManagerId),
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              note,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || "Failed to clock in");
            setSubmittingClockIn(false);
            return;
          }

          toast.success(`Clocked in for ${selectedOrganisation}`);
          setNote("");
          await fetchActiveShift();
        } catch (err) {
          console.error(err);
          toast.error("Something went wrong");
        } finally {
          setSubmittingClockIn(false);
        }
      },
      () => {
        toast.error("Unable to retrieve location");
        setSubmittingClockIn(false);
      }
    );
  };

  const handleClockOut = () => {
    setSubmittingClockOut(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      setSubmittingClockOut(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/shifts/clock-out", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shiftId: activeShift?.id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              note,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || "Failed to clock out");
            setSubmittingClockOut(false);
            return;
          }

          toast.success("Clocked out successfully");
          setSelectedManagerId("");
          setSelectedOrganisation("");
          setActiveShift(null);
          setNote("");
        } catch (err) {
          console.error(err);
          toast.error("Something went wrong");
        } finally {
          setSubmittingClockOut(false);
        }
      },
      () => {
        toast.error("Unable to retrieve location");
        setSubmittingClockOut(false);
      }
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-6 border rounded-lg shadow-sm bg-white">
      {activeShift ? (
        <>
          <h2>Clock out of your current shift.</h2>
          <div>
            <Label className="font-medium">Manager</Label>
            <p className="mt-1">
              {activeShift?.manager?.user?.username || "-"}
            </p>
          </div>

          <div>
            <Label className="font-medium">Organisation</Label>
            <p className="mt-1">{activeShift.organization}</p>
          </div>

          <div className="space-y-2">
            <Label className="font-medium" htmlFor="note">
              Optional Note
            </Label>
            <Input
              id="note"
              placeholder="Enter a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button
            onClick={handleClockOut}
            disabled={submittingClockOut}
            className="w-full font-semibold"
          >
            {submittingClockOut ? "Clocking Out..." : "Clock Out"}
          </Button>
        </>
      ) : (
        <>
        <h2>Clock in to your shift.</h2>
          <div className="space-y-2">
            <Label className="font-medium">Manager</Label>
            <Select
              value={selectedManagerId}
              onValueChange={(val) => setSelectedManagerId(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem
                    key={manager.manager.id}
                    value={manager.manager.id.toString()}
                  >
                    {manager.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Organisation</Label>
            <Select
              value={selectedOrganisation || ""}
              onValueChange={setSelectedOrganisation}
              disabled={!selectedManagerId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select organisation" />
              </SelectTrigger>
              <SelectContent>
                {selectedOrganisation && (
                  <SelectItem value={selectedOrganisation}>
                    {selectedOrganisation}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium" htmlFor="note">
              Optional Note
            </Label>
            <Input
              id="note"
              placeholder="Enter a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button
            onClick={handleClockIn}
            disabled={submittingClockIn}
            className="w-full font-semibold"
          >
            {submittingClockIn ? "Clocking In..." : "Clock In"}
          </Button>
        </>
      )}
    </div>
  );
}
