package dev.agentos.jetbrains.actions

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.execution.process.ScriptRunnerUtil
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.InputDialog
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.progress.Task
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.wm.ToolWindowManager

class DevelopWithAgentOSAction : AnAction() {

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        
        // Show input dialog for development task
        val dialog = InputDialog(
            "What would you like to develop with AgentOS?",
            "🚀 AgentOS Development Assistant",
            null,
            "Create a new component",
            null
        )
        
        if (!dialog.showAndGet()) {
            return
        }
        
        val task = dialog.inputString
        if (task.isNullOrBlank()) {
            return
        }
        
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "AgentOS Development: $task", true) {
            override fun run(indicator: ProgressIndicator) {
                indicator.text = "🤖 AgentOS is working on: $task"
                indicator.fraction = 0.1
                
                try {
                    val command = GeneralCommandLine("agentos-dev", "develop", task)
                    command.workDirectory = java.io.File(project.basePath ?: ".")
                    
                    indicator.fraction = 0.3
                    indicator.text = "🧠 AI agents analyzing task..."
                    
                    val result = ScriptRunnerUtil.getProcessOutput(command, ScriptRunnerUtil.STDOUT_OUTPUT_KEY_FILTER, 60000)
                    
                    indicator.fraction = 1.0
                    
                    if (result.exitCode == 0) {
                        // Show success notification
                        NotificationGroupManager.getInstance()
                            .getNotificationGroup("AgentOS")
                            .createNotification(
                                "🎉 AgentOS development task completed!",
                                "Task: $task\n\nCheck the terminal output for detailed results.",
                                NotificationType.INFORMATION
                            )
                            .notify(project)
                        
                        // Open terminal tool window to show results
                        val toolWindowManager = ToolWindowManager.getInstance(project)
                        val terminalWindow = toolWindowManager.getToolWindow("Terminal")
                        terminalWindow?.activate(null)
                        
                    } else {
                        NotificationGroupManager.getInstance()
                            .getNotificationGroup("AgentOS")
                            .createNotification(
                                "❌ AgentOS development task failed",
                                "Error: ${result.stderr}\n\nPlease check your AgentOS installation and try again.",
                                NotificationType.ERROR
                            )
                            .notify(project)
                    }
                    
                } catch (e: Exception) {
                    NotificationGroupManager.getInstance()
                        .getNotificationGroup("AgentOS")
                        .createNotification(
                            "❌ Error running AgentOS development task",
                            "Exception: ${e.message}",
                            NotificationType.ERROR
                        )
                        .notify(project)
                }
            }
        })
    }
}