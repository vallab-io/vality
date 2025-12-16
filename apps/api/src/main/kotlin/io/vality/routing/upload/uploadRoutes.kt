package io.vality.routing.upload

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.dto.upload.PresignedUrlRequest
import io.vality.dto.upload.PresignedUrlResponse
import io.vality.service.upload.ImageUploadException
import io.vality.service.upload.ImageUploadService
import org.koin.ktor.ext.inject

fun Route.uploadRoutes() {
    val imageUploadService: ImageUploadService by inject()

    route("/api/upload") {
        authenticate("jwt") {
            /**
             * Presigned URL 생성
             * POST /api/upload/presigned-url
             */
            post("/presigned-url") {
                val principal = call.principal<JWTPrincipal>()
                    ?: return@post call.respond(
                        HttpStatusCode.Unauthorized,
                        ApiResponse.error<Nothing>(message = "Unauthorized")
                    )

                val userId = principal.payload.subject
                val request = call.receive<PresignedUrlRequest>()

                try {
                    when (request.type) {
                        "user" -> {
                            // 프로필 이미지 업로드
                            val result = imageUploadService.generateUserAvatarPresignedUrl(
                                userId = userId,
                                filename = request.filename,
                                contentType = request.contentType,
                                fileSize = request.fileSize,
                            )

                            call.respond(
                                HttpStatusCode.OK,
                                ApiResponse.success(
                                    data = PresignedUrlResponse(
                                        presignedUrl = result.presignedUrl,
                                        filename = result.filename,
                                        key = result.key,
                                    )
                                )
                            )
                        }
                        "issue" -> {
                            // TODO: 이슈 이미지 업로드 구현
                            call.respond(
                                HttpStatusCode.NotImplemented,
                                ApiResponse.error<Nothing>(message = "Issue image upload not implemented yet")
                            )
                        }
                        else -> {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                ApiResponse.error<Nothing>(message = "Invalid upload type. Use 'user' or 'issue'")
                            )
                        }
                    }
                } catch (e: ImageUploadException) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = e.message ?: "Image upload validation failed")
                    )
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to generate presigned URL: ${e.message}")
                    )
                }
            }
        }
    }
}

