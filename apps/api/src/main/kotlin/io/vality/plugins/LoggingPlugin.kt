package io.vality.plugins

import io.ktor.http.HttpHeaders
import io.ktor.http.content.OutgoingContent
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.application.log
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.doublereceive.DoubleReceive
import io.ktor.server.request.header
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.receiveText
import io.ktor.server.response.ApplicationSendPipeline
import io.ktor.util.AttributeKey
import io.ktor.utils.io.charsets.Charsets
import org.slf4j.event.Level

private val RequestBodyKey = AttributeKey<String>("requestBodyLog")

fun Application.configureLogging() {
    install(DoubleReceive)

    install(CallLogging) {
        level = Level.INFO
        filter { call ->
            !call.request.path()
                .startsWith("/api/health")
        }
        mdc("method") { it.request.httpMethod.value }
        mdc("uri") { it.request.path() }
        mdc("status") { it.response.status()?.value?.toString() ?: "pending" }
        mdc("userAgent") { it.request.header(HttpHeaders.UserAgent) ?: "unknown" }
        mdc("requestId") { it.request.header("X-Request-Id") ?: "" }
    }

    // Request body logging (safe, truncated)
    intercept(ApplicationCallPipeline.Monitoring) {
        val body = try {
            call.receiveText()
        } catch (_: Exception) {
            "<unavailable>"
        }
        call.attributes.put(RequestBodyKey, body)
        proceed()
    }

    // Response body logging (safe, truncated)
    sendPipeline.intercept(ApplicationSendPipeline.After) { message ->
        val reqId = call.request.header("X-Request-Id") ?: ""
        val reqBody = call.attributes.getOrNull(RequestBodyKey) ?: ""
        val resBody = when (message) {
            is String -> message
            is OutgoingContent.ByteArrayContent -> message.bytes()
                .toString(Charsets.UTF_8)

            else -> message.toString()
        }
        call.application.log.info(
            "[req:{}] {} {} status={} reqBody={} resBody={}",
            reqId,
            call.request.httpMethod.value,
            call.request.path(),
            call.response.status()?.value ?: "pending",
            reqBody,
            resBody,
        )
        proceedWith(message)
    }
}
