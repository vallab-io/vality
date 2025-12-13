package io.vality.service.oauth

import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * OAuth2 State 저장소 인터페이스
 */
interface OAuthStateRepository {
    fun storeState(state: String, redirectUri: String)
    fun validateState(state: String): String?
}

/**
 * OAuth2 State 저장소 (메모리 기반 - 개발 환경용)
 * CSRF 방지를 위한 state와 redirectUri를 임시 저장
 */
class InMemoryOAuthStateStore : OAuthStateRepository {
    private val stateMap = ConcurrentHashMap<String, StateData>()
    private val executor = Executors.newScheduledThreadPool(1)

    init {
        // 10분마다 만료된 state 정리
        executor.scheduleAtFixedRate({
            val now = System.currentTimeMillis()
            stateMap.entries.removeIf { (_, data) -> data.expiresAt < now }
        }, 10, 10, TimeUnit.MINUTES)
    }

    override fun storeState(state: String, redirectUri: String) {
        stateMap[state] = StateData(
            redirectUri = redirectUri,
            expiresAt = System.currentTimeMillis() + 600_000, // 10분
        )
    }

    override fun validateState(state: String): String? {
        val data = stateMap.remove(state) ?: return null

        if (data.expiresAt < System.currentTimeMillis()) {
            return null
        }

        return data.redirectUri
    }

    private data class StateData(
        val redirectUri: String,
        val expiresAt: Long,
    )
}

/**
 * OAuth2 State 저장소 (Redis 기반 - 프로덕션 환경용)
 *
 * 사용 방법:
 * 1. build.gradle.kts에 다음 의존성 추가:
 *    implementation("io.lettuce:lettuce-core:6.3.2.RELEASE")
 *
 * 2. Redis 클라이언트 초기화:
 *    val redisClient = RedisClient.create("redis://localhost:6379")
 *    val redisConnection = redisClient.connect()
 *    val redisCommands = redisConnection.sync()
 *
 * 3. OAuthStateStore 초기화:
 *    OAuthStateStore = RedisOAuthStateStore(redisCommands)
 *
 * 장점:
 * - 서버 재시작 후에도 state 유지
 * - 분산 환경에서 여러 서버 인스턴스 간 공유 가능
 * - TTL 자동 만료로 메모리 관리 불필요
 * - 높은 성능 (인메모리 캐시)
 *//*
class RedisOAuthStateStore(
    private val redisCommands: RedisCommands<String, String>
) : OAuthStateRepository {
    companion object {
        private const val KEY_PREFIX = "oauth:state:"
        private const val TTL_SECONDS = 600L // 10분
    }

    override fun storeStateWithRedirectUri(state: String, redirectUri: String) {
        val key = "$KEY_PREFIX$state"
        redisCommands.setex(key, TTL_SECONDS, redirectUri)
    }

    override fun validateStateAndGetRedirectUri(state: String): String? {
        val key = "$KEY_PREFIX$state"
        val redirectUri = redisCommands.get(key)
        
        if (redirectUri != null) {
            // 사용 후 즉시 삭제 (일회용)
            redisCommands.del(key)
        }
        
        return redirectUri
    }
}
*/

/**
 * OAuth2 State 저장소 (서명된 쿠키 기반 - 단순한 프로덕션 환경용)
 *
 * 장점:
 * - Redis 같은 외부 의존성 불필요
 * - 서버 확장 시 문제 없음 (stateless)
 * - 구현이 간단
 *
 * 단점:
 * - 쿠키 크기 제한 (4KB)
 * - 쿠키가 클라이언트에 노출됨 (서명으로 보호)
 *
 * 구현 예시:
 * 1. HMAC-SHA256으로 state와 redirectUri를 서명
 * 2. 쿠키에 state와 서명을 함께 저장
 * 3. 검증 시 서명을 확인하여 무결성 검증
 *//*
class SignedCookieOAuthStateStore(
    private val secretKey: String // 환경 변수에서 가져오기
) : OAuthStateRepository {
    private val hmac = Mac.getInstance("HmacSHA256")
    
    init {
        val keySpec = SecretKeySpec(secretKey.toByteArray(), "HmacSHA256")
        hmac.init(keySpec)
    }

    override fun storeStateWithRedirectUri(state: String, redirectUri: String) {
        // 실제로는 쿠키에 저장하는 로직이 필요
        // 여기서는 서명 생성만 예시
        val data = "$state|$redirectUri"
        val signature = hmac.doFinal(data.toByteArray())
        // Base64 인코딩하여 쿠키에 저장
    }

    override fun validateStateAndGetRedirectUri(state: String): String? {
        // 쿠키에서 서명을 읽어 검증
        // 서명이 유효하면 redirectUri 반환
        return null
    }
}
*/

/**
 * 기본 OAuthStateStore 인스턴스
 */
object OAuthStateStore {
    private var repository: OAuthStateRepository = InMemoryOAuthStateStore()

    fun storeState(state: String, redirectUri: String) {
        repository.storeState(state, redirectUri)
    }

    fun validateState(state: String): String? = repository.validateState(state)
}
