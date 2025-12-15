package io.vality.routing.docs

import io.ktor.http.ContentType
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.swagger.v3.core.util.Json
import io.swagger.v3.oas.models.Operation
import io.swagger.v3.oas.models.PathItem
import io.swagger.v3.oas.models.media.Content
import io.swagger.v3.oas.models.media.MediaType
import io.swagger.v3.oas.models.media.Schema
import io.swagger.v3.oas.models.parameters.RequestBody
import io.swagger.v3.oas.models.responses.ApiResponse
import io.swagger.v3.oas.models.responses.ApiResponses
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.vality.plugins.createOpenAPISpec

fun Route.docsRoutes() {
    route("/api/docs") {
        // OpenAPI JSON 스펙 제공
        get("/openapi.json") {
            val openAPI = createOpenAPISpec()

            // Health API
            openAPI.path("/api/health", PathItem().apply {
                get = Operation().apply {
                    summary = "Health Check"
                    description = "서버 상태 확인"
                    tags = listOf("Health")
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply {
                            description = "서버가 정상 작동 중"
                            content = Content().apply {
                                addMediaType("application/json", MediaType().apply {
                                    schema = Schema<Any>().apply {
                                        type = "object"
                                        properties = mapOf("success" to Schema<Any>().apply {
                                            type = "boolean"
                                            example = true
                                        }, "data" to Schema<Any>().apply {
                                            type = "object"
                                            properties = mapOf("status" to Schema<Any>().apply {
                                                type = "string"
                                                example = "UP"
                                            }, "timestamp" to Schema<Any>().apply {
                                                type = "string"
                                                format = "date-time"
                                            })
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
            })

            // Auth APIs
            openAPI.path("/api/auth/send-verification-code", PathItem().apply {
                post = Operation().apply {
                    summary = "이메일 인증 코드 발송"
                    description = "이메일로 인증 코드를 발송합니다."
                    tags = listOf("인증")
                    requestBody = RequestBody().apply {
                        description = "이메일 주소"
                        required = true
                        content = Content().apply {
                            addMediaType("application/json", MediaType().apply {
                                schema = Schema<Any>().apply {
                                    type = "object"
                                    required = listOf("email")
                                    properties = mapOf(
                                        "email" to Schema<Any>().apply {
                                            type = "string"
                                            format = "email"
                                            example = "user@example.com"
                                        })
                                }
                            })
                        }
                    }
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply {
                            description = "인증 코드 발송 성공"
                        })
                        addApiResponse("400", ApiResponse().apply {
                            description = "잘못된 요청"
                        })
                    }
                }
            })

            openAPI.path("/api/auth/email-auth", PathItem().apply {
                post = Operation().apply {
                    summary = "이메일 인증 로그인/회원가입 (통합)"
                    description = "email + code로 로그인 또는 신규 회원가입 후 AuthResponse를 반환합니다."
                    tags = listOf("인증")
                    requestBody = RequestBody().apply {
                        required = true
                        content = Content().apply {
                            addMediaType("application/json", MediaType().apply {
                                schema = Schema<Any>().apply {
                                    type = "object"
                                    required = listOf("email", "code")
                                    properties = mapOf(
                                        "email" to Schema<Any>().apply {
                                            type = "string"; format = "email"; example = "user@example.com"
                                        },
                                        "code" to Schema<Any>().apply {
                                            type = "string"; example = "123456"
                                        }
                                    )
                                }
                            })
                        }
                    }
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply { description = "로그인/회원가입 성공 (AuthResponse 반환)" })
                        addApiResponse("400", ApiResponse().apply { description = "잘못된 요청 또는 인증 실패" })
                    }
                }
            })

            openAPI.path("/api/auth/check-username", PathItem().apply {
                get = Operation().apply {
                    summary = "사용자명 중복 확인"
                    description = "username 쿼리 파라미터로 사용 가능 여부를 조회합니다."
                    tags = listOf("인증")
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply { description = "{ available: boolean }" })
                        addApiResponse("400", ApiResponse().apply { description = "username 누락" })
                    }
                }
            })

            openAPI.path("/api/auth/refresh", PathItem().apply {
                post = Operation().apply {
                    summary = "AccessToken 갱신"
                    description = "refreshToken으로 새로운 accessToken/refreshToken을 발급합니다."
                    tags = listOf("인증")
                    requestBody = RequestBody().apply {
                        required = true
                        content = Content().apply {
                            addMediaType("application/json", MediaType().apply {
                                schema = Schema<Any>().apply {
                                    type = "object"
                                    required = listOf("refreshToken")
                                    properties = mapOf(
                                        "refreshToken" to Schema<Any>().apply {
                                            type = "string"; example = "refresh-token"
                                        }
                                    )
                                }
                            })
                        }
                    }
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply { description = "갱신 성공 (AuthResponse 반환)" })
                        addApiResponse("400", ApiResponse().apply { description = "잘못된 refreshToken" })
                    }
                }
            })

            openAPI.path("/api/auth/me", PathItem().apply {
                get = Operation().apply {
                    summary = "내 정보 조회"
                    description = "현재 로그인한 사용자의 정보를 조회합니다."
                    tags = listOf("인증")
                    security = listOf(SecurityRequirement().addList("bearer-jwt"))
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply {
                            description = "사용자 정보 조회 성공"
                        })
                        addApiResponse("401", ApiResponse().apply {
                            description = "인증 실패"
                        })
                        addApiResponse("404", ApiResponse().apply {
                            description = "사용자를 찾을 수 없음"
                        })
                    }
                }
                patch = Operation().apply {
                    summary = "프로필 업데이트"
                    description = "username(필수), name, bio를 수정합니다."
                    tags = listOf("인증")
                    security = listOf(SecurityRequirement().addList("bearer-jwt"))
                    requestBody = RequestBody().apply {
                        required = true
                        content = Content().apply {
                            addMediaType("application/json", MediaType().apply {
                                schema = Schema<Any>().apply {
                                    type = "object"
                                    required = listOf("username")
                                    properties = mapOf(
                                        "username" to Schema<Any>().apply { type = "string"; example = "johndoe" },
                                        "name" to Schema<Any>().apply { type = "string"; nullable = true; example = "John Doe" },
                                        "bio" to Schema<Any>().apply { type = "string"; nullable = true; example = "소개글" }
                                    )
                                }
                            })
                        }
                    }
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply { description = "업데이트 성공" })
                        addApiResponse("400", ApiResponse().apply { description = "유효성 오류 또는 중복 username" })
                        addApiResponse("401", ApiResponse().apply { description = "인증 실패" })
                    }
                }
                delete = Operation().apply {
                    summary = "계정 삭제"
                    description = "현재 로그인한 사용자의 계정을 삭제합니다."
                    tags = listOf("인증")
                    security = listOf(SecurityRequirement().addList("bearer-jwt"))
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply { description = "삭제 성공" })
                        addApiResponse("401", ApiResponse().apply { description = "인증 실패" })
                    }
                }
            })

            val json = Json.mapper()
                .writeValueAsString(openAPI)
            call.respond(json)
        }

        // Swagger UI 제공
        get {
            call.respondText(
                text = getSwaggerUIHtml(),
                contentType = ContentType.Text.Html,
            )
        }
    }
}

private fun getSwaggerUIHtml(): String {
    return """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vality API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "/api/docs/openapi.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: null,
                tryItOutEnabled: true
            });
            
            // JWT 토큰 입력 UI 개선
            ui.getSystem().authActions.authorize({
                "bearer-jwt": {
                    name: "bearer-jwt",
                    schema: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    },
                    value: ""
                }
            });
        };
    </script>
</body>
</html>
    """.trimIndent()
}

