package io.vality.repository

import io.vality.domain.PlanType
import io.vality.domain.Subscription
import io.vality.domain.SubscriptionStatus
import io.vality.domain.Subscriptions
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.update

class SubscriptionRepository {

    private fun ResultRow.toSubscription(): Subscription {
        return Subscription(
            id = this[Subscriptions.id],
            userId = this[Subscriptions.userId],
            lemonSqueezySubscriptionId = this[Subscriptions.lemonSqueezySubscriptionId],
            lemonSqueezyOrderId = this[Subscriptions.lemonSqueezyOrderId],
            planType = PlanType.valueOf(this[Subscriptions.planType]),
            status = SubscriptionStatus.valueOf(this[Subscriptions.status]),
            currentPeriodStart = this[Subscriptions.currentPeriodStart],
            currentPeriodEnd = this[Subscriptions.currentPeriodEnd],
            cancelAtPeriodEnd = this[Subscriptions.cancelAtPeriodEnd],
            cancelledAt = this[Subscriptions.cancelledAt],
            createdAt = this[Subscriptions.createdAt],
            updatedAt = this[Subscriptions.updatedAt]
        )
    }

    /**
     * 구독 ID로 조회
     */
    suspend fun findById(id: String): Subscription? = dbQuery {
        Subscriptions.select(
            listOf(
                Subscriptions.id,
                Subscriptions.userId,
                Subscriptions.lemonSqueezySubscriptionId,
                Subscriptions.lemonSqueezyOrderId,
                Subscriptions.planType,
                Subscriptions.status,
                Subscriptions.currentPeriodStart,
                Subscriptions.currentPeriodEnd,
                Subscriptions.cancelAtPeriodEnd,
                Subscriptions.cancelledAt,
                Subscriptions.createdAt,
                Subscriptions.updatedAt
            )
        )
            .where { Subscriptions.id eq id }
            .singleOrNull()
            ?.toSubscription()
    }

    /**
     * 사용자 ID로 구독 조회
     */
    suspend fun findByUserId(userId: String): Subscription? = dbQuery {
        Subscriptions.select(
            listOf(
                Subscriptions.id,
                Subscriptions.userId,
                Subscriptions.lemonSqueezySubscriptionId,
                Subscriptions.lemonSqueezyOrderId,
                Subscriptions.planType,
                Subscriptions.status,
                Subscriptions.currentPeriodStart,
                Subscriptions.currentPeriodEnd,
                Subscriptions.cancelAtPeriodEnd,
                Subscriptions.cancelledAt,
                Subscriptions.createdAt,
                Subscriptions.updatedAt
            )
        )
            .where { Subscriptions.userId eq userId }
            .singleOrNull()
            ?.toSubscription()
    }

    /**
     * Lemon Squeezy 구독 ID로 조회
     */
    suspend fun findByLemonSqueezySubscriptionId(lemonSqueezySubscriptionId: String): Subscription? = dbQuery {
        Subscriptions.select(
            listOf(
                Subscriptions.id,
                Subscriptions.userId,
                Subscriptions.lemonSqueezySubscriptionId,
                Subscriptions.lemonSqueezyOrderId,
                Subscriptions.planType,
                Subscriptions.status,
                Subscriptions.currentPeriodStart,
                Subscriptions.currentPeriodEnd,
                Subscriptions.cancelAtPeriodEnd,
                Subscriptions.cancelledAt,
                Subscriptions.createdAt,
                Subscriptions.updatedAt
            )
        )
            .where { Subscriptions.lemonSqueezySubscriptionId eq lemonSqueezySubscriptionId }
            .singleOrNull()
            ?.toSubscription()
    }

    /**
     * 구독 생성
     */
    suspend fun create(subscription: Subscription): Subscription = dbQuery {
        Subscriptions.insert {
            it[id] = subscription.id
            it[userId] = subscription.userId
            it[lemonSqueezySubscriptionId] = subscription.lemonSqueezySubscriptionId
            it[lemonSqueezyOrderId] = subscription.lemonSqueezyOrderId
            it[planType] = subscription.planType.name
            it[status] = subscription.status.name
            it[currentPeriodStart] = subscription.currentPeriodStart
            it[currentPeriodEnd] = subscription.currentPeriodEnd
            it[cancelAtPeriodEnd] = subscription.cancelAtPeriodEnd
            it[cancelledAt] = subscription.cancelledAt
            it[createdAt] = subscription.createdAt
            it[updatedAt] = subscription.updatedAt
        }
        subscription
    }

    /**
     * 구독 업데이트
     */
    suspend fun update(subscription: Subscription): Subscription = dbQuery {
        Subscriptions.update({ Subscriptions.id eq subscription.id }) {
            it[userId] = subscription.userId
            it[lemonSqueezySubscriptionId] = subscription.lemonSqueezySubscriptionId
            it[lemonSqueezyOrderId] = subscription.lemonSqueezyOrderId
            it[planType] = subscription.planType.name
            it[status] = subscription.status.name
            it[currentPeriodStart] = subscription.currentPeriodStart
            it[currentPeriodEnd] = subscription.currentPeriodEnd
            it[cancelAtPeriodEnd] = subscription.cancelAtPeriodEnd
            it[cancelledAt] = subscription.cancelledAt
            it[updatedAt] = subscription.updatedAt
        }
        subscription
    }

    /**
     * 구독 상태만 업데이트
     */
    suspend fun updateStatus(subscriptionId: String, status: SubscriptionStatus): Subscription? = dbQuery {
        val subscription = findById(subscriptionId) ?: return@dbQuery null
        
        Subscriptions.update({ Subscriptions.id eq subscriptionId }) {
            it[Subscriptions.status] = status.name
            it[Subscriptions.updatedAt] = java.time.Instant.now()
        }
        
        subscription.copy(status = status, updatedAt = java.time.Instant.now())
    }

    /**
     * 구독 삭제
     */
    suspend fun delete(id: String): Boolean = dbQuery {
        Subscriptions.deleteWhere { Subscriptions.id eq id } > 0
    }
}

