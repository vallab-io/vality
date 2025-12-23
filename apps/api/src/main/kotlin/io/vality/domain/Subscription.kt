package io.vality.domain

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

/**
 * 구독 플랜 타입
 * 
 * 주의: 이는 뉴스레터 발행자(사용자)가 Vality 서비스를 사용하기 위해 구매하는 플랜입니다.
 * 뉴스레터를 구독하는 구독자(Subscriber)와는 다른 개념입니다.
 * 
 * - FREE: 무료 플랜 (구독자 500명, 월 1,000건 이메일)
 * - STARTER: 스타터 플랜 ($9.99/월, 구독자 2,000명, 월 5,000건 이메일)
 * - PRO: 프로 플랜 ($29.99/월, 무제한)
 */
enum class PlanType {
    FREE,
    STARTER,
    PRO,
}

/**
 * 구독 상태
 * 
 * 뉴스레터 발행자의 Vality 서비스 구독 상태를 나타냅니다.
 */
enum class SubscriptionStatus {
    ACTIVE,      // 활성 구독 (정상적으로 결제되고 사용 가능)
    CANCELLED,   // 취소됨 (기간 종료 시 만료)
    EXPIRED,     // 만료됨 (구독 기간이 종료됨)
    PAST_DUE     // 결제 실패 (과거 납입 기한, 재시도 대기 중)
}

/**
 * 구독 정보 (Subscription)
 * 
 * 이는 뉴스레터 발행자(사용자)가 Vality 서비스를 사용하기 위해 구매하는 플랜 구독 정보입니다.
 * 
 * 예시:
 * - 사용자 A가 Pro 플랜($29.99/월)을 구매 → Subscription (planType: PRO)
 * - 사용자 B가 무료 플랜 사용 → Subscription (planType: FREE)
 * 
 * 주의: 뉴스레터를 구독하는 구독자(이메일 구독자)와는 완전히 다른 개념입니다.
 * - Subscription: 뉴스레터 발행자가 Vality 서비스를 사용하기 위한 플랜
 * - Subscriber: 뉴스레터를 구독하는 이메일 구독자
 * 
 * @property id 구독 ID (CUID)
 * @property userId 뉴스레터 발행자(사용자) ID
 * @property lemonSqueezySubscriptionId Lemon Squeezy에서 발급한 구독 ID
 * @property lemonSqueezyOrderId Lemon Squeezy 주문 ID
 * @property planType 플랜 타입 (FREE, STARTER, PRO)
 * @property status 구독 상태 (ACTIVE, CANCELLED, EXPIRED, PAST_DUE)
 * @property currentPeriodStart 현재 구독 기간 시작일
 * @property currentPeriodEnd 현재 구독 기간 종료일
 * @property cancelAtPeriodEnd 기간 종료 시 자동 취소 여부
 * @property cancelledAt 구독 취소 일시
 */
@Serializable
data class Subscription(
    val id: String,
    val userId: String,
    val lemonSqueezySubscriptionId: String? = null,
    val lemonSqueezyOrderId: String? = null,
    val planType: PlanType = PlanType.FREE,
    val status: SubscriptionStatus = SubscriptionStatus.ACTIVE,
    @Contextual
    val currentPeriodStart: Instant? = null,
    @Contextual
    val currentPeriodEnd: Instant? = null,
    val cancelAtPeriodEnd: Boolean = false,
    @Contextual
    val cancelledAt: Instant? = null,
    @Contextual
    val createdAt: Instant,
    @Contextual
    val updatedAt: Instant,
) {
    /**
     * 구독이 활성 상태인지 확인
     * 
     * @return true: 활성 구독 (정상적으로 사용 가능), false: 비활성
     */
    fun isActive(): Boolean {
        return status == SubscriptionStatus.ACTIVE
    }

    /**
     * 구독이 유료 플랜인지 확인
     * 
     * @return true: STARTER 또는 PRO 플랜, false: FREE 플랜
     */
    fun isPaidPlan(): Boolean {
        return planType != PlanType.FREE
    }

    /**
     * 구독이 만료되었는지 확인
     * 
     * @return true: 구독 기간이 종료됨, false: 아직 유효함
     */
    fun isExpired(): Boolean {
        if (currentPeriodEnd == null) return false
        return Instant.now().isAfter(currentPeriodEnd)
    }
}

