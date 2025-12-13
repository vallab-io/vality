package io.vality.domain

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

enum class AccountProvider {
    GOOGLE,
    APPLE,
}

@Serializable
data class Account(
    val id: String,
    val provider: AccountProvider,
    val providerAccountId: String,
    val userId: String,
    @Contextual
    val createdAt: Instant,
)

