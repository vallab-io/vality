package io.vality.routing.subscription

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.request.receiveText
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.vality.dto.ApiResponse
import io.vality.service.LemonSqueezyService
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.koin.ktor.ext.inject

fun Route.lemonSqueezyRoutes() {
    val lemonSqueezyService: LemonSqueezyService by inject()

    /**
     * Lemon Squeezy 웹훅 엔드포인트
     * POST /api/webhooks/lemon-squeezy
     */
    post("/api/webhooks/lemon-squeezy") {
        val signature = call.request.headers["X-Signature"]
            ?: return@post call.respond(
                HttpStatusCode.BadRequest,
                ApiResponse.error<Nothing>("Missing signature header"),
            )

        val payload = call.receiveText()

        // 서명 검증
        val isValid = lemonSqueezyService.verifyWebhookSignature(payload, signature)
        if (!isValid) {
            call.application.log.warn("Invalid Lemon Squeezy webhook signature")
            return@post call.respond(
                HttpStatusCode.Unauthorized,
                ApiResponse.error<Nothing>("Invalid signature"),
            )
        }

        // 이벤트 타입 및 이벤트 ID 추출 (meta.event_name, meta.event_id)
        val json = Json.parseToJsonElement(payload).jsonObject
        val meta = json["meta"]?.jsonObject
        val eventType = meta?.get("event_name")?.jsonPrimitive?.content
            ?: return@post call.respond(
                HttpStatusCode.BadRequest,
                ApiResponse.error<Nothing>("Missing event_name in webhook meta"),
            )
        val eventId = meta["event_id"]?.jsonPrimitive?.content

        try {
            lemonSqueezyService.processWebhookEvent(
                eventType = eventType,
                payload = payload,
                lemonSqueezyEventId = eventId,
            )
            call.respond(HttpStatusCode.OK, ApiResponse.success(data = true, message = "Webhook processed"))
        } catch (e: Exception) {
            call.application.log.error("Failed to process Lemon Squeezy webhook", e)
            call.respond(
                HttpStatusCode.InternalServerError,
                ApiResponse.error<Nothing>("Failed to process webhook: ${e.message}"),
            )
        }
    }
}

