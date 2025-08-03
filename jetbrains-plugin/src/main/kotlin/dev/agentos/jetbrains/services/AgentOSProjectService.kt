package dev.agentos.jetbrains.services

import com.intellij.openapi.components.Service
import com.intellij.openapi.project.Project
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.execution.process.ScriptRunnerUtil
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import kotlinx.coroutines.*

@Service(Service.Level.PROJECT)
class AgentOSProjectService(private val project: Project) {
    
    private var oasisInitialized = false
    private var claudeInstanceCount = 0
    private var oasisLocation = ""
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    init {
        // Check oasis status on service initialization
        checkOasisStatus()
    }
    
    fun isOasisInitialized(): Boolean = oasisInitialized
    
    fun getClaudeInstanceCount(): Int = claudeInstanceCount
    
    fun getOasisLocation(): String = oasisLocation
    
    fun onOasisInitialized() {
        oasisInitialized = true
        // Start periodic status checks
        startPeriodicStatusCheck()
    }
    
    private fun checkOasisStatus() {
        scope.launch {
            try {
                val command = GeneralCommandLine("agentos-dev", "oasis", "status")
                command.workDirectory = java.io.File(project.basePath ?: ".")
                
                val result = ScriptRunnerUtil.getProcessOutput(command, ScriptRunnerUtil.STDOUT_OUTPUT_KEY_FILTER, 10000)
                
                if (result.exitCode == 0) {
                    parseOasisStatus(result.stdout)
                    oasisInitialized = true
                } else {
                    oasisInitialized = false
                }
                
            } catch (e: Exception) {
                // AgentOS CLI not available or oasis not initialized
                oasisInitialized = false
            }
        }
    }
    
    private fun parseOasisStatus(output: String) {
        val lines = output.split("\n")
        
        for (line in lines) {
            when {
                line.contains("Claude Instances Welcomed:") -> {
                    val count = line.substringAfter("Welcomed:").trim().split(" ")[0]
                    claudeInstanceCount = count.toIntOrNull() ?: 0
                }
                line.contains("Oasis Location:") -> {
                    oasisLocation = line.substringAfter("Location:").trim()
                }
            }
        }
    }
    
    private fun startPeriodicStatusCheck() {
        scope.launch {
            while (oasisInitialized) {
                delay(30000) // Check every 30 seconds
                checkOasisStatus()
            }
        }
    }
    
    fun showWelcomeNotification() {
        if (oasisInitialized) {
            NotificationGroupManager.getInstance()
                .getNotificationGroup("AgentOS")
                .createNotification(
                    "🏝️ Welcome to the AgentOS Developer Oasis!",
                    "Your AI paradise is active with $claudeInstanceCount Claude instances. " +
                    "Experience unlimited development power!",
                    NotificationType.INFORMATION
                )
                .notify(project)
        }
    }
    
    fun dispose() {
        scope.cancel()
    }
}