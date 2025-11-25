/**
 * @file health.ts
 * @description Health check API endpoints
 */

import api from '../client';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    database: 'ok' | 'error' | 'unknown';
    redis: 'ok' | 'error' | 'unknown';
  };
  version?: string;
}

export const healthApi = {
  /**
   * Get system health status
   */
  getHealth: async (): Promise<HealthCheckResponse> => {
    const response = await api.get('/health');
    return response.data;
  },

  /**
   * Check liveness (for internal use)
   */
  checkLiveness: async (): Promise<{ status: string }> => {
    const response = await api.get('/health/liveness');
    return response.data;
  },

  /**
   * Check readiness (for internal use)
   */
  checkReadiness: async (): Promise<{ status: string; error?: string }> => {
    const response = await api.get('/health/readiness');
    return response.data;
  },
};
