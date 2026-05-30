import type { Database, EquipmentCategory, EquipmentCondition, RentalStatus } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
export type Rental = Database["public"]["Tables"]["rentals"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];

export type { EquipmentCategory, EquipmentCondition, RentalStatus };

export type EquipmentWithOwner = Equipment & {
  owner: Profile;
  is_favorited?: boolean;
};

export type RentalWithDetails = Rental & {
  equipment: Equipment;
  renter: Profile;
  owner: Profile;
};

export type MessageWithSender = Message & {
  sender: Profile;
};

export type ReviewWithReviewer = Review & {
  reviewer: Profile;
};

export type ConversationPreview = {
  rental_id: string;
  other_user: Profile;
  equipment: Equipment;
  last_message: Message | null;
  unread_count: number;
};

export type EquipmentFilters = {
  category?: EquipmentCategory | "";
  minPrice?: number;
  maxPrice?: number;
  condition?: EquipmentCondition | "";
  minRating?: number;
  onlyAvailable?: boolean;
  search?: string;
  sortBy?: "newest" | "cheapest" | "expensive" | "best_rated";
  page?: number;
};

export type CreateEquipmentData = {
  title: string;
  description: string;
  category: EquipmentCategory;
  brand: string;
  condition: EquipmentCondition;
  daily_price: number;
  deposit_amount: number;
  images: string[];
  location_city: string;
  location_district: string;
  specs?: Record<string, string>;
};

export type CreateRentalData = {
  equipment_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_price: number;
  rental_amount: number;
  platform_fee: number;
  owner_payout: number;
  deposit_amount: number;
  renter_notes?: string;
};
