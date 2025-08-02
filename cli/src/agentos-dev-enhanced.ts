#!/usr/bin/env node

/**
 * AgentOS Enhanced CLI with Tier Management
 * Simple CLI experience with usage tracking and tier-based features
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AgentOS } from './core/AgentOS';
import { TierManager } from './agentos-dev-tier-manager';

const program = new Command();

interface DevContext {
  projectPath: string;
  agentOS: AgentOS;
  confidence: number;
  sandboxMode: boolean;
  tier: string;
}

class EnhancedMetaDeveloper {
  private agentOS: AgentOS;
  private tierManager: TierManager;
  private context: DevContext;

  constructor() {
    this.tierManager = new TierManager();
    this.agentOS = new AgentOS({
      agentId: 'enhanced_meta_developer',
      projectId: 'agentos_cli_platform',
      enableExecution: true,
      enableLearning: true,
      logLevel: 'info'
    });
  }

  async initialize(): Promise<void> {
    // Check tier and usage before initializing
    const usageCheck = await this.tierManager.canPerformOperation();
    if (!usageCheck.allowed) {
      console.log(chalk.red(usageCheck.message));
      this.tierManager.showUpgradePrompt(usageCheck.usage.tier);
      process.exit(1);
    }

    if (usageCheck.message) {
      console.log(chalk.yellow(usageCheck.message));
    }

    await this.agentOS.initialize();
    
    // Record the initialization operation
    await this.tierManager.recordOperation();
    
    // Store tier-aware context
    const usage = await this.tierManager.getCurrentUsage();
    const tier = this.tierManager.TIERS[usage.tier];
    
    await this.agentOS.remember({
      content: `AgentOS CLI initialized - ${tier.name} tier with ${tier.operationsLimit} operations/month`,
      context: 'cli_initialization',
      type: 'milestone',
      metadata: {
        tags: ['cli_startup', 'tier_management', usage.tier],
        confidence: 1.0,
        importance: 0.8,
        category: 'system_initialization',
        tier: usage.tier,
        operationsRemaining: tier.operationsLimit - usage.operationsUsed
      },
      relationships: []
    });
  }

  /**
   * Enhanced task analysis with tier-based confidence thresholds
   */
  async analyzeTask(taskDescription: string, codeContext: string): Promise<{
    successProbability: number;
    confidence: number;
    recommendations: string[];
    riskFactors: string[];
    tierInfo: string;
  }> {
    // Check operation limit
    const usageCheck = await this.tierManager.canPerformOperation();
    if (!usageCheck.allowed) {
      throw new Error(usageCheck.message);
    }

    console.log(chalk.blue('🔮 Analyzing task with tier-optimized AgentOS intelligence...'));

    const usage = await this.tierManager.getCurrentUsage();
    const confidenceThreshold = this.tierManager.getConfidenceThreshold(usage.tier);

    // Enhanced prediction based on tier
    const prediction = await this.agentOS.predictSuccess({
      code: codeContext,
      language: 'typescript',
      context: 'tier_aware_development',
      purpose: taskDescription,
      confidence: confidenceThreshold,
      metadata: { 
        task_type: 'cli_development',
        tier: usage.tier,
        threshold: confidenceThreshold
      }
    });

    await this.tierManager.recordOperation();

    if (prediction.success) {
      return {
        successProbability: prediction.data.successProbability,
        confidence: prediction.data.confidence,
        recommendations: this.getTierRecommendations(usage.tier, prediction.data.confidence),
        riskFactors: [],
        tierInfo: `${this.tierManager.TIERS[usage.tier].name} tier - ${confidenceThreshold * 100}% confidence threshold`
      };
    }

    return {
      successProbability: 0.5,
      confidence: 0.5,
      recommendations: ['Consider upgrading tier for better analysis'],
      riskFactors: ['Limited analysis on current tier'],
      tierInfo: `${this.tierManager.TIERS[usage.tier].name} tier (limited analysis)`
    };
  }

  /**
   * Tier-aware code generation
   */
  async generateCode(task: string, context: string): Promise<{
    code: string;
    confidence: number;
    explanation: string;
    tierFeatures: string[];
  }> {
    const usageCheck = await this.tierManager.canPerformOperation();
    if (!usageCheck.allowed) {
      throw new Error(usageCheck.message);
    }

    const usage = await this.tierManager.getCurrentUsage();
    const tier = this.tierManager.TIERS[usage.tier];

    console.log(chalk.cyan(`💻 Generating code with ${tier.name} tier intelligence...`));

    // Enhanced memory search for higher tiers
    let memories;
    if (this.tierManager.hasFeature(usage.tier, 'advanced_analytics')) {
      memories = await this.agentOS.recall(`${task} ${context} advanced patterns`);
    } else {
      memories = await this.agentOS.recall(`${task} ${context}`);
    }
    
    let baseConfidence = tier.confidenceThreshold;
    let tierFeatures = ['Basic code generation'];

    if (memories.success && memories.data && memories.data.length > 0) {
      baseConfidence = Math.min(0.95, baseConfidence + 0.1);
      console.log(chalk.green(`📚 Found ${memories.data.length} relevant memories`));
      
      if (this.tierManager.hasFeature(usage.tier, 'pattern_recognition')) {
        tierFeatures.push('Pattern recognition');
        baseConfidence += 0.05;
      }
      
      if (this.tierManager.hasFeature(usage.tier, 'advanced_analytics')) {
        tierFeatures.push('Advanced analytics');
        baseConfidence += 0.05;
      }
    }

    await this.tierManager.recordOperation();

    const generatedCode = await this.generateCodeFromTask(task, context, memories.data || [], usage.tier);
    
    return {
      code: generatedCode,
      confidence: Math.min(0.95, baseConfidence),
      explanation: `Generated with ${tier.name} tier capabilities: ${tierFeatures.join(', ')}`,
      tierFeatures
    };
  }

  /**
   * Enhanced sandbox testing with tier-based features
   */
  async sandboxTest(code: string, language: string): Promise<{
    success: boolean;
    output: string;
    performance: string;
    securityScore: number;
    tierAnalysis: string[];
  }> {
    const usageCheck = await this.tierManager.canPerformOperation();
    if (!usageCheck.allowed) {
      throw new Error(usageCheck.message);
    }

    const usage = await this.tierManager.getCurrentUsage();
    const tier = this.tierManager.TIERS[usage.tier];

    console.log(chalk.yellow(`🧪 Testing in ${tier.name} tier sandbox environment...`));

    const result = await this.agentOS.execute({
      language,
      code,
      context: {
        purpose: 'tier_aware_testing',
        metadata: { 
          sandbox_test: true,
          tier: usage.tier,
          enhanced_analysis: this.tierManager.hasFeature(usage.tier, 'advanced_analytics')
        }
      }
    });

    await this.tierManager.recordOperation();

    let tierAnalysis = ['Basic execution analysis'];
    
    if (this.tierManager.hasFeature(usage.tier, 'advanced_analytics')) {
      tierAnalysis.push('Performance optimization suggestions');
      tierAnalysis.push('Resource usage analysis');
    }
    
    if (this.tierManager.hasFeature(usage.tier, 'enterprise_execution')) {
      tierAnalysis.push('Enterprise security validation');
      tierAnalysis.push('Production readiness check');
    }

    if (result.success) {
      return {
        success: result.data.status === 'completed',
        output: result.data.result.stdout || result.data.result.stderr || '',
        performance: result.data.result.executionTime < 1000 ? 'excellent' : 'good',
        securityScore: result.data.analysis?.securityScore || 1.0,
        tierAnalysis
      };
    }

    return {
      success: false,
      output: 'Execution failed',
      performance: 'failed',
      securityScore: 0.0,
      tierAnalysis
    };
  }

  private getTierRecommendations(tier: string, confidence: number): string[] {
    const recommendations = [];
    
    if (confidence < this.tierManager.getConfidenceThreshold(tier)) {
      recommendations.push(`Consider upgrading for higher confidence thresholds`);
    }
    
    if (!this.tierManager.hasFeature(tier, 'advanced_analytics')) {
      recommendations.push('Upgrade to Pro for advanced analytics');
    }
    
    if (!this.tierManager.hasFeature(tier, 'enterprise_execution')) {
      recommendations.push('Upgrade to Premium for enterprise-grade execution');
    }
    
    return recommendations;
  }

  private async generateCodeFromTask(task: string, context: string, memories: any[], tier: string): Promise<string> {
    // Enhanced code generation based on tier
    const tierComment = `// Generated with AgentOS ${this.tierManager.TIERS[tier].name} tier`;
    
    if (task.includes('API endpoint')) {
      return `${tierComment}
import { Request, Response } from 'express';

export const ${context}Handler = async (req: Request, res: Response) => {
  try {
    // ${this.tierManager.hasFeature(tier, 'enterprise_execution') ? 'Enterprise-grade' : 'Standard'} implementation
    const result = await process${context}(req.body);
    
    ${this.tierManager.hasFeature(tier, 'advanced_analytics') ? 
      '// Advanced analytics tracking\n    await trackOperation(req, result);' : 
      '// Basic logging'
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    ${this.tierManager.hasFeature(tier, 'enterprise_execution') ? 
      '// Enterprise error handling\n    await logSecurityEvent(error);\n    ' : ''}res.status(500).json({ success: false, error: (error as Error).message });
  }
};`;
    }

    if (task.includes('React component')) {
      return `${tierComment}
import React${this.tierManager.hasFeature(tier, 'advanced_analytics') ? ', { useEffect }' : ''} from 'react';

interface ${context}Props {
  // Props optimized for ${this.tierManager.TIERS[tier].name} tier
}

export const ${context}: React.FC<${context}Props> = (props) => {
  ${this.tierManager.hasFeature(tier, 'advanced_analytics') ? 
    '// Advanced component analytics\n  useEffect(() => {\n    trackComponentUsage(\'' + context + '\');\n  }, []);' : 
    '// Basic component'
  }
  
  return (
    <div className="agentos-component ${tier}-tier">
      {/* ${this.tierManager.TIERS[tier].name} tier implementation */}
      {props.children}
    </div>
  );
};`;
    }

    return `${tierComment}\n// ${task}\n// Implementation: ${context}\n// Tier: ${this.tierManager.TIERS[tier].name}`;
  }

  async getUsageStatus(): Promise<void> {
    await this.tierManager.showStatus();
  }
}

