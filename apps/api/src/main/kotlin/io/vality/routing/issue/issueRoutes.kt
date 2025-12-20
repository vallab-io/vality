package io.vality.routing.issue

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.patch
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.domain.Issue
import io.vality.domain.IssueStatus
import io.vality.dto.ApiResponse
import io.vality.dto.issue.CreateIssueRequest
import io.vality.dto.issue.IssueResponse
import io.vality.dto.issue.UpdateIssueRequest
import io.vality.dto.issue.toIssueResponse
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import io.vality.util.CuidGenerator
import org.koin.ktor.ext.inject
import java.time.Instant

fun Route.issueRoutes() {
    val issueRepository: IssueRepository by inject()
    val newsletterRepository: NewsletterRepository by inject()

    authenticate("jwt") {
        route("/api/newsletters/{newsletterId}/issues") {
            /**
             * 이슈 생성
             * POST /api/newsletters/{newsletterId}/issues
             */
            post {
                val principal = call.principal<JWTPrincipal>() ?: return@post call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized"),
                )

                val userId = principal.payload.subject
                val newsletterId = call.parameters["newsletterId"]
                    ?: return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Newsletter ID is required"),
                    )

                try {
                    val request = call.receive<CreateIssueRequest>()

                    // 뉴스레터 존재 및 소유자 확인
                    val newsletter = newsletterRepository.findById(newsletterId)
                        ?: return@post call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Newsletter not found"),
                        )

                    if (newsletter.ownerId != userId) {
                        return@post call.respond(
                            HttpStatusCode.Forbidden,
                            ApiResponse.error<Nothing>(message = "You don't have permission to access this newsletter"),
                        )
                    }

                    // Slug 생성 (없으면 자동 생성)
                    val slug = if (request.slug.isNullOrBlank()) {
                        val timestamp = System.currentTimeMillis()
                        "issue-${timestamp}"
                    } else {
                        request.slug.trim()
                    }

                    // Slug 중복 확인
                    val slugExists = issueRepository.existsByNewsletterIdAndSlug(newsletterId, slug)
                    if (slugExists) {
                        return@post call.respond(
                            HttpStatusCode.Conflict,
                            ApiResponse.error<Nothing>(message = "Slug already exists in this newsletter"),
                        )
                    }

                    // 상태 파싱 및 검증
                    val status = when (request.status?.uppercase()) {
                        "DRAFT" -> IssueStatus.DRAFT
                        "SCHEDULED" -> {
                            // 발행 시 제목 필수
                            if (request.title.isNullOrBlank()) {
                                return@post call.respond(
                                    HttpStatusCode.BadRequest,
                                    ApiResponse.error<Nothing>(message = "Title is required for publishing"),
                                )
                            }
                            if (request.scheduledAt == null) {
                                return@post call.respond(
                                    HttpStatusCode.BadRequest,
                                    ApiResponse.error<Nothing>(message = "scheduledAt is required for SCHEDULED status"),
                                )
                            }
                            IssueStatus.SCHEDULED
                        }
                        "PUBLISHED" -> {
                            // 발행 시 제목 필수
                            if (request.title.isNullOrBlank()) {
                                return@post call.respond(
                                    HttpStatusCode.BadRequest,
                                    ApiResponse.error<Nothing>(message = "Title is required for publishing"),
                                )
                            }
                            IssueStatus.PUBLISHED
                        }
                        null -> IssueStatus.DRAFT // 기본값
                        else -> {
                            return@post call.respond(
                                HttpStatusCode.BadRequest,
                                ApiResponse.error<Nothing>(message = "Invalid status. Must be DRAFT, SCHEDULED, or PUBLISHED"),
                            )
                        }
                    }

                    // SCHEDULED 상태가 아닌데 scheduledAt이 있으면 에러
                    if (status != IssueStatus.SCHEDULED && request.scheduledAt != null) {
                        return@post call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "scheduledAt can only be set when status is SCHEDULED"),
                        )
                    }

                    // publishedAt 설정 (PUBLISHED일 때만)
                    val publishedAt = if (status == IssueStatus.PUBLISHED) {
                        Instant.now()
                    } else {
                        null
                    }

                    // 이슈 생성
                    val now = Instant.now()
                    val issue = Issue(
                        id = CuidGenerator.generate(),
                        title = request.title?.trim(),
                        slug = slug,
                        content = request.content,
                        excerpt = request.excerpt?.trim(),
                        coverImageUrl = request.coverImageUrl?.trim(),
                        status = status,
                        publishedAt = publishedAt,
                        scheduledAt = request.scheduledAt,
                        newsletterId = newsletterId,
                        createdAt = now,
                        updatedAt = now,
                    )

                    val createdIssue = issueRepository.create(issue)
                    val issueResponse = createdIssue.toIssueResponse()

                    call.respond(
                        HttpStatusCode.Created,
                        ApiResponse.success(data = issueResponse, message = "Issue created successfully"),
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to create issue", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to create issue: ${e.message}"),
                    )
                }
            }

            /**
             * 이슈 목록 조회
             * GET /api/newsletters/{newsletterId}/issues
             */
            get {
                val principal = call.principal<JWTPrincipal>() ?: return@get call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized"),
                )

                val userId = principal.payload.subject
                val newsletterId = call.parameters["newsletterId"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Newsletter ID is required"),
                    )

                try {
                    // 뉴스레터 존재 및 소유자 확인
                    val newsletter = newsletterRepository.findById(newsletterId)
                        ?: return@get call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Newsletter not found"),
                        )

                    if (newsletter.ownerId != userId) {
                        return@get call.respond(
                            HttpStatusCode.Forbidden,
                            ApiResponse.error<Nothing>(message = "You don't have permission to access this newsletter"),
                        )
                    }

                    // 이슈 목록 조회
                    val issues = issueRepository.findByNewsletterId(newsletterId)
                    val issueResponses = issues.map { it.toIssueResponse() }

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = issueResponses),
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to get issues", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to get issues: ${e.message}"),
                    )
                }
            }

            /**
             * 개별 이슈 조회
             * GET /api/newsletters/{newsletterId}/issues/{issueId}
             */
            get("/{issueId}") {
                val principal = call.principal<JWTPrincipal>() ?: return@get call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized"),
                )

                val userId = principal.payload.subject
                val newsletterId = call.parameters["newsletterId"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Newsletter ID is required"),
                    )

                val issueId = call.parameters["issueId"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Issue ID is required"),
                    )

                try {
                    // 뉴스레터 존재 및 소유자 확인
                    val newsletter = newsletterRepository.findById(newsletterId)
                        ?: return@get call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Newsletter not found"),
                        )

                    if (newsletter.ownerId != userId) {
                        return@get call.respond(
                            HttpStatusCode.Forbidden,
                            ApiResponse.error<Nothing>(message = "You don't have permission to access this newsletter"),
                        )
                    }

                    // 이슈 존재 및 뉴스레터 소유 확인
                    val issue = issueRepository.findById(issueId)
                        ?: return@get call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Issue not found"),
                        )

                    if (issue.newsletterId != newsletterId) {
                        return@get call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "Issue does not belong to this newsletter"),
                        )
                    }

                    val issueResponse = issue.toIssueResponse()

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = issueResponse),
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to get issue", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to get issue: ${e.message}"),
                    )
                }
            }

            /**
             * 이슈 수정
             * PATCH /api/newsletters/{newsletterId}/issues/{issueId}
             */
            patch("/{issueId}") {
                val principal = call.principal<JWTPrincipal>() ?: return@patch call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized"),
                )

                val userId = principal.payload.subject
                val newsletterId = call.parameters["newsletterId"]
                    ?: return@patch call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Newsletter ID is required"),
                    )

                val issueId = call.parameters["issueId"]
                    ?: return@patch call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Issue ID is required"),
                    )

                try {
                    val request = call.receive<UpdateIssueRequest>()

                    // 뉴스레터 존재 및 소유자 확인
                    val newsletter = newsletterRepository.findById(newsletterId)
                        ?: return@patch call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Newsletter not found"),
                        )

                    if (newsletter.ownerId != userId) {
                        return@patch call.respond(
                            HttpStatusCode.Forbidden,
                            ApiResponse.error<Nothing>(message = "You don't have permission to access this newsletter"),
                        )
                    }

                    // 이슈 존재 및 뉴스레터 소유 확인
                    val existingIssue = issueRepository.findById(issueId)
                        ?: return@patch call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Issue not found"),
                        )

                    if (existingIssue.newsletterId != newsletterId) {
                        return@patch call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "Issue does not belong to this newsletter"),
                        )
                    }

                    // Slug 중복 확인 (변경하는 경우)
                    if (request.slug != null && request.slug != existingIssue.slug) {
                        val slugExists = issueRepository.existsByNewsletterIdAndSlug(newsletterId, request.slug)
                        if (slugExists) {
                            return@patch call.respond(
                                HttpStatusCode.Conflict,
                                ApiResponse.error<Nothing>(message = "Slug already exists in this newsletter"),
                            )
                        }
                    }

                    // 상태 파싱 및 검증
                    val newStatus = if (request.status != null) {
                        when (request.status.uppercase()) {
                            "DRAFT" -> IssueStatus.DRAFT
                            "SCHEDULED" -> {
                                // 발행 시 제목 필수
                                val finalTitle = request.title?.trim() ?: existingIssue.title
                                if (finalTitle.isNullOrBlank()) {
                                    return@patch call.respond(
                                        HttpStatusCode.BadRequest,
                                        ApiResponse.error<Nothing>(message = "Title is required for publishing"),
                                    )
                                }
                                if (request.scheduledAt == null) {
                                    return@patch call.respond(
                                        HttpStatusCode.BadRequest,
                                        ApiResponse.error<Nothing>(message = "scheduledAt is required for SCHEDULED status"),
                                    )
                                }
                                IssueStatus.SCHEDULED
                            }
                            "PUBLISHED" -> {
                                // 발행 시 제목 필수
                                val finalTitle = request.title?.trim() ?: existingIssue.title
                                if (finalTitle.isNullOrBlank()) {
                                    return@patch call.respond(
                                        HttpStatusCode.BadRequest,
                                        ApiResponse.error<Nothing>(message = "Title is required for publishing"),
                                    )
                                }
                                IssueStatus.PUBLISHED
                            }
                            else -> {
                                return@patch call.respond(
                                    HttpStatusCode.BadRequest,
                                    ApiResponse.error<Nothing>(message = "Invalid status. Must be DRAFT, SCHEDULED, or PUBLISHED"),
                                )
                            }
                        }
                    } else {
                        existingIssue.status
                    }

                    // SCHEDULED 상태가 아닌데 scheduledAt이 있으면 에러
                    if (newStatus != IssueStatus.SCHEDULED && request.scheduledAt != null) {
                        return@patch call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "scheduledAt can only be set when status is SCHEDULED"),
                        )
                    }

                    // publishedAt 설정 (PUBLISHED로 변경할 때만)
                    val publishedAt = if (newStatus == IssueStatus.PUBLISHED && existingIssue.status != IssueStatus.PUBLISHED) {
                        Instant.now()
                    } else {
                        existingIssue.publishedAt
                    }

                    // 이슈 업데이트
                    val updatedIssue = existingIssue.copy(
                        title = request.title?.trim() ?: existingIssue.title,
                        slug = request.slug?.trim() ?: existingIssue.slug,
                        content = request.content ?: existingIssue.content,
                        excerpt = request.excerpt?.trim() ?: existingIssue.excerpt,
                        coverImageUrl = request.coverImageUrl?.trim() ?: existingIssue.coverImageUrl,
                        status = newStatus,
                        publishedAt = publishedAt,
                        scheduledAt = request.scheduledAt ?: existingIssue.scheduledAt,
                        updatedAt = Instant.now(),
                    )

                    val savedIssue = issueRepository.update(updatedIssue)
                    val issueResponse = savedIssue.toIssueResponse()

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = issueResponse, message = "Issue updated successfully"),
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to update issue", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to update issue: ${e.message}"),
                    )
                }
            }

            /**
             * 이슈 삭제
             * DELETE /api/newsletters/{newsletterId}/issues/{issueId}
             */
            delete("/{issueId}") {
                val principal = call.principal<JWTPrincipal>() ?: return@delete call.respond(
                    HttpStatusCode.Unauthorized,
                    ApiResponse.error<Nothing>(message = "Unauthorized"),
                )

                val userId = principal.payload.subject
                val newsletterId = call.parameters["newsletterId"]
                    ?: return@delete call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Newsletter ID is required"),
                    )

                val issueId = call.parameters["issueId"]
                    ?: return@delete call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Issue ID is required"),
                    )

                try {
                    // 뉴스레터 존재 및 소유자 확인
                    val newsletter = newsletterRepository.findById(newsletterId)
                        ?: return@delete call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Newsletter not found"),
                        )

                    if (newsletter.ownerId != userId) {
                        return@delete call.respond(
                            HttpStatusCode.Forbidden,
                            ApiResponse.error<Nothing>(message = "You don't have permission to access this newsletter"),
                        )
                    }

                    // 이슈 존재 및 뉴스레터 소유 확인
                    val issue = issueRepository.findById(issueId)
                        ?: return@delete call.respond(
                            HttpStatusCode.NotFound,
                            ApiResponse.error<Nothing>(message = "Issue not found"),
                        )

                    if (issue.newsletterId != newsletterId) {
                        return@delete call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "Issue does not belong to this newsletter"),
                        )
                    }

                    // 이슈 삭제
                    val deleted = issueRepository.delete(issueId)
                    if (!deleted) {
                        return@delete call.respond(
                            HttpStatusCode.InternalServerError,
                            ApiResponse.error<Nothing>(message = "Failed to delete issue"),
                        )
                    }

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = Unit, message = "Issue deleted"),
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to delete issue", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to delete issue: ${e.message}"),
                    )
                }
            }
        }
    }
}

