package io.vality.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import io.vality.config.RedisConfig
import org.koin.ktor.ext.inject

fun Application.configureRedis() {
    // Redis는 Koin을 통해 주입되므로 별도 초기화 불필요
    // 애플리케이션 종료 시 정리만 수행
    
    environment.monitor.subscribe(ApplicationStopped) {
        try {
            val redisConfig: RedisConfig by inject()
            redisConfig.shutdown()
        } catch (e: Exception) {
            // Koin이 이미 종료되었을 수 있으므로 예외 무시
        }
    }
}

