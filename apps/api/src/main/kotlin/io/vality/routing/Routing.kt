package io.vality.routing

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.vality.routing.health.healthRoutes

fun Application.configureRouting() {
    routing {
        healthRoutes()
        // TODO: 다른 라우트 추가
        // userRoutes()
        // newsletterRoutes()
        // issueRoutes()
    }
}

