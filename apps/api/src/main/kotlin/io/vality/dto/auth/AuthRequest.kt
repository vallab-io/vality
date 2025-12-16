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
    val imageUrl: String? = null, // 프로필 이미지 파일명 (새로 업로드한 경우)
    val removeAvatar: Boolean = false, // 프로필 이미지 삭제 여부
)

@Serializable
data class RefreshTokenRequest(
    val refreshToken: String,
)


