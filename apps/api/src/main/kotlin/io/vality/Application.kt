package io.vality

import com.typesafe.config.ConfigFactory
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.vality.plugins.configureCORS
import io.vality.plugins.configureDatabase
import io.vality.plugins.configureDefaultHeaders
import io.vality.plugins.configureJWT
import io.vality.plugins.configureKoin
import io.vality.plugins.configureLogging
import io.vality.plugins.configureRedis
import io.vality.plugins.configureSerialization
import io.vality.plugins.configureStatusPages
import io.vality.routing.configureRouting

fun main() {
    embeddedServer(Netty, port = 4000, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    val config = ConfigFactory.load()

    // Dependency Injection (Koin) - 먼저 초기화
    configureKoin()

    // Plugins
    configureSerialization()
    configureCORS(config)
    configureStatusPages()
    configureDefaultHeaders()
    configureLogging()
    configureJWT(config)
    configureRedis()

    // Database
    configureDatabase(config)

    // Routing
    configureRouting()
}

