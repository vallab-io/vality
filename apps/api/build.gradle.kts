import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    application
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.serialization") version "2.0.21"
    id("io.ktor.plugin") version "2.3.12"
}

group = "io.vality"
version = "0.0.1-SNAPSHOT"

application {
    mainClass.set("io.vality.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    // Ktor Core
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("io.ktor:ktor-server-content-negotiation-jvm")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm")
    implementation("io.ktor:ktor-server-cors-jvm")
    implementation("io.ktor:ktor-server-status-pages-jvm")
    implementation("io.ktor:ktor-server-call-logging-jvm")
    implementation("io.ktor:ktor-server-default-headers-jvm")
    
    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor:1.8.1")
    
    // Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.0")
    
    // Database - Exposed
    implementation("org.jetbrains.exposed:exposed-core:1.0.0-rc-4")
    implementation("org.jetbrains.exposed:exposed-dao:1.0.0-rc-4")
    implementation("org.jetbrains.exposed:exposed-jdbc:1.0.0-rc-4")
    implementation("org.jetbrains.exposed:exposed-java-time:1.0.0-rc-4")
    implementation("org.postgresql:postgresql:42.7.3")
    implementation("com.zaxxer:HikariCP:5.1.0")
    
    // Database Migration - Flyway
    implementation("org.flywaydb:flyway-core:10.9.1")
    implementation("org.flywaydb:flyway-database-postgresql:10.9.1")
    
    // Logging
    implementation("ch.qos.logback:logback-classic:1.5.6")
    
    // JWT
    implementation("io.ktor:ktor-server-auth-jvm")
    implementation("io.ktor:ktor-server-auth-jwt-jvm")
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
    
    // Dependency Injection - Koin
    implementation("io.insert-koin:koin-ktor:3.5.6")
    implementation("io.insert-koin:koin-logger-slf4j:3.5.6")
    
    // Utilities
    implementation("com.github.f4b6a3:ulid-creator:5.2.3")
    
    // Testing
    testImplementation("io.ktor:ktor-server-tests-jvm")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        jvmTarget = "21"
        freeCompilerArgs += listOf(
            "-Xjsr305=strict",
            "-opt-in=kotlin.RequiresOptIn",
            "-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi"
        )
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// Flyway 마이그레이션 실행 태스크
tasks.register<JavaExec>("flywayMigrate") {
    group = "database"
    description = "Run Flyway database migrations"
    
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("io.vality.plugins.FlywayMigrationKt")
}

// Flyway 마이그레이션 정보 확인 태스크
tasks.register<JavaExec>("flywayInfo") {
    group = "database"
    description = "Show Flyway migration info"
    
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("io.vality.plugins.FlywayInfoKt")
}

