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
import io.vality.dto.ApiResponse
import io.vality.dto.issue.CreateIssueCommand
import io.vality.dto.issue.CreateIssueRequest
import io.vality.dto.issue.DeleteIssueCommand
import io.vality.dto.issue.GetIssueQuery
import io.vality.dto.issue.GetIssuesQuery
import io.vality.dto.issue.IssueException
import io.vality.dto.issue.UpdateIssueCommand
import io.vality.dto.issue.UpdateIssueRequest
import io.vality.service.IssueService
import org.koin.ktor.ext.inject

fun Route.issueRoutes() {
    val issueService: IssueService by inject()

    authenticate("jwt") {
        route("/api/newsletters/{newsletterId}/issues") {
            
            // POST /api/newsletters/{newsletterId}/issues - 이슈 생성
            post {
                val userId = call.getUserId() ?: return@post call.respondUnauthorized()
                val newsletterId = call.getNewsletterId() ?: return@post call.respondBadRequest("Newsletter ID is required")

                try {
                    val request = call.receive<CreateIssueRequest>()
                    
                    val command = CreateIssueCommand(
                        userId = userId,
                        newsletterId = newsletterId,
                        title = request.title,
                        slug = request.slug,
                        content = request.content,
                        excerpt = request.excerpt,
                        coverImageUrl = request.coverImageUrl,
                        status = request.status,
                        scheduledAt = request.scheduledAt,
                    )

                    val issueResponse = issueService.createIssue(command)

                    call.respond(
                        HttpStatusCode.Created,
                        ApiResponse.success(data = issueResponse, message = "Issue created successfully"),
                    )
                } catch (e: IssueException) {
                    call.respondIssueException(e)
                } catch (e: Exception) {
                    call.application.log.error("Failed to create issue", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to create issue: ${e.message}"),
                    )
                }
            }

            // GET /api/newsletters/{newsletterId}/issues - 이슈 목록 조회
            get {
                val userId = call.getUserId() ?: return@get call.respondUnauthorized()
                val newsletterId = call.getNewsletterId() ?: return@get call.respondBadRequest("Newsletter ID is required")

                try {
                    val query = GetIssuesQuery(userId = userId, newsletterId = newsletterId)
                    val issueResponses = issueService.getIssues(query)

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = issueResponses),
                    )
                } catch (e: IssueException) {
                    call.respondIssueException(e)
                } catch (e: Exception) {
                    call.application.log.error("Failed to get issues", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to get issues: ${e.message}"),
                    )
                }
            }

            // GET /api/newsletters/{newsletterId}/issues/{issueId} - 개별 이슈 조회
            get("/{issueId}") {
                val userId = call.getUserId() ?: return@get call.respondUnauthorized()
                val newsletterId = call.getNewsletterId() ?: return@get call.respondBadRequest("Newsletter ID is required")
                val issueId = call.getIssueId() ?: return@get call.respondBadRequest("Issue ID is required")

                try {
                    val query = GetIssueQuery(userId = userId, newsletterId = newsletterId, issueId = issueId)
                    val issueResponse = issueService.getIssue(query)

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = issueResponse),
                    )
                } catch (e: IssueException) {
                    call.respondIssueException(e)
                } catch (e: Exception) {
                    call.application.log.error("Failed to get issue", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to get issue: ${e.message}"),
                    )
                }
            }

            // PATCH /api/newsletters/{newsletterId}/issues/{issueId} - 이슈 수정
            patch("/{issueId}") {
                val userId = call.getUserId() ?: return@patch call.respondUnauthorized()
                val newsletterId = call.getNewsletterId() ?: return@patch call.respondBadRequest("Newsletter ID is required")
                val issueId = call.getIssueId() ?: return@patch call.respondBadRequest("Issue ID is required")

                try {
                    val request = call.receive<UpdateIssueRequest>()

                    val command = UpdateIssueCommand(
                        userId = userId,
                        newsletterId = newsletterId,
                        issueId = issueId,
                        title = request.title,
                        slug = request.slug,
                        content = request.content,
                        excerpt = request.excerpt,
                        coverImageUrl = request.coverImageUrl,
                        status = request.status,
                        scheduledAt = request.scheduledAt,
                    )

                    val issueResponse = issueService.updateIssue(command)

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = issueResponse, message = "Issue updated successfully"),
                    )
                } catch (e: IssueException) {
                    call.respondIssueException(e)
                } catch (e: Exception) {
                    call.application.log.error("Failed to update issue", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to update issue: ${e.message}"),
                    )
                }
            }

            // DELETE /api/newsletters/{newsletterId}/issues/{issueId} - 이슈 삭제
            delete("/{issueId}") {
                val userId = call.getUserId() ?: return@delete call.respondUnauthorized()
                val newsletterId = call.getNewsletterId() ?: return@delete call.respondBadRequest("Newsletter ID is required")
                val issueId = call.getIssueId() ?: return@delete call.respondBadRequest("Issue ID is required")

                try {
                    val command = DeleteIssueCommand(
                        userId = userId,
                        newsletterId = newsletterId,
                        issueId = issueId,
                    )

                    issueService.deleteIssue(command)

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(data = Unit, message = "Issue deleted"),
                    )
                } catch (e: IssueException) {
                    call.respondIssueException(e)
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

// ========================================
// Extension Functions (헬퍼)
// ========================================

private fun io.ktor.server.application.ApplicationCall.getUserId(): String? {
    return principal<JWTPrincipal>()?.payload?.subject
}

private fun io.ktor.server.application.ApplicationCall.getNewsletterId(): String? {
    return parameters["newsletterId"]
}

private fun io.ktor.server.application.ApplicationCall.getIssueId(): String? {
    return parameters["issueId"]
}

private suspend fun io.ktor.server.application.ApplicationCall.respondUnauthorized() {
    respond(
        HttpStatusCode.Unauthorized,
        ApiResponse.error<Nothing>(message = "Unauthorized"),
    )
}

private suspend fun io.ktor.server.application.ApplicationCall.respondBadRequest(message: String) {
    respond(
        HttpStatusCode.BadRequest,
        ApiResponse.error<Nothing>(message = message),
    )
}

private suspend fun io.ktor.server.application.ApplicationCall.respondIssueException(e: IssueException) {
    val (status, message) = when (e) {
        is IssueException.NotFound -> HttpStatusCode.NotFound to e.message
        is IssueException.NewsletterNotFound -> HttpStatusCode.NotFound to e.message
        is IssueException.Forbidden -> HttpStatusCode.Forbidden to e.message
        is IssueException.SlugConflict -> HttpStatusCode.Conflict to e.message
        is IssueException.ValidationError -> HttpStatusCode.BadRequest to e.message
    }
    respond(status, ApiResponse.error<Nothing>(message = message ?: "Unknown error"))
}
