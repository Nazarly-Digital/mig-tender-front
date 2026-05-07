// Property enums
export type PropertyType =
  | "apartment"
  | "house"
  | "townhouse"
  | "commercial"
  | "land";

export type PropertyClass = "comfort" | "business" | "premium" | "elite";

export type CommercialSubtype = "office" | "retail";

export type PropertyStatus = "draft" | "published" | "archived" | "sold";

// Property Image
export type PropertyImage = {
  id: number;
  url: string;
  external_url: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

// Property
export type Property = {
  id: number;
  reference_id: string;
  developer: number;
  type: PropertyType;
  address: string;
  area: string; // decimal as string
  property_class: PropertyClass;
  price: string | null; // decimal as string; null when hidden by auction
  currency: string;
  deadline: string | null;
  status: PropertyStatus;
  moderation_status?: ModerationStatus;
  moderation_rejection_reason?: string | null;
  commission_rate: string | null;
  developer_name?: string;
  project?: string;
  project_comment?: string;
  commercial_subtype?: CommercialSubtype | null;
  floor?: number | null;
  land_number?: string | null;
  house_number?: string | null;
  show_price_to_brokers?: boolean;
  images: PropertyImage[];
  created_at: string;
  updated_at: string;
  is_editable?: boolean;
};

// List / filters
export type PropertyListParams = {
  address?: string;
  area_min?: number;
  area_max?: number;
  currency?: string;
  deadline?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  price_min?: number;
  price_max?: number;
  property_class?: PropertyClass;
  status?: PropertyStatus;
  moderation_status?: ModerationStatus;
  type?: PropertyType;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// Create
export type PropertyCreateRequest = {
  type: PropertyType;
  address: string;
  area: string;
  property_class?: PropertyClass | null;
  price: string;
  currency?: string;
  deadline?: string | null;
  commission_rate?: string | null;
  status?: PropertyStatus;
  floor?: number | null;
  developer_name?: string;
  project?: string;
  project_comment?: string;
  commercial_subtype?: CommercialSubtype | null;
  land_number?: string | null;
  house_number?: string | null;
  show_price_to_brokers?: boolean;
};

// Update (partial)
export type PropertyUpdateRequest = {
  type?: PropertyType;
  address?: string;
  area?: string;
  property_class?: PropertyClass | null;
  price?: string;
  currency?: string;
  deadline?: string | null;
  commission_rate?: string | null;
  status?: PropertyStatus;
  floor?: number | null;
  developer_name?: string;
  project?: string;
  project_comment?: string;
  commercial_subtype?: CommercialSubtype | null;
  land_number?: string | null;
  house_number?: string | null;
  show_price_to_brokers?: boolean;
};

// Image create
export type PropertyImageCreateRequest = {
  image?: File;
  external_url?: string;
  sort_order?: number;
  is_primary?: boolean;
};
