"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Rental, RentalWithDetails, CreateRentalData } from "@/types";
import type { RentalStatus } from "@/lib/supabase/types";

export function useRentals() {
  const [loading, setLoading] = useState(false);

  const createRental = async (data: CreateRentalData, renterId: string) => {
    const supabase = createClient();
    setLoading(true);
    try {
      const { data: rental, error } = await (supabase
        .from("rentals")
        .insert({ ...data, renter_id: renterId } as any)
        .select()
        .single() as any);
      return { data: rental as Rental | null, error };
    } finally {
      setLoading(false);
    }
  };

  const getRentalById = async (id: string) => {
    const supabase = createClient();
    const { data, error } = await (supabase
      .from("rentals")
      .select("*, equipment(*), renter:profiles!renter_id(*), owner:profiles!owner_id(*)")
      .eq("id", id)
      .single() as any);
    return { data: data as RentalWithDetails | null, error };
  };

  const getMyRentals = async (userId: string, type: "renter" | "owner") => {
    const supabase = createClient();
    const field = type === "renter" ? "renter_id" : "owner_id";
    const { data, error } = await (supabase
      .from("rentals")
      .select("*, equipment(*), renter:profiles!renter_id(*), owner:profiles!owner_id(*)")
      .eq(field, userId)
      .order("created_at", { ascending: false }) as any);
    return { data: data as RentalWithDetails[] | null, error };
  };

  const updateRentalStatus = async (id: string, status: RentalStatus) => {
    const supabase = createClient();
    const { data, error } = await (supabase
      .from("rentals")
      .update({ status } as never)
      .eq("id", id)
      .select()
      .single() as any);
    return { data: data as Rental | null, error };
  };

  const getUnavailableDates = async (equipmentId: string): Promise<string[]> => {
    const supabase = createClient();
    const { data } = await (supabase
      .from("unavailable_dates")
      .select("date")
      .eq("equipment_id", equipmentId) as any);
    return (data as { date: string }[])?.map((d) => d.date) || [];
  };

  const checkAvailability = async (
    equipmentId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> => {
    const supabase = createClient();
    const { data } = await (supabase
      .from("unavailable_dates")
      .select("date")
      .eq("equipment_id", equipmentId)
      .gte("date", startDate)
      .lte("date", endDate) as any);
    return !data || (data as unknown[]).length === 0;
  };

  return {
    loading,
    createRental,
    getRentalById,
    getMyRentals,
    updateRentalStatus,
    getUnavailableDates,
    checkAvailability,
  };
}
