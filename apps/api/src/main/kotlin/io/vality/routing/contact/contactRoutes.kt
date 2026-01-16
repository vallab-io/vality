package io.vality.routing.contact

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.typesafe.config.Config
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.request.header
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.dto.contact.ContactRequest
import io.vality.dto.contact.ContactResponse
import io.vality.service.ContactService
import org.koin.ktor.ext.inject

fun Route.contactRoutes() {
    val contactService: ContactService by inject()
    val config: Config by inject()

    route("/api/contact") {
        /**
         * 문의하기
         * POST /api/contact
         * 
         * 인증: 선택적 (로그인한 사용자는 userId가 자동으로 포함됨)
         * - 로그인하지 않은 사용자도 문의 가능
         * - 로그인한 사용자는 userId가 자동으로 포함됨
         */
        post {
            try {
                val request = call.receive<ContactRequest>()

                // 유효성 검증
                if (request.name.isBlank()) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "이름을 입력해주세요.")
                    )
                }

                if (request.email.isBlank() || !request.email.contains("@")) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "유효한 이메일을 입력해주세요.")
                    )
                }

                if (request.message.isBlank()) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "문의 내용을 입력해주세요.")
                    )
                }

                if (!request.privacyAgreed) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "개인 정보 수집 및 이용에 동의해주세요.")
                    )
                }

                // 로그인한 사용자 ID 가져오기 (선택적)
                val userId = getUserIdFromToken(call, config)

                // 문의 생성
                val contact = contactService.createContact(
                    name = request.name,
                    email = request.email,
                    message = request.message,
                    userId = userId,
                )

                val response = ContactResponse(
                    id = contact.id,
                    name = contact.name,
                    email = contact.email,
                    message = contact.message,
                    createdAt = contact.createdAt,
                )

                call.respond(
                    HttpStatusCode.Created,
                    ApiResponse.success(
                        data = response,
                        message = "문의가 접수되었습니다."
                    )
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to create contact", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "문의 접수에 실패했습니다: ${e.message}")
                )
            }
        }
    }
}

/**
 * Authorization 헤더에서 JWT 토큰을 파싱하여 사용자 ID를 반환 (선택적)
 * 토큰이 없거나 유효하지 않으면 null 반환
 */
private fun getUserIdFromToken(call: io.ktor.server.application.ApplicationCall, config: Config): String? {
    return try {
        val authHeader = call.request.header("Authorization") ?: return null
        if (!authHeader.startsWith("Bearer ", ignoreCase = true)) {
            return null
        }

        val token = authHeader.removePrefix("Bearer ").trim()
        if (token.isBlank()) {
            return null
        }

        // JWT 토큰 검증
        val jwtSecret = config.getString("ktor.jwt.secret")
        val jwtIssuer = config.getString("ktor.jwt.issuer")
        val jwtAudience = config.getString("ktor.jwt.audience")

        val verifier = JWT
            .require(Algorithm.HMAC256(jwtSecret))
            .withAudience(jwtAudience)
            .withIssuer(jwtIssuer)
            .build()

        val decodedJWT = verifier.verify(token)
        decodedJWT.subject // 사용자 ID 반환
    } catch (e: Exception) {
        // 토큰이 없거나 유효하지 않으면 null 반환 (에러 로깅하지 않음 - 선택적 인증이므로)
        null
    }
}
