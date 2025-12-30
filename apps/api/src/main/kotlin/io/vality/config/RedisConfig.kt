package io.vality.config

import io.lettuce.core.RedisClient
import io.lettuce.core.RedisURI
import io.lettuce.core.api.StatefulRedisConnection
import io.lettuce.core.api.coroutines.RedisCoroutinesCommands
import io.lettuce.core.api.coroutines.RedisCoroutinesCommandsImpl
import io.lettuce.core.codec.StringCodec
import org.slf4j.LoggerFactory

/**
 * Redis 연결 설정 (간단한 버전)
 *
 * Upstash 또는 일반 Redis 서버에 연결합니다.
 * 단일 연결을 사용하여 간단하게 구현합니다.
 */
class RedisConfig(
    host: String,
    port: Int = 6379,
    password: String? = null,
    useTls: Boolean = false,
) {
    private val logger = LoggerFactory.getLogger(RedisConfig::class.java)
    private val redisClient: RedisClient
    val connection: StatefulRedisConnection<String, String>

    init {
        // Redis URI 생성
        val redisUri = RedisURI.Builder.redis(host, port)
            .apply {
                password?.let { withPassword(it.toCharArray()) }
                if (useTls) {
                    withSsl(true)
                    withVerifyPeer(false) // Upstash는 자체 인증서 사용
                }
            }
            .build()

        // Redis 클라이언트 생성 및 연결
        redisClient = RedisClient.create(redisUri)
        connection = redisClient.connect(StringCodec.UTF8)

        logger.info("Redis client initialized: $host:$port (TLS: $useTls)")
    }

    /**
     * 코루틴용 Redis 명령어 가져오기
     */
    fun getCoroutinesCommands(): RedisCoroutinesCommands<String, String> {
        return RedisCoroutinesCommandsImpl(connection.reactive())
    }

    /**
     * 리소스 정리
     */
    fun shutdown() {
        connection.close()
        redisClient.shutdown()
        logger.info("Redis client shut down")
    }
}

