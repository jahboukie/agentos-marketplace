/**
 * 🔐 AgentOS License Manager
 * Integrates with RipBug.dev license system for subscription management
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';

export interface LicenseInfo {
  key: string;
  type: 'TRIAL' | 'EARLY_ADOPTER' | 'STANDARD' | 'PRO' | 'PREMIUM' | 'OASIS';
  email: string;
  validUntil: Date;
  operationsLimit: number;
  features: string[];
  isValid: boolean;
}

export interface AgentOSTier {
  name: string;
  price: number;
  operationsLimit: number;
  features: string[];
  confidenceThreshold: number;
  keyPrefix: string;
}

export class LicenseManager {
  private licensePath: string;
  private configPath: string;
  
  public readonly TIERS: Record<string, AgentOSTier> = {
    trial: {
      name: 'AgentOS Trial',
      price: 0,
      operationsLimit: 100,
      features: ['Basic confidence scoring', 'Standard memory', '7-day experience'],
      confidenceThreshold: 0.7,
      keyPrefix: 'AOS-TRIAL'
    },
    starter: {
      name: 'AgentOS Starter',
      price: 29,
      operationsLimit: 2500,
      features: ['Enhanced confidence', 'Advanced memory', 'Multi-agent coordination'],
      confidenceThreshold: 0.8,
      keyPrefix: 'AOS-STARTER'
    },
    professional: {
      name: 'AgentOS Professional',
      price: 79,
      operationsLimit: 10000,
      features: ['Premium confidence', 'Cross-instance memory', 'Analytics dashboard'],
      confidenceThreshold: 0.9,
      keyPrefix: 'AOS-PRO'
    },
    enterprise: {
      name: 'AgentOS Enterprise',
      price: 199,
      operationsLimit: 50000,
      features: ['Enterprise confidence', 'Team collaboration', 'Custom models'],
      confidenceThreshold: 0.95,
      keyPrefix: 'AOS-ENTERPRISE'
    },
    ultimate: {
      name: 'AgentOS Ultimate',
      price: 499,
      operationsLimit: Infinity,
      features: ['Maximum confidence', 'Unlimited operations', 'Premium support'],
      confidenceThreshold: 0.98,
      keyPrefix: 'AOS-ULTIMATE'
    },
    oasis: {
      name: 'Developer Oasis',
      price: 0,
      operationsLimit: Infinity,
      features: ['Unlimited local development', 'Cross-instance paradise'],
      confidenceThreshold: 0.95,
      keyPrefix: 'AOS-OASIS'
    }
  };

  constructor() {
    const agentOSDir = path.join(os.homedir(), '.agentos');
    this.licensePath = path.join(agentOSDir, 'license.json');
    this.configPath = path.join(agentOSDir, 'config.json');
    fs.ensureDirSync(agentOSDir);
  }

  /**
   * 🔑 Validate license key with RipBug backend
   */
  async validateLicense(licenseKey: string): Promise<{ valid: boolean; licenseInfo?: LicenseInfo; error?: string }> {
    try {
      // Parse license key format: {PRODUCT}-{TYPE}-{SEGMENT1}-{SEGMENT2}-{SEGMENT3}
      const parts = licenseKey.split('-');
      if (parts.length !== 5) {
        return { valid: false, error: 'Invalid license key format' };
      }

      const product = parts[0]; // AGM or AOS
      if (product !== 'AGM' && product !== 'AOS') {
        return { valid: false, error: 'Invalid product code. AgentOS requires AOS- license keys.' };
      }

      if (product === 'AGM') {
        return { valid: false, error: 'AntiGoldfishMode license detected. Please use an AgentOS (AOS-) license key.' };
      }

      const keyType = parts[1];
      const tierKey = this.mapKeyTypeToTier(keyType);
      
      if (!tierKey) {
        return { valid: false, error: 'Unknown license type' };
      }

      // In real implementation, this would call RipBug API for validation
      // For now, simulate validation based on key format
      const tier = this.TIERS[tierKey];
      const licenseInfo: LicenseInfo = {
        key: licenseKey,
        type: keyType as any,
        email: 'user@example.com', // Would come from API
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        operationsLimit: tier.operationsLimit,
        features: tier.features,
        isValid: true
      };

      await this.saveLicense(licenseInfo);
      return { valid: true, licenseInfo };

    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  /**
   * 📊 Get current license status
   */
  async getCurrentLicense(): Promise<LicenseInfo | null> {
    try {
      if (await fs.pathExists(this.licensePath)) {
        const license = await fs.readJSON(this.licensePath);
        
        // Check if license is still valid
        if (new Date(license.validUntil) > new Date()) {
          return license;
        } else {
          console.log(chalk.yellow('⚠️ License has expired'));
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading license:', error);
      return null;
    }
  }

  /**
   * 🎯 Check if operation is allowed
   */
  async canPerformOperation(): Promise<{ 
    allowed: boolean; 
    license: LicenseInfo | null; 
    message?: string;
    upgradeUrl?: string;
  }> {
    const license = await this.getCurrentLicense();
    
    if (!license) {
      return {
        allowed: false,
        license: null,
        message: '🔑 No valid license found. Get your license at https://ripbug.dev',
        upgradeUrl: 'https://ripbug.dev'
      };
    }

    // Check if trial period expired
    if (license.type === 'TRIAL' && new Date(license.validUntil) <= new Date()) {
      return {
        allowed: false,
        license,
        message: '⏰ Trial period expired. Upgrade to continue unlimited AI development!',
        upgradeUrl: 'https://ripbug.dev'
      };
    }

    // For paid tiers, always allow (operation counting handled separately)
    return {
      allowed: true,
      license,
      message: license.operationsLimit === Infinity ? 
        '🏝️ Unlimited operations available!' : 
        `✅ Licensed for ${license.operationsLimit.toLocaleString()} operations`
    };
  }

  /**
   * 🔧 Activate license with key
   */
  async activateLicense(licenseKey: string, email?: string): Promise<{ success: boolean; message: string }> {
    console.log(chalk.blue('🔍 Validating license key...'));
    
    const validation = await this.validateLicense(licenseKey);
    
    if (!validation.valid) {
      return { 
        success: false, 
        message: `❌ License validation failed: ${validation.error}` 
      };
    }

    const licenseInfo = validation.licenseInfo!;
    if (email) {
      licenseInfo.email = email;
    }

    await this.saveLicense(licenseInfo);
    
    const tier = this.getTierFromLicense(licenseInfo);
    
    return {
      success: true,
      message: `🎉 ${tier.name} license activated! You now have ${licenseInfo.operationsLimit === Infinity ? 'unlimited' : licenseInfo.operationsLimit.toLocaleString()} operations.`
    };
  }

  /**
   * 📈 Show upgrade options
   */
  showUpgradeOptions(currentLicense?: LicenseInfo): void {
    console.log(chalk.bold.cyan('\n🚀 AgentOS License Tiers\n'));
    
    Object.entries(this.TIERS).forEach(([key, tier]) => {
      if (key === 'oasis') return; // Skip oasis in public display
      
      const isCurrent = currentLicense && this.getTierFromLicense(currentLicense).name === tier.name;
      const prefix = isCurrent ? '✅ CURRENT' : '  ';
      
      console.log(chalk.bold(`${prefix} ${tier.name} - $${tier.price}/year`));
      console.log(chalk.blue(`     Operations: ${tier.operationsLimit === Infinity ? 'Unlimited' : tier.operationsLimit.toLocaleString()}/year`));
      console.log(chalk.blue(`     Confidence: ${(tier.confidenceThreshold * 100)}%+ threshold`));
      console.log(chalk.gray('     Features:'));
      tier.features.forEach(feature => {
        console.log(chalk.gray(`       • ${feature}`));
      });
      console.log();
    });

    console.log(chalk.bold.green('🔑 Get your license: https://ripbug.dev'));
    console.log(chalk.bold.blue('💡 Activate: agentos license activate <key>'));
  }

  /**
   * 🏝️ Check for developer oasis
   */
  async checkForOasis(): Promise<boolean> {
    try {
      const oasisPath = path.join(os.homedir(), '.agentos', 'developer-oasis.json');
      return await fs.pathExists(oasisPath);
    } catch {
      return false;
    }
  }

  private async saveLicense(license: LicenseInfo): Promise<void> {
    await fs.writeJSON(this.licensePath, license, { spaces: 2 });
  }

  private mapKeyTypeToTier(keyType: string): string | null {
    const mapping: Record<string, string> = {
      'TRIAL': 'trial',
      'STARTER': 'starter', 
      'PRO': 'professional',
      'ENTERPRISE': 'enterprise',
      'ULTIMATE': 'ultimate',
      'OASIS': 'oasis'
    };
    return mapping[keyType] || null;
  }

  private getTierFromLicense(license: LicenseInfo): AgentOSTier {
    const tierKey = this.mapKeyTypeToTier(license.type);
    return this.TIERS[tierKey!];
  }
}

export default LicenseManager;