package io.vality.service

import io.vality.dto.public.PublicUserProfileResponse
import io.vality.repository.UserRepository
import io.vality.service.upload.ImageUrlService

/**
 * 사용자 관련 서비스
 */
class UserService(
    private val userRepository: UserRepository,
    private val imageUrlService: ImageUrlService,
) {
    /**
     * 공개 사용자 프로필 조회
     */
    suspend fun getUserProfile(username: String): PublicUserProfileResponse {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("User not found")

        if (user.username == null) {
            throw IllegalArgumentException("User profile not available")
        }

        return PublicUserProfileResponse(
            id = user.id,
            username = user.username,
            name = user.name,
            bio = user.bio,
            imageUrl = imageUrlService.getImageUrl(user),
        )
    }
}

