#!/usr/bin/env node

/**
 * AgentOS CLI Tier Management System
 * Simple usage tracking and tier-based feature unlocks
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';

export interface TierConfig {
  name: string;
  price: number;
  operationsLimit: number;
  features: string[];
  confidenceThreshold: number;
}

export interface UserUsage {
  userId: string;
  tier: string;
  operationsUsed: number;
  resetDate: Date;
  subscriptionId?: string;
  paymentMethod?: string;
}

export class TierManager {
  private configPath: string;
  private usagePath: string;
  
  public readonly TIERS: Record<string, TierConfig> = {
    free: {
      name: 'Free',
      price: 0,
      operationsLimit: 750,
      features: ['Basic memory storage', 'Code execution', 'Confidence scoring'],
      confidenceThreshold: 0.7
    },
    standard: {
      name: 'Standard',
      price: 19,
      operationsLimit: 2500,
      features: ['Enhanced confidence scoring', 'Learning insights', 'Pattern recognition'],
      confidenceThreshold: 0.8
    },
    pro: {
      name: 'Pro', 
      price: 49,
      operationsLimit: 7000,
      features: ['Advanced analytics', 'Prediction accuracy', 'Memory optimization'],
      confidenceThreshold: 0.85
    },
    premium: {
      name: 'Premium',
      price: 99,
      operationsLimit: 50000,
      features: ['Enterprise execution', 'Unlimited memory', 'Priority support'],
      confidenceThreshold: 0.9
    }
  };

  constructor() {
    const agentOSDir = path.join(os.homedir(), '.agentos');
    this.configPath = path.join(agentOSDir, 'tier-config.json');
    this.usagePath = path.join(agentOSDir, 'usage-tracking.json');
    
    // Ensure directory exists
    fs.ensureDirSync(agentOSDir);
  }

  /**
   * Initialize user with free tier
   */
  async initializeUser(userId?: string): Promise<UserUsage> {
    const user: UserUsage = {
      userId: userId || this.generateUserId(),
      tier: 'free',
      operationsUsed: 0,
      resetDate: this.getNextResetDate()
    };

    await this.saveUsage(user);
    console.log(chalk.green('🎉 Welcome to AgentOS! You\'re on the Free tier with 750 operations/month.'));
    return user;
  }

  /**
   * Get current user usage
   */
  async getCurrentUsage(): Promise<UserUsage> {
    try {
      if (!await fs.pathExists(this.usagePath)) {
        return await this.initializeUser();
      }

      const usage = await fs.readJSON(this.usagePath);
      
      // Check if we need to reset monthly usage
      if (new Date() > new Date(usage.resetDate)) {
        usage.operationsUsed = 0;
        usage.resetDate = this.getNextResetDate();
        await this.saveUsage(usage);
      }

      return usage;
    } catch (error) {
      console.error(chalk.red('Error loading usage data:'), (error as Error).message);
      return await this.initializeUser();
    }
  }

  /**
   * Check if user can perform operation
   */
  async canPerformOperation(): Promise<{ allowed: boolean; usage: UserUsage; message?: string }> {
    const usage = await this.getCurrentUsage();
    const tier = this.TIERS[usage.tier];
    
    if (usage.operationsUsed >= tier.operationsLimit) {
      return {
        allowed: false,
        usage,
        message: `🚫 ${tier.name} tier limit reached (${tier.operationsLimit} operations/month). Upgrade to continue!`
      };
    }

    const remaining = tier.operationsLimit - usage.operationsUsed;
    let message;
    
    if (remaining <= 50) {
      message = `⚠️ Only ${remaining} operations remaining this month. Consider upgrading!`;
    } else if (remaining <= 200) {
      message = `📊 ${remaining} operations remaining this month.`;
    }

    return { allowed: true, usage, message };
  }

  /**
   * Record operation usage
   */
  async recordOperation(): Promise<UserUsage> {
    const usage = await this.getCurrentUsage();
    usage.operationsUsed++;
    await this.saveUsage(usage);
    return usage;
  }

  /**
   * Show tier information and upgrade options
   */
  showTiers(): void {
    console.log(chalk.bold.cyan('\n🚀 AgentOS CLI Tiers\n'));
    
    Object.entries(this.TIERS).forEach(([key, tier]) => {
      const priceText = tier.price === 0 ? 'FREE' : `$${tier.price}/month`;
      console.log(chalk.bold(`${tier.name} - ${priceText}`));
      console.log(chalk.blue(`  Operations: ${tier.operationsLimit.toLocaleString()}/month`));
      console.log(chalk.blue(`  Confidence: ${(tier.confidenceThreshold * 100)}%+ threshold`));
      console.log(chalk.gray('  Features:'));
      tier.features.forEach(feature => {
        console.log(chalk.gray(`    • ${feature}`));
      });
      console.log();
    });
  }

  /**
   * Show upgrade prompt
   */
  showUpgradePrompt(currentTier: string): void {
    const current = this.TIERS[currentTier];
    console.log(chalk.yellow(`\n⬆️  You're currently on the ${current.name} tier`));
    console.log(chalk.yellow('Upgrade to unlock more operations and enhanced features:\n'));
    
    Object.entries(this.TIERS).forEach(([key, tier]) => {
      if (tier.price > current.price) {
        console.log(chalk.cyan(`${tier.name} ($${tier.price}/month):`));
        console.log(chalk.cyan(`  • ${tier.operationsLimit.toLocaleString()} operations/month`));
        console.log(chalk.cyan(`  • ${(tier.confidenceThreshold * 100)}%+ confidence threshold`));
        tier.features.slice(-1).forEach(feature => {
          console.log(chalk.cyan(`  • ${feature}`));
        });
        console.log();
      }
    });

    console.log(chalk.bold.green('💳 Upgrade: agentos-dev upgrade <tier>'));
    console.log(chalk.bold.blue('📊 View tiers: agentos-dev tiers\n'));
  }

  /**
   * Upgrade user tier (simplified - would integrate with Stripe)
   */
  async upgradeTier(newTier: string): Promise<{ success: boolean; message: string }> {
    if (!this.TIERS[newTier]) {
      return { success: false, message: `Invalid tier: ${newTier}` };
    }

    const usage = await this.getCurrentUsage();
    const currentTier = this.TIERS[usage.tier];
    const targetTier = this.TIERS[newTier];

    if (targetTier.price <= currentTier.price) {
      return { success: false, message: 'Can only upgrade to higher tiers' };
    }

    // In real implementation, this would handle Stripe payment
    console.log(chalk.blue('💳 Processing upgrade...'));
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    usage.tier = newTier;
    usage.subscriptionId = `sub_${Date.now()}`;
    await this.saveUsage(usage);

    return { 
      success: true, 
      message: `🎉 Successfully upgraded to ${targetTier.name}! You now have ${targetTier.operationsLimit.toLocaleString()} operations/month.`
    };
  }

  /**
   * Get tier-based confidence threshold
   */
  getConfidenceThreshold(tier: string): number {
    return this.TIERS[tier]?.confidenceThreshold || 0.7;
  }

  /**
   * Check if feature is available for tier
   */
  hasFeature(tier: string, feature: string): boolean {
    const tierConfig = this.TIERS[tier];
    if (!tierConfig) return false;
    
    // Feature availability logic
    switch (feature) {
      case 'advanced_analytics':
        return ['pro', 'premium'].includes(tier);
      case 'enterprise_execution':
        return tier === 'premium';
      case 'learning_insights':
        return ['standard', 'pro', 'premium'].includes(tier);
      case 'pattern_recognition':
        return ['standard', 'pro', 'premium'].includes(tier);
      default:
        return true; // Basic features available to all
    }
  }

  /**
   * Show current status
   */
  async showStatus(): Promise<void> {
    const usage = await this.getCurrentUsage();
    const tier = this.TIERS[usage.tier];
    const remaining = tier.operationsLimit - usage.operationsUsed;
    const resetDate = new Date(usage.resetDate).toLocaleDateString();

    console.log(chalk.bold.cyan('\n📊 AgentOS CLI Status\n'));
    console.log(chalk.blue(`Current Tier: ${tier.name} ($${tier.price}/month)`));
    console.log(chalk.blue(`Operations Used: ${usage.operationsUsed.toLocaleString()} / ${tier.operationsLimit.toLocaleString()}`));
    console.log(chalk.blue(`Remaining: ${remaining.toLocaleString()}`));
    console.log(chalk.blue(`Resets: ${resetDate}`));
    console.log(chalk.blue(`Confidence Threshold: ${(tier.confidenceThreshold * 100)}%`));
    
    // Progress bar
    const percentage = (usage.operationsUsed / tier.operationsLimit) * 100;
    const barLength = 30;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    console.log(chalk.blue(`\nUsage: [${bar}] ${percentage.toFixed(1)}%\n`));

    if (remaining < 100) {
      this.showUpgradePrompt(usage.tier);
    }
  }

  private async saveUsage(usage: UserUsage): Promise<void> {
    await fs.writeJSON(this.usagePath, usage, { spaces: 2 });
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private getNextResetDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}

export default TierManager;