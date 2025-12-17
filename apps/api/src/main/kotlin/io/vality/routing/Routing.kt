package io.vality.routing

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.vality.routing.auth.authRoutes
import io.vality.routing.auth.oauthRoutes
import io.vality.routing.docs.docsRoutes
import io.vality.routing.health.healthRoutes
import io.vality.routing.test.testRoutes
import io.vality.routing.upload.uploadRoutes

fun Application.configureRouting() {
    routing {
        healthRoutes()
        docsRoutes()
        authRoutes()
        oauthRoutes()
        uploadRoutes()
        testRoutes()
    }
}

