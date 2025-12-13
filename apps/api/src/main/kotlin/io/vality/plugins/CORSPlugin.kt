package io.vality.plugins

import com.typesafe.config.Config
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*

fun Application.configureCORS(config: Config) {
    val allowedOrigins = try {
        config.getStringList("ktor.cors.allowedOrigins")
    } catch (e: Exception) {
        listOf("http://localhost:3000")
    }
    
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowCredentials = true
        allowNonSimpleContentTypes = true
        anyHost()
        
        // 특정 origin만 허용하려면 아래 주석 해제
        // allowedOrigins.forEach { origin ->
        //     allowHost(origin, schemes = listOf("http", "https"))
        // }
    }
}

