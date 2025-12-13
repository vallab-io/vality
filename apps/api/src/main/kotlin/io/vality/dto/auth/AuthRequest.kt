package io.vality.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class SendVerificationCodeRequest(
    val email: String,
)

@Serializable
data class VerifyCodeRequest(
    val email: String,
    val code: String,
)

@Serializable
data class SignupRequest(
    val email: String,
    val code: String,
    val username: String? = null,
    val name: String? = null,
)


