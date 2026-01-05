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
    val timezone: String,
    val ownerId: String,
    @Contextual
    val createdAt: Instant,
    @Contextual
    val updatedAt: Instant,
)

