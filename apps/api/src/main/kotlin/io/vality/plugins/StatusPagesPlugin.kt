package io.vality.plugins

import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.http.*
import io.vality.dto.ApiResponse

fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ApiResponse.error<Nothing>(
                    error = "Internal server error",
                    message = cause.message
                )
            )
        }
        
        exception<IllegalArgumentException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ApiResponse.error<Nothing>(
                    error = "Bad request",
                    message = cause.message
                )
            )
        }
        
        exception<NoSuchElementException> { call, cause ->
            call.respond(
                HttpStatusCode.NotFound,
                ApiResponse.error<Nothing>(
                    error = "Not found",
                    message = cause.message
                )
            )
        }
    }
}
