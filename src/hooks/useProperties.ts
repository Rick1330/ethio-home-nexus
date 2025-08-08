import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import propertyService, { Property, PropertyFilters, CreatePropertyData } from '@/services/propertyService';

// Get all properties
export const useProperties = (filters: PropertyFilters = {}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getProperties(filters),
  });
};

// Get single property
export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id),
    enabled: !!id,
  });
};

// Create property mutation
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, images }: { data: CreatePropertyData; images?: File[] }) =>
      propertyService.createProperty(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

// Update property mutation
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      data, 
      images 
    }: { 
      id: string; 
      data: Partial<CreatePropertyData>; 
      images?: File[] 
    }) => propertyService.updateProperty(id, data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
};

// Delete property mutation
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

// Search properties
export const useSearchProperties = (query: string, filters: PropertyFilters = {}) => {
  return useQuery({
    queryKey: ['properties', 'search', query, filters],
    queryFn: () => propertyService.searchProperties(query, filters),
    enabled: !!query,
  });
};