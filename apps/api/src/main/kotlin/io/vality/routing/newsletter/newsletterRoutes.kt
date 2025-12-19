package io.vality.routing.newsletter

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.dto.newsletter.CreateNewsletterRequest
import io.vality.dto.newsletter.NewsletterResponse
import io.vality.service.NewsletterService
import org.koin.ktor.ext.inject

fun Route.newsletterRoutes() {
    val newsletterService: NewsletterService by inject()

    route("/api/newsletters") {
        authenticate("jwt") {
            /**
             * 뉴스레터 생성
             * POST /api/newsletters
             */
            post {
                val principal = call.principal<JWTPrincipal>()
                    ?: return@post call.respond(
                        HttpStatusCode.Unauthorized,
                        ApiResponse.error<Nothing>(message = "Unauthorized")
                    )

                val userId = principal.payload.subject
                val request = call.receive<CreateNewsletterRequest>()

                try {
                    // Slug 유효성 검증
                    if (request.slug.isBlank()) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "Slug is required")
                        )
                        return@post
                    }

                    // Slug 형식 검증 (영문 소문자, 숫자, 하이픈, 언더스코어만 허용)
                    if (!request.slug.matches(Regex("^[a-z0-9_-]+$"))) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "Slug can only contain lowercase letters, numbers, hyphens, and underscores")
                        )
                        return@post
                    }

                    val newsletter = newsletterService.createNewsletter(
                        ownerId = userId,
                        name = request.name,
                        slug = request.slug,
                        description = request.description,
                        senderName = request.senderName,
                    )

                    val response = NewsletterResponse(
                        id = newsletter.id,
                        name = newsletter.name,
                        slug = newsletter.slug,
                        description = newsletter.description,
                        senderName = newsletter.senderName,
                        timezone = newsletter.timezone,
                        createdAt = newsletter.createdAt,
                        updatedAt = newsletter.updatedAt,
                    )

                    call.respond(HttpStatusCode.Created, ApiResponse.success(data = response))
                } catch (e: IllegalArgumentException) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = e.message ?: "Invalid request")
                    )
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to create newsletter: ${e.message}")
                    )
                }
            }

            /**
             * 내 뉴스레터 목록 조회
             * GET /api/newsletters
             */
            get {
                val principal = call.principal<JWTPrincipal>()
                    ?: return@get call.respond(
                        HttpStatusCode.Unauthorized,
                        ApiResponse.error<Nothing>(message = "Unauthorized")
                    )

                val userId = principal.payload.subject

                try {
                    val newsletters = newsletterService.getNewslettersByOwner(userId)
                    val responses = newsletters.map { newsletter ->
                        NewsletterResponse(
                            id = newsletter.id,
                            name = newsletter.name,
                            slug = newsletter.slug,
                            description = newsletter.description,
                            senderName = newsletter.senderName,
                            timezone = newsletter.timezone,
                            createdAt = newsletter.createdAt,
                            updatedAt = newsletter.updatedAt,
                        )
                    }

                    call.respond(HttpStatusCode.OK, ApiResponse.success(data = responses))
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to get newsletters: ${e.message}")
                    )
                }
            }
        }
    }
}

