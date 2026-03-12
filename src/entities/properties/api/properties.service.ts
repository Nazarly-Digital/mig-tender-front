import { apiInstance } from "@/shared/api";
import type {
  Property,
  PropertyListParams,
  PropertyCreateRequest,
  PropertyUpdateRequest,
  PropertyImage,
  PropertyImageCreateRequest,
  PaginatedResponse,
} from "@/shared/types/properties";

export const propertiesService = {
  // List all properties (with filters & pagination)
  getAll: (params?: PropertyListParams) =>
    apiInstance.get<PaginatedResponse<Property>>("/properties/", { params }),

  // Get my properties (developer)
  getMy: (params?: PropertyListParams) =>
    apiInstance.get<PaginatedResponse<Property>>("/properties/my/", { params }),

  // Get single property
  getById: (id: number) =>
    apiInstance.get<Property>(`/properties/${id}/`),

  // Create property
  create: (data: PropertyCreateRequest) =>
    apiInstance.post<Property>("/properties/", data),

  // Update property (partial)
  update: (id: number, data: PropertyUpdateRequest) =>
    apiInstance.patch<Property>(`/properties/${id}/`, data),

  // Delete property
  delete: (id: number) =>
    apiInstance.delete(`/properties/${id}/delete/`),

  // List images for a property
  getImages: (propertyId: number) =>
    apiInstance.get<PropertyImage[]>(`/properties/${propertyId}/images/`),

  // Delete image
  deleteImage: (propertyId: number, imageId: number) =>
    apiInstance.delete(`/properties/${propertyId}/images/${imageId}/`),

  // Upload image for a property
  addImage: (propertyId: number, data: PropertyImageCreateRequest) => {
    const formData = new FormData();
    if (data.image) formData.append("image", data.image, data.image.name);
    if (data.external_url) formData.append("external_url", data.external_url);

    return apiInstance.post<PropertyImage>(
      `/properties/${propertyId}/images/`,
      formData,
      { headers: { 'Content-Type': undefined } },
    );
  },
};
