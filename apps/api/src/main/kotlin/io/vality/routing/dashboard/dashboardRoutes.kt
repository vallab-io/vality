package io.vality.routing.dashboard

import io.ktor.http.*
import io.ktor.server.application.call
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.vality.dto.ApiResponse
import io.vality.service.DashboardService
import org.koin.ktor.ext.inject

fun Route.dashboardRoutes() {
    val dashboardService by inject<DashboardService>()

    authenticate("jwt") {
        route("/api/dashboard") {
            // 대시보드 통계 조회
            get("/stats") {
                val principal = call.principal<JWTPrincipal>()
                    ?: return@get call.respond(
                        HttpStatusCode.Unauthorized,
                        ApiResponse.error<Nothing>("Unauthorized")
                    )

                val userId = principal.payload.subject

                val stats = dashboardService.getStats(userId)
                call.respond(HttpStatusCode.OK, ApiResponse.success(stats))
            }

            // 최근 이슈 목록 조회
            get("/recent-issues") {
                val principal = call.principal<JWTPrincipal>()
                    ?: return@get call.respond(
                        HttpStatusCode.Unauthorized,
                        ApiResponse.error<Nothing>("Unauthorized")
                    )

                val userId = principal.payload.subject
                val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 5

                val recentIssues = dashboardService.getRecentIssues(userId, limit)
                call.respond(HttpStatusCode.OK, ApiResponse.success(recentIssues))
            }
        }
    }
}

