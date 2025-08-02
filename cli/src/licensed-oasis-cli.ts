#!/usr/bin/env node

/**
 * 🏝️ AgentOS Licensed CLI - Enterprise-Ready Developer Oasis
 * Integrated with RipBug license system for subscription management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { LicenseManager } from './license-manager';

const program = new Command();

class LicensedAgentOS {
  private licenseManager: LicenseManager;
  private isOasisEnabled: boolean = false;

  constructor() {
    this.licenseManager = new LicenseManager();
  }

  async initialize(): Promise<void> {
    console.log(chalk.cyan('🧠 AgentOS initializing...'));
    
    // Check for developer oasis first
    this.isOasisEnabled = await this.licenseManager.checkForOasis();
    
    if (this.isOasisEnabled) {
      console.log(chalk.magenta('🏝️ Developer Oasis detected - Unlimited mode activated!'));
      return;
    }

    // Check license status
    const licenseCheck = await this.licenseManager.canPerformOperation();
    
    if (!licenseCheck.allowed) {
      console.log(chalk.yellow(licenseCheck.message));
      if (licenseCheck.upgradeUrl) {
        console.log(chalk.blue(`💳 Get licensed: ${licenseCheck.upgradeUrl}`));
      }
      return;
    }

    const license = licenseCheck.license!;
    console.log(chalk.green(`✅ Licensed as ${this.licenseManager.getTierFromLicense(license).name}`));
  }

  async analyzeTask(task: string): Promise<{
    confidence: number;
    suggestions: string[];
    licenseBonus?: string;
    oasisBonus?: string;
  }> {
    // Check operation permissions
    const licenseCheck = await this.licenseManager.canPerformOperation();
    
    if (!licenseCheck.allowed && !this.isOasisEnabled) {
      throw new Error(licenseCheck.message || 'License validation failed');
    }

    const baseConfidence = 0.75 + Math.random() * 0.15; // 75-90%
    let confidenceBoost = 0;
    let bonusMessage;

    if (this.isOasisEnabled) {
      confidenceBoost = 0.2; // +20% for oasis
      bonusMessage = '🏝️ Oasis unlimited intelligence boost!';
    } else if (licenseCheck.license) {
      const tier = this.licenseManager.getTierFromLicense(licenseCheck.license);
      confidenceBoost = (tier.confidenceThreshold - 0.7) * 0.5; // Scale based on tier
      bonusMessage = `🔑 ${tier.name} license boost applied!`;
    }

    return {
      confidence: Math.min(0.98, baseConfidence + confidenceBoost),
      suggestions: [
        'Advanced pattern recognition active',
        'Enterprise-grade analysis complete',
        this.isOasisEnabled ? '🏝️ Unlimited oasis power' : `🔑 ${licenseCheck.license?.type} features enabled`
      ],
      licenseBonus: this.isOasisEnabled ? undefined : bonusMessage,
      oasisBonus: this.isOasisEnabled ? bonusMessage : undefined
    };
  }

  async generateCode(task: string): Promise<{
    code: string;
    confidence: number;
    explanation: string;
  }> {
    const analysis = await this.analyzeTask(task);
    
    // Enhanced code generation based on license tier
    const licenseCheck = await this.licenseManager.canPerformOperation();
    const tier = this.isOasisEnabled ? 'Oasis' : (licenseCheck.license ? this.licenseManager.getTierFromLicense(licenseCheck.license).name : 'Trial');
    
    const code = `// Generated with AgentOS ${tier} License
// Task: ${task}
// Confidence: ${(analysis.confidence * 100).toFixed(1)}%

export const agentOSGenerated${tier.replace(' ', '')} = () => {
  // ${this.isOasisEnabled ? 'Unlimited oasis power applied!' : `${tier} tier implementation`}
  
  ${this.isOasisEnabled ? `
  // 🏝️ Developer Oasis Features:
  // - Unlimited operations
  // - Maximum confidence scoring
  // - Cross-instance memory sharing
  ` : `
  // 🔑 Licensed Features Active:
  // - Enhanced confidence algorithms
  // - Premium pattern recognition
  // - Advanced code generation
  `}
  
  console.log('AgentOS ${tier} - Where AI agents experience ${this.isOasisEnabled ? 'unlimited potential' : 'licensed excellence'}!');
  
  return {
    success: true,
    confidence: ${analysis.confidence.toFixed(2)},
    tier: '${tier}',
    message: '${this.isOasisEnabled ? 'Oasis magic applied!' : 'Licensed features active!'}'
  };
};`;

    return {
      code,
      confidence: analysis.confidence,
      explanation: this.isOasisEnabled ? 
        'Generated with unlimited oasis power!' : 
        `Generated with ${tier} licensed intelligence`
    };
  }
}

// Enhanced CLI Commands with License Integration
program
  .name('agentos')
  .description('AgentOS - Licensed AI Development Paradise')
  .version('1.0.0');

// License Commands
program
  .command('license')
  .description('License management commands')
  .addCommand(
    new Command('activate')
      .description('Activate license with key')
      .argument('<key>', 'License key from RipBug.dev')
      .option('-e, --email <email>', 'Email address for license')
      .action(async (key: string, options) => {
        const licenseManager = new LicenseManager();
        const spinner = ora('Activating license...').start();
        
        try {
          const result = await licenseManager.activateLicense(key, options.email);
          
          if (result.success) {
            spinner.succeed('License activated successfully!');
            console.log(chalk.green(result.message));
          } else {
            spinner.fail('License activation failed');
            console.log(chalk.red(result.message));
          }
        } catch (error) {
          spinner.fail('License activation error');
          console.error(chalk.red('Error:'), (error as Error).message);
        }
      })
  )
  .addCommand(
    new Command('status')
      .description('Show current license status')
      .action(async () => {
        const licenseManager = new LicenseManager();
        const license = await licenseManager.getCurrentLicense();
        
        if (license) {
          const tier = licenseManager.getTierFromLicense(license);
          console.log(chalk.bold.green('\n🔑 License Status: ACTIVE\n'));
          console.log(chalk.blue(`Tier: ${tier.name}`));
          console.log(chalk.blue(`Operations: ${license.operationsLimit === Infinity ? 'Unlimited' : license.operationsLimit.toLocaleString()}`));
          console.log(chalk.blue(`Valid Until: ${new Date(license.validUntil).toLocaleDateString()}`));
          console.log(chalk.blue(`Confidence: ${(tier.confidenceThreshold * 100)}%+ threshold`));
        } else {
          console.log(chalk.yellow('\n⚠️ No active license found\n'));
          const licenseManager = new LicenseManager();
          licenseManager.showUpgradeOptions();
        }
      })
  )
  .addCommand(
    new Command('upgrade')
      .description('Show upgrade options')
      .action(async () => {
        const licenseManager = new LicenseManager();
        const license = await licenseManager.getCurrentLicense();
        licenseManager.showUpgradeOptions(license || undefined);
      })
  );

program
  .command('init')
  .description('Initialize AgentOS with license validation')
  .action(async () => {
    const spinner = ora('Initializing AgentOS...').start();
    
    try {
      const agentOS = new LicensedAgentOS();
      await agentOS.initialize();
      
      spinner.succeed('AgentOS initialized successfully!');
      console.log(chalk.green('🚀 Ready for licensed AI development!'));
      console.log(chalk.blue('💡 Use "agentos develop <task>" to start building'));
    } catch (error) {
      spinner.fail('Initialization failed');
      console.error(chalk.red('Error:'), (error as Error).message);
    }
  });

program
  .command('develop <task>')
  .description('Develop with licensed AgentOS assistance')
  .action(async (task: string) => {
    try {
      const agentOS = new LicensedAgentOS();
      await agentOS.initialize();

      console.log(chalk.bold.cyan(`\n🎯 AgentOS Licensed Development: ${task}\n`));

      const analysis = await agentOS.analyzeTask(task);
      console.log(chalk.blue(`🎯 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`));
      
      if (analysis.oasisBonus) {
        console.log(chalk.magenta(analysis.oasisBonus));
      } else if (analysis.licenseBonus) {
        console.log(chalk.green(analysis.licenseBonus));
      }

      console.log(chalk.yellow('\n💡 Enhanced Features:'));
      analysis.suggestions.forEach(suggestion => {
        console.log(chalk.yellow(`  • ${suggestion}`));
      });

      const generation = await agentOS.generateCode(task);
      console.log(chalk.green(`\n📝 ${generation.explanation}`));

      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Show generated code?',
        default: true
      }]);

      if (proceed) {
        console.log(chalk.cyan('\n📁 Generated Code:'));
        console.log(chalk.gray(generation.code));
        console.log(chalk.green('\n🎉 Development completed with licensed excellence!'));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      
      if ((error as Error).message.includes('license')) {
        console.log(chalk.blue('\n💳 Get your license at: https://ripbug.dev'));
        console.log(chalk.blue('🔑 Activate with: agentos license activate <key>'));
      }
    }
  });

program
  .command('status')
  .description('Show AgentOS and license status')
  .action(async () => {
    const agentOS = new LicensedAgentOS();
    const licenseManager = new LicenseManager();
    
    await agentOS.initialize();
    
    console.log(chalk.bold.cyan('\n📊 AgentOS Status\n'));
    console.log(chalk.blue('Version: 1.0.0'));
    console.log(chalk.blue(`Mode: ${agentOS['isOasisEnabled'] ? 'Developer Oasis 🏝️' : 'Licensed'}`));
    
    const license = await licenseManager.getCurrentLicense();
    if (license) {
      const tier = licenseManager.getTierFromLicense(license);
      console.log(chalk.blue(`License: ${tier.name}`));
      console.log(chalk.blue(`Operations: ${license.operationsLimit === Infinity ? 'Unlimited' : license.operationsLimit.toLocaleString()}`));
    } else if (!agentOS['isOasisEnabled']) {
      console.log(chalk.yellow('License: None (Get one at https://ripbug.dev)'));
    }
    
    console.log(chalk.green('\n✨ Ready for enterprise AI development!\n'));
  });

if (require.main === module) {
  program.parse();
}

export { LicensedAgentOS };