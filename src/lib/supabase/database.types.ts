export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          company: string | null
          country_code: string
          created_at: string
          customer_id: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          postal_code: string
          region: string | null
          updated_at: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          company?: string | null
          country_code: string
          created_at?: string
          customer_id?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          postal_code: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          company?: string | null
          country_code?: string
          created_at?: string
          customer_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          postal_code?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_translations: {
        Row: {
          banner_id: string
          body: string | null
          created_at: string
          cta_label: string | null
          eyebrow: string | null
          image_alt: string | null
          locale: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_id: string
          body?: string | null
          created_at?: string
          cta_label?: string | null
          eyebrow?: string | null
          image_alt?: string | null
          locale: string
          title: string
          updated_at?: string
        }
        Update: {
          banner_id?: string
          body?: string | null
          created_at?: string
          cta_label?: string | null
          eyebrow?: string | null
          image_alt?: string | null
          locale?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banner_translations_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          cta_href: string | null
          ends_at: string | null
          id: string
          image_path: string | null
          key: string
          sort_order: number
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_href?: string | null
          ends_at?: string | null
          id?: string
          image_path?: string | null
          key: string
          sort_order?: number
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_href?: string | null
          ends_at?: string | null
          id?: string
          image_path?: string | null
          key?: string
          sort_order?: number
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          archived_at: string | null
          created_at: string
          id: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          created_at?: string
          id?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      category_translations: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          locale: string
          name: string
          seo_description: string | null
          seo_title: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          locale: string
          name: string
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          locale?: string
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coa_documents: {
        Row: {
          active: boolean
          batch_id: string | null
          created_at: string
          id: string
          product_id: string
          public_visible: boolean
          storage_path: string
          title: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          active?: boolean
          batch_id?: string | null
          created_at?: string
          id?: string
          product_id: string
          public_visible?: boolean
          storage_path: string
          title: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          active?: boolean
          batch_id?: string | null
          created_at?: string
          id?: string
          product_id?: string
          public_visible?: boolean
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coa_documents_batch_id_product_id_fkey"
            columns: ["batch_id", "product_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id", "product_id"]
          },
          {
            foreignKeyName: "coa_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          customer_id: string | null
          id: string
          order_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          order_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string | null
          id: string
          minimum_order_amount: number | null
          percentage_value: number | null
          starts_at: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          usage_count: number
          usage_limit: number | null
          value_amount: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          minimum_order_amount?: number | null
          percentage_value?: number | null
          starts_at?: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value_amount?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          minimum_order_amount?: number | null
          percentage_value?: number | null
          starts_at?: string | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          value_amount?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total_amount: number
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          product_strength: string
          product_unit: string
          quantity: number
          unit_price_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total_amount: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          product_strength: string
          product_unit: string
          quantity: number
          unit_price_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total_amount?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          product_strength?: string
          product_unit?: string
          quantity?: number
          unit_price_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_json: Json
          created_at: string
          currency: string
          customer_id: string | null
          customer_note: string | null
          discount_amount: number
          email: string
          fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]
          id: string
          internal_note: string | null
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_address_json: Json | null
          shipping_amount: number
          shipping_status: Database["public"]["Enums"]["shipping_status"]
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          billing_address_json: Json
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_note?: string | null
          discount_amount?: number
          email: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          internal_note?: string | null
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address_json?: Json | null
          shipping_amount?: number
          shipping_status?: Database["public"]["Enums"]["shipping_status"]
          subtotal_amount: number
          tax_amount?: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          billing_address_json?: Json
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_note?: string | null
          discount_amount?: number
          email?: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          internal_note?: string | null
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address_json?: Json | null
          shipping_amount?: number
          shipping_status?: Database["public"]["Enums"]["shipping_status"]
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json
          order_id: string
          provider: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          order_id: string
          provider?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          order_id?: string
          provider?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_batches: {
        Row: {
          active: boolean
          batch_number: string
          created_at: string
          id: string
          manufactured_at: string | null
          product_id: string
          purity: number | null
          test_date: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          batch_number: string
          created_at?: string
          id?: string
          manufactured_at?: string | null
          product_id: string
          purity?: number | null
          test_date?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          batch_number?: string
          created_at?: string
          id?: string
          manufactured_at?: string | null
          product_id?: string
          purity?: number | null
          test_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string
          product_id: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string
          product_id: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          storage_path: string
          updated_at: string
        }
        Insert: {
          alt_text: string
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          storage_path: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specification_translations: {
        Row: {
          created_at: string
          label: string
          locale: string
          specification_id: string
          updated_at: string
          value_override: string | null
        }
        Insert: {
          created_at?: string
          label: string
          locale: string
          specification_id: string
          updated_at?: string
          value_override?: string | null
        }
        Update: {
          created_at?: string
          label?: string
          locale?: string
          specification_id?: string
          updated_at?: string
          value_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specification_translations_specification_id_fkey"
            columns: ["specification_id"]
            isOneToOne: false
            referencedRelation: "product_specifications"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          code: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
          unit: string | null
          updated_at: string
          value: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          unit?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          unit?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_translations: {
        Row: {
          created_at: string
          description: string | null
          disclaimer: string | null
          locale: string
          name: string
          product_id: string
          seo_description: string | null
          seo_title: string | null
          shipping_information: string | null
          short_description: string | null
          short_name: string | null
          storage_information: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          disclaimer?: string | null
          locale: string
          name: string
          product_id: string
          seo_description?: string | null
          seo_title?: string | null
          shipping_information?: string | null
          short_description?: string | null
          short_name?: string | null
          storage_information?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          disclaimer?: string | null
          locale?: string
          name?: string
          product_id?: string
          seo_description?: string | null
          seo_title?: string | null
          shipping_information?: string | null
          short_description?: string | null
          short_name?: string | null
          storage_information?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_translations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          archived_at: string | null
          compare_at_price_amount: number | null
          created_at: string
          currency: string
          featured: boolean
          id: string
          price_amount: number
          sku: string | null
          slug: string
          sort_order: number
          stock_quantity: number
          stock_status: Database["public"]["Enums"]["product_stock_status"]
          strength: string
          unit: string
          updated_at: string
          visibility: Database["public"]["Enums"]["product_visibility"]
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          compare_at_price_amount?: number | null
          created_at?: string
          currency?: string
          featured?: boolean
          id?: string
          price_amount: number
          sku?: string | null
          slug: string
          sort_order?: number
          stock_quantity?: number
          stock_status?: Database["public"]["Enums"]["product_stock_status"]
          strength: string
          unit: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["product_visibility"]
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          compare_at_price_amount?: number | null
          created_at?: string
          currency?: string
          featured?: boolean
          id?: string
          price_amount?: number
          sku?: string | null
          slug?: string
          sort_order?: number
          stock_quantity?: number
          stock_status?: Database["public"]["Enums"]["product_stock_status"]
          strength?: string
          unit?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["product_visibility"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          code: Database["public"]["Enums"]["admin_role"]
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: Database["public"]["Enums"]["admin_role"]
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: Database["public"]["Enums"]["admin_role"]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_methods: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          free_shipping_threshold_amount: number | null
          id: string
          name: string
          price_amount: number
          shipping_zone_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          free_shipping_threshold_amount?: number | null
          id?: string
          name: string
          price_amount: number
          shipping_zone_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          free_shipping_threshold_amount?: number | null
          id?: string
          name?: string
          price_amount?: number
          shipping_zone_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_methods_shipping_zone_id_fkey"
            columns: ["shipping_zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_public_products: {
        Args: {
          requested_locale?: string
          result_limit?: number
          search_term: string
        }
        Returns: {
          compare_at_price_amount: number
          currency: string
          featured: boolean
          id: string
          image_alt: string
          image_path: string
          name: string
          price_amount: number
          short_name: string
          sku: string
          slug: string
          stock_status: Database["public"]["Enums"]["product_stock_status"]
          strength: string
          unit: string
        }[]
      }
    }
    Enums: {
      admin_role: "SUPER_ADMIN" | "ADMIN" | "ORDERS_MANAGER" | "CONTENT_MANAGER"
      coupon_type: "PERCENTAGE" | "FIXED"
      fulfillment_status:
        | "UNFULFILLED"
        | "PROCESSING"
        | "FULFILLED"
        | "CANCELLED"
      order_status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
      payment_status:
        | "PENDING"
        | "AUTHORIZED"
        | "PAID"
        | "FAILED"
        | "REFUNDED"
        | "PARTIALLY_REFUNDED"
        | "CANCELLED"
      product_stock_status:
        | "IN_STOCK"
        | "LOW_STOCK"
        | "OUT_OF_STOCK"
        | "DISABLED"
      product_visibility: "PUBLIC" | "HIDDEN" | "DRAFT"
      shipping_status:
        | "NOT_REQUIRED"
        | "PENDING"
        | "READY"
        | "SHIPPED"
        | "DELIVERED"
        | "RETURNED"
        | "CANCELLED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["SUPER_ADMIN", "ADMIN", "ORDERS_MANAGER", "CONTENT_MANAGER"],
      coupon_type: ["PERCENTAGE", "FIXED"],
      fulfillment_status: [
        "UNFULFILLED",
        "PROCESSING",
        "FULFILLED",
        "CANCELLED",
      ],
      order_status: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      payment_status: [
        "PENDING",
        "AUTHORIZED",
        "PAID",
        "FAILED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
        "CANCELLED",
      ],
      product_stock_status: [
        "IN_STOCK",
        "LOW_STOCK",
        "OUT_OF_STOCK",
        "DISABLED",
      ],
      product_visibility: ["PUBLIC", "HIDDEN", "DRAFT"],
      shipping_status: [
        "NOT_REQUIRED",
        "PENDING",
        "READY",
        "SHIPPED",
        "DELIVERED",
        "RETURNED",
        "CANCELLED",
      ],
    },
  },
} as const

