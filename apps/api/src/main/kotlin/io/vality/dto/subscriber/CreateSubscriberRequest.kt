package io.vality.dto.subscriber

import kotlinx.serialization.Serializable

@Serializable
data class CreateSubscriberRequest(
    val email: String,
)

