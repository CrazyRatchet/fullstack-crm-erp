// src/services/leadService.ts
import api from '@/src/api/axios';
import { PaginatedResponse } from '@/src/services/customerService';

// -- TYPES --
export type LeadStage = 'new' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  title: string;
  value: string;
  stage: LeadStage;
  expected_close_date: string;
  customer: string;
  assigned_to: string | null;
  created_at: string;
}

export interface LeadFilters {
  stage?: LeadStage;
  search?: string;
}

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const STAGES: LeadStage[] = [
  'new',
  'contacted',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
];

// -- FUNCTIONS --
export const getLeads = async (filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> => {
  const params = new URLSearchParams();
  if (filters.stage) params.append('stage', filters.stage);
  if (filters.search) params.append('search', filters.search);
  const response = await api.get(`/v1/leads/?${params.toString()}`);
  return response.data;
};

export const getLead = async (id: string): Promise<Lead> => {
  const response = await api.get(`/v1/leads/${id}/`);
  return response.data;
};
