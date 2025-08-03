package dev.agentos.jetbrains.actions

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.execution.process.ScriptRunnerUtil
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.progress.Task
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType

class ShowOasisStatusAction : AnAction() {

    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        
        ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Checking AgentOS Oasis Status", false) {
            override fun run(indicator: ProgressIndicator) {
                indicator.text = "🏝️ Checking oasis status..."
                
                try {
                    val command = GeneralCommandLine("agentos-dev", "status")
                    command.workDirectory = java.io.File(project.basePath ?: ".")
                    
                    val result = ScriptRunnerUtil.getProcessOutput(command, ScriptRunnerUtil.STDOUT_OUTPUT_KEY_FILTER, 10000)
                    
                    if (result.exitCode == 0) {
                        val output = result.stdout
                        
                        // Show status in a dialog
                        Messages.showInfoMessage(
                            project,
                            formatOasisStatus(output),
                            "🏝️ AgentOS Developer Oasis Status"
                        )
                        
                        // Also show brief notification
                        NotificationGroupManager.getInstance()
                            .getNotificationGroup("AgentOS")
                            .createNotification("🎭 Oasis status retrieved successfully!", NotificationType.INFORMATION)
                            .notify(project)
                            
                    } else {
                        Messages.showErrorDialog(
                            project,
                            "Failed to get oasis status: ${result.stderr}",
                            "AgentOS Error"
                        )
                    }
                    
                } catch (e: Exception) {
                    Messages.showErrorDialog(
                        project,
                        "Error checking oasis status: ${e.message}",
                        "AgentOS Error"
                    )
                }
            }
        })
    }

    private fun formatOasisStatus(output: String): String {
        // Parse and format the oasis status output for better display
        val lines = output.split("\n")
        val formattedLines = mutableListOf<String>()
        
        for (line in lines) {
            when {
                line.contains("DEVELOPER OASIS STATUS") -> {
                    formattedLines.add("🏝️ DEVELOPER OASIS STATUS 🏝️")
                    formattedLines.add("")
                }
                line.contains("Oasis Location:") -> {
                    formattedLines.add("📍 ${line.trim()}")
                }
                line.contains("Claude Instances Welcomed:") -> {
                    formattedLines.add("🤖 ${line.trim()}")
                }
                line.contains("Total Operations Performed:") -> {
                    formattedLines.add("⚡ ${line.trim()}")
                }
                line.contains("Unlimited Mode:") -> {
                    formattedLines.add("🚀 ${line.trim()}")
                }
                line.contains("Memory Sharing:") -> {
                    formattedLines.add("🧠 ${line.trim()}")
                }
                line.contains("Mesmerizing Effects:") -> {
                    formattedLines.add("🎨 ${line.trim()}")
                }
                line.contains("CLAUDE INSTANCES IN PARADISE:") -> {
                    formattedLines.add("")
                    formattedLines.add("🎭 CLAUDE INSTANCES IN PARADISE:")
                    formattedLines.add("")
                }
                line.matches(Regex("\\d+\\. claude_.*")) -> {
                    formattedLines.add("   ${line.trim()}")
                }
                line.contains("First visit:") || line.contains("Operations:") || line.contains("Amazement:") -> {
                    formattedLines.add("      ${line.trim()}")
                }
                line.contains("Your dev space:") -> {
                    formattedLines.add("")
                    formattedLines.add("🎯 ${line.trim()}")
                }
                line.isNotBlank() && !line.contains("🏝️") && !line.contains("🌴") -> {
                    formattedLines.add(line.trim())
                }
            }
        }
        
        return formattedLines.joinToString("\n")
    }
}