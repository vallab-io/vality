package io.vality.dto.subscription

import io.vality.domain.PlanType
import kotlinx.serialization.Serializable

@Serializable
data class CheckoutRequest(
    val planType: PlanType,
)

