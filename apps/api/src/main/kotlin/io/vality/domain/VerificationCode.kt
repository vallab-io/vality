package io.vality.domain

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class VerificationCode(
    val id: String,
    val email: String,
    val code: String, // 6자리 인증 코드
    @Contextual
    val expiresAt: Instant,
    @Contextual
    val createdAt: Instant,
)

