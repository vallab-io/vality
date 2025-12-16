package io.vality.dto.auth

import kotlinx.serialization.Serializable
import io.vality.domain.User
import io.vality.service.upload.ImageUrlService

@Serializable
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val user: UserResponse,
)

@Serializable
data class UserResponse(
    val id: String,
    val email: String,
    val username: String? = null,
    val name: String? = null,
    val bio: String? = null,
    val imageUrl: String? = null,
)

fun User.toUserResponse(imageUrlService: ImageUrlService): UserResponse {
    return UserResponse(
        id = this.id,
        email = this.email,
        username = this.username,
        name = this.name,
        bio = this.bio,
        imageUrl = imageUrlService.getImageUrl(this),
    )
}

@Serializable
data class SendVerificationCodeResponse(
    val message: String = "Verification code sent"
)
