package io.vality.routing.public

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.service.IssueService
import io.vality.service.NewsletterService
import io.vality.service.UserService
import org.koin.ktor.ext.inject

fun Route.publicRoutes() {
    val issueService: IssueService by inject()
    val newsletterService: NewsletterService by inject()
    val userService: UserService by inject()

    route("/api/public") {
        // ============================================
        // Issues - 이슈 관련 라우트
        // ============================================
        
        /**
         * 이슈 좋아요 추가 (Medium clap 방식 - JWT 인증 불필요)
         * POST /api/public/issues/{issueId}/like
         * 구체적인 라우트를 먼저 정의
         */
        post("/issues/{issueId}/like") {
            val issueId = call.parameters["issueId"]
                ?: return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Issue ID is required"),
                )

            call.application.log.info("Like request received for issue: $issueId")

            try {
                val likeCount = issueService.incrementLikeCount(issueId)
                call.respond(
                    HttpStatusCode.OK,
                    ApiResponse.success(
                        data = mapOf("likeCount" to likeCount),
                        message = "Like added"
                    ),
                )
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.NotFound,
                    ApiResponse.error<Nothing>(message = e.message ?: "Issue not found"),
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to add like", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to add like: ${e.message}"),
                )
            }
        }

        /**
         * 모든 사용자의 발행된 이슈 목록 조회 (최신순, 페이징)
         * GET /api/public/issues?limit=20&offset=0
         */
        get("/issues") {
            val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 20
            val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0

            try {
                val responses = issueService.getAllPublishedIssues(limit, offset)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = responses))
            } catch (e: Exception) {
                call.application.log.error("Failed to get all issues", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get all issues: ${e.message}")
                )
            }
        }

        // ============================================
        // Users - 사용자 관련 라우트
        // ============================================

        /**
         * 특정 이슈 조회 (username + newsletterSlug + issueSlug)
         * GET /api/public/users/{username}/newsletters/{newsletterSlug}/issues/{issueSlug}
         * 가장 구체적인 라우트를 먼저 정의
         */
        get("/users/{username}/newsletters/{newsletterSlug}/issues/{issueSlug}") {
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
                val response = issueService.getIssueDetailBySlug(username, newsletterSlug, issueSlug)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = response))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.NotFound,
                    ApiResponse.error<Nothing>(message = e.message ?: "Not found")
                )
            } catch (e: IllegalStateException) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = e.message ?: "Internal server error")
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get issue", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get issue: ${e.message}")
                )
            }
        }

        /**
         * 특정 뉴스레터의 발행된 이슈 목록 조회 (최신순)
         * GET /api/public/users/{username}/newsletters/{newsletterSlug}/issues?limit=20&offset=0
         */
        get("/users/{username}/newsletters/{newsletterSlug}/issues") {
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
                val issues = issueService.getNewsletterIssues(username, newsletterSlug, limit, offset)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = issues))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.NotFound,
                    ApiResponse.error<Nothing>(message = e.message ?: "Not found")
                )
            } catch (e: IllegalStateException) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = e.message ?: "Internal server error")
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
         * 특정 뉴스레터 조회 (username + slug)
         * GET /api/public/users/{username}/newsletters/{newsletterSlug}
         */
        get("/users/{username}/newsletters/{newsletterSlug}") {
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
                val response = newsletterService.getNewsletterByUsernameAndSlug(username, newsletterSlug)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = response))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.NotFound,
                    ApiResponse.error<Nothing>(message = e.message ?: "Newsletter not found")
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
         * 사용자의 뉴스레터 목록 조회
         * GET /api/public/users/{username}/newsletters
         */
        get("/users/{username}/newsletters") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            try {
                val newsletters = newsletterService.getUserNewsletters(username)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = newsletters))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.NotFound,
                    ApiResponse.error<Nothing>(message = e.message ?: "User not found")
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
         */
        get("/users/{username}/issues") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 20
            val offset = call.request.queryParameters["offset"]?.toIntOrNull() ?: 0

            try {
                val issues = issueService.getUserIssues(username, limit, offset)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = issues))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.NotFound,
                    ApiResponse.error<Nothing>(message = e.message ?: "User not found")
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
         * 공개 사용자 프로필 조회
         * GET /api/public/users/{username}
         * 가장 일반적인 라우트를 마지막에 정의
         */
        get("/users/{username}") {
            val username = call.parameters["username"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ApiResponse.error<Nothing>(message = "Username is required")
                )

            try {
                val response = userService.getUserProfile(username)
                call.respond(HttpStatusCode.OK, ApiResponse.success(data = response))
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.NotFound,
                    ApiResponse.error<Nothing>(message = e.message ?: "User not found")
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to get user profile", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse.error<Nothing>(message = "Failed to get user profile: ${e.message}")
                )
            }
        }
    }
}
