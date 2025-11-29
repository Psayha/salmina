/**
 * Security API endpoints
 */

import { apiClient, ApiResponse } from '../client';

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

/**
 * Get full security status
 */
export async function getStatus(): Promise<SecurityStatus> {
  const response = await apiClient.get<ApiResponse<SecurityStatus>>('/security/status');
  return response.data.data;
}

/**
 * Get fail2ban status and banned IPs
 */
export async function getFail2banStatus(): Promise<Fail2banStatus> {
  const response = await apiClient.get<ApiResponse<Fail2banStatus>>('/security/fail2ban');
  return response.data.data;
}

/**
 * Get firewall status
 */
export async function getFirewallStatus(): Promise<FirewallStatus> {
  const response = await apiClient.get<ApiResponse<FirewallStatus>>('/security/firewall');
  return response.data.data;
}

export const securityApi = {
  getStatus,
  getFail2banStatus,
  getFirewallStatus,
};
