package io.vality.dto.public

import kotlinx.serialization.Serializable

@Serializable
data class PublicUserProfileResponse(
    val id: String,
    val username: String,
    val name: String?,
    val bio: String?,
    val imageUrl: String?,
)

