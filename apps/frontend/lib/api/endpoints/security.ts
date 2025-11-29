/**
 * Security API endpoints
 */

import { apiClient } from '../client';

export interface BannedIPInfo {
  ip: string;
  jail: string;
}

export interface Fail2banStatus {
  available: boolean;
  jails: string[];
  bannedIPs: BannedIPInfo[];
  totalBanned: number;
}

export interface FirewallStatus {
  enabled: boolean;
  rules: string[];
}

export interface SecurityStatus {
  fail2ban: Fail2banStatus;
  firewall: FirewallStatus;
}

export const securityApi = {
  /**
   * Get full security status
   */
  async getStatus(): Promise<SecurityStatus> {
    const response = await apiClient.get<{ success: boolean; data: SecurityStatus }>(
      '/api/security/status'
    );
    return response.data;
  },

  /**
   * Get fail2ban status and banned IPs
   */
  async getFail2banStatus(): Promise<Fail2banStatus> {
    const response = await apiClient.get<{ success: boolean; data: Fail2banStatus }>(
      '/api/security/fail2ban'
    );
    return response.data;
  },

  /**
   * Get firewall status
   */
  async getFirewallStatus(): Promise<FirewallStatus> {
    const response = await apiClient.get<{ success: boolean; data: FirewallStatus }>(
      '/api/security/firewall'
    );
    return response.data;
  },
};
