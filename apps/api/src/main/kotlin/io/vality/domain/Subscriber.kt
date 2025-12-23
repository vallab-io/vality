package io.vality.domain

import kotlinx.serialization.Serializable
import kotlinx.serialization.Contextual
import java.time.Instant

/**
 * 구독자 상태 (Subscriber Status)
 * 
 * 뉴스레터를 구독하는 이메일 구독자의 상태를 나타냅니다.
 * 
 * 주의: 이는 뉴스레터 발행자의 Vality 서비스 구독(Subscription)과는 다른 개념입니다.
 * - Subscriber: 뉴스레터를 구독하는 이메일 구독자
 * - Subscription: 뉴스레터 발행자가 Vality 서비스를 사용하기 위한 플랜
 */
enum class SubStatus {
    PENDING,      // 이메일 인증 대기 중 (Double Opt-In)
    ACTIVE,       // 활성 구독자 (인증 완료, 이메일 수신 중)
    UNSUBSCRIBED, // 구독 취소함
}

/**
 * 구독자 (Subscriber)
 * 
 * 이는 뉴스레터를 구독하는 이메일 구독자 정보입니다.
 * 
 * 예시:
 * - 사용자 A가 "기술 뉴스레터"를 이메일로 구독 → Subscriber (newsletterId: "기술 뉴스레터" ID)
 * - 사용자 B가 "디자인 뉴스레터"를 이메일로 구독 → Subscriber (newsletterId: "디자인 뉴스레터" ID)
 * 
 * 주의: 뉴스레터 발행자가 Vality 서비스를 사용하기 위한 플랜 구독(Subscription)과는 완전히 다른 개념입니다.
 * - Subscriber: 뉴스레터를 구독하는 이메일 구독자 (이메일을 받는 사람)
 * - Subscription: 뉴스레터 발행자가 Vality 서비스를 사용하기 위한 플랜 (서비스를 사용하는 사람)
 * 
 * 관계:
 * - User (뉴스레터 발행자) → Subscription (Vality 서비스 플랜 구매)
 * - User (뉴스레터 발행자) → Newsletter (뉴스레터 생성)
 * - Newsletter → Subscriber (이메일 구독자)
 * 
 * @property id 구독자 ID (CUID)
 * @property email 구독자 이메일 주소
 * @property status 구독자 상태 (PENDING, ACTIVE, UNSUBSCRIBED)
 * @property subscribedAt 구독 신청 일시
 * @property confirmedAt 이메일 인증 완료 일시 (Double Opt-In)
 * @property unsubscribedAt 구독 취소 일시
 * @property newsletterId 구독한 뉴스레터 ID
 */
@Serializable
data class Subscriber(
    val id: String,
    val email: String,
    val status: SubStatus = SubStatus.PENDING,
    @Contextual val subscribedAt: Instant,
    @Contextual val confirmedAt: Instant? = null,
    @Contextual val unsubscribedAt: Instant? = null,
    val newsletterId: String,
)
