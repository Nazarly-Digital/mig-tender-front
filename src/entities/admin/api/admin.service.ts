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
  AdminUpdateBrokerRequest,
  AdminUpdateBrokerResponse,
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

  rejectBroker: (id: number, reason: string) =>
    apiInstance.post<VerifyBrokerResponse>("/admin/broker/verify/", { id, action: "reject", reason }),

  // Developer management (admin)
  createDeveloper: (data: AdminCreateDeveloperRequest) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("password_confirm", data.password_confirm);
    formData.append("company_name", data.company_name);
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("inn_number", data.inn_number);
    formData.append("phone_number", data.phone_number);
    if (data.inn) formData.append("inn", data.inn, data.inn.name);
    if (data.passport) formData.append("passport", data.passport, data.passport.name);
    formData.append("ddu_template", data.ddu_template, data.ddu_template.name);
    return apiInstance.post<AdminDeveloperResponse>(
      "/admin/developers/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  updateDeveloper: (id: number, data: AdminUpdateDeveloperRequest) => {
    const hasFile = !!data.ddu_template;
    if (hasFile) {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof File) {
          formData.append(k, v, v.name);
        } else {
          formData.append(k, String(v));
        }
      });
      return apiInstance.patch<AdminDeveloperResponse>(
        `/admin/developers/${id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
    }
    return apiInstance.patch<AdminDeveloperResponse>(`/admin/developers/${id}/`, data);
  },

  // Broker management (admin edits via shared /admin/users/<id>/ endpoint)
  updateBroker: (id: number, data: AdminUpdateBrokerRequest) =>
    apiInstance.patch<AdminUpdateBrokerResponse>(`/admin/users/${id}/`, data),

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
