package io.vality.repository

import io.vality.domain.SubscriptionWebhookEvent
import io.vality.domain.SubscriptionWebhookEvents
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.update

class SubscriptionWebhookEventRepository {

    private fun ResultRow.toWebhookEvent(): SubscriptionWebhookEvent {
        return SubscriptionWebhookEvent(
            id = this[SubscriptionWebhookEvents.id],
            eventType = this[SubscriptionWebhookEvents.eventType],
            lemonSqueezyEventId = this[SubscriptionWebhookEvents.lemonSqueezyEventId],
            subscriptionId = this[SubscriptionWebhookEvents.subscriptionId],
            payload = this[SubscriptionWebhookEvents.payload],
            processed = this[SubscriptionWebhookEvents.processed],
            errorMessage = this[SubscriptionWebhookEvents.errorMessage],
            createdAt = this[SubscriptionWebhookEvents.createdAt]
        )
    }

    /**
     * 이벤트 ID로 조회
     */
    suspend fun findById(id: String): SubscriptionWebhookEvent? = dbQuery {
        SubscriptionWebhookEvents.select(
            listOf(
                SubscriptionWebhookEvents.id,
                SubscriptionWebhookEvents.eventType,
                SubscriptionWebhookEvents.lemonSqueezyEventId,
                SubscriptionWebhookEvents.subscriptionId,
                SubscriptionWebhookEvents.payload,
                SubscriptionWebhookEvents.processed,
                SubscriptionWebhookEvents.errorMessage,
                SubscriptionWebhookEvents.createdAt
            )
        )
            .where { SubscriptionWebhookEvents.id eq id }
            .singleOrNull()
            ?.toWebhookEvent()
    }

    /**
     * Lemon Squeezy 이벤트 ID로 조회 (멱등성 보장용)
     */
    suspend fun findByLemonSqueezyEventId(lemonSqueezyEventId: String): SubscriptionWebhookEvent? = dbQuery {
        SubscriptionWebhookEvents.select(
            listOf(
                SubscriptionWebhookEvents.id,
                SubscriptionWebhookEvents.eventType,
                SubscriptionWebhookEvents.lemonSqueezyEventId,
                SubscriptionWebhookEvents.subscriptionId,
                SubscriptionWebhookEvents.payload,
                SubscriptionWebhookEvents.processed,
                SubscriptionWebhookEvents.errorMessage,
                SubscriptionWebhookEvents.createdAt
            )
        )
            .where { SubscriptionWebhookEvents.lemonSqueezyEventId eq lemonSqueezyEventId }
            .singleOrNull()
            ?.toWebhookEvent()
    }

    /**
     * 구독 ID로 이벤트 목록 조회
     */
    suspend fun findBySubscriptionId(subscriptionId: String): List<SubscriptionWebhookEvent> = dbQuery {
        SubscriptionWebhookEvents.select(
            listOf(
                SubscriptionWebhookEvents.id,
                SubscriptionWebhookEvents.eventType,
                SubscriptionWebhookEvents.lemonSqueezyEventId,
                SubscriptionWebhookEvents.subscriptionId,
                SubscriptionWebhookEvents.payload,
                SubscriptionWebhookEvents.processed,
                SubscriptionWebhookEvents.errorMessage,
                SubscriptionWebhookEvents.createdAt
            )
        )
            .where { SubscriptionWebhookEvents.subscriptionId eq subscriptionId }
            .orderBy(SubscriptionWebhookEvents.createdAt to SortOrder.DESC)
            .map { it.toWebhookEvent() }
    }

    /**
     * 처리되지 않은 이벤트 목록 조회
     */
    suspend fun findUnprocessed(limit: Int = 100): List<SubscriptionWebhookEvent> = dbQuery {
        SubscriptionWebhookEvents.select(
            listOf(
                SubscriptionWebhookEvents.id,
                SubscriptionWebhookEvents.eventType,
                SubscriptionWebhookEvents.lemonSqueezyEventId,
                SubscriptionWebhookEvents.subscriptionId,
                SubscriptionWebhookEvents.payload,
                SubscriptionWebhookEvents.processed,
                SubscriptionWebhookEvents.errorMessage,
                SubscriptionWebhookEvents.createdAt
            )
        )
            .where { SubscriptionWebhookEvents.processed eq false }
            .orderBy(SubscriptionWebhookEvents.createdAt to SortOrder.ASC)
            .limit(limit)
            .map { it.toWebhookEvent() }
    }

    /**
     * 웹훅 이벤트 생성
     */
    suspend fun create(event: SubscriptionWebhookEvent): SubscriptionWebhookEvent = dbQuery {
        SubscriptionWebhookEvents.insert {
            it[id] = event.id
            it[eventType] = event.eventType
            it[lemonSqueezyEventId] = event.lemonSqueezyEventId
            it[subscriptionId] = event.subscriptionId
            it[payload] = event.payload
            it[processed] = event.processed
            it[errorMessage] = event.errorMessage
            it[createdAt] = event.createdAt
        }
        event
    }

    /**
     * 이벤트를 처리 완료로 표시
     */
    suspend fun markAsProcessed(eventId: String): Boolean = dbQuery {
        SubscriptionWebhookEvents.update({ SubscriptionWebhookEvents.id eq eventId }) {
            it[SubscriptionWebhookEvents.processed] = true
            it[SubscriptionWebhookEvents.errorMessage] = null
        } > 0
    }

    /**
     * 이벤트를 처리 실패로 표시
     */
    suspend fun markAsFailed(eventId: String, errorMessage: String): Boolean = dbQuery {
        SubscriptionWebhookEvents.update({ SubscriptionWebhookEvents.id eq eventId }) {
            it[SubscriptionWebhookEvents.processed] = true
            it[SubscriptionWebhookEvents.errorMessage] = errorMessage
        } > 0
    }
}

