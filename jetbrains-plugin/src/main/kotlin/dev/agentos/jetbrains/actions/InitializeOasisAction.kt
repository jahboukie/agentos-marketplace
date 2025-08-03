package dev.agentos.jetbrains.actions

import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.execution.process.ScriptRunnerUtil
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.progress.Task
import dev.agentos.jetbrains.services.AgentOSProjectService

class InitializeOasisAction : AnAction() {

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Initializing AgentOS Developer Oasis", true) {
            override fun run(indicator: ProgressIndicator) {
                indicator.text = "🏝️ Setting up your AI paradise..."
                indicator.fraction = 0.1
                
                try {
                    // Check if AgentOS CLI is available
                    val checkCommand = GeneralCommandLine("agentos-dev", "--version")
                    val checkResult = ScriptRunnerUtil.getProcessOutput(checkCommand, ScriptRunnerUtil.STDOUT_OUTPUT_KEY_FILTER, 5000)
                    
                    if (checkResult.isTimeout || checkResult.exitCode != 0) {
                        showError(project, "AgentOS CLI not found. Please install with: npm install -g agentos-dev")
                        return
                    }
                    
                    indicator.text = "🌴 Initializing oasis..."
                    indicator.fraction = 0.5
                    
                    // Run AgentOS initialization
                    val initCommand = GeneralCommandLine("agentos-dev", "init")
                    initCommand.workDirectory = java.io.File(project.basePath ?: ".")
                    
                    val result = ScriptRunnerUtil.getProcessOutput(initCommand, ScriptRunnerUtil.STDOUT_OUTPUT_KEY_FILTER, 30000)
                    
                    indicator.fraction = 1.0
                    
                    if (result.exitCode == 0) {
                        showSuccess(project, "🎉 AgentOS Developer Oasis initialized! Welcome to AI paradise!")
                        
                        // Update project service
                        project.getService(AgentOSProjectService::class.java).onOasisInitialized()
                        
                    } else {
                        showError(project, "Failed to initialize oasis: ${result.stderr}")
                    }
                    
                } catch (e: Exception) {
                    showError(project, "Error initializing oasis: ${e.message}")
                }
            }
        })
    }

    private fun showSuccess(project: Project, message: String) {
        NotificationGroupManager.getInstance()
            .getNotificationGroup("AgentOS")
            .createNotification(message, NotificationType.INFORMATION)
            .notify(project)
    }

    private fun showError(project: Project, message: String) {
        NotificationGroupManager.getInstance()
            .getNotificationGroup("AgentOS")
            .createNotification(message, NotificationType.ERROR)
            .notify(project)
    }
}