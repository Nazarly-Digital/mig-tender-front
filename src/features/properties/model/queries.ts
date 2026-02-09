import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { propertiesService } from "@/entities/properties";
import type {
  Property,
  PaginatedResponse,
  PropertyListParams,
  PropertyCreateRequest,
  PropertyUpdateRequest,
  PropertyImageCreateRequest,
} from "@/shared/types/properties";

// Query keys
export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (params?: PropertyListParams) =>
    [...propertyKeys.lists(), params] as const,
  my: (params?: PropertyListParams) =>
    [...propertyKeys.all, "my", params] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: number) => [...propertyKeys.details(), id] as const,
  images: (propertyId: number) =>
    [...propertyKeys.all, "images", propertyId] as const,
};

// --- Queries ---

export function useProperties(params?: PropertyListParams) {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: () => propertiesService.getAll(params).then((res) => res.data),
  });
}

export function useMyProperties(params?: PropertyListParams) {
  return useQuery({
    queryKey: propertyKeys.my(params),
    queryFn: () => propertiesService.getMy(params).then((res) => res.data),
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertiesService.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function usePropertyImages(propertyId: number) {
  return useQuery({
    queryKey: propertyKeys.images(propertyId),
    queryFn: () =>
      propertiesService.getImages(propertyId).then((res) => res.data),
    enabled: !!propertyId,
  });
}

// --- Mutations ---

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PropertyCreateRequest) =>
      propertiesService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PropertyUpdateRequest }) =>
      propertiesService.update(id, data).then((res) => res.data),
    onSuccess: (updatedFields, { id }) => {
      // Update the property in all cached lists with the response data
      const updateCache = (old: PaginatedResponse<Property> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          results: old.results.map((p) =>
            p.id === id ? { ...p, ...updatedFields } : p,
          ),
        };
      };

      queryClient.setQueriesData<PaginatedResponse<Property>>(
        { queryKey: propertyKeys.all },
        updateCache,
      );
    },
  });
}

export function useAddPropertyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      data,
    }: {
      propertyId: number;
      data: PropertyImageCreateRequest;
    }) => propertiesService.addImage(propertyId, data).then((res) => res.data),
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.images(propertyId),
      });
      queryClient.invalidateQueries({
        queryKey: propertyKeys.detail(propertyId),
      });
    },
  });
}
