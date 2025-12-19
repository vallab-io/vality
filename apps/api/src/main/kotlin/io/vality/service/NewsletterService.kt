package io.vality.service

import io.vality.domain.Newsletter
import io.vality.repository.NewsletterRepository
import io.vality.util.CuidGenerator
import java.time.Instant

class NewsletterService(
    private val newsletterRepository: NewsletterRepository,
) {
    /**
     * 뉴스레터 생성
     *
     * @param ownerId 사용자 ID
     * @param name 뉴스레터 이름
     * @param slug 뉴스레터 슬러그 (URL에 사용)
     * @param description 뉴스레터 설명 (선택)
     * @param senderName 발신자 이름 (선택)
     * @return 생성된 뉴스레터
     */
    suspend fun createNewsletter(
        ownerId: String,
        name: String,
        slug: String,
        description: String? = null,
        senderName: String? = null,
    ): Newsletter {
        // Slug 중복 확인
        val existingNewsletter = newsletterRepository.findByOwnerIdAndSlug(ownerId, slug)
        if (existingNewsletter != null) {
            throw IllegalArgumentException("Newsletter with slug '$slug' already exists")
        }

        val now = Instant.now()
        val newsletter = Newsletter(
            id = CuidGenerator.generate(),
            name = name,
            slug = slug,
            description = description,
            senderName = senderName,
            timezone = "Asia/Seoul",
            ownerId = ownerId,
            createdAt = now,
            updatedAt = now,
        )

        return newsletterRepository.create(newsletter)
    }

    /**
     * 사용자의 뉴스레터 목록 조회
     *
     * @param ownerId 사용자 ID
     * @return 뉴스레터 목록
     */
    suspend fun getNewslettersByOwner(ownerId: String): List<Newsletter> {
        return newsletterRepository.findByOwnerId(ownerId)
    }

    /**
     * 뉴스레터 ID로 조회 (소유자 확인 포함)
     *
     * @param id 뉴스레터 ID
     * @param ownerId 소유자 ID
     * @return 뉴스레터 (없거나 소유자가 아니면 null)
     */
    suspend fun getNewsletterById(id: String, ownerId: String): Newsletter? {
        val newsletter = newsletterRepository.findById(id) ?: return null
        // 소유자 확인
        if (newsletter.ownerId != ownerId) {
            return null
        }
        return newsletter
    }

    /**
     * 뉴스레터 업데이트
     *
     * @param id 뉴스레터 ID
     * @param ownerId 소유자 ID
     * @param name 뉴스레터 이름
     * @param slug 뉴스레터 슬러그
     * @param description 뉴스레터 설명
     * @param senderName 발신자 이름
     * @param timezone 시간대
     * @return 업데이트된 뉴스레터
     */
    suspend fun updateNewsletter(
        id: String,
        ownerId: String,
        name: String,
        slug: String,
        description: String? = null,
        senderName: String? = null,
        timezone: String,
    ): Newsletter {
        // 뉴스레터 존재 및 소유자 확인
        val existingNewsletter = newsletterRepository.findById(id)
            ?: throw IllegalArgumentException("Newsletter not found")
        
        if (existingNewsletter.ownerId != ownerId) {
            throw IllegalArgumentException("You don't have permission to update this newsletter")
        }

        // Slug 변경 시 중복 확인 (자신 제외)
        if (slug != existingNewsletter.slug) {
            val duplicateNewsletter = newsletterRepository.findByOwnerIdAndSlug(ownerId, slug)
            if (duplicateNewsletter != null && duplicateNewsletter.id != id) {
                throw IllegalArgumentException("Newsletter with slug '$slug' already exists")
            }
        }

        // Slug 형식 검증
        if (!slug.matches(Regex("^[a-z0-9_-]+$"))) {
            throw IllegalArgumentException("Slug can only contain lowercase letters, numbers, hyphens, and underscores")
        }

        val updatedNewsletter = existingNewsletter.copy(
            name = name,
            slug = slug,
            description = description,
            senderName = senderName,
            timezone = timezone,
            updatedAt = java.time.Instant.now(),
        )

        return newsletterRepository.update(updatedNewsletter)
    }

    /**
     * 뉴스레터 존재 여부 확인
     *
     * @param ownerId 사용자 ID
     * @return 뉴스레터가 하나라도 있으면 true
     */
    suspend fun hasNewsletter(ownerId: String): Boolean {
        return newsletterRepository.findByOwnerId(ownerId).isNotEmpty()
    }
}

