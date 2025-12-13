package io.vality.plugins

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.servers.Server
import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.security.SecurityScheme
import io.swagger.v3.oas.models.security.SecurityRequirement

fun createOpenAPISpec(): OpenAPI {
    return OpenAPI().apply {
        info = Info().apply {
            title = "Vality API"
            version = "1.0.0"
            description = """
                뉴스레터 + 웹 아카이빙 플랫폼 API
                
                ## 인증
                대부분의 API는 JWT 토큰 인증이 필요합니다.
                Authorization 헤더에 `Bearer {token}` 형식으로 토큰을 포함하세요.
            """.trimIndent()
            contact = Contact().apply {
                name = "Vality Team"
            }
        }
        
        servers = listOf(
            Server().apply {
                url = "http://localhost:4000"
                description = "로컬 개발 서버"
            },
            Server().apply {
                url = "https://api.vality.io"
                description = "프로덕션 서버"
            }
        )
        
        components = Components().apply {
            addSecuritySchemes(
                "bearer-jwt",
                SecurityScheme().apply {
                    type = SecurityScheme.Type.HTTP
                    scheme = "bearer"
                    bearerFormat = "JWT"
                    description = "JWT 토큰을 입력하세요. 형식: Bearer {token}"
                }
            )
        }
        
        addSecurityItem(SecurityRequirement().addList("bearer-jwt"))
    }
}

