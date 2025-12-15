package io.vality.routing.auth

import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.domain.AccountProvider
import io.vality.service.AuthService
import io.vality.service.oauth.GoogleOAuthService
import io.vality.service.oauth.OAuthException
import io.vality.service.oauth.OAuthStateStore
import org.koin.ktor.ext.inject
import org.slf4j.LoggerFactory
import java.util.UUID

private val logger = LoggerFactory.getLogger("OAuthRoutes")

fun Route.oauthRoutes() {
    val googleOAuthService: GoogleOAuthService by inject()
    val authService: AuthService by inject()

    route("/api/auth/oauth") {
        // Google OAuth2 시작
        get("/google") {
            try {
                // 프론트엔드 콜백 URL 설정
                val frontendUrl = try {
                    val config: Config = ConfigFactory.load()
                    config.getStringList("ktor.cors.allowedOrigins")
                        .firstOrNull() ?: "http://localhost:3000"
                } catch (e: Exception) {
                    logger.warn("ktor.cors.allowedOrigins not found in config, using default frontendUrl", e)
                    "http://localhost:3000"
                }
                
                val redirectUri = "$frontendUrl/auth/google/callback"
                
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

        // 프론트엔드에서 호출하는 OAuth 완료 엔드포인트 (state, code 검증 및 회원가입/로그인 처리)
        post("/google/complete") {
            try {
                val code = call.request.queryParameters["code"]
                val state = call.request.queryParameters["state"]

                // 필수 파라미터 확인
                if (code == null || state == null) {
                    logger.error("Missing required parameters: code=$code, state=$state")
                    call.respond(
                        HttpStatusCode.BadRequest,
                        "Missing code or state parameter",
                    )
                    return@post
                }

                // State 검증 및 Redirect URI 가져오기
                val redirectUri = OAuthStateStore.validateState(state) ?: run {
                    logger.error("Invalid or expired state: state=$state")
                    call.respond(
                        HttpStatusCode.BadRequest, "Invalid or expired state"
                    )
                    return@post
                }

                // 토큰 교환
                val tokenResponse = googleOAuthService.exchangeCodeForToken(code, redirectUri)

                // 사용자 정보 가져오기
                val userInfo = googleOAuthService.getUserInfo(tokenResponse.accessToken)

                // AuthService.socialLogin() 호출하여 회원가입/로그인 처리
                val authResponse = authService.socialLogin(
                    provider = AccountProvider.GOOGLE,
                    userInfo = userInfo,
                )

                // AuthResponse 반환 (ApiResponse로 래핑)
                call.respond(
                    HttpStatusCode.OK,
                    io.vality.dto.ApiResponse.success(data = authResponse)
                )
            } catch (e: OAuthException) {
                logger.error("OAuth error: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    io.vality.dto.ApiResponse.error<Nothing>(message = e.message),
                )
            } catch (e: Exception) {
                logger.error("Google OAuth complete error", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    io.vality.dto.ApiResponse.error<Nothing>(message = e.message ?: "Internal server error"),
                )
            }
        }
    }
}

