package io.vality.repository

import io.vality.domain.Contact
import io.vality.domain.Contacts
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.jdbc.insert

class ContactRepository {

    private fun ResultRow.toContact(): Contact {
        return Contact(
            id = this[Contacts.id],
            name = this[Contacts.name],
            email = this[Contacts.email],
            message = this[Contacts.message],
            userId = this[Contacts.userId],
            createdAt = this[Contacts.createdAt]
        )
    }

    suspend fun create(contact: Contact): Contact = dbQuery {
        Contacts.insert {
            it[id] = contact.id
            it[name] = contact.name
            it[email] = contact.email
            it[message] = contact.message
            it[userId] = contact.userId
            it[createdAt] = contact.createdAt
        }
        contact
    }
}
