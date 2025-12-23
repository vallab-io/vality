package io.vality.service

import io.vality.domain.PlanType
import io.vality.domain.Subscription
import io.vality.domain.SubscriptionStatus
import io.vality.repository.NewsletterRepository
import io.vality.repository.SubscriptionRepository

/**
 * 구독 관련 서비스
 *
 * 뉴스레터 발행자의 Vality 서비스 플랜 구독을 관리하고,
 * 플랜별 제한사항을 체크합니다.
 */
class SubscriptionService(
    private val subscriptionRepository: SubscriptionRepository,
    private val newsletterRepository: NewsletterRepository,
) {
    /**
     * 사용자의 구독 정보 조회
     *
     * @param userId 사용자 ID
     * @return 구독 정보 (없으면 null)
     */
    suspend fun getUserSubscription(userId: String): Subscription? {
        return subscriptionRepository.findByUserId(userId)
    }

    /**
     * 사용자의 현재 플랜 타입 조회
     *
     * @param userId 사용자 ID
     * @return 플랜 타입 (기본값: FREE)
     */
    suspend fun getUserPlan(userId: String): PlanType {
        val subscription = subscriptionRepository.findByUserId(userId)
        return subscription?.planType ?: PlanType.FREE
    }

    /**
     * 사용자의 구독이 활성 상태인지 확인
     *
     * @param userId 사용자 ID
     * @return true: 활성 구독, false: 비활성 또는 없음
     */
    suspend fun isSubscriptionActive(userId: String): Boolean {
        val subscription = subscriptionRepository.findByUserId(userId)
        return subscription?.isActive() == true && !subscription.isExpired()
    }

    /**
     * 플랜별 뉴스레터 생성 제한
     */
    private fun getNewsletterLimit(planType: PlanType): Int? {
        return when (planType) {
            PlanType.FREE -> 1
            PlanType.STARTER -> 3
            PlanType.PRO -> null // 무제한
        }
    }

    /**
     * 플랜별 구독자 수 제한
     *
     * 주의: 현재는 구독자 수 제한이 없습니다.
     * 향후 필요 시 이 메서드를 사용할 수 있습니다.
     */
    private fun getSubscriberLimit(planType: PlanType): Int? {
        // 구독자 수 제한 없음
        return null
    }

    /**
     * 플랜별 월 이메일 발송 제한
     */
    private fun getEmailLimit(planType: PlanType): Int? {
        return when (planType) {
            PlanType.FREE -> 1_000
            PlanType.STARTER -> 5_000
            PlanType.PRO -> null // 무제한
        }
    }

    /**
     * 뉴스레터 생성 가능 여부 확인
     *
     * @param userId 사용자 ID
     * @return true: 생성 가능, false: 제한 초과
     */
    suspend fun canCreateNewsletter(userId: String): Boolean {
        val planType = getUserPlan(userId)
        val limit = getNewsletterLimit(planType) ?: return true // 무제한

        val currentCount = newsletterRepository.findByOwnerId(userId).size
        return currentCount < limit
    }

    /**
     * 구독자 추가 가능 여부 확인
     *
     * 현재는 구독자 수 제한이 없으므로 항상 true를 반환합니다.
     *
     * @param userId 사용자 ID
     * @param newsletterId 뉴스레터 ID
     * @return 항상 true (제한 없음)
     */
    suspend fun canAddSubscriber(userId: String, newsletterId: String): Boolean {
        // 구독자 수 제한 없음
        return true
    }

    /**
     * 이메일 발송 가능 여부 확인
     *
     * @param userId 사용자 ID
     * @param emailCount 발송하려는 이메일 수
     * @return true: 발송 가능, false: 제한 초과
     */
    suspend fun canSendEmail(userId: String, emailCount: Int): Boolean {
        val planType = getUserPlan(userId)
        val limit = getEmailLimit(planType) ?: return true // 무제한

        // TODO: 월별 이메일 발송량 추적 (EmailLog 테이블 활용)
        // 현재는 단순히 제한만 확인
        // 추후 EmailLog를 통해 월별 발송량을 계산해야 함
        return emailCount <= limit
    }

    /**
     * 플랜 제한 체크 (종합)
     *
     * @param userId 사용자 ID
     * @param action 수행하려는 액션 (NEWSLETTER, EMAIL)
     * @param count 추가/생성하려는 수량
     * @return true: 가능, false: 제한 초과
     */
    suspend fun checkPlanLimits(
        userId: String,
        action: PlanLimitAction,
        count: Int = 1,
    ): Boolean {
        return when (action) {
            PlanLimitAction.NEWSLETTER -> canCreateNewsletter(userId)
            PlanLimitAction.EMAIL -> canSendEmail(userId, count)
        }
    }

    /**
     * 구독 생성 또는 업데이트
     *
     * @param subscription 구독 정보
     * @return 저장된 구독 정보
     */
    suspend fun saveSubscription(subscription: Subscription): Subscription {
        val existing = subscriptionRepository.findByUserId(subscription.userId)
        return if (existing != null) {
            subscriptionRepository.update(subscription)
        } else {
            subscriptionRepository.create(subscription)
        }
    }

    /**
     * 구독 상태 업데이트
     *
     * @param subscriptionId 구독 ID
     * @param status 새로운 상태
     * @return 업데이트된 구독 정보
     */
    suspend fun updateSubscriptionStatus(
        subscriptionId: String,
        status: SubscriptionStatus,
    ): Subscription? {
        return subscriptionRepository.updateStatus(subscriptionId, status)
    }

    /**
     * Lemon Squeezy 구독 ID로 구독 조회
     *
     * @param lemonSqueezySubscriptionId Lemon Squeezy 구독 ID
     * @return 구독 정보
     */
    suspend fun findByLemonSqueezySubscriptionId(
        lemonSqueezySubscriptionId: String,
    ): Subscription? {
        return subscriptionRepository.findByLemonSqueezySubscriptionId(lemonSqueezySubscriptionId)
    }

}

/**
 * 플랜 제한 액션 타입
 */
enum class PlanLimitAction {
    NEWSLETTER,  // 뉴스레터 생성
    EMAIL        // 이메일 발송
}

