package io.vality.dto.public

import kotlinx.serialization.Serializable

@Serializable
data class PublicNewsletterResponse(
    val id: String,
    val slug: String,
    val name: String,
    val description: String?,
    val subscriberCount: Long,
)

