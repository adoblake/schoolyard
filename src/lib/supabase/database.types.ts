// Generated from the Supabase project schema (public). Regenerate after schema
// changes with: npx supabase gen types typescript --project-id yyrbpxpkvlkefpkaooxg
// (Relationships trimmed to what the app's joins use.)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      blocks: {
        Row: { blocked_id: string; blocker_id: string; created_at: string };
        Insert: { blocked_id: string; blocker_id: string; created_at?: string };
        Update: { blocked_id?: string; blocker_id?: string; created_at?: string };
        Relationships: Rel[];
      };
      campus_requests: {
        Row: { city: string | null; created_at: string; email: string | null; id: string; role: string; school_name: string; state: string | null };
        Insert: { city?: string | null; created_at?: string; email?: string | null; id?: string; role?: string; school_name: string; state?: string | null };
        Update: { city?: string | null; created_at?: string; email?: string | null; id?: string; role?: string; school_name?: string; state?: string | null };
        Relationships: [];
      };
      conversations: {
        Row: { buyer_id: string; created_at: string; id: string; listing_id: string; seller_id: string };
        Insert: { buyer_id: string; created_at?: string; id?: string; listing_id: string; seller_id: string };
        Update: { buyer_id?: string; created_at?: string; id?: string; listing_id?: string; seller_id?: string };
        Relationships: Rel[];
      };
      listing_photos: {
        Row: { created_at: string; id: string; listing_id: string; position: number; storage_path: string };
        Insert: { created_at?: string; id?: string; listing_id: string; position?: number; storage_path: string };
        Update: { created_at?: string; id?: string; listing_id?: string; position?: number; storage_path?: string };
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          area: string;
          category: Database["public"]["Enums"]["listing_category"];
          condition: Database["public"]["Enums"]["listing_condition"];
          created_at: string;
          description: string;
          expires_at: string;
          id: string;
          price_cents: number;
          region_slug: string;
          school_id: string;
          search: unknown;
          seller_id: string;
          status: Database["public"]["Enums"]["listing_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          area: string;
          category: Database["public"]["Enums"]["listing_category"];
          condition?: Database["public"]["Enums"]["listing_condition"];
          created_at?: string;
          description: string;
          expires_at?: string;
          id?: string;
          price_cents: number;
          region_slug: string;
          school_id: string;
          search?: unknown;
          seller_id: string;
          status?: Database["public"]["Enums"]["listing_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          area?: string;
          category?: Database["public"]["Enums"]["listing_category"];
          condition?: Database["public"]["Enums"]["listing_condition"];
          created_at?: string;
          description?: string;
          expires_at?: string;
          id?: string;
          price_cents?: number;
          region_slug?: string;
          school_id?: string;
          search?: unknown;
          seller_id?: string;
          status?: Database["public"]["Enums"]["listing_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_region_slug_fkey";
            columns: ["region_slug"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "listings_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listings_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: { body: string; conversation_id: string; created_at: string; id: string; read_at: string | null; sender_id: string };
        Insert: { body: string; conversation_id: string; created_at?: string; id?: string; read_at?: string | null; sender_id: string };
        Update: { body?: string; conversation_id?: string; created_at?: string; id?: string; read_at?: string | null; sender_id?: string };
        Relationships: Rel[];
      };
      profiles: {
        Row: { created_at: string; display_name: string; id: string; school_id: string | null; verified_domain: string | null };
        Insert: { created_at?: string; display_name?: string; id: string; school_id?: string | null; verified_domain?: string | null };
        Update: { created_at?: string; display_name?: string; id?: string; school_id?: string | null; verified_domain?: string | null };
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      regions: {
        Row: { label: string; name: string; slug: string; sort_order: number; subtitle: string };
        Insert: { label: string; name: string; slug: string; sort_order?: number; subtitle: string };
        Update: { label?: string; name?: string; slug?: string; sort_order?: number; subtitle?: string };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          listing_id: string | null;
          reason: string;
          reported_user_id: string | null;
          reporter_id: string;
          status: Database["public"]["Enums"]["report_status"];
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          listing_id?: string | null;
          reason: string;
          reported_user_id?: string | null;
          reporter_id: string;
          status?: Database["public"]["Enums"]["report_status"];
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          listing_id?: string | null;
          reason?: string;
          reported_user_id?: string | null;
          reporter_id?: string;
          status?: Database["public"]["Enums"]["report_status"];
        };
        Relationships: Rel[];
      };
      saved_listings: {
        Row: { created_at: string; listing_id: string; user_id: string };
        Insert: { created_at?: string; listing_id: string; user_id: string };
        Update: { created_at?: string; listing_id?: string; user_id?: string };
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      school_email_domains: {
        Row: { domain: string; school_id: string };
        Insert: { domain: string; school_id: string };
        Update: { domain?: string; school_id?: string };
        Relationships: [
          {
            foreignKeyName: "school_email_domains_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      schools: {
        Row: { id: string; name: string; region_slug: string; sort_order: number };
        Insert: { id: string; name: string; region_slug: string; sort_order?: number };
        Update: { id?: string; name?: string; region_slug?: string; sort_order?: number };
        Relationships: [
          {
            foreignKeyName: "schools_region_slug_fkey";
            columns: ["region_slug"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["slug"];
          },
        ];
      };
      tester_emails: {
        Row: { domain: string; email: string; note: string | null };
        Insert: { domain: string; email: string; note?: string | null };
        Update: { domain?: string; email?: string; note?: string | null };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      email_is_eligible: { Args: { email: string }; Returns: boolean };
      matching_school_domain: { Args: { email: string }; Returns: string };
      signup_domain: { Args: { email: string }; Returns: string };
    };
    Enums: {
      listing_category: "books" | "furniture" | "electronics" | "supplies" | "free" | "wanted" | "services" | "dorm/apartment";
      listing_condition: "new" | "like new" | "good" | "fair" | "for parts";
      listing_status: "active" | "sold" | "expired" | "removed";
      report_status: "open" | "actioned" | "dismissed";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
