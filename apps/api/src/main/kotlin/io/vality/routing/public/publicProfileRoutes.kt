package io.vality.routing.public

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.vality.domain.IssueStatus
import io.vality.dto.ApiResponse
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import io.vality.repository.SubscriberRepository
import io.vality.repository.UserRepository
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

@Serializable
data class PublicIssueResponse(
    val id: String,
    val slug: String,
    val title: String?,
    val excerpt: String?,
    val publishedAt: String,
    val newsletterId: String,
    val newsletterSlug: String,
    val newsletterName: String,
)

fun Route.publicProfileRoutes() {
    val userRepository: UserRepository by inject()
    val newsletterRepository: NewsletterRepository by inject()
    val issueRepository: IssueRepository by inject()
    val subscriberRepository: SubscriberRepository by inject()
    val imageUrlService: ImageUrlService by inject()

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
                                excerpt = issue.excerpt,
                                publishedAt = issue.publishedAt?.toString() ?: "",
                                newsletterId = newsletter.id,
                                newsletterSlug = newsletter.slug,
                                newsletterName = newsletter.name,
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
                val issues = issueRepository.findPublishedByNewsletterId(newsletter.id)
                    .sortedByDescending { it.publishedAt }
                    .drop(offset)
                    .take(limit)
                    .map { issue ->
                        PublicIssueResponse(
                            id = issue.id,
                            slug = issue.slug,
                            title = issue.title,
                            excerpt = issue.excerpt,
                            publishedAt = issue.publishedAt?.toString() ?: "",
                            newsletterId = newsletter.id,
                            newsletterSlug = newsletter.slug,
                            newsletterName = newsletter.name,
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
    }
}

