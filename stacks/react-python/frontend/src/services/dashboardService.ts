// src/services/dashboardService.ts
import api from '@/src/api/axios';
import { LeadStage } from '@/src/services/leadService';

// -- TYPES --
export interface DashboardSummary {
  total_customers: number;
  active_leads: Record<LeadStage, number>;
  leads_total_value: string;
}

// -- FUNCTIONS --
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get('/v1/dashboard/');
  return response.data;
};
