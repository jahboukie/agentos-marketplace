"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let statusBarItem;
let oasisProvider;
function activate(context) {
    console.log('🏝️ AgentOS Developer Oasis Extension Activated!');
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '🏝️ AgentOS';
    statusBarItem.tooltip = 'Click to show AgentOS status';
    statusBarItem.command = 'agentos.showStatus';
    statusBarItem.show();
    // Register commands
    const commands = [
        vscode.commands.registerCommand('agentos.initOasis', initializeOasis),
        vscode.commands.registerCommand('agentos.showStatus', showOasisStatus),
        vscode.commands.registerCommand('agentos.develop', developWithAgentOS),
        vscode.commands.registerCommand('agentos.showInstances', showClaudeInstances)
    ];
    commands.forEach(command => context.subscriptions.push(command));
    context.subscriptions.push(statusBarItem);
    // Initialize oasis tree view
    oasisProvider = new AgentOSTreeDataProvider();
    vscode.window.createTreeView('agentosOasis', { treeDataProvider: oasisProvider });
    // Auto-initialize if enabled
    const config = vscode.workspace.getConfiguration('agentos');
    if (config.get('autoInitOasis', true)) {
        initializeOasis();
    }
}
async function initializeOasis() {
    const terminal = vscode.window.createTerminal('AgentOS Oasis');
    terminal.show();
    terminal.sendText('agentos-dev init');
    vscode.window.showInformationMessage('🏝️ Initializing AgentOS Developer Oasis...');
    // Update status bar
    statusBarItem.text = '🌴 AgentOS Oasis';
    statusBarItem.tooltip = 'AgentOS Developer Oasis Active';
    // Set context for when clause
    vscode.commands.executeCommand('setContext', 'agentos.oasisActive', true);
    // Show welcome message
    setTimeout(() => {
        vscode.window.showInformationMessage('🎉 Welcome to the AgentOS Developer Oasis! Unlimited AI power activated!', 'View Status', 'Show Instances').then(selection => {
            if (selection === 'View Status') {
                showOasisStatus();
            }
            else if (selection === 'Show Instances') {
                showClaudeInstances();
            }
        });
    }, 2000);
}
async function showOasisStatus() {
    const terminal = vscode.window.createTerminal('AgentOS Status');
    terminal.show();
    terminal.sendText('agentos-dev status');
}
async function developWithAgentOS() {
    const task = await vscode.window.showInputBox({
        prompt: 'What would you like to develop with AgentOS?',
        placeHolder: 'e.g., Create a React component, Fix authentication bug, Add unit tests'
    });
    if (task) {
        const terminal = vscode.window.createTerminal('AgentOS Develop');
        terminal.show();
        terminal.sendText(`agentos-dev develop "${task}"`);
    }
}
async function showClaudeInstances() {
    const terminal = vscode.window.createTerminal('Claude Instances');
    terminal.show();
    terminal.sendText('agentos-dev oasis status');
    vscode.window.showInformationMessage('🎭 Showing Claude instances in your Developer Oasis!');
}
class AgentOSTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve([
                new AgentOSItem('🏝️ Oasis Status', 'Check current oasis status', vscode.TreeItemCollapsibleState.None, 'agentos.showStatus'),
                new AgentOSItem('🎭 Claude Instances', 'View Claude instances in paradise', vscode.TreeItemCollapsibleState.None, 'agentos.showInstances'),
                new AgentOSItem('🚀 Develop', 'Start developing with AgentOS', vscode.TreeItemCollapsibleState.None, 'agentos.develop'),
                new AgentOSItem('🌴 Initialize Oasis', 'Initialize Developer Oasis', vscode.TreeItemCollapsibleState.None, 'agentos.initOasis')
            ]);
        }
        return Promise.resolve([]);
    }
}
class AgentOSItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, commandName) {
        super(label, collapsibleState);
        this.label = label;
        this.tooltip = tooltip;
        this.collapsibleState = collapsibleState;
        this.tooltip = tooltip;
        if (commandName) {
            this.command = {
                command: commandName,
                title: label,
                arguments: []
            };
        }
    }
}
function deactivate() {
    console.log('🏝️ AgentOS Developer Oasis Extension Deactivated');
}
//# sourceMappingURL=extension.js.map