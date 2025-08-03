plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "1.9.20"
    id("org.jetbrains.intellij") version "1.16.1"
}

group = "dev.agentos"
version = "1.0.0"

repositories {
    mavenCentral()
}

intellij {
    version.set("2023.3")
    type.set("IC") // IntelliJ IDEA Community Edition
    
    plugins.set(listOf(
        // Add plugin dependencies here if needed
    ))
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    // Add other dependencies as needed
}

tasks {
    withType<JavaCompile> {
        sourceCompatibility = "17"
        targetCompatibility = "17"
    }
    
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        kotlinOptions.jvmTarget = "17"
    }

    patchPluginXml {
        sinceBuild.set("223")
        untilBuild.set("241.*")
        
        changeNotes.set("""
            <h3>Version 1.0.0</h3>
            <ul>
                <li>🏝️ Initial release with Developer Oasis integration</li>
                <li>🎭 Multi-agent orchestration support</li>
                <li>📊 Oasis status monitoring and Claude instance tracking</li>
                <li>🚀 Direct AgentOS CLI integration</li>
                <li>🌴 Automatic oasis initialization</li>
                <li>⚡ Real-time development assistance</li>
            </ul>
        """.trimIndent())
    }

    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }

    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
    }
}

// Plugin metadata for marketplace
kotlin {
    jvmToolchain(17)
}