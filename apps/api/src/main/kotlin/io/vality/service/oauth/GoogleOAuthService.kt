package io.vality.service.oauth

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/**
 * Google OAuth2 서비스
 */
class GoogleOAuthService(
    private val clientId: String,
    private val clientSecret: String,
    private val httpClient: HttpClient = HttpClient(CIO) {
        engine {
            requestTimeout = 10000
        }
    },
) {
    companion object {
        private const val AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
        private const val TOKEN_URL = "https://oauth2.googleapis.com/token"
        private const val USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    }

    /**
     * OAuth2 인증 URL 생성
     */
    fun getAuthorizationUrl(state: String, redirectUri: String): String {
        val params = mapOf(
            "client_id" to clientId,
            "redirect_uri" to redirectUri,
            "response_type" to "code",
            "scope" to "openid email profile",
            "state" to state,
            "access_type" to "offline",
            "prompt" to "consent",
        )

        val queryString = params.entries.joinToString("&") { (key, value) ->
            "${URLEncoder.encode(key, StandardCharsets.UTF_8)}=${URLEncoder.encode(value, StandardCharsets.UTF_8)}"
        }

        return "$AUTHORIZATION_URL?$queryString"
    }

    /**
     * 인증 코드를 액세스 토큰으로 교환
     */
    suspend fun exchangeCodeForToken(code: String, redirectUri: String): OAuthTokenResponse {
        val response = httpClient.post(TOKEN_URL) {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(
                listOf(
                    "client_id" to clientId,
                    "client_secret" to clientSecret,
                    "code" to code,
                    "grant_type" to "authorization_code",
                    "redirect_uri" to redirectUri,
                ).joinToString("&") { (key, value) ->
                    "${URLEncoder.encode(key, StandardCharsets.UTF_8)}=${
                        URLEncoder.encode(
                            value, StandardCharsets.UTF_8
                        )
                    }"
                })
        }

        if (!response.status.isSuccess()) {
            val errorBody = response.bodyAsText()
            throw OAuthException("Failed to exchange code for token: ${response.status} - $errorBody")
        }

        val json = Json { ignoreUnknownKeys = true }
        val tokenData = json.decodeFromString<GoogleTokenResponse>(response.bodyAsText())

        return OAuthTokenResponse(
            accessToken = tokenData.accessToken,
            tokenType = tokenData.tokenType,
            expiresIn = tokenData.expiresIn,
            refreshToken = tokenData.refreshToken,
            idToken = tokenData.idToken,
            scope = tokenData.scope,
        )
    }

    /**
     * 액세스 토큰으로 사용자 정보 가져오기
     */
    suspend fun getUserInfo(accessToken: String): OAuthUserInfo {
        // 액세스 토큰 유효성 검사
        if (accessToken.isBlank()) {
            throw OAuthException("Access token is empty or null")
        }

        val response = httpClient.get(USER_INFO_URL) {
            header(HttpHeaders.Authorization, "Bearer $accessToken")
        }

        if (!response.status.isSuccess()) {
            val errorBody = response.bodyAsText()
            val statusCode = response.status.value
            throw OAuthException("Failed to get user info: HTTP $statusCode - $errorBody")
        }

        val json = Json { ignoreUnknownKeys = true }
        val responseBody = response.bodyAsText()
        val userData = json.decodeFromString<GoogleUserInfo>(responseBody)

        return OAuthUserInfo(
            id = userData.id,
            email = userData.email,
            name = userData.name,
            avatarUrl = userData.picture,
        )
    }

    @Serializable
    private data class GoogleTokenResponse(
        @SerialName("access_token")
        val accessToken: String,
        @SerialName("token_type")
        val tokenType: String,
        @SerialName("expires_in")
        val expiresIn: Int? = null,
        @SerialName("refresh_token")
        val refreshToken: String? = null,
        @SerialName("id_token")
        val idToken: String? = null,
        val scope: String? = null,
    )

    @Serializable
    private data class GoogleUserInfo(
        val id: String,
        val email: String? = null,
        val name: String? = null,
        val picture: String? = null,
        @SerialName("verified_email")
        val verifiedEmail: Boolean = false,
    )
}

/**
 * OAuth2 토큰 응답
 */
data class OAuthTokenResponse(
    val accessToken: String,
    val tokenType: String,
    val expiresIn: Int? = null,
    val refreshToken: String? = null,
    val idToken: String? = null,
    val scope: String? = null,
)

/**
 * OAuth2 사용자 정보
 */
data class OAuthUserInfo(
    val id: String,
    val email: String? = null,
    val name: String? = null,
    val avatarUrl: String? = null,
)

/**
 * OAuth2 예외
 */
class OAuthException(message: String) : Exception(message)

