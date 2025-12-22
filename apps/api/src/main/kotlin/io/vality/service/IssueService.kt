package io.vality.service

import io.vality.repository.IssueRepository

class IssueService(
    private val issueRepository: IssueRepository,
) {
    /**
     * 이슈 좋아요 수 증가 (Medium clap 방식 - 중복 허용)
     * 
     * @param issueId 이슈 ID
     * @return 증가된 좋아요 수
     */
    suspend fun incrementLikeCount(issueId: String): Long {
        // 이슈 존재 확인
        val issue = issueRepository.findById(issueId)
            ?: throw IllegalArgumentException("Issue not found")
        
        // 현재 좋아요 수 조회 및 증가
        val currentCount = issue.likeCount
        val newCount = currentCount + 1
        
        // 좋아요 수 업데이트
        issueRepository.updateLikeCount(issueId, newCount)
        
        return newCount
    }
}

