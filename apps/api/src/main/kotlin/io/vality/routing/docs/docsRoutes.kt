package io.vality.routing.docs

import io.ktor.http.ContentType
import io.ktor.server.application.call
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.swagger.v3.parser.OpenAPIV3Parser
import java.io.InputStream

fun Route.docsRoutes() {
    route("/api/docs") {
        // OpenAPI YAML 스펙 제공
        get("/openapi.yaml") {
            val yamlContent = loadSwaggerYaml()
            call.respondText(
                text = yamlContent,
                contentType = ContentType("application", "yaml")
            )
        }

        // OpenAPI JSON 스펙 제공 (YAML에서 변환)
        get("/openapi.json") {
            val yamlContent = loadSwaggerYaml()
            val openAPI = OpenAPIV3Parser().readContents(yamlContent, null, null).openAPI
                ?: throw IllegalStateException("Failed to parse OpenAPI YAML")
            
            val json = io.swagger.v3.core.util.Json.mapper()
                .writeValueAsString(openAPI)
            
            call.respondText(
                text = json,
                contentType = ContentType.Application.Json
            )
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

/**
 * Swagger YAML 파일을 resources에서 로드
 */
private fun loadSwaggerYaml(): String {
    val inputStream: InputStream =
        object {}.javaClass.classLoader.getResourceAsStream("api/swagger.yaml")
        ?: throw IllegalStateException("swagger.yaml file not found in resources")
    
    return inputStream.bufferedReader().use { it.readText() }
}

/**
 * Swagger UI HTML 생성
 */
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
                "bearerAuth": {
                    name: "bearerAuth",
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
