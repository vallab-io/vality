package io.vality.dto.public

import kotlinx.serialization.Serializable

@Serializable
data class PublicSubscribeRequest(
    val email: String,
)

