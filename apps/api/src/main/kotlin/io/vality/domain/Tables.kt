package io.vality.domain

import org.jetbrains.exposed.v1.core.ReferenceOption
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
    val imageUrl = varchar("image_url", 500).nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")

    override val primaryKey = PrimaryKey(id)
}

// ============================================
// Account - 소셜 로그인 계정 (OAuth)
// ============================================
object Accounts : Table("accounts") {
    val id = varchar("id", 25)
    val provider = varchar("provider", 20)
    val providerAccountId = varchar("provider_account_id", 255)
    val userId = varchar("user_id", 25).references(Users.id, onDelete = ReferenceOption.CASCADE)
    val createdAt = timestamp("created_at")

    override val primaryKey = PrimaryKey(id)

    init {
        uniqueIndex(provider, providerAccountId)
    }
}

// ============================================
// VerificationCode - 이메일 인증 코드
// ============================================
object VerificationCodes : Table("verification_codes") {
    val id = varchar("id", 25)
    val email = varchar("email", 255)
    val code = varchar("code", 6)
    val expiresAt = timestamp("expires_at")
    val createdAt = timestamp("created_at")

    override val primaryKey = PrimaryKey(id)

    init {
        uniqueIndex(email, code)
    }
}

// ============================================
// Newsletter - 뉴스레터 (채널)
// ============================================
object Newsletters : Table("newsletters") {
    val id = varchar("id", 25)
    val name = varchar("name", 255)
    val slug = varchar("slug", 255)
    val description = text("description").nullable()
    val senderName = varchar("sender_name", 255).nullable()
    val timezone = varchar("timezone", 50).default("Asia/Seoul")
    val ownerId = varchar("owner_id", 25).references(Users.id, onDelete = ReferenceOption.CASCADE)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")

    override val primaryKey = PrimaryKey(id)

    init {
        uniqueIndex(ownerId, slug)
    }
}

// ============================================
// Issue - 뉴스레터 이슈 (개별 발행 글)
// ============================================
object Issues : Table("issues") {
    val id = varchar("id", 25)
    val title = varchar("title", 500)
    val slug = varchar("slug", 255)
    val content = text("content")
    val excerpt = text("excerpt").nullable()
    val coverImageUrl = varchar("cover_image_url", 500).nullable()
    val status = varchar("status", 20).default("DRAFT")
    val publishedAt = timestamp("published_at").nullable()
    val scheduledAt = timestamp("scheduled_at").nullable()
    val newsletterId = varchar("newsletter_id", 25).references(Newsletters.id, onDelete = ReferenceOption.CASCADE)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")

    override val primaryKey = PrimaryKey(id)

    init {
        uniqueIndex(newsletterId, slug)
    }
}

// ============================================
// Subscriber - 구독자
// ============================================
object Subscribers : Table("subscribers") {
    val id = varchar("id", 25)
    val email = varchar("email", 255)
    val status = varchar("status", 20).default("PENDING")
    val subscribedAt = timestamp("subscribed_at")
    val confirmedAt = timestamp("confirmed_at").nullable()
    val unsubscribedAt = timestamp("unsubscribed_at").nullable()
    val newsletterId = varchar("newsletter_id", 25).references(Newsletters.id, onDelete = ReferenceOption.CASCADE)

    override val primaryKey = PrimaryKey(id)

    init {
        uniqueIndex(newsletterId, email)
    }
}

// ============================================
// EmailLog - 이메일 발송 로그
// ============================================
object EmailLogs : Table("email_logs") {
    val id = varchar("id", 25)
    val status = varchar("status", 20).default("PENDING")
    val sentAt = timestamp("sent_at").nullable()
    val openedAt = timestamp("opened_at").nullable()
    val clickedAt = timestamp("clicked_at").nullable()
    val createdAt = timestamp("created_at")
    val issueId = varchar("issue_id", 25).references(Issues.id, onDelete = ReferenceOption.CASCADE)
    val subscriberId = varchar("subscriber_id", 25).references(Subscribers.id, onDelete = ReferenceOption.CASCADE)

    override val primaryKey = PrimaryKey(id)
}

// ============================================
// RefreshToken - 리프레시 토큰
// ============================================
object RefreshTokens : Table("refresh_tokens") {
    val id = varchar("id", 25)
    val userId = varchar("user_id", 25).references(Users.id, onDelete = ReferenceOption.CASCADE)
    val token = varchar("token", 255).uniqueIndex()
    val expiresAt = timestamp("expires_at")
    val createdAt = timestamp("created_at")

    override val primaryKey = PrimaryKey(id)
}
