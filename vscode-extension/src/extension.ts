import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let oasisProvider: AgentOSTreeDataProvider;

export function activate(context: vscode.ExtensionContext) {
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
        vscode.window.showInformationMessage(
            '🎉 Welcome to the AgentOS Developer Oasis! Unlimited AI power activated!',
            'View Status', 'Show Instances'
        ).then(selection => {
            if (selection === 'View Status') {
                showOasisStatus();
            } else if (selection === 'Show Instances') {
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

class AgentOSTreeDataProvider implements vscode.TreeDataProvider<AgentOSItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<AgentOSItem | undefined | null | void> = new vscode.EventEmitter<AgentOSItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<AgentOSItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: AgentOSItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AgentOSItem): Thenable<AgentOSItem[]> {
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
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        commandName?: string
    ) {
        super(label, collapsibleState);
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

export function deactivate() {
    console.log('🏝️ AgentOS Developer Oasis Extension Deactivated');
}