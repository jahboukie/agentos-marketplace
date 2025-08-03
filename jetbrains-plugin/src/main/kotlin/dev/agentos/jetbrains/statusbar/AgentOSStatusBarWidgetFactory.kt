package dev.agentos.jetbrains.statusbar

import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.StatusBar
import com.intellij.openapi.wm.StatusBarWidget
import com.intellij.openapi.wm.StatusBarWidgetFactory
import com.intellij.openapi.wm.impl.status.widget.StatusBarEditorBasedWidgetFactory
import com.intellij.util.Consumer
import dev.agentos.jetbrains.services.AgentOSProjectService
import java.awt.event.MouseEvent

class AgentOSStatusBarWidgetFactory : StatusBarWidgetFactory {
    
    override fun getId(): String = "AgentOSStatusWidget"
    
    override fun getDisplayName(): String = "AgentOS"
    
    override fun isAvailable(project: Project): Boolean = true
    
    override fun createWidget(project: Project): StatusBarWidget {
        return AgentOSStatusBarWidget(project)
    }
    
    override fun disposeWidget(widget: StatusBarWidget) {
        // Cleanup if needed
    }
    
    override fun canBeEnabledOn(statusBar: StatusBar): Boolean = true
}

class AgentOSStatusBarWidget(private val project: Project) : StatusBarWidget, StatusBarWidget.TextPresentation {
    
    private val agentOSService = project.getService(AgentOSProjectService::class.java)
    
    override fun ID(): String = "AgentOSStatusWidget"
    
    override fun getPresentation(): StatusBarWidget.WidgetPresentation = this
    
    override fun install(statusBar: StatusBar) {
        // Widget installed
    }
    
    override fun dispose() {
        // Cleanup
    }
    
    override fun getText(): String {
        return if (agentOSService.isOasisInitialized()) {
            val count = agentOSService.getClaudeInstanceCount()
            "🏝️ AgentOS ($count)"
        } else {
            "🏝️ AgentOS"
        }
    }
    
    override fun getAlignment(): Float = 0.5f
    
    override fun getTooltipText(): String {
        return if (agentOSService.isOasisInitialized()) {
            "🎭 AgentOS Developer Oasis Active\n" +
            "Claude Instances: ${agentOSService.getClaudeInstanceCount()}\n" +
            "Location: ${agentOSService.getOasisLocation()}\n" +
            "Click to view status"
        } else {
            "🏝️ AgentOS - Click to initialize Developer Oasis"
        }
    }
    
    override fun getClickConsumer(): Consumer<MouseEvent>? {
        return Consumer { 
            if (agentOSService.isOasisInitialized()) {
                // Show oasis status
                val action = dev.agentos.jetbrains.actions.ShowOasisStatusAction()
                val event = com.intellij.openapi.actionSystem.AnActionEvent.createFromDataContext(
                    "",
                    null,
                    com.intellij.openapi.actionSystem.impl.SimpleDataContext.getProjectContext(project)
                )
                action.actionPerformed(event)
            } else {
                // Initialize oasis
                val action = dev.agentos.jetbrains.actions.InitializeOasisAction()
                val event = com.intellij.openapi.actionSystem.AnActionEvent.createFromDataContext(
                    "",
                    null,
                    com.intellij.openapi.actionSystem.impl.SimpleDataContext.getProjectContext(project)
                )
                action.actionPerformed(event)
            }
        }
    }
}