package io.vality.config

import com.typesafe.config.ConfigFactory
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class RedisTest {
    @Test
    fun `Redis 연결 테스트`() = runBlocking {
        val config = ConfigFactory.load()
        
        val host = config.getString("ktor.redis.host")
        val port = config.getInt("ktor.redis.port")
        val password = config.getString("ktor.redis.password")
        val useTls = config.getBoolean("ktor.redis.tls")
        
        val redisConfig = RedisConfig(
            host = host,
            port = port,
            password = password,
            useTls = useTls,
        )
        
        try {
            val commands = redisConfig.getCoroutinesCommands()
            
            // PING 테스트
            val pong = commands.ping()
            assertNotNull(pong)
            println("✅ Redis PING 성공: $pong")
            
            // SET 테스트
            commands.set("test:key", "test:value")
            println("✅ Redis SET 성공")
            
            // GET 테스트
            val value = commands.get("test:key")
            assertNotNull(value)
            assertTrue(value == "test:value", "Expected 'test:value', but got '$value'")
            println("✅ Redis GET 성공: $value")
            
            // DELETE
            val deleted = commands.del("test:key")
            assertTrue(deleted!! > 0, "Key should be deleted")
            println("✅ Redis DELETE 성공: $deleted keys deleted")
            
            println("✅ Redis 연결 테스트 완료!")
        } finally {
            redisConfig.shutdown()
        }
    }
}

