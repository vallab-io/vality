# Upstash Redis 설정 가이드

## ⚡ 빠른 시작 요약

1. **Upstash 콘솔**에서 Redis Database 생성
2. **build.gradle.kts**에 `io.lettuce:lettuce-core:6.3.1.RELEASE` 추가
3. **RedisConfig.kt** 생성 (가이드 참고)
4. **RedisModule.kt** 생성 및 `AppModule.kt`에 추가
5. **환경 변수** 설정 (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TLS`)
6. **테스트** 실행

---

## 📋 개요

Upstash는 서버리스 Redis 서비스로, 사용한 만큼만 비용을 지불하는 구조입니다. MVP 단계에서 무료 티어로 시작하여 나중에 AWS ElastiCache로 마이그레이션하기 좋은 선택입니다.

### 무료 티어 제한
- **10,000 명령어/일** (충분한 양)
- **256MB 스토리지**
- **Global replication 가능**

### 리전 선택 (ap-northeast-1)
Upstash는 현재 **서울(ap-northeast-2) 리전을 제공하지 않습니다**. 따라서 **도쿄(ap-northeast-1) 리전**을 사용해야 합니다.

**성능 영향 분석**:
- 서울 → 도쿄: 약 **30-50ms 지연시간**
- 뉴스레터 발송 큐 작업: **백그라운드 비동기 처리**이므로 사용자 경험에 영향 없음
- 큐 작업(ENQUEUE/DEQUEUE)은 빠르게 처리되므로 실제 발송 시간에 미치는 영향 미미
- 메일 발송 자체는 SES에서 처리되므로 Redis 지연과 무관

**결론**: ap-northeast-1 사용해도 **성능상 전혀 문제 없습니다** ✅

---

## 🚀 1. Upstash 가입 및 Redis 생성

### 1.1 Upstash 가입
1. [https://console.upstash.com](https://console.upstash.com) 접속
2. **Sign Up** (GitHub/Google 로그인 가능)
3. 이메일 인증 완료

### 1.2 Redis Database 생성
1. 콘솔 대시보드에서 **Create Database** 클릭
2. 설정:
   - **Name**: `vality-redis` (원하는 이름)
   - **Type**: **Regional** (비용 절감)
   - **Region**: `Asia Pacific (ap-northeast-1)` - 도쿄 리전 선택
   - **Primary Region**: `ap-northeast-1`
   - **TLS**: **Enabled** (보안)
3. **Create** 클릭

**📌 참고**: Upstash는 현재 서울(ap-northeast-2) 리전을 제공하지 않습니다. 도쿄(ap-northeast-1) 리전을 사용하면 한국에서 약 30-50ms 지연이 발생하지만, 뉴스레터 발송 큐 작업에는 전혀 문제가 없습니다 (백그라운드 비동기 작업).

### 1.3 연결 정보 확인
Database 생성 후, **Details** 탭에서 다음 정보 확인:
- **UPSTASH_REDIS_REST_URL**: REST API 엔드포인트
- **UPSTASH_REDIS_REST_TOKEN**: 인증 토큰
- **UPSTASH_REDIS_HOST**: Redis 호스트 (직접 연결용)
- **UPSTASH_REDIS_PORT**: `6379` 또는 `38899` (TLS 포트)
- **UPSTASH_REDIS_PASSWORD**: Redis 비밀번호

**⚠️ 중요**: 이 정보는 나중에 다시 확인할 수 없으므로 안전하게 보관하세요.

---

## 🔧 2. Ktor 백엔드 설정

### 2.1 의존성 추가

`apps/api/build.gradle.kts`에 Lettuce (Redis 클라이언트) 추가:

```kotlin
dependencies {
    // ... 기존 의존성들 ...
    
    // Redis - Lettuce (비동기 지원)
    implementation("io.lettuce:lettuce-core:6.3.1.RELEASE")
    
    // Connection Pool (선택사항 - 고성능이 필요할 때)
    // implementation("org.apache.commons:commons-pool2:2.12.0")
}
```

**참고**: Connection Pool은 나중에 성능 최적화가 필요할 때 추가하면 됩니다. 초기에는 단일 연결로도 충분합니다.

### 2.2 환경 변수 설정

#### 로컬 개발

**방법 1: 환경 변수** (`.env.local` 또는 시스템 환경 변수)
```bash
# Redis (로컬: Docker Compose)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false
```

**방법 2: application.conf** (`apps/api/src/main/resources/application.conf`)
```hocon
ktor {
    # ... 기존 설정 ...
    
    redis {
        host = "localhost"
        port = 6379
        # password = ""  # 로컬은 비밀번호 없음
        tls = false
    }
}
```

#### 프로덕션 (EC2 환경 변수)
```bash
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
REDIS_TLS=true
```

**⚠️ 보안**: 프로덕션에서는 환경 변수나 AWS Secrets Manager를 사용하세요.

### 2.3 Redis 연결 설정 클래스 생성

#### 간단한 버전 (권장 - MVP 단계)

`apps/api/src/main/kotlin/io/vality/config/RedisConfig.kt`:

```kotlin
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
        val redisUri = RedisURI.Builder
            .redis(host, port)
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
        return RedisCoroutinesCommandsImpl(connection.async())
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
```

**참고**: 나중에 성능 최적화가 필요하면 Connection Pool 버전으로 업그레이드할 수 있습니다.

### 2.4 Koin DI 모듈에 Redis 추가

`apps/api/src/main/kotlin/io/vality/di/RedisModule.kt` 생성:

```kotlin
package io.vality.di

import com.typesafe.config.Config
import io.vality.config.RedisConfig
import org.koin.dsl.module

val redisModule = module {
    single<RedisConfig> {
        val config = get<Config>()
        
        // application.conf에서 먼저 찾고, 없으면 환경 변수 사용
        val host = config.getStringOrNull("ktor.redis.host") 
            ?: System.getenv("REDIS_HOST") 
            ?: "localhost"
            
        val port = config.getIntOrNull("ktor.redis.port") 
            ?: System.getenv("REDIS_PORT")?.toIntOrNull() 
            ?: 6379
            
        val password = config.getStringOrNull("ktor.redis.password") 
            ?: System.getenv("REDIS_PASSWORD")
            
        val useTls = config.getBooleanOrNull("ktor.redis.tls") 
            ?: System.getenv("REDIS_TLS")?.toBoolean() 
            ?: false
        
        RedisConfig(
            host = host,
            port = port,
            password = password,
            useTls = useTls
        )
    }
}

// Config 확장 함수
private fun Config.getStringOrNull(path: String): String? {
    return if (hasPath(path)) getString(path) else null
}

private fun Config.getIntOrNull(path: String): Int? {
    return if (hasPath(path)) getInt(path) else null
}

private fun Config.getBooleanOrNull(path: String): Boolean? {
    return if (hasPath(path)) getBoolean(path) else null
}
```

`apps/api/src/main/kotlin/io/vality/di/AppModule.kt`에 추가:

```kotlin
val appModule = module {
    includes(
        configModule,
        repositoryModule,
        awsModule,
        redisModule,  // 👈 추가
        serviceModule,
    )
}
```

### 2.5 Application.kt에 Redis 종료 처리 추가

`apps/api/src/main/kotlin/io/vality/plugins/RedisPlugin.kt` 생성:

```kotlin
package io.vality.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import io.ktor.server.application.pluginOrNull
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
```

`apps/api/src/main/kotlin/io/vality/Application.kt`에 추가:

```kotlin
fun Application.module() {
    val config = ConfigFactory.load()

    // Dependency Injection (Koin) - 먼저 초기화
    configureKoin()

    // Plugins
    configureSerialization()
    configureCORS(config)
    configureStatusPages()
    configureDefaultHeaders()
    configureLogging()
    configureJWT(config)
    configureRedis()  // 👈 추가

    // Database
    configureDatabase(config)

    // Routing
    configureRouting()
}
```

---

## 🧪 3. 테스트

### 3.1 간단한 Redis 연결 테스트

`apps/api/src/test/kotlin/io/vality/RedisTest.kt`:

```kotlin
package io.vality

import io.vality.config.RedisConfig
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import kotlin.test.assertNotNull

class RedisTest {
    @Test
    fun `Redis 연결 테스트`() = runBlocking {
        val redisConfig = RedisConfig(
            host = System.getenv("REDIS_HOST") ?: "localhost",
            port = (System.getenv("REDIS_PORT") ?: "6379").toInt(),
            password = System.getenv("REDIS_PASSWORD"),
            useTls = System.getenv("REDIS_TLS")?.toBoolean() ?: false
        )
        
        try {
            val commands = redisConfig.getCoroutinesCommands()
            
            // SET 테스트
            commands.set("test:key", "test:value")
            
            // GET 테스트
            val value = commands.get("test:key")
            assertNotNull(value)
            println("Redis value: $value")
            
            // DELETE
            commands.del("test:key")
            
            println("✅ Redis 연결 성공!")
        } finally {
            redisConfig.shutdown()
        }
    }
}
```

### 3.2 Health Check에 Redis 추가

기존 health check 라우트를 찾아서 Redis 상태를 추가합니다:

```kotlin
get("/health") {
    val redisConfig: RedisConfig by inject()
    
    val redisStatus = try {
        val commands = redisConfig.getCoroutinesCommands()
        commands.ping() // PING 테스트
        "healthy"
    } catch (e: Exception) {
        "unhealthy"
    }
    
    call.respond(
        mapOf(
            "status" to "ok",
            "redis" to redisStatus
        )
    )
}
```

**참고**: Health check 라우트가 없으면 새로 만들어야 합니다.

---

## 🔄 4. 로컬 개발 환경

로컬 개발에서는 **Docker Compose의 Redis**를 그대로 사용할 수 있습니다.

### 4.1 프로덕션 환경 변수

EC2나 다른 배포 환경:

```bash
# 프로덕션: Upstash Redis 사용
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
REDIS_TLS=true
```

**또는 application.conf에 추가** (보안상 환경 변수 권장):

```hocon
ktor {
    redis {
        host = ${?REDIS_HOST}
        port = ${?REDIS_PORT}
        password = ${?REDIS_PASSWORD}
        tls = ${?REDIS_TLS}
    }
}
```

---

## 📊 5. Upstash 대시보드 모니터링

Upstash 콘솔에서 다음을 확인할 수 있습니다:

1. **Metrics**: 명령어 실행 수, 메모리 사용량, 지연 시간
2. **Logs**: Redis 명령어 로그 (디버깅용)
3. **Alerts**: 임계값 초과 알림 설정

### 무료 티어 모니터링
- 일일 명령어 사용량 추적
- 10,000 명령어에 근접하면 알림 설정 권장

---

## 🔐 6. 보안 고려사항

1. **비밀번호 관리**
   - 환경 변수 또는 AWS Secrets Manager 사용
   - Git에 커밋하지 않기

2. **TLS 연결**
   - 프로덕션에서는 반드시 `REDIS_TLS=true` 설정

3. **네트워크 접근 제어**
   - Upstash는 기본적으로 IP 화이트리스트 지원
   - 필요시 EC2 IP만 허용

---

## 🚀 7. 다음 단계

Redis 연결이 완료되면, 다음 작업을 진행하세요:

1. **메일 큐 시스템 구현**
   - `EmailQueueService`: 큐에 작업 추가
   - `EmailWorkerService`: 백그라운드 워커
   - `EmailTaskRepository`: Redis 작업 저장소

2. **뉴스레터 발송 연동**
   - 이슈 발행 시 큐에 메일 작업 추가
   - 백그라운드에서 구독자에게 발송

---

## 📚 참고 자료

- [Upstash 공식 문서](https://docs.upstash.com/)
- [Lettuce 문서](https://lettuce.io/)
- [Redis 명령어 레퍼런스](https://redis.io/commands)

---

## ❓ 문제 해결

### 연결 실패
- **TLS 설정 확인**: Upstash는 TLS 필수 (`REDIS_TLS=true`)
- **포트 확인**: TLS 포트는 보통 `38899` 또는 `6379`
- **비밀번호 확인**: Upstash 콘솔에서 정확한 비밀번호 확인

### 타임아웃
- **네트워크 확인**: EC2에서 Upstash 엔드포인트 접근 가능한지 확인
- **보안 그룹**: 필요시 IP 화이트리스트 설정

### 인증 오류
- **비밀번호 재확인**: Upstash 콘솔에서 새로 생성 가능
- **문자 인코딩**: 비밀번호에 특수문자가 있으면 이스케이프 처리 확인

