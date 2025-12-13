package io.vality.routing

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.vality.routing.auth.authRoutes
import io.vality.routing.auth.oauthRoutes
import io.vality.routing.docs.docsRoutes
import io.vality.routing.health.healthRoutes

fun Application.configureRouting() {
    routing {
        healthRoutes()
        docsRoutes()
        authRoutes()
        oauthRoutes()
        // TODO: 다른 라우트 추가
        // userRoutes()
        // newsletterRoutes()
        // issueRoutes()
    }
}

