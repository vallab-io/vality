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
    
    // Ktor HTTP Client (OAuth2용)
    implementation("io.ktor:ktor-client-core-jvm")
    implementation("io.ktor:ktor-client-cio-jvm")
    implementation("io.ktor:ktor-client-content-negotiation-jvm")
    
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
    implementation("com.auth0:java-jwt:4.4.0")
    
    // Dependency Injection - Koin
    implementation("io.insert-koin:koin-ktor:3.5.6")
    implementation("io.insert-koin:koin-logger-slf4j:3.5.6")
    
    // OpenAPI/Swagger
    implementation("io.swagger.core.v3:swagger-core:2.2.22")
    implementation("io.swagger.core.v3:swagger-models:2.2.22")
    implementation("io.swagger.parser.v3:swagger-parser:2.1.22")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.1")
    implementation("com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:2.17.1")
    implementation("io.ktor:ktor-server-core:2.3.12")
    implementation("io.ktor:ktor-server-double-receive:2.3.12")
    
    // AWS SDK for Java v2 (S3만 사용, SES는 Resend로 마이그레이션)
    implementation("software.amazon.awssdk:s3:2.17.106")
    
    // Redis - Lettuce (비동기 지원)
    implementation("io.lettuce:lettuce-core:6.3.1.RELEASE")

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

