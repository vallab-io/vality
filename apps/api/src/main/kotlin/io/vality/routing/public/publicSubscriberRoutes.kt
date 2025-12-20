package io.vality.routing.public

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.dto.subscriber.SubscribeConfirmResponse
import io.vality.dto.subscriber.toSubscriberResponse
import io.vality.service.SubscriberService
import kotlinx.serialization.Serializable
import org.koin.ktor.ext.inject

@Serializable
data class PublicSubscribeRequest(
    val email: String,
)

fun Route.publicSubscriberRoutes() {
    val subscriberService: SubscriberService by inject()

    route("/api/public") {
        /**
         * 공개 구독 등록
         * POST /api/public/newsletter/{newsletterId}/subscribe
         * JWT 인증 불필요
         */
        post("/newsletter/{newsletterId}/subscribe") {
            val newsletterId = call.parameters["newsletterId"]
                ?: return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Newsletter ID is required"),
                )

            val request = call.receive<PublicSubscribeRequest>()

            try {
                // 이메일 유효성 검증
                if (request.email.isBlank()) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Email is required"),
                    )
                    return@post
                }

                val subscriber = subscriberService.subscribePublic(
                    newsletterId = newsletterId,
                    email = request.email,
                )

                call.respond(
                    HttpStatusCode.Created,
                    ApiResponse.success(
                        data = subscriber.toSubscriberResponse(),
                        message = "구독 신청이 완료되었습니다. 이메일을 확인해주세요.",
                    )
                )
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = e.message ?: "Invalid request"),
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to subscribe", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to subscribe: ${e.message}"),
                )
            }
        }

        /**
         * 구독 확인
         * GET /api/public/subscribe/confirm?token={token}
         * JWT 인증 불필요
         */
        get("/subscribe/confirm") {
            val token = call.request.queryParameters["token"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Token is required")
                )

            try {
                val subscriber = subscriberService.confirmSubscribe(token)
                val confirmResponse = subscriberService.getSubscribeConfirmResponse(subscriber)
                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(
                        data = confirmResponse,
                        message = "구독이 확인되었습니다.",
                    )
                )
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = e.message ?: "Invalid token"),
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to confirm subscribe", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to confirm subscribe: ${e.message}"),
                )
            }
        }
    }
}

