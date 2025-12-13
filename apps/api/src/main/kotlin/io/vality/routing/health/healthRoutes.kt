package io.vality.routing.health

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.vality.dto.ApiResponse
import kotlinx.serialization.Serializable
import kotlinx.serialization.Contextual
import java.time.Instant

@Serializable
data class HealthResponse(
    val status: String,
    @Contextual val timestamp: Instant
)

fun Route.healthRoutes() {
    route("/api/health") {
        get {
            call.respond(
                ApiResponse.success(
                    data = HealthResponse(
                        status = "UP",
                        timestamp = Instant.now()
                    )
                )
            )
        }
    }
}
