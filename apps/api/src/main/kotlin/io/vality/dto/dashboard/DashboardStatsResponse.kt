package io.vality.dto.dashboard

import kotlinx.serialization.Serializable

@Serializable
data class DashboardStatsResponse(
    val totalSubscribers: Long,
    val publishedIssues: Long,
    val draftIssues: Long,
)

