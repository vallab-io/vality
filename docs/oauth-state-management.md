# OAuth2 State 관리 가이드

OAuth2 인증 플로우에서 CSRF 공격을 방지하기 위한 `state` 파라미터 관리 방법입니다.

## 프로덕션 환경 권장 방법

### 1. Redis 기반 저장소 (권장) ⭐

**장점:**
- ✅ 서버 재시작 후에도 state 유지
- ✅ 분산 환경에서 여러 서버 인스턴스 간 공유 가능
- ✅ TTL 자동 만료로 메모리 관리 불필요
- ✅ 높은 성능 (인메모리 캐시)

**단점:**
- ❌ Redis 서버 필요 (추가 인프라)
- ❌ Redis 장애 시 OAuth 플로우 중단

**사용 시나리오:**
- 여러 서버 인스턴스 실행 (로드 밸런싱)
- 서버 재시작 후에도 OAuth 플로우 유지 필요
- 높은 트래픽 처리

**구현 방법:**

1. **의존성 추가** (`build.gradle.kts`):
```kotlin
implementation("io.lettuce:lettuce-core:6.3.2.RELEASE")
```

2. **Redis 클라이언트 초기화**:
```kotlin
val redisClient = RedisClient.create("redis://localhost:6379")
val redisConnection = redisClient.connect()
val redisCommands = redisConnection.sync()
```

3. **OAuthStateStore 설정**:
```kotlin
val redisStore = RedisOAuthStateStore(redisCommands)
OAuthStateStore.useRedisStore(redisStore)
```

---

### 2. 서명된 쿠키 기반 저장소

**장점:**
- ✅ Redis 같은 외부 의존성 불필요
- ✅ 서버 확장 시 문제 없음 (stateless)
- ✅ 구현이 간단
- ✅ 서버 재시작과 무관

**단점:**
- ❌ 쿠키 크기 제한 (4KB)
- ❌ 쿠키가 클라이언트에 노출됨 (서명으로 보호)
- ❌ 쿠키가 비활성화된 경우 작동 안 함

**사용 시나리오:**
- 단일 서버 또는 stateless 아키텍처
- 외부 의존성 최소화
- 간단한 구현 선호

**구현 방법:**

1. **서명 키 설정** (환경 변수):
```env
OAUTH_STATE_SECRET=your-secret-key-here
```

2. **OAuthStateStore 설정**:
```kotlin
val secretKey = System.getenv("OAUTH_STATE_SECRET")
val signedCookieStore = SignedCookieOAuthStateStore(secretKey)
OAuthStateStore.useSignedCookieStore(signedCookieStore)
```

---

### 3. 데이터베이스 기반 저장소

**장점:**
- ✅ 영구 저장 (서버 재시작 후에도 유지)
- ✅ 기존 DB 인프라 활용
- ✅ 감사 로그 가능

**단점:**
- ❌ DB 부하 증가
- ❌ 성능이 Redis보다 낮음
- ❌ 만료된 데이터 정리 필요

**사용 시나리오:**
- Redis 인프라 구축이 어려운 경우
- OAuth 플로우 감사 로그 필요
- 낮은 트래픽

---

## 개발 환경

개발 환경에서는 **메모리 기반 저장소** (`InMemoryOAuthStateStore`)를 사용합니다.

**특징:**
- 서버 재시작 시 state 손실 (개발 환경에서는 문제 없음)
- Redis 같은 외부 의존성 불필요
- 빠른 개발 및 테스트

---

## 보안 고려사항

### 1. State 생성
- **랜덤 UUID 사용**: 예측 불가능한 값 생성
- **충분한 길이**: 최소 32자 이상 권장

### 2. State 검증
- **일회용**: 검증 후 즉시 삭제
- **만료 시간**: 10분 이내 권장
- **타이밍 공격 방지**: 검증 실패 시에도 일정한 시간 소요

### 3. 쿠키 사용 시
- **HttpOnly**: JavaScript 접근 차단 (XSS 방지)
- **Secure**: HTTPS에서만 전송
- **SameSite**: CSRF 방지 (Lax 또는 Strict)

---

## 마이그레이션 가이드

### 개발 → 프로덕션 (Redis)

1. Redis 서버 설정
2. `build.gradle.kts`에 Lettuce 의존성 추가
3. `Application.kt`에서 Redis 클라이언트 초기화
4. `OAuthStateStore.useRedisStore()` 호출

### 개발 → 프로덕션 (서명된 쿠키)

1. 환경 변수에 `OAUTH_STATE_SECRET` 설정
2. `OAuthStateStore.useSignedCookieStore()` 호출

---

## 참고 자료

- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Google OAuth2 Best Practices](https://developers.google.com/identity/protocols/oauth2/resources/best-practices)
- [OWASP OAuth 2.0 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)

