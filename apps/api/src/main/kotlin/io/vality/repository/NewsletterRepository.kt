package io.vality.repository

import io.vality.domain.Newsletter
import io.vality.domain.Newsletters
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.update

class NewsletterRepository {

    private fun ResultRow.toNewsletter(): Newsletter {
        return Newsletter(
            id = this[Newsletters.id],
            name = this[Newsletters.name],
            slug = this[Newsletters.slug],
            description = this[Newsletters.description],
            senderName = this[Newsletters.senderName],
            timezone = this[Newsletters.timezone],
            ownerId = this[Newsletters.ownerId],
            createdAt = this[Newsletters.createdAt],
            updatedAt = this[Newsletters.updatedAt]
        )
    }

    suspend fun findById(id: String): Newsletter? = dbQuery {
        Newsletters.select(
            listOf(
                Newsletters.id,
                Newsletters.name,
                Newsletters.slug,
                Newsletters.description,
                Newsletters.senderName,
                Newsletters.timezone,
                Newsletters.ownerId,
                Newsletters.createdAt,
                Newsletters.updatedAt
            )
        )
            .where { Newsletters.id eq id }
            .map { it.toNewsletter() }
            .singleOrNull()
    }

    suspend fun findByOwnerId(ownerId: String): List<Newsletter> = dbQuery {
        Newsletters.select(
            listOf(
                Newsletters.id,
                Newsletters.name,
                Newsletters.slug,
                Newsletters.description,
                Newsletters.senderName,
                Newsletters.timezone,
                Newsletters.ownerId,
                Newsletters.createdAt,
                Newsletters.updatedAt
            )
        )
            .where { Newsletters.ownerId eq ownerId }
            .map { it.toNewsletter() }
    }

    suspend fun findByOwnerIdAndSlug(ownerId: String, slug: String): Newsletter? = dbQuery {
        Newsletters.select(
            listOf(
                Newsletters.id,
                Newsletters.name,
                Newsletters.slug,
                Newsletters.description,
                Newsletters.senderName,
                Newsletters.timezone,
                Newsletters.ownerId,
                Newsletters.createdAt,
                Newsletters.updatedAt
            )
        )
            .where { (Newsletters.ownerId eq ownerId) and (Newsletters.slug eq slug) }
            .map { it.toNewsletter() }
            .singleOrNull()
    }

    suspend fun existsByOwnerIdAndSlug(ownerId: String, slug: String): Boolean = dbQuery {
        Newsletters.select(listOf(Newsletters.id))
            .where { (Newsletters.ownerId eq ownerId) and (Newsletters.slug eq slug) }
            .count() > 0
    }

    suspend fun create(newsletter: Newsletter): Newsletter = dbQuery {
        Newsletters.insert {
            it[id] = newsletter.id
            it[name] = newsletter.name
            it[slug] = newsletter.slug
            it[description] = newsletter.description
            it[senderName] = newsletter.senderName
            it[timezone] = newsletter.timezone
            it[ownerId] = newsletter.ownerId
            it[createdAt] = newsletter.createdAt
            it[updatedAt] = newsletter.updatedAt
        }
        newsletter
    }

    suspend fun update(newsletter: Newsletter): Newsletter = dbQuery {
        Newsletters.update({ Newsletters.id eq newsletter.id }) {
            it[name] = newsletter.name
            it[slug] = newsletter.slug
            it[description] = newsletter.description
            it[senderName] = newsletter.senderName
            it[timezone] = newsletter.timezone
            it[updatedAt] = newsletter.updatedAt
        }
        newsletter
    }

    suspend fun delete(id: String): Boolean = dbQuery {
        Newsletters.deleteWhere { Newsletters.id eq id } > 0
    }
}

