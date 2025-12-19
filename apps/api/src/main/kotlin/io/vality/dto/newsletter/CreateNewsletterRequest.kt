package io.vality.dto.newsletter

import kotlinx.serialization.Serializable

@Serializable
data class CreateNewsletterRequest(
    val name: String,
    val slug: String,
    val description: String? = null,
    val senderName: String? = null,
)

