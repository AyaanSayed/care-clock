"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function ManagerLocationForm() {
  const { data: session, status } = useSession();

  const [organization, setOrganization] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success("Location fetched successfully!");
        setLoadingLocation(false);
      },
      () => {
        toast.error("Unable to retrieve location.");
        setLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (!session || session.user.role !== "manager") return;

    const fetchExistingManager = async () => {
      const response = await fetch("/api/manager", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const existingManager = await response.json();
        setOrganization(existingManager.organization);
        setCoords({
          lat: existingManager.latitude,
          lng: existingManager.longitude,
        });
      }
    };
    fetchExistingManager();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organization.trim()) {
      toast.error("Please enter an organisation name.");
      return;
    }
    if (!coords) {
      toast.error("Please fetch your location before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization,
          latitude: coords.lat,
          longitude: coords.lng,
        }),
      });

      if (res.ok) {
        toast.success("Organisation location saved successfully!");
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Failed to save location.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving.");
    }
    setSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!organization.trim()) {
      toast.error("Please enter an organisation name.");
      return;
    }
    if (!coords) {
      toast.error("Please fetch your location before submitting.");
      return;
    }

    setSubmittingUpdate(true);
    try {
      const res = await fetch("/api/manager", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization,
          latitude: coords.lat,
          longitude: coords.lng,
        }),
      });

      if (res.ok) {
        toast.success("Organisation & location updated successfully!");
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Failed to update location.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating.");
    }
    setSubmittingUpdate(false);
  };

  const handleDelete = async () => {
    if (!session || session.user.role !== "manager") {
      toast.error("You must be a manager to delete this.");
      return;
    }

    const confirmDelete = confirm(
      "Are you sure you want to delete this organisation?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/manager", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Organisation deleted successfully!");
        setOrganization("");
        setCoords(null);
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Failed to delete organisation.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting.");
    }
  };

  if (status === "loading") {
    return <div className="text-gray-500">Loading...</div>;
  }
  if (!session || session.user.role !== "manager") {
    return (
      <div className="text-red-500">
        You must be a manager to access this page.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-4 p-4 border-gray-400 border rounded-md"
    >
      <div className="space-y-2">
        <Label htmlFor="organization">Organisation Name</Label>
        <Input
          id="organization"
          placeholder="Enter organisation name"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Location (Latitude, Longitude)</Label>
        <Input
          readOnly
          value={coords ? `${coords.lat}, ${coords.lng}` : ""}
          placeholder="No location fetched"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={getLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? "Fetching..." : "Get Current Location"}
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Saving..." : "Save Organisation & Location"}
      </Button>
      <Button
        type="button"
        onClick={handleUpdate}
        className="w-full"
        disabled={submittingUpdate}
      >
        {submittingUpdate ? "Updating..." : "Update Organisation & Location"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        className="w-full"
      >
        Delete
      </Button>
    </form>
  );
}