// Enhanced CLI Commands

program
  .name('agentos-dev')
  .description('AgentOS CLI with tier management and enhanced features')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize AgentOS with tier management')
  .action(async () => {
    const spinner = ora('Initializing AgentOS with tier management...').start();
    
    try {
      const metaDev = new EnhancedMetaDeveloper();
      await metaDev.initialize();
      
      spinner.succeed('AgentOS CLI initialized with tier management!');
      console.log(chalk.green('🚀 Ready for tier-aware development!'));
      console.log(chalk.blue('💡 Use "agentos-dev develop <task>" to start building'));
      console.log(chalk.blue('📊 Use "agentos-dev status" to check your usage and tier'));
    } catch (error) {
      spinner.fail('Failed to initialize');
      console.error(chalk.red('Error:'), (error as Error).message);
    }
  });

program
  .command('develop <task>')
  .description('Develop with tier-aware AgentOS assistance')
  .option('-c, --context <context>', 'Development context')
  .option('-s, --sandbox', 'Test in sandbox first', true)
  .action(async (task: string, options) => {
    try {
      const metaDev = new EnhancedMetaDeveloper();
      await metaDev.initialize();

      console.log(chalk.bold.cyan(`\n🎯 Tier-Aware Development: ${task}\n`));

      // Step 1: Enhanced analysis
      const analysis = await metaDev.analyzeTask(task, options.context || '');
      console.log(chalk.blue(`📊 Success Probability: ${(analysis.successProbability * 100).toFixed(1)}%`));
      console.log(chalk.blue(`🎯 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`));
      console.log(chalk.blue(`🏷️  ${analysis.tierInfo}\n`));

      if (analysis.recommendations.length > 0) {
        console.log(chalk.yellow('💡 Recommendations:'));
        analysis.recommendations.forEach(rec => console.log(chalk.yellow(`  • ${rec}`)));
        console.log();
      }

      // Step 2: Enhanced code generation
      const generation = await metaDev.generateCode(task, options.context || '');
      console.log(chalk.green(`📝 ${generation.explanation}`));
      console.log(chalk.green(`🎯 Confidence: ${(generation.confidence * 100).toFixed(1)}%\n`));

      // Step 3: Enhanced sandbox testing
      if (options.sandbox) {
        const sandboxResult = await metaDev.sandboxTest(generation.code, 'typescript');
        
        if (sandboxResult.success) {
          console.log(chalk.green('✅ Sandbox test passed!'));
          console.log(chalk.green(`⚡ Performance: ${sandboxResult.performance}`));
          console.log(chalk.green(`🔒 Security Score: ${sandboxResult.securityScore}`));
          console.log(chalk.green('🔧 Analysis:'));
          sandboxResult.tierAnalysis.forEach(analysis => {
            console.log(chalk.green(`  • ${analysis}`));
          });
          console.log();
        } else {
          console.log(chalk.red('❌ Sandbox test failed!'));
          console.log(chalk.red(`Output: ${sandboxResult.output}\n`));
          return;
        }
      }

      // Step 4: Confirm with enhanced context
      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: `Write code to files? (${generation.tierFeatures.join(', ')})`,
        default: generation.confidence > 0.8
      }]);

      if (proceed) {
        console.log(chalk.cyan('\n📁 Writing to files...'));
        console.log(chalk.gray(generation.code));
        console.log(chalk.green('\n🎉 Development completed successfully!'));
      } else {
        console.log(chalk.yellow('\n⏸️  Development paused - code not written'));
      }

    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      if ((error as Error).message.includes('limit reached')) {
        const tierManager = new TierManager();
        tierManager.showUpgradePrompt('free'); // Default to showing upgrade from free
      }
    }
  });

program
  .command('status')
  .description('Show AgentOS usage and tier status')
  .action(async () => {
    const metaDev = new EnhancedMetaDeveloper();
    await metaDev.getUsageStatus();
  });

program
  .command('tiers')
  .description('Show available tiers and pricing')
  .action(() => {
    const tierManager = new TierManager();
    tierManager.showTiers();
    console.log(chalk.bold.green('💳 Upgrade: agentos-dev upgrade <tier>'));
  });

program
  .command('upgrade <tier>')
  .description('Upgrade to a higher tier')
  .action(async (tier: string) => {
    const tierManager = new TierManager();
    const result = await tierManager.upgradeTier(tier.toLowerCase());
    
    if (result.success) {
      console.log(chalk.green(result.message));
      console.log(chalk.blue('🚀 Restart CLI to use new tier features!'));
    } else {
      console.log(chalk.red(result.message));
    }
  });

if (require.main === module) {
  program.parse();
}

export { EnhancedMetaDeveloper };