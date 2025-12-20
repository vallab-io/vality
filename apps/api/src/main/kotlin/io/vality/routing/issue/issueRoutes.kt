package io.vality.routing.issue

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.vality.domain.IssueStatus
import io.vality.dto.ApiResponse
import io.vality.dto.issue.IssueResponse
import io.vality.dto.issue.toIssueResponse
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import org.koin.ktor.ext.inject

fun Route.issueRoutes() {
    val issueRepository: IssueRepository by inject()
    val newsletterRepository: NewsletterRepository by inject()

    authenticate("jwt") {
        route("/api/newsletters/{newsletterId}/issues") {
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

