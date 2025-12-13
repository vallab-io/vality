package io.vality.domain

import kotlinx.serialization.Serializable
import kotlinx.serialization.Contextual
import java.time.Instant

@Serializable
data class User(
    val id: String,
    val email: String,
    val username: String? = null,
    val name: String? = null,
    val bio: String? = null,
    val avatarUrl: String? = null,
    @Contextual val createdAt: Instant,
    @Contextual val updatedAt: Instant
)

