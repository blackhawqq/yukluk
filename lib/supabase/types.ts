export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_verified: boolean;
          iban: string | null;
          rating: number;
          rating_count: number;
          total_rentals: number;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          iban?: string | null;
          rating?: number;
          rating_count?: number;
          total_rentals?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          iban?: string | null;
          rating?: number;
          rating_count?: number;
          total_rentals?: number;
          created_at?: string;
        };
      };
      equipment: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          category: EquipmentCategory;
          brand: string | null;
          condition: EquipmentCondition;
          daily_price: number;
          deposit_amount: number;
          images: string[];
          location_city: string;
          location_district: string | null;
          is_available: boolean;
          specs: Json;
          total_rentals: number;
          rating: number;
          rating_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          category: EquipmentCategory;
          brand?: string | null;
          condition?: EquipmentCondition;
          daily_price: number;
          deposit_amount: number;
          images?: string[];
          location_city?: string;
          location_district?: string | null;
          is_available?: boolean;
          specs?: Json;
          total_rentals?: number;
          rating?: number;
          rating_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["equipment"]["Insert"]>;
      };
      rentals: {
        Row: {
          id: string;
          equipment_id: string;
          renter_id: string;
          owner_id: string;
          start_date: string;
          end_date: string;
          total_days: number;
          daily_price: number;
          rental_amount: number;
          platform_fee: number;
          owner_payout: number;
          deposit_amount: number;
          status: RentalStatus;
          iyzico_payment_id: string | null;
          iyzico_payment_status: string | null;
          renter_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          renter_id: string;
          owner_id: string;
          start_date: string;
          end_date: string;
          total_days: number;
          daily_price: number;
          rental_amount: number;
          platform_fee: number;
          owner_payout: number;
          deposit_amount: number;
          status?: RentalStatus;
          iyzico_payment_id?: string | null;
          iyzico_payment_status?: string | null;
          renter_notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rentals"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          rental_id: string;
          reviewer_id: string;
          reviewed_id: string | null;
          equipment_id: string | null;
          rating: number;
          comment: string | null;
          type: ReviewType;
          created_at: string;
        };
        Insert: {
          id?: string;
          rental_id: string;
          reviewer_id: string;
          reviewed_id?: string | null;
          equipment_id?: string | null;
          rating: number;
          comment?: string | null;
          type: ReviewType;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          rental_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          rental_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          equipment_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          equipment_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
      };
      unavailable_dates: {
        Row: {
          id: string;
          equipment_id: string;
          rental_id: string;
          date: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          rental_id: string;
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["unavailable_dates"]["Insert"]>;
      };
    };
  };
};

export type EquipmentCategory =
  | "backpack"
  | "tent"
  | "sleeping_bag"
  | "trekking_pole"
  | "headlamp"
  | "camp_stove"
  | "camp_chair"
  | "water_filter"
  | "other";

export type EquipmentCondition = "new" | "like_new" | "good" | "fair";

export type RentalStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "disputed";

export type ReviewType = "renter_to_owner" | "owner_to_renter";
