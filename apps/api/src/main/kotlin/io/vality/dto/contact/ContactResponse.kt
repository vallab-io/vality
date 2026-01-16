package io.vality.dto.contact

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class ContactResponse(
    val id: String,
    val name: String,
    val email: String,
    val message: String,
    @Contextual
    val createdAt: Instant,
)
