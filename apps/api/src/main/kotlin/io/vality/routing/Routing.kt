package io.vality.routing

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.vality.routing.auth.authRoutes
import io.vality.routing.auth.oauthRoutes
import io.vality.routing.docs.docsRoutes
import io.vality.routing.health.healthRoutes
import io.vality.routing.issue.issueRoutes
import io.vality.routing.newsletter.newsletterRoutes
import io.vality.routing.public.publicRoutes
import io.vality.routing.public.publicSubscriberRoutes
import io.vality.routing.subscription.lemonSqueezyRoutes
import io.vality.routing.subscription.subscriptionRoutes
import io.vality.routing.subscriber.subscriberRoutes
import io.vality.routing.test.testRoutes
import io.vality.routing.upload.uploadRoutes

fun Application.configureRouting() {
    routing {
        healthRoutes()
        docsRoutes()
        authRoutes()
        oauthRoutes()
        uploadRoutes()
        newsletterRoutes()
        issueRoutes()
        subscriberRoutes()
        subscriptionRoutes()
        lemonSqueezyRoutes()
        publicRoutes()
        publicSubscriberRoutes()
        testRoutes()
    }
}

