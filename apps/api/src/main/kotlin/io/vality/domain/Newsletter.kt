package io.vality.domain

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class Newsletter(
    val id: String,
    val name: String,
    val slug: String,
    val description: String? = null,
    val senderName: String? = null,
    val timezone: String = "Asia/Seoul",
    val ownerId: String,
    @Contextual
    val createdAt: Instant,
    @Contextual
    val updatedAt: Instant,
)

