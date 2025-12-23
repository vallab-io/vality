package io.vality.routing.subscription

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.vality.domain.PlanType
import io.vality.dto.ApiResponse
import io.vality.service.SubscriptionService
import org.koin.ktor.ext.inject

fun Route.subscriptionRoutes() {
    val subscriptionService: SubscriptionService by inject()

    authenticate("jwt") {
        route("/api/subscriptions") {
            /**
             * 내 구독 정보 조회
             * GET /api/subscriptions/me
             */
            get("/me") {
                val principal = call.principal<JWTPrincipal>() ?: return@get call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>("Unauthorized"),
                )

                val userId = principal.payload.subject
                val subscription = subscriptionService.getUserSubscription(userId)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = subscription))
            }

            /**
             * 사용 가능한 플랜 목록 조회
             * GET /api/subscriptions/plans
             */
            get("/plans") {
                val plans = PlanType.entries.map { it.name }
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = plans))
            }
        }
    }
}

