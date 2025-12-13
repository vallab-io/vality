package io.vality.repository

import io.vality.domain.Account
import io.vality.domain.Accounts
import io.vality.domain.AccountProvider
import io.vality.plugins.dbQuery
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select

class AccountRepository {

    private fun ResultRow.toAccount(): Account {
        return Account(
            id = this[Accounts.id],
            provider = AccountProvider.valueOf(this[Accounts.provider]),
            providerAccountId = this[Accounts.providerAccountId],
            userId = this[Accounts.userId],
            createdAt = this[Accounts.createdAt]
        )
    }

    suspend fun findById(id: String): Account? = dbQuery {
        Accounts.select(
            listOf(
                Accounts.id,
                Accounts.provider,
                Accounts.providerAccountId,
                Accounts.userId,
                Accounts.createdAt,
            )
        )
            .where { Accounts.id eq id }
            .map { it.toAccount() }
            .singleOrNull()
    }

    suspend fun findByProviderAndProviderAccountId(provider: AccountProvider, providerAccountId: String): Account? = dbQuery {
        Accounts.select(
            listOf(
                Accounts.id,
                Accounts.provider,
                Accounts.providerAccountId,
                Accounts.userId,
                Accounts.createdAt,
            )
        )
            .where { (Accounts.provider eq provider.name) and (Accounts.providerAccountId eq providerAccountId) }
            .map { it.toAccount() }
            .singleOrNull()
    }

    suspend fun findByUserId(userId: String): List<Account> = dbQuery {
        Accounts.select(
            listOf(
                Accounts.id,
                Accounts.provider,
                Accounts.providerAccountId,
                Accounts.userId,
                Accounts.createdAt,
            )
        )
            .where { Accounts.userId eq userId }
            .map { it.toAccount() }
    }

    suspend fun create(account: Account): Account = dbQuery {
        Accounts.insert {
            it[id] = account.id
            it[provider] = account.provider.name
            it[providerAccountId] = account.providerAccountId
            it[userId] = account.userId
            it[createdAt] = account.createdAt
        }
        account
    }

    suspend fun delete(id: String): Boolean = dbQuery {
        Accounts.deleteWhere { Accounts.id eq id } > 0
    }

    suspend fun deleteByUserId(userId: String): Boolean = dbQuery {
        Accounts.deleteWhere { Accounts.userId eq userId } > 0
    }
}

