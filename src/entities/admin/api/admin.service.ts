import { apiInstance } from "@/shared/api";
import type {
  AdminUser,
  AdminUserListParams,
  BlockUserResponse,
  VerifyBrokerResponse,
  PendingProperty,
  PendingPropertyListParams,
  PropertyActionResponse,
  RejectPropertyRequest,
  PaginatedResponse,
  AdminCreateDeveloperRequest,
  AdminUpdateDeveloperRequest,
  AdminDeveloperResponse,
} from "@/shared/types/admin";

export const adminService = {
  // Users
  getUsers: (params?: AdminUserListParams) =>
    apiInstance.get<PaginatedResponse<AdminUser>>("/admin/users/", { params }),

  blockUser: (id: number, isActive: boolean) =>
    apiInstance.patch<BlockUserResponse>(`/admin/users/${id}/block/`, { is_active: isActive }),

  // Broker verification
  verifyBroker: (id: number) =>
    apiInstance.post<VerifyBrokerResponse>("/admin/broker/verify/", { id, action: "accept" }),

  // Developer management (admin)
  createDeveloper: (data: AdminCreateDeveloperRequest) =>
    apiInstance.post<AdminDeveloperResponse>("/admin/developers/", data),

  updateDeveloper: (id: number, data: AdminUpdateDeveloperRequest) =>
    apiInstance.patch<AdminDeveloperResponse>(`/admin/developers/${id}/`, data),

  // Properties moderation
  getPendingProperties: (params?: PendingPropertyListParams) =>
    apiInstance.get<PendingProperty[] | PaginatedResponse<PendingProperty>>(
      "/admin/properties/pending/",
      { params },
    ),

  approveProperty: (id: number) =>
    apiInstance.patch<PropertyActionResponse>(
      `/admin/properties/${id}/approve/`,
    ),

  rejectProperty: (id: number, data: RejectPropertyRequest) =>
    apiInstance.patch<PropertyActionResponse>(
      `/admin/properties/${id}/reject/`,
      data,
    ),
};
