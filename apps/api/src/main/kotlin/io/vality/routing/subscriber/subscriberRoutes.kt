package io.vality.routing.subscriber

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.domain.SubStatus
import io.vality.dto.ApiResponse
import io.vality.dto.subscriber.CreateSubscriberRequest
import io.vality.dto.subscriber.toSubscriberResponse
import io.vality.service.SubscriberService
import org.koin.ktor.ext.inject

fun Route.subscriberRoutes() {
    val subscriberService: SubscriberService by inject()

    authenticate("jwt") {
        route("/api/newsletters/{newsletterId}/subscribers") {
            /**
             * 구독자 목록 조회
             * GET /api/newsletters/{newsletterId}/subscribers?status=ACTIVE
             */
            get {
                val principal = call.principal<JWTPrincipal>() ?: return@get call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized"),
                )

                val userId = principal.payload.subject
                val newsletterId = call.parameters["newsletterId"] ?: return@get call.respond(
                    HttpStatusCode.BadRequest, ApiResponse.error<Nothing>(message = "Newsletter ID is required")
                )

                // status query parameter 파싱 (선택사항)
                val statusParam = call.request.queryParameters["status"]
                val status = statusParam?.let {
                    try {
                        SubStatus.valueOf(it.uppercase())
                    } catch (e: IllegalArgumentException) {
                        return@get call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "Invalid status. Must be PENDING, ACTIVE, or UNSUBSCRIBED"),
                        )
                    }
                }

                try {
                    val subscribers = subscriberService.getSubscribersByNewsletter(newsletterId, userId, status)
                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = subscribers.map { it.toSubscriberResponse() }),
                    )
                } catch (e: IllegalArgumentException) {
                    call.respond(
                        HttpStatusCode.BadRequest, ApiResponse.error<Nothing>(message = e.message ?: "Invalid request")
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to get subscribers", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to get subscribers: ${e.message}"),
                    )
                }
            }

            /**
             * 구독자 추가
             * POST /api/newsletters/{newsletterId}/subscribers
             */
            post {
                val principal = call.principal<JWTPrincipal>() ?: return@post call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized"),
                )

                principal.payload.subject
                val newsletterId = call.parameters["newsletterId"] ?: return@post call.respond(
                    HttpStatusCode.BadRequest, ApiResponse.error<Nothing>(message = "Newsletter ID is required")
                )

                val request = call.receive<CreateSubscriberRequest>()

                try {
                    // 이메일 유효성 검증
                    if (request.email.isBlank()) {
                        call.respond(
                            HttpStatusCode.BadRequest, ApiResponse.error<Nothing>(message = "Email is required")
                        )
                        return@post
                    }

                    // 대시보드에서 관리자가 직접 추가하는 경우 ACTIVE 상태로 생성
                    val subscriber = subscriberService.createSubscriber(
                        newsletterId = newsletterId,
                        email = request.email,
                        status = io.vality.domain.SubStatus.ACTIVE,
                    )

                    call.respond(
                        HttpStatusCode.Created, ApiResponse.success(data = subscriber.toSubscriberResponse())
                    )
                } catch (e: IllegalArgumentException) {
                    call.respond(
                        HttpStatusCode.BadRequest, ApiResponse.error<Nothing>(message = e.message ?: "Invalid request")
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to create subscriber", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to create subscriber: ${e.message}")
                    )
                }
            }

            /**
             * 구독자 삭제
             * DELETE /api/newsletters/{newsletterId}/subscribers/{subscriberId}
             */
            delete("/{subscriberId}") {
                val principal = call.principal<JWTPrincipal>() ?: return@delete call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized"),
                )

                val userId = principal.payload.subject
                val newsletterId = call.parameters["newsletterId"] ?: return@delete call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Newsletter ID is required"),
                )

                val subscriberId = call.parameters["subscriberId"] ?: return@delete call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Subscriber ID is required"),
                )

                try {
                    subscriberService.deleteSubscriber(subscriberId, newsletterId, userId)
                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = Unit, message = "Subscriber deleted"),
                    )
                } catch (e: IllegalArgumentException) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = e.message ?: "Invalid request"),
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to delete subscriber", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to delete subscriber: ${e.message}"),
                    )
                }
            }
        }
    }
}

