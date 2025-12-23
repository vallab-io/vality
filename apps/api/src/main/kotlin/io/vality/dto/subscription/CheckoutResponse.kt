package io.vality.dto.subscription

import kotlinx.serialization.Serializable

@Serializable
data class CheckoutResponse(
    val checkoutUrl: String,
)

