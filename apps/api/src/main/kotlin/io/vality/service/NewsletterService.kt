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
     * 뉴스레터 존재 여부 확인
     *
     * @param ownerId 사용자 ID
     * @return 뉴스레터가 하나라도 있으면 true
     */
    suspend fun hasNewsletter(ownerId: String): Boolean {
        return newsletterRepository.findByOwnerId(ownerId).isNotEmpty()
    }
}

