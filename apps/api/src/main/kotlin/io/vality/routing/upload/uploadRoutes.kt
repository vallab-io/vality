package io.vality.routing.upload

import io.ktor.http.HttpStatusCode
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.http.content.streamProvider
import io.ktor.server.application.call
import io.ktor.server.application.log
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.request.receiveMultipart
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.vality.dto.ApiResponse
import io.vality.dto.upload.ImageUploadResponse
import io.vality.dto.upload.PresignedUrlRequest
import io.vality.dto.upload.PresignedUrlResponse
import io.vality.service.upload.ImageUploadException
import io.vality.service.upload.ImageUploadService
import io.vality.service.upload.ImageUrlService
import org.koin.ktor.ext.inject

fun Route.uploadRoutes() {
    val imageUploadService: ImageUploadService by inject()
    val imageUrlService: ImageUrlService by inject()

    route("/api/upload") {
        authenticate("jwt") {
            /**
             * 이슈 이미지 업로드 (서버를 통한 직접 업로드)
             * POST /api/upload/issues/{issueId}/images
             */
            post("/issues/{issueId}/images") {
                val principal = call.principal<JWTPrincipal>()
                    ?: return@post call.respond(
                        HttpStatusCode.Unauthorized,
                        ApiResponse.error<Nothing>(message = "Unauthorized")
                    )

                val issueId = call.parameters["issueId"]
                    ?: return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = "Issue ID is required")
                    )

                try {
                    val multipart = call.receiveMultipart()
                    var fileBytes: ByteArray? = null
                    var filename: String? = null
                    var contentType: String? = null

                    multipart.forEachPart { part ->
                        when (part) {
                            is PartData.FileItem -> {
                                filename = part.originalFileName
                                contentType = part.contentType?.toString() ?: "image/jpeg"
                                fileBytes = part.streamProvider().readBytes()
                            }
                            else -> {
                                part.dispose()
                            }
                        }
                    }

                    if (fileBytes == null || filename == null) {
                        return@post call.respond(
                            HttpStatusCode.BadRequest,
                            ApiResponse.error<Nothing>(message = "Image file is required")
                        )
                    }

                    // 이미지 업로드
                    val key = imageUploadService.uploadIssueImage(
                        issueId = issueId,
                        filename = filename!!,
                        content = fileBytes!!,
                        contentType = contentType!!,
                    )

                    // 완성된 URL 생성
                    val imageUrl = imageUrlService.getImageUrl(key)
                        ?: return@post call.respond(
                            HttpStatusCode.InternalServerError,
                            ApiResponse.error<Nothing>(message = "Failed to generate image URL")
                        )

                    call.respond(
                        HttpStatusCode.OK,
                        ApiResponse.success(
                            data = ImageUploadResponse(
                                url = imageUrl,
                                key = key,
                            )
                        )
                    )
                } catch (e: ImageUploadException) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiResponse.error<Nothing>(message = e.message ?: "Image upload validation failed")
                    )
                } catch (e: Exception) {
                    call.application.log.error("Failed to upload issue image", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ApiResponse.error<Nothing>(message = "Failed to upload image: ${e.message}")
                    )
                }
            }

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
                            // 이슈 이미지 업로드
                            val issueId = request.issueId
                                ?: return@post call.respond(
                                    HttpStatusCode.BadRequest,
                                    ApiResponse.error<Nothing>(message = "issueId is required for issue image upload")
                                )

                            val result = imageUploadService.generateIssueImagePresignedUrl(
                                issueId = issueId,
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

