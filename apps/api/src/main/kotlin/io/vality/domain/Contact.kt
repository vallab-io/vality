package io.vality.domain

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class Contact(
    val id: String,
    val name: String,
    val email: String,
    val message: String,
    val userId: String? = null, // 로그인한 사용자의 경우
    @Contextual
    val createdAt: Instant,
)
