// src/services/customerService.ts
import api from '@/src/api/axios';

// -- TYPES --
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CustomerFilters {
  search?: string;
  is_active?: boolean;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// -- FUNCTIONS --
export const getCustomers = async (
  filters: CustomerFilters = {},
): Promise<PaginatedResponse<Customer>> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
  const response = await api.get(`/v1/customers/?${params.toString()}`);
  return response.data;
};

export const getCustomer = async (id: string): Promise<Customer> => {
  const response = await api.get(`/v1/customers/${id}/`);
  return response.data;
};

export const createCustomer = async (data: CreateCustomerData): Promise<Customer> => {
  const response = await api.post('/v1/customers/', data);
  return response.data;
};

export const updateCustomer = async (
  id: string,
  data: Partial<CreateCustomerData>,
): Promise<Customer> => {
  const response = await api.patch(`/v1/customers/${id}/`, data);
  return response.data;
};

export const deactivateCustomer = async (id: string): Promise<void> => {
  await api.post(`/v1/customers/${id}/deactivate/`);
};

export const getContacts = async (customerId: string): Promise<PaginatedResponse<Contact>> => {
  const response = await api.get(`/v1/customers/${customerId}/contacts/`);
  return response.data;
};
