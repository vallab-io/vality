package io.vality.dto.contact

import kotlinx.serialization.Serializable

@Serializable
data class ContactRequest(
    val name: String,
    val email: String,
    val message: String,
    val privacyAgreed: Boolean, // 개인 정보 수집 및 이용에 동의합니다
)
