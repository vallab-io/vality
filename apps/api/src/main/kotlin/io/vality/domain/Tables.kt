package io.vality.domain

import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.timestamp


// ============================================
// User - 사용자 (뉴스레터 발행자)
// ============================================
object Users : Table("users") {
    val id = varchar("id", 25)
    val email = varchar("email", 255).uniqueIndex()
    val username = varchar("username", 50).nullable()
        .uniqueIndex()
    val name = varchar("name", 255).nullable()
    val bio = text("bio").nullable()
    val avatarUrl = varchar("avatar_url", 500).nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")

    override val primaryKey = PrimaryKey(id)
}

