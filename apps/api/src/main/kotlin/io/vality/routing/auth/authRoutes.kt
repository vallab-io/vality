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
import io.ktor.server.routing.patch
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.dto.auth.EmailAuthRequest
import io.vality.dto.auth.RefreshTokenRequest
import io.vality.dto.auth.SendVerificationCodeRequest
import io.vality.dto.auth.SendVerificationCodeResponse
import io.vality.dto.auth.UpdateProfileRequest
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

        // 이메일 인증 로그인/회원가입 (통합)
        post("/email-auth") {
            val request = call.receive<EmailAuthRequest>()

            try {
                val response = authService.authenticateWithEmail(request.email, request.code)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = response))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = e.message ?: "Invalid request"),
                )
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = e.message ?: "Failed to authenticate"),
                )
            }
        }

        // RefreshToken으로 AccessToken 갱신
        post("/refresh") {
            val request = call.receive<RefreshTokenRequest>()

            try {
                val response = authService.refreshAccessToken(request.refreshToken)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = response))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = e.message ?: "Invalid refresh token"),
                )
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = e.message ?: "Failed to refresh token"),
                )
            }
        }

        // Username 존재 여부 확인
        get("/check-username") {
            val username = call.request.queryParameters["username"]

            if (username == null || username.isBlank()) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required"),
                )
                return@get
            }

            try {
                val isAvailable = authService.checkUsernameAvailability(username)
                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = mapOf("available" to isAvailable)),
                )
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = e.message ?: "Failed to check username"),
                )
            }
        }

        // 내 정보 조회 및 업데이트 (인증 필요)
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

            patch("/me") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.subject ?: return@patch call.respond(
                    HttpStatusCode.Unauthorized, ApiResponse.error<Nothing>(message = "Unauthorized")
                )

                val request = call.receive<UpdateProfileRequest>()

                try {
                    val user = authService.updateProfile(
                        userId = userId,
                        username = request.username,
                        name = request.name,
                        bio = request.bio,
                    )
                    call.respond(HttpStatusCode.OK, ApiResponse.success(data = user))
                } catch (e: IllegalArgumentException) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = e.message ?: "Invalid request"),
                    )
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = e.message ?: "Failed to update profile"),
                    )
                }
            }
        }
    }
}

