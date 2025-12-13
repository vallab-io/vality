package io.vality.routing.auth

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.plugins.origin
import io.ktor.server.request.host
import io.ktor.server.request.port
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.vality.service.oauth.GoogleOAuthService
import io.vality.service.oauth.OAuthException
import io.vality.service.oauth.OAuthStateStore
import org.koin.ktor.ext.inject
import org.slf4j.LoggerFactory
import java.util.UUID

private val logger = LoggerFactory.getLogger("OAuthRoutes")

fun Route.oauthRoutes() {
    val googleOAuthService: GoogleOAuthService by inject()

    route("/api/auth/oauth") {
        // Google OAuth2 시작
        get("/google") {
            try {
                val redirectUri =
                    "${call.request.origin.scheme}://${call.request.host()}:${call.request.port()}/api/auth/oauth/google/callback"
                // State 생성 (CSRF 방지용)
                val state = UUID.randomUUID()
                    .toString()

                // State와 Redirect URI를 메모리에 저장
                OAuthStateStore.storeState(state, redirectUri)

                val authUrl = googleOAuthService.getAuthorizationUrl(state, redirectUri)
                call.respondRedirect(authUrl)
            } catch (e: Exception) {
                logger.error("Failed to initiate Google OAuth", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    "Failed to initiate Google OAuth: ${e.message}",
                )
            }
        }

        // Google OAuth2 콜백
        get("/google/callback") {
            try {
                val code = call.request.queryParameters["code"]
                val state = call.request.queryParameters["state"]
                val error = call.request.queryParameters["error"]
                val errorDescription = call.request.queryParameters["error_description"]

                // 에러 처리
                if (error != null) {
                    logger.error("OAuth2 error: $error - $errorDescription")
                    call.respond(
                        HttpStatusCode.BadRequest,
                        "OAuth2 error: $error - $errorDescription",
                    )
                    return@get
                }

                // 필수 파라미터 확인
                if (code == null || state == null) {
                    logger.error("Missing required parameters: code=$code, state=$state")
                    call.respond(
                        HttpStatusCode.BadRequest,
                        "Missing code or state parameter",
                    )
                    return@get
                }

                // 메모리 저장소에서 State 검증 및 Redirect URI 가져오기
                val redirectUri = OAuthStateStore.validateState(state) ?: run {
                    logger.error("Invalid or expired state: state=$state")
                    call.respond(
                        HttpStatusCode.BadRequest, "Invalid or expired state"
                    )
                    return@get
                }

                // 토큰 교환
                val tokenResponse = googleOAuthService.exchangeCodeForToken(code, redirectUri)

                // 사용자 정보 가져오기
                val userInfo = googleOAuthService.getUserInfo(tokenResponse.accessToken)

                // TODO: AuthService.socialLogin() 호출하여 회원가입/로그인 처리
                call.respondRedirect("http://localhost:3000?id=${userInfo.id}")
            } catch (e: OAuthException) {
                logger.error("OAuth error: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    "OAuth error: ${e.message}",
                )
            } catch (e: Exception) {
                logger.error("Google OAuth callback error", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    "Internal server error during Google OAuth: ${e.message}",
                )
            }
        }
    }
}

