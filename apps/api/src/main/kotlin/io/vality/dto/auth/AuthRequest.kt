package io.vality.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class SendVerificationCodeRequest(
    val email: String,
)

@Serializable
data class EmailAuthRequest(
    val email: String,
    val code: String,
)

@Serializable
data class UpdateProfileRequest(
    val username: String, // 필수
    val name: String? = null,
    val bio: String? = null,
)

@Serializable
data class RefreshTokenRequest(
    val refreshToken: String,
)


