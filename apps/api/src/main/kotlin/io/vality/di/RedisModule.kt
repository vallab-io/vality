package io.vality.di

import com.typesafe.config.Config
import io.vality.config.RedisConfig
import org.koin.dsl.module

val redisModule = module {
    single<RedisConfig> {
        val config = get<Config>()

        // application.conf에서 필수 값 읽기 (값이 없으면 ConfigException 발생)
        val host = config.getString("ktor.redis.host")
        val port = config.getInt("ktor.redis.port")
        val password = config.getString("ktor.redis.password")
        val useTls = config.getBoolean("ktor.redis.tls")

        RedisConfig(
            host = host,
            port = port,
            password = password,
            useTls = useTls,
        )
    }
}

