// Property enums
export type PropertyType =
  | "apartment"
  | "house"
  | "townhouse"
  | "commercial"
  | "land";

export type PropertyClass = "economy" | "comfort" | "business" | "premium";

export type PropertyStatus = "draft" | "published" | "archived";

// Property Image
export type PropertyImage = {
  id: number;
  url: string;
  external_url: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

// Property
export type Property = {
  id: number;
  developer: number;
  type: PropertyType;
  address: string;
  area: string; // decimal as string
  property_class: PropertyClass;
  price: string; // decimal as string
  currency: string;
  deadline: string | null;
  status: PropertyStatus;
  images: PropertyImage[];
  created_at: string;
  updated_at: string;
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
  property_class: PropertyClass;
  price: string;
  currency?: string;
  deadline?: string | null;
  status?: PropertyStatus;
};

// Update (partial)
export type PropertyUpdateRequest = {
  type?: PropertyType;
  address?: string;
  area?: string;
  property_class?: PropertyClass;
  price?: string;
  currency?: string;
  deadline?: string | null;
  status?: PropertyStatus;
};

// Image create
export type PropertyImageCreateRequest = {
  image?: File;
  external_url?: string;
  sort_order?: number;
  is_primary?: boolean;
};
