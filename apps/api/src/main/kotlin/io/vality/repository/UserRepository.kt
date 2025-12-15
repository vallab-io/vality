package io.vality.repository

import io.vality.domain.User
import io.vality.domain.Users
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.update

class UserRepository {

    private fun ResultRow.toUser(): User {
        return User(
            id = this[Users.id],
            email = this[Users.email],
            username = this[Users.username],
            name = this[Users.name],
            bio = this[Users.bio],
            avatarUrl = this[Users.avatarUrl],
            createdAt = this[Users.createdAt],
            updatedAt = this[Users.updatedAt]
        )
    }

    suspend fun findById(id: String): User? = dbQuery {
        Users.select(
            listOf(
                Users.id,
                Users.email,
                Users.username,
                Users.name,
                Users.bio,
                Users.avatarUrl,
                Users.createdAt,
                Users.updatedAt,
            )
        )
            .where { Users.id eq id }
            .singleOrNull()
            ?.toUser()
    }

    suspend fun findByEmail(email: String): User? = dbQuery {
        Users.select(
            listOf(
                Users.id,
                Users.email,
                Users.username,
                Users.name,
                Users.bio,
                Users.avatarUrl,
                Users.createdAt,
                Users.updatedAt
            )
        )
            .where { Users.email eq email }
            .singleOrNull()
            ?.toUser()
    }

    suspend fun findByUsername(username: String): User? = dbQuery {
        Users.select(
            listOf(
                Users.id,
                Users.email,
                Users.username,
                Users.name,
                Users.bio,
                Users.avatarUrl,
                Users.createdAt,
                Users.updatedAt
            )
        )
            .where { Users.username eq username }
            .singleOrNull()
            ?.toUser()
    }

    suspend fun existsByEmail(email: String): Boolean = dbQuery {
        Users.select(listOf(Users.id))
            .where { Users.email eq email }
            .limit(1)
            .firstOrNull() != null
    }

    suspend fun existsByUsername(username: String): Boolean = dbQuery {
        Users.select(listOf(Users.id))
            .where { Users.username eq username }
            .limit(1)
            .firstOrNull() != null
    }

    suspend fun create(user: User): User = dbQuery {
        Users.insert {
            it[id] = user.id
            it[email] = user.email
            it[username] = user.username
            it[name] = user.name
            it[bio] = user.bio
            it[avatarUrl] = user.avatarUrl
            it[createdAt] = user.createdAt
            it[updatedAt] = user.updatedAt
        }
        user
    }

    suspend fun update(user: User): User = dbQuery {
        Users.update({ Users.id eq user.id }) {
            it[email] = user.email
            it[username] = user.username
            it[name] = user.name
            it[bio] = user.bio
            it[avatarUrl] = user.avatarUrl
            it[updatedAt] = user.updatedAt
        }
        user
    }

    suspend fun delete(id: String): Boolean = dbQuery {
        Users.deleteWhere { Users.id eq id } > 0
    }
}
