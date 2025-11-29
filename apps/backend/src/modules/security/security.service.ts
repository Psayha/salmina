/**
 * @file security.service.ts
 * @description Security monitoring service - banned IPs, fail2ban status
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

class SecurityService {
  /**
   * Get fail2ban status and banned IPs
   */
  async getFail2banStatus(): Promise<Fail2banStatus> {
    const result: Fail2banStatus = {
      available: false,
      jails: [],
      bannedIPs: [],
      totalBanned: 0,
    };

    try {
      // Check if fail2ban is available
      const { stdout: statusOut } = await execAsync('fail2ban-client status 2>/dev/null || echo "not_available"');

      if (statusOut.includes('not_available')) {
        return result;
      }

      result.available = true;

      // Parse jail list
      const jailMatch = statusOut.match(/Jail list:\s*(.+)/);
      if (jailMatch) {
        result.jails = jailMatch[1].split(',').map(j => j.trim()).filter(Boolean);
      }

      // Get banned IPs from each jail
      for (const jail of result.jails) {
        try {
          const { stdout: jailStatus } = await execAsync(`fail2ban-client status ${jail} 2>/dev/null`);

          // Parse banned IP list
          const bannedMatch = jailStatus.match(/Banned IP list:\s*(.+)/);
          if (bannedMatch && bannedMatch[1].trim()) {
            const ips = bannedMatch[1].trim().split(/\s+/).filter(Boolean);
            for (const ip of ips) {
              result.bannedIPs.push({ ip, jail });
            }
          }
        } catch {
          // Jail might not be accessible
        }
      }

      result.totalBanned = result.bannedIPs.length;
    } catch {
      // fail2ban not available or permission denied
    }

    return result;
  }

  /**
   * Get UFW firewall status
   */
  async getFirewallStatus(): Promise<{ enabled: boolean; rules: string[] }> {
    try {
      const { stdout } = await execAsync('ufw status 2>/dev/null || echo "not_available"');

      if (stdout.includes('not_available') || stdout.includes('inactive')) {
        return { enabled: false, rules: [] };
      }

      const rules: string[] = [];
      const lines = stdout.split('\n');

      for (const line of lines) {
        if (line.includes('ALLOW') || line.includes('DENY')) {
          rules.push(line.trim());
        }
      }

      return { enabled: true, rules };
    } catch {
      return { enabled: false, rules: [] };
    }
  }
}

export const securityService = new SecurityService();
