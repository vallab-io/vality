package io.vality.routing.subscription

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.domain.PlanType
import io.vality.dto.ApiResponse
import io.vality.dto.subscription.CheckoutRequest
import io.vality.dto.subscription.CheckoutResponse
import io.vality.service.LemonSqueezyService
import io.vality.service.SubscriptionService
import org.koin.ktor.ext.inject

fun Route.subscriptionRoutes() {
    val subscriptionService: SubscriptionService by inject()
    val lemonSqueezyService: LemonSqueezyService by inject()

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

            /**
             * 체크아웃 생성 (Lemon Squeezy로 리다이렉트할 URL 반환)
             * POST /api/subscriptions/checkout
             */
            post("/checkout") {
                val principal = call.principal<JWTPrincipal>() ?: return@post call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>("Unauthorized"),
                )
                val userId = principal.payload.subject

                val request = runCatching { call.receive<CheckoutRequest>() }.getOrElse {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>("Invalid request body"),
                    )
                }

                try {
                    val url = lemonSqueezyService.createCheckoutUrl(request.planType, userId)
                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = CheckoutResponse(checkoutUrl = url), message = "Checkout created"),
                    )
                } catch (e: IllegalArgumentException) {
                    call.respond(HttpStatusCode.BadRequest, ApiResponse.error<Nothing>(e.message ?: "Invalid plan"))
                } catch (e: Exception) {
                    call.application.log.error("Failed to create checkout", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>("Failed to create checkout: ${e.message}"),
                    )
                }
            }
        }
    }
}

