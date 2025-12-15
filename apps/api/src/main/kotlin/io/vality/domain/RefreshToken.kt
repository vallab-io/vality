package io.vality.domain

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class RefreshToken(
    val id: String,
    val userId: String,
    val token: String,
    @Contextual
    val expiresAt: Instant,
    @Contextual
    val createdAt: Instant,
)

