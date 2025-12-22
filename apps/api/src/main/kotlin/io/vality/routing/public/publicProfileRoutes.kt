package io.vality.routing.public

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.domain.IssueStatus
import io.vality.dto.ApiResponse
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import io.vality.repository.SubscriberRepository
import io.vality.repository.UserRepository
import io.vality.service.IssueService
import io.vality.service.upload.ImageUrlService
import kotlinx.serialization.Serializable
import org.koin.ktor.ext.inject

@Serializable
data class PublicUserProfileResponse(
    val id: String,
    val username: String,
    val name: String?,
    val bio: String?,
    val imageUrl: String?,
)

@Serializable
data class PublicNewsletterResponse(
    val id: String,
    val slug: String,
    val name: String,
    val description: String?,
    val subscriberCount: Long,
)

/**
 * 이슈 목록 조회용 Response (Preview 정보)
 * 여러 이슈를 조회할 때 사용되는 간단한 정보만 포함
 */
@Serializable
data class PublicIssueResponse(
    val id: String,
    val slug: String,
    val title: String?,
    val excerpt: String?, // Short 버전 (excerpt)
    val coverImageUrl: String?,
    val publishedAt: String,
    val likeCount: Long = 0,
    val newsletterId: String,
    val newsletterSlug: String,
    val newsletterName: String,
    val ownerUsername: String?,
    val ownerName: String?,
    val ownerImageUrl: String?,
)

/**
 * 이슈 상세 조회용 Response
 * /@{{username}}/{{newsletterSlug}}/{{issueSlug}}에서 사용
 * user, newsletter, issue에 대한 모든 데이터 포함
 */
@Serializable
data class PublicIssueDetailResponse(
    // Issue 정보
    val id: String,
    val slug: String,
    val title: String?,
    val content: String, // 전체 content
    val excerpt: String?,
    val coverImageUrl: String?,
    val publishedAt: String,
    val createdAt: String,
    val updatedAt: String,
    val likeCount: Long = 0,
    
    // Newsletter 정보
    val newsletterId: String,
    val newsletterSlug: String,
    val newsletterName: String,
    val newsletterDescription: String?,
    val newsletterSenderName: String?,
    
    // Owner (User) 정보
    val ownerId: String,
    val ownerUsername: String?,
    val ownerName: String?,
    val ownerBio: String?,
    val ownerImageUrl: String?,
)

