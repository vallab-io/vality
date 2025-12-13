package io.vality.plugins

import com.typesafe.config.Config
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm

data class JwtConfig(
    val secret: String,
    val issuer: String,
    val audience: String,
    val realm: String
)

fun Application.configureJWT(config: Config) {
    val jwtConfig = JwtConfig(
        secret = config.getString("ktor.jwt.secret"),
        issuer = config.getString("ktor.jwt.issuer"),
        audience = config.getString("ktor.jwt.audience"),
        realm = config.getString("ktor.jwt.realm")
    )
    
    install(Authentication) {
        jwt("jwt") {
            realm = jwtConfig.realm
            verifier(
                JWT
                    .require(Algorithm.HMAC256(jwtConfig.secret))
                    .withAudience(jwtConfig.audience)
                    .withIssuer(jwtConfig.issuer)
                    .build()
            )
            validate { credential ->
                if (credential.payload.audience.contains(jwtConfig.audience)) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
        }
    }
}
