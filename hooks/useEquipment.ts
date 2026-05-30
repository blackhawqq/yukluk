"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Equipment, EquipmentWithOwner, CreateEquipmentData, EquipmentFilters } from "@/types";

const PAGE_SIZE = 12;

export function useEquipment() {
  const [loading, setLoading] = useState(false);

  const getEquipment = async (filters: EquipmentFilters = {}) => {
    const supabase = createClient();
    setLoading(true);
    try {
      let query = supabase
        .from("equipment")
        .select("*, owner:profiles!owner_id(*)", { count: "exact" }) as ReturnType<typeof supabase.from>;

      if (filters.category) query = (query as any).eq("category", filters.category);
      if (filters.minPrice !== undefined) query = (query as any).gte("daily_price", filters.minPrice);
      if (filters.maxPrice !== undefined) query = (query as any).lte("daily_price", filters.maxPrice);
      if (filters.condition) query = (query as any).eq("condition", filters.condition);
      if (filters.minRating) query = (query as any).gte("rating", filters.minRating);
      if (filters.onlyAvailable) query = (query as any).eq("is_available", true);
      if (filters.search) query = (query as any).ilike("title", `%${filters.search}%`);

      switch (filters.sortBy) {
        case "cheapest": query = (query as any).order("daily_price", { ascending: true }); break;
        case "expensive": query = (query as any).order("daily_price", { ascending: false }); break;
        case "best_rated": query = (query as any).order("rating", { ascending: false }); break;
        default: query = (query as any).order("created_at", { ascending: false });
      }

      const page = filters.page || 1;
      const from = (page - 1) * PAGE_SIZE;
      query = (query as any).range(from, from + PAGE_SIZE - 1);

      const { data, count, error } = await (query as any);
      if (error) throw error;
      return { data: (data as EquipmentWithOwner[]) || [], count: count || 0, error: null };
    } catch (error) {
      return { data: [] as EquipmentWithOwner[], count: 0, error };
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentById = async (id: string) => {
    const supabase = createClient();
    const { data, error } = await (supabase
      .from("equipment")
      .select("*, owner:profiles!owner_id(*)")
      .eq("id", id)
      .single() as any);
    return { data: data as EquipmentWithOwner | null, error };
  };

  const createEquipment = async (data: CreateEquipmentData, ownerId: string) => {
    const supabase = createClient();
    const { data: equipment, error } = await (supabase
      .from("equipment")
      .insert({ ...data, owner_id: ownerId } as any)
      .select()
      .single() as any);
    return { data: equipment as Equipment | null, error };
  };

  const updateEquipment = async (id: string, data: Partial<CreateEquipmentData> & { is_available?: boolean }) => {
    const supabase = createClient();
    const { data: equipment, error } = await (supabase
      .from("equipment")
      .update(data as never)
      .eq("id", id)
      .select()
      .single() as any);
    return { data: equipment as Equipment | null, error };
  };

  const deleteEquipment = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    return { error };
  };

  const uploadImages = async (files: File[], equipmentId?: string): Promise<string[]> => {
    const supabase = createClient();
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${equipmentId || Date.now()}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("equipment-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (!error) {
        const { data } = supabase.storage.from("equipment-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const toggleFavorite = async (userId: string, equipmentId: string, isFavorited: boolean) => {
    const supabase = createClient();
    if (isFavorited) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("equipment_id", equipmentId);
    } else {
      await (supabase.from("favorites").insert({ user_id: userId, equipment_id: equipmentId } as any) as any);
    }
  };

  const getFavorites = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("favorites").select("equipment_id").eq("user_id", userId) as any;
    return (data as { equipment_id: string }[])?.map((f) => f.equipment_id) || [];
  };

  const getOwnerEquipment = async (ownerId: string) => {
    const supabase = createClient();
    const { data, error } = await (supabase
      .from("equipment")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false }) as any);
    return { data: data as Equipment[] | null, error };
  };

  return {
    loading,
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    uploadImages,
    toggleFavorite,
    getFavorites,
    getOwnerEquipment,
  };
}
