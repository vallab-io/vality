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

            openAPI.path("/api/auth/verify-code", PathItem().apply {
                post = Operation().apply {
                    summary = "인증 코드 검증"
                    description = "발송된 인증 코드를 검증합니다."
                    tags = listOf("인증")
                    requestBody = RequestBody().apply {
                        description = "이메일과 인증 코드"
                        required = true
                        content = Content().apply {
                            addMediaType("application/json", MediaType().apply {
                                schema = Schema<Any>().apply {
                                    type = "object"
                                    required = listOf("email", "code")
                                    properties = mapOf("email" to Schema<Any>().apply {
                                        type = "string"
                                        format = "email"
                                        example = "user@example.com"
                                    }, "code" to Schema<Any>().apply {
                                        type = "string"
                                        example = "123456"
                                    })
                                }
                            })
                        }
                    }
                    responses = ApiResponses().apply {
                        addApiResponse("200", ApiResponse().apply {
                            description = "인증 코드 검증 성공"
                        })
                        addApiResponse("400", ApiResponse().apply {
                            description = "잘못된 인증 코드"
                        })
                    }
                }
            })

            openAPI.path("/api/auth/signup", PathItem().apply {
                post = Operation().apply {
                    summary = "회원가입"
                    description = "이메일 인증을 완료한 후 회원가입을 진행합니다."
                    tags = listOf("인증")
                    requestBody = RequestBody().apply {
                        description = "회원가입 정보"
                        required = true
                        content = Content().apply {
                            addMediaType("application/json", MediaType().apply {
                                schema = Schema<Any>().apply {
                                    type = "object"
                                    required = listOf("email", "code")
                                    properties = mapOf("email" to Schema<Any>().apply {
                                        type = "string"
                                        format = "email"
                                        example = "user@example.com"
                                    }, "code" to Schema<Any>().apply {
                                        type = "string"
                                        example = "123456"
                                    }, "username" to Schema<Any>().apply {
                                        type = "string"
                                        nullable = true
                                        example = "johndoe"
                                    }, "name" to Schema<Any>().apply {
                                        type = "string"
                                        nullable = true
                                        example = "John Doe"
                                    })
                                }
                            })
                        }
                    }
                    responses = ApiResponses().apply {
                        addApiResponse("201", ApiResponse().apply {
                            description = "회원가입 성공"
                        })
                        addApiResponse("400", ApiResponse().apply {
                            description = "잘못된 요청"
                        })
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