fun Route.publicProfileRoutes() {
    val userRepository: UserRepository by inject()
    val newsletterRepository: NewsletterRepository by inject()
    val issueRepository: IssueRepository by inject()
    val issueService: IssueService by inject()
    val subscriberRepository: SubscriberRepository by inject()
    val imageUrlService: ImageUrlService by inject()

    route("/api/public") {
        /**
         * 이슈 좋아요 추가 (Medium clap 방식 - JWT 인증 불필요)
         * POST /api/public/issues/{issueId}/like
         * 같은 사람이 계속 눌러도 카운트가 올라감
         * 더 구체적인 라우트를 먼저 정의
         */
        route("/issues/{issueId}/like") {
            post {
                val issueId = call.parameters["issueId"]
                    ?: return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Issue ID is required"),
                    )

                call.application.log.info("Like request received for issue: $issueId")

                try {
                    // 이슈 존재 확인
                    val issue = issueRepository.findById(issueId)
                        ?: return@post call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Issue not found"),
                        )

                    // 좋아요 수 증가 (Medium clap 방식 - 중복 허용)
                    val likeCount = issueService.incrementLikeCount(issueId)

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(
                            data = mapOf(
                                "likeCount" to likeCount
                            ),
                            message = "Like added"
                        ),
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to add like", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to add like: ${e.message}"),
                    )
                }
            }
        }

        /**
         * 모든 사용자의 발행된 이슈 목록 조회 (최신순, 페이징)
         * GET /api/public/issues?limit=20&offset=0
         * JWT 인증 불필요
         */
        get("/issues") {
            val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 20
            val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0

            try {
                val issuesWithDetails = issueRepository.findAllPublishedWithNewsletterAndOwner(limit, offset)
                
                val responses = issuesWithDetails.map { issue ->
                    PublicIssueResponse(
                        id = issue.issueId,
                        slug = issue.issueSlug,
                        title = issue.issueTitle,
                        excerpt = issue.issueExcerpt, // Short 버전 (excerpt)
                        publishedAt = issue.issuePublishedAt?.toString() ?: "",
                        likeCount = issue.issueLikeCount,
                        newsletterId = issue.newsletterId,
                        newsletterSlug = issue.newsletterSlug,
                        newsletterName = issue.newsletterName,
                        ownerUsername = issue.ownerUsername,
                        ownerName = issue.ownerName,
                        ownerImageUrl = imageUrlService.getUserImageUrl(issue.ownerImageUrl, issue.ownerId),
                        coverImageUrl = issue.issueCoverImageUrl?.let { imageUrlService.getImageUrl(it) },
                    )
                }
                
                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = responses)
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get all issues", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get all issues: ${e.message}")
                )
            }
        }
    }

    route("/api/public/users") {
        /**
         * 공개 사용자 프로필 조회
         * GET /api/public/users/{username}
         * JWT 인증 불필요
         */
        get("/{username}") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            try {
                val user = userRepository.findByUsername(username)
                    ?: return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "User not found")
                    )

                // username이 null이면 공개 프로필이 아님
                if (user.username == null) {
                    return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "User profile not available")
                    )
                }

                val response = PublicUserProfileResponse(
                    id = user.id,
                    username = user.username,
                    name = user.name,
                    bio = user.bio,
                    imageUrl = imageUrlService.getImageUrl(user),
                )

                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = response)
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get user profile", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get user profile: ${e.message}")
                )
            }
        }

        /**
         * 사용자의 뉴스레터 목록 조회
         * GET /api/public/users/{username}/newsletters
         * JWT 인증 불필요
         */
        get("/{username}/newsletters") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            try {
                val user = userRepository.findByUsername(username)
                    ?: return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "User not found")
                    )

                val newsletters = newsletterRepository.findByOwnerId(user.id)
                val newslettersWithCount = newsletters.map { newsletter ->
                    val subscriberCount = subscriberRepository.countActiveByNewsletterId(newsletter.id)
                    PublicNewsletterResponse(
                        id = newsletter.id,
                        slug = newsletter.slug,
                        name = newsletter.name,
                        description = newsletter.description,
                        subscriberCount = subscriberCount,
                    )
                }

                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = newslettersWithCount)
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get newsletters", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get newsletters: ${e.message}")
                )
            }
        }

        /**
         * 사용자의 발행된 이슈 목록 조회 (최신순)
         * GET /api/public/users/{username}/issues?limit=20&offset=0
         * JWT 인증 불필요
         */
        get("/{username}/issues") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 20
            val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0

            try {
                val user = userRepository.findByUsername(username)
                    ?: return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "User not found")
                    )

                // 사용자의 모든 뉴스레터 가져오기
                val newsletters = newsletterRepository.findByOwnerId(user.id)
                if (newsletters.isEmpty()) {
                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = emptyList<PublicIssueResponse>())
                    )
                    return@get
                }

                // 모든 뉴스레터의 발행된 이슈 가져오기
                val allIssues = newsletters.flatMap { newsletter ->
                    issueRepository.findPublishedByNewsletterId(newsletter.id)
                        .map { issue ->
                            PublicIssueResponse(
                                id = issue.id,
                                slug = issue.slug,
                                title = issue.title,
                                excerpt = issue.excerpt, // Short 버전 (excerpt)
                                publishedAt = issue.publishedAt?.toString() ?: "",
                                newsletterId = newsletter.id,
                                newsletterSlug = newsletter.slug,
                                newsletterName = newsletter.name,
                                ownerUsername = user.username,
                                ownerName = user.name,
                                ownerImageUrl = imageUrlService.getImageUrl(user),
                                coverImageUrl = issue.coverImageUrl?.let { imageUrlService.getImageUrl(it) },
                                likeCount = 0, // TODO: 좋아요 수 조회 추가
                            )
                        }
                }

                // 발행일 기준 최신순 정렬
                val sortedIssues = allIssues
                    .sortedByDescending { it.publishedAt }
                    .drop(offset)
                    .take(limit)

                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = sortedIssues)
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get issues", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get issues: ${e.message}")
                )
            }
        }

        /**
         * 특정 뉴스레터 조회 (username + slug)
         * GET /api/public/users/{username}/newsletters/{newsletterSlug}
         * JWT 인증 불필요
         */
        get("/{username}/newsletters/{newsletterSlug}") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            val newsletterSlug = call.parameters["newsletterSlug"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Newsletter slug is required")
                )

            try {
                val newsletter = newsletterRepository.findByUsernameAndSlug(username, newsletterSlug)
                    ?: return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "Newsletter not found")
                    )

                val subscriberCount = subscriberRepository.countActiveByNewsletterId(newsletter.id)
                val response = PublicNewsletterResponse(
                    id = newsletter.id,
                    slug = newsletter.slug,
                    name = newsletter.name,
                    description = newsletter.description,
                    subscriberCount = subscriberCount,
                )

                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = response)
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get newsletter", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get newsletter: ${e.message}")
                )
            }
        }

        /**
         * 특정 뉴스레터의 발행된 이슈 목록 조회 (최신순)
         * GET /api/public/users/{username}/newsletters/{newsletterSlug}/issues?limit=20&offset=0
         * JWT 인증 불필요
         */
        get("/{username}/newsletters/{newsletterSlug}/issues") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            val newsletterSlug = call.parameters["newsletterSlug"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Newsletter slug is required")
                )

            val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 20
            val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0

            try {
                val newsletter = newsletterRepository.findByUsernameAndSlug(username, newsletterSlug)
                    ?: return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "Newsletter not found")
                    )

                // 발행된 이슈만 가져오기
                // N+1 문제 방지: 한 번의 쿼리로 사용자 정보 가져오기
                val owner = userRepository.findById(newsletter.ownerId)
                val issues = issueRepository.findPublishedByNewsletterId(newsletter.id)
                    .sortedByDescending { it.publishedAt }
                    .drop(offset)
                    .take(limit)
                    .map { issue ->
                        PublicIssueResponse(
                            id = issue.id,
                            slug = issue.slug,
                            title = issue.title,
                            excerpt = issue.excerpt, // Short 버전 (excerpt)
                            publishedAt = issue.publishedAt?.toString() ?: "",
                            newsletterId = newsletter.id,
                            newsletterSlug = newsletter.slug,
                            newsletterName = newsletter.name,
                            ownerUsername = owner?.username,
                            ownerName = owner?.name,
                            ownerImageUrl = owner?.let { imageUrlService.getImageUrl(it) },
                            coverImageUrl = issue.coverImageUrl?.let { imageUrlService.getImageUrl(it) },
                        )
                    }

                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = issues)
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get newsletter issues", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get newsletter issues: ${e.message}")
                )
            }
        }

        /**
         * 특정 이슈 조회 (username + newsletterSlug + issueSlug)
         * GET /api/public/users/{username}/newsletters/{newsletterSlug}/issues/{issueSlug}
         * JWT 인증 불필요
         */
        get("/{username}/newsletters/{newsletterSlug}/issues/{issueSlug}") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            val newsletterSlug = call.parameters["newsletterSlug"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Newsletter slug is required")
                )

            val issueSlug = call.parameters["issueSlug"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Issue slug is required")
                )

            try {
                val newsletter = newsletterRepository.findByUsernameAndSlug(username, newsletterSlug)
                    ?: return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "Newsletter not found")
                    )

                // 이슈 조회 (발행된 것만)
                val issue = issueRepository.findByNewsletterIdAndSlug(newsletter.id, issueSlug)
                    ?: return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "Issue not found")
                    )

                // 발행된 이슈만 조회 가능
                if (issue.status != IssueStatus.PUBLISHED) {
                    return@get call.respond(
                        HttpStatusCode.NotFound,
                        ApiResponse.error<Nothing>(message = "Issue not found")
                    )
                }

                val user = userRepository.findById(newsletter.ownerId)
                    ?: return@get call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "User not found")
                    )

                val response = PublicIssueDetailResponse(
                    // Issue 정보
                    id = issue.id,
                    slug = issue.slug,
                    title = issue.title,
                    content = issue.content, // 전체 content
                    excerpt = issue.excerpt,
                    coverImageUrl = issue.coverImageUrl?.let { imageUrlService.getImageUrl(it) },
                    publishedAt = issue.publishedAt?.toString() ?: "",
                    createdAt = issue.createdAt.toString(),
                    updatedAt = issue.updatedAt.toString(),
                    likeCount = issue.likeCount,
                    
                    // Newsletter 정보
                    newsletterId = newsletter.id,
                    newsletterSlug = newsletter.slug,
                    newsletterName = newsletter.name,
                    newsletterDescription = newsletter.description,
                    newsletterSenderName = newsletter.senderName,
                    
                    // Owner (User) 정보
                    ownerId = user.id,
                    ownerUsername = user.username,
                    ownerName = user.name,
                    ownerBio = user.bio,
                    ownerImageUrl = imageUrlService.getImageUrl(user),
                )

                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(data = response)
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get issue", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get issue: ${e.message}")
                )
            }
        }

    }
}

