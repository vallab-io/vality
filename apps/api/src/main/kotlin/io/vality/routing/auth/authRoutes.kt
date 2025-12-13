package io.vality.routing.auth

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.dto.auth.SendVerificationCodeRequest
import io.vality.dto.auth.SendVerificationCodeResponse
import io.vality.dto.auth.SignupRequest
import io.vality.dto.auth.VerifyCodeRequest
import io.vality.dto.auth.VerifyCodeResponse
import io.vality.service.AuthService
import org.koin.ktor.ext.inject

fun Route.authRoutes() {
    val authService: AuthService by inject()

    route("/api/auth") {
        // 이메일 인증 코드 발송
        post("/send-verification-code") {
            val request = call.receive<SendVerificationCodeRequest>()

            try {
                authService.sendVerificationCode(request.email)
                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = SendVerificationCodeResponse()),
                )
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = e.message ?: "Failed to send verification code")
                )
            }
        }

        // 인증 코드 검증
        post("/verify-code") {
            val request = call.receive<VerifyCodeRequest>()

            try {
                val isValid = authService.verifyCode(request.email, request.code)
                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = VerifyCodeResponse(valid = isValid)),
                )
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = e.message ?: "Failed to verify code"),
                )
            }
        }

        // 회원가입 (이메일 인증 방식)
        post("/signup") {
            val request = call.receive<SignupRequest>()

            try {
                val response = authService.signup(request)
                call.respond(HttpStatusCode.Created, ApiResponse.success(data = response))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = e.message ?: "Invalid request"),
                )
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = e.message ?: "Failed to signup"),
                )
            }
        }

        // 내 정보 조회 (인증 필요)
        authenticate("jwt") {
            get("/me") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.subject ?: return@get call.respond(
                    HttpStatusCode.Unauthorized, ApiResponse.error<Nothing>(message = "Unauthorized")
                )

                try {
                    val user = authService.getCurrentUser(userId)
                    call.respond(HttpStatusCode.OK, ApiResponse.success(data = user))
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = e.message ?: "User not found"),
                    )
                }
            }
        }
    }
}

