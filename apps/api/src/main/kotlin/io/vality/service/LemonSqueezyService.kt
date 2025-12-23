package io.vality.service

import com.typesafe.config.Config
import io.vality.domain.PlanType
import io.vality.domain.Subscription
import io.vality.domain.SubscriptionStatus
import io.vality.domain.SubscriptionWebhookEvent
import io.vality.repository.SubscriptionRepository
import io.vality.repository.SubscriptionWebhookEventRepository
import io.vality.util.CuidGenerator
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.security.MessageDigest
import java.time.Instant
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/**
 * Lemon Squeezy 웹훅 처리 서비스
 * 
 * Lemon Squeezy에서 전송되는 웹훅 이벤트를 처리하고,
 * 구독 정보를 동기화합니다.
 */
class LemonSqueezyService(
    private val subscriptionRepository: SubscriptionRepository,
    private val subscriptionWebhookEventRepository: SubscriptionWebhookEventRepository,
    private val subscriptionService: SubscriptionService,
    private val config: Config,
) {
    private val webhookSecret: String = config.getString("ktor.lemonSqueezy.webhookSecret")

    /**
     * 웹훅 서명 검증
     * 
     * Lemon Squeezy는 HMAC-SHA256을 사용하여 웹훅 서명을 생성합니다.
     * 
     * @param payload 웹훅 페이로드 (원본 문자열)
     * @param signature 요청 헤더의 서명
     * @return true: 서명이 유효함, false: 서명이 유효하지 않음
     */
    fun verifyWebhookSignature(payload: String, signature: String): Boolean {
        return try {
            val mac = Mac.getInstance("HmacSHA256")
            val secretKey = SecretKeySpec(webhookSecret.toByteArray(), "HmacSHA256")
            mac.init(secretKey)
            val calculatedSignature = mac.doFinal(payload.toByteArray())
            val calculatedSignatureHex = calculatedSignature.joinToString("") { "%02x".format(it) }
            
            // Lemon Squeezy는 서명을 hex 문자열로 전송
            calculatedSignatureHex.equals(signature, ignoreCase = true)
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 웹훅 이벤트 처리
     * 
     * @param eventType 이벤트 타입 (예: "subscription_created")
     * @param payload 웹훅 페이로드 (JSON 문자열)
     * @param lemonSqueezyEventId Lemon Squeezy 이벤트 ID (멱등성 보장용)
     * @return 처리된 구독 정보
     */
    suspend fun processWebhookEvent(
        eventType: String,
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        // 멱등성 보장: 이미 처리된 이벤트인지 확인
        if (lemonSqueezyEventId != null) {
            val existingEvent = subscriptionWebhookEventRepository.findByLemonSqueezyEventId(lemonSqueezyEventId)
            if (existingEvent != null && existingEvent.processed) {
                // 이미 처리된 이벤트는 무시
                return existingEvent.subscriptionId?.let { subscriptionRepository.findById(it) }
            }
        }

        // 웹훅 이벤트 로그 생성
        val eventId = CuidGenerator.generate()
        val webhookEvent = SubscriptionWebhookEvent(
            id = eventId,
            eventType = eventType,
            lemonSqueezyEventId = lemonSqueezyEventId,
            subscriptionId = null, // 처리 후 업데이트
            payload = payload,
            processed = false,
            errorMessage = null,
            createdAt = Instant.now(),
        )
        subscriptionWebhookEventRepository.create(webhookEvent)

        try {
            // 이벤트 타입별 처리
            val subscription = when (eventType) {
                "subscription_created" -> handleSubscriptionCreated(payload, lemonSqueezyEventId)
                "subscription_updated" -> handleSubscriptionUpdated(payload, lemonSqueezyEventId)
                "subscription_cancelled" -> handleSubscriptionCancelled(payload, lemonSqueezyEventId)
                "subscription_resumed" -> handleSubscriptionResumed(payload, lemonSqueezyEventId)
                "subscription_expired" -> handleSubscriptionExpired(payload, lemonSqueezyEventId)
                "subscription_payment_success" -> handleSubscriptionPaymentSuccess(payload, lemonSqueezyEventId)
                "subscription_payment_failed" -> handleSubscriptionPaymentFailure(payload, lemonSqueezyEventId)
                "order_created" -> handleOrderCreated(payload, lemonSqueezyEventId)
                "order_refunded" -> handleOrderRefunded(payload, lemonSqueezyEventId)
                else -> {
                    // 알 수 없는 이벤트 타입은 로그만 남기고 무시
                    subscriptionWebhookEventRepository.markAsProcessed(eventId)
                    null
                }
            }

            // 이벤트 처리 완료 표시
            subscriptionWebhookEventRepository.markAsProcessed(eventId)

            return subscription
        } catch (e: Exception) {
            // 에러 발생 시 실패로 표시
            subscriptionWebhookEventRepository.markAsFailed(eventId, e.message ?: "Unknown error")
            throw e
        }
    }

    /**
     * 구독 생성 이벤트 처리
     */
    private suspend fun handleSubscriptionCreated(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        val json = Json.parseToJsonElement(payload).jsonObject
        val data = json["data"]?.jsonObject ?: return null
        val attributes = data["attributes"]?.jsonObject ?: return null

        val subscriptionId = data["id"]?.jsonPrimitive?.content
            ?: throw IllegalArgumentException("Subscription ID not found in webhook payload")

        // Lemon Squeezy subscription ID로 기존 구독 확인
        val existingSubscription = subscriptionRepository.findByLemonSqueezySubscriptionId(subscriptionId)
        if (existingSubscription != null) {
            return existingSubscription
        }

        // 사용자 ID 추출 (custom_data 또는 customer 정보에서)
        val userId = extractUserIdFromPayload(json)
            ?: throw IllegalArgumentException("User ID not found in webhook payload")

        // 플랜 타입 추출 (variant_id 또는 product_id에서)
        val planType = extractPlanTypeFromPayload(json)
            ?: PlanType.FREE

        // 구독 기간 정보 추출
        val currentPeriodStart = extractTimestamp(attributes, "current_period_start_at")
        val currentPeriodEnd = extractTimestamp(attributes, "current_period_end_at")

        val subscription = Subscription(
            id = CuidGenerator.generate(),
            userId = userId,
            lemonSqueezySubscriptionId = subscriptionId,
            lemonSqueezyOrderId = extractOrderIdFromPayload(json),
            planType = planType,
            status = SubscriptionStatus.ACTIVE,
            currentPeriodStart = currentPeriodStart,
            currentPeriodEnd = currentPeriodEnd,
            cancelAtPeriodEnd = false,
            cancelledAt = null,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        return subscriptionService.saveSubscription(subscription)
    }

    /**
     * 구독 업데이트 이벤트 처리
     */
    private suspend fun handleSubscriptionUpdated(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        val json = Json.parseToJsonElement(payload).jsonObject
        val data = json["data"]?.jsonObject ?: return null
        val attributes = data["attributes"]?.jsonObject ?: return null

        val subscriptionId = data["id"]?.jsonPrimitive?.content
            ?: throw IllegalArgumentException("Subscription ID not found in webhook payload")

        val existingSubscription = subscriptionRepository.findByLemonSqueezySubscriptionId(subscriptionId)
            ?: throw IllegalArgumentException("Subscription not found: $subscriptionId")

        // 구독 기간 정보 업데이트
        val currentPeriodStart = extractTimestamp(attributes, "current_period_start_at")
        val currentPeriodEnd = extractTimestamp(attributes, "current_period_end_at")

        val updatedSubscription = existingSubscription.copy(
            currentPeriodStart = currentPeriodStart ?: existingSubscription.currentPeriodStart,
            currentPeriodEnd = currentPeriodEnd ?: existingSubscription.currentPeriodEnd,
            updatedAt = Instant.now()
        )

        return subscriptionRepository.update(updatedSubscription)
    }

    /**
     * 구독 취소 이벤트 처리
     */
    private suspend fun handleSubscriptionCancelled(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        val json = Json.parseToJsonElement(payload).jsonObject
        val data = json["data"]?.jsonObject ?: return null

        val subscriptionId = data["id"]?.jsonPrimitive?.content
            ?: throw IllegalArgumentException("Subscription ID not found in webhook payload")

        val existingSubscription = subscriptionRepository.findByLemonSqueezySubscriptionId(subscriptionId)
            ?: throw IllegalArgumentException("Subscription not found: $subscriptionId")

        val updatedSubscription = existingSubscription.copy(
            status = SubscriptionStatus.CANCELLED,
            cancelAtPeriodEnd = true,
            cancelledAt = Instant.now(),
            updatedAt = Instant.now()
        )

        return subscriptionRepository.update(updatedSubscription)
    }

    /**
     * 구독 재개 이벤트 처리
     */
    private suspend fun handleSubscriptionResumed(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        val json = Json.parseToJsonElement(payload).jsonObject
        val data = json["data"]?.jsonObject ?: return null
        val attributes = data["attributes"]?.jsonObject ?: return null

        val subscriptionId = data["id"]?.jsonPrimitive?.content
            ?: throw IllegalArgumentException("Subscription ID not found in webhook payload")

        val existingSubscription = subscriptionRepository.findByLemonSqueezySubscriptionId(subscriptionId)
            ?: throw IllegalArgumentException("Subscription not found: $subscriptionId")

        val currentPeriodStart = extractTimestamp(attributes, "current_period_start_at")
        val currentPeriodEnd = extractTimestamp(attributes, "current_period_end_at")

        val updatedSubscription = existingSubscription.copy(
            status = SubscriptionStatus.ACTIVE,
            cancelAtPeriodEnd = false,
            cancelledAt = null,
            currentPeriodStart = currentPeriodStart ?: existingSubscription.currentPeriodStart,
            currentPeriodEnd = currentPeriodEnd ?: existingSubscription.currentPeriodEnd,
            updatedAt = Instant.now()
        )

        return subscriptionRepository.update(updatedSubscription)
    }

    /**
     * 구독 만료 이벤트 처리
     */
    private suspend fun handleSubscriptionExpired(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        val json = Json.parseToJsonElement(payload).jsonObject
        val data = json["data"]?.jsonObject ?: return null

        val subscriptionId = data["id"]?.jsonPrimitive?.content
            ?: throw IllegalArgumentException("Subscription ID not found in webhook payload")

        val existingSubscription = subscriptionRepository.findByLemonSqueezySubscriptionId(subscriptionId)
            ?: throw IllegalArgumentException("Subscription not found: $subscriptionId")

        val updatedSubscription = existingSubscription.copy(
            status = SubscriptionStatus.EXPIRED,
            updatedAt = Instant.now()
        )

        return subscriptionRepository.update(updatedSubscription)
    }

    /**
     * 구독 결제 성공 이벤트 처리
     */
    private suspend fun handleSubscriptionPaymentSuccess(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        // 결제 성공 시 구독 상태를 ACTIVE로 유지하고 기간 업데이트
        return handleSubscriptionUpdated(payload, lemonSqueezyEventId)
    }

    /**
     * 구독 결제 실패 이벤트 처리
     */
    private suspend fun handleSubscriptionPaymentFailure(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        val json = Json.parseToJsonElement(payload).jsonObject
        val data = json["data"]?.jsonObject ?: return null

        val subscriptionId = data["id"]?.jsonPrimitive?.content
            ?: throw IllegalArgumentException("Subscription ID not found in webhook payload")

        val existingSubscription = subscriptionRepository.findByLemonSqueezySubscriptionId(subscriptionId)
            ?: throw IllegalArgumentException("Subscription not found: $subscriptionId")

        val updatedSubscription = existingSubscription.copy(
            status = SubscriptionStatus.PAST_DUE,
            updatedAt = Instant.now()
        )

        return subscriptionRepository.update(updatedSubscription)
    }

    /**
     * 주문 생성 이벤트 처리
     */
    private suspend fun handleOrderCreated(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        // 주문 생성은 구독 생성과 연관될 수 있지만,
        // 일반적으로 subscription_created 이벤트가 먼저 발생하므로
        // 여기서는 로그만 남기고 구독 정보는 업데이트하지 않음
        return null
    }

    /**
     * 주문 환불 이벤트 처리
     */
    private suspend fun handleOrderRefunded(
        payload: String,
        lemonSqueezyEventId: String?,
    ): Subscription? {
        // 환불 시 구독 취소 처리
        return handleSubscriptionCancelled(payload, lemonSqueezyEventId)
    }

    /**
     * 페이로드에서 사용자 ID 추출
     * 
     * Lemon Squeezy 웹훅 페이로드에서 사용자 ID를 추출합니다.
     * custom_data 또는 meta에 userId가 포함되어 있어야 합니다.
     */
    private fun extractUserIdFromPayload(json: JsonObject): String? {
        // custom_data에서 userId 추출 시도
        val customData = json["meta"]?.jsonObject?.get("custom_data")?.jsonObject
        return customData?.get("userId")?.jsonPrimitive?.content
            ?: json["meta"]?.jsonObject?.get("userId")?.jsonPrimitive?.content
    }

    /**
     * 페이로드에서 주문 ID 추출
     */
    private fun extractOrderIdFromPayload(json: JsonObject): String? {
        val included = json["included"]?.jsonObject
        val orders = included?.get("orders")?.jsonObject
        return orders?.get("id")?.jsonPrimitive?.content
    }

    /**
     * 페이로드에서 플랜 타입 추출
     * 
     * variant_id 또는 product_id를 기반으로 플랜 타입을 결정합니다.
     * 환경 변수에서 variant_id 매핑을 확인합니다.
     */
    private fun extractPlanTypeFromPayload(json: JsonObject): PlanType? {
        val data = json["data"]?.jsonObject ?: return null
        val attributes = data["attributes"]?.jsonObject ?: return null

        // variant_id 추출
        val variantId = attributes["variant_id"]?.jsonPrimitive?.content
            ?: return null

        // 환경 변수에서 variant_id 매핑 확인
        val starterVariantId = config.getStringOrNull("ktor.lemonSqueezy.starterVariantId")
        val proVariantId = config.getStringOrNull("ktor.lemonSqueezy.proVariantId")

        return when (variantId) {
            starterVariantId -> PlanType.STARTER
            proVariantId -> PlanType.PRO
            else -> null
        }
    }

    /**
     * 타임스탬프 추출
     */
    private fun extractTimestamp(attributes: JsonObject, key: String): Instant? {
        val timestampStr = attributes[key]?.jsonPrimitive?.content ?: return null
        return try {
            Instant.parse(timestampStr)
        } catch (e: Exception) {
            null
        }
    }
}

/**
 * Config 확장 함수: 안전하게 문자열 가져오기
 */
private fun Config.getStringOrNull(path: String): String? {
    return try {
        if (hasPath(path)) {
            getString(path)
        } else {
            null
        }
    } catch (e: Exception) {
        null
    }
}

