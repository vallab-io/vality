package io.vality.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.vality.di.appModule
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

fun Application.configureKoin() {
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
}

