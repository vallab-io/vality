package io.vality.repository

import io.vality.domain.Subscriber
import io.vality.domain.Subscribers
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.update

class SubscriberRepository {

    private fun ResultRow.toSubscriber(): Subscriber {
        return Subscriber(
            id = this[Subscribers.id],
            email = this[Subscribers.email],
            status = io.vality.domain.SubStatus.valueOf(this[Subscribers.status]),
            subscribedAt = this[Subscribers.subscribedAt],
            confirmedAt = this[Subscribers.confirmedAt],
            unsubscribedAt = this[Subscribers.unsubscribedAt],
            newsletterId = this[Subscribers.newsletterId]
        )
    }

    suspend fun findById(id: String): Subscriber? = dbQuery {
        Subscribers.select(
            listOf(
                Subscribers.id,
                Subscribers.email,
                Subscribers.status,
                Subscribers.subscribedAt,
                Subscribers.confirmedAt,
                Subscribers.unsubscribedAt,
                Subscribers.newsletterId
            )
        )
            .where { Subscribers.id eq id }
            .map { it.toSubscriber() }
            .singleOrNull()
    }

    suspend fun findByNewsletterId(newsletterId: String): List<Subscriber> = dbQuery {
        Subscribers.select(
            listOf(
                Subscribers.id,
                Subscribers.email,
                Subscribers.status,
                Subscribers.subscribedAt,
                Subscribers.confirmedAt,
                Subscribers.unsubscribedAt,
                Subscribers.newsletterId
            )
        )
            .where { Subscribers.newsletterId eq newsletterId }
            .map { it.toSubscriber() }
    }

    suspend fun findByNewsletterIdAndStatus(newsletterId: String, status: io.vality.domain.SubStatus): List<Subscriber> = dbQuery {
        Subscribers.select(
            listOf(
                Subscribers.id,
                Subscribers.email,
                Subscribers.status,
                Subscribers.subscribedAt,
                Subscribers.confirmedAt,
                Subscribers.unsubscribedAt,
                Subscribers.newsletterId
            )
        )
            .where { (Subscribers.newsletterId eq newsletterId) and (Subscribers.status eq status.name) }
            .map { it.toSubscriber() }
    }

    suspend fun findByNewsletterIdAndEmail(newsletterId: String, email: String): Subscriber? = dbQuery {
        Subscribers.select(
            listOf(
                Subscribers.id,
                Subscribers.email,
                Subscribers.status,
                Subscribers.subscribedAt,
                Subscribers.confirmedAt,
                Subscribers.unsubscribedAt,
                Subscribers.newsletterId
            )
        )
            .where { (Subscribers.newsletterId eq newsletterId) and (Subscribers.email eq email) }
            .map { it.toSubscriber() }
            .singleOrNull()
    }

    suspend fun countByNewsletterId(newsletterId: String): Long = dbQuery {
        Subscribers.select(listOf(Subscribers.id))
            .where { Subscribers.newsletterId eq newsletterId }
            .count()
    }

    suspend fun countActiveByNewsletterId(newsletterId: String): Long = dbQuery {
        Subscribers.select(listOf(Subscribers.id))
            .where { (Subscribers.newsletterId eq newsletterId) and (Subscribers.status eq io.vality.domain.SubStatus.ACTIVE.name) }
            .count()
    }

    suspend fun create(subscriber: Subscriber): Subscriber = dbQuery {
        Subscribers.insert {
            it[id] = subscriber.id
            it[email] = subscriber.email
            it[status] = subscriber.status.name
            it[subscribedAt] = subscriber.subscribedAt
            it[confirmedAt] = subscriber.confirmedAt
            it[unsubscribedAt] = subscriber.unsubscribedAt
            it[newsletterId] = subscriber.newsletterId
        }
        subscriber
    }

    suspend fun update(subscriber: Subscriber): Subscriber = dbQuery {
        Subscribers.update({ Subscribers.id eq subscriber.id }) {
            it[email] = subscriber.email
            it[status] = subscriber.status.name
            it[confirmedAt] = subscriber.confirmedAt
            it[unsubscribedAt] = subscriber.unsubscribedAt
        }
        subscriber
    }

    suspend fun delete(id: String): Boolean = dbQuery {
        Subscribers.deleteWhere { Subscribers.id eq id } > 0
    }
}

