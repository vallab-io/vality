# Vality Ktor API

뉴스레터 + 웹 아카이빙 플랫폼 백엔드 API 서버 (Ktor + Kotlin Coroutines)

## 기술 스택

- **Ktor 2.3.12** - Kotlin 네이티브 비동기 웹 프레임워크
- **Kotlin 2.0.21** - 최신 Kotlin
- **Kotlin Coroutines** - 비동기 프로그래밍
- **Exposed** - Kotlin ORM (JetBrains)
- **PostgreSQL** - 데이터베이스
- **HikariCP** - JDBC Connection Pool
- **Kotlinx Serialization** - JSON 직렬화
- **JWT** - 인증
- **Gradle (Kotlin DSL)** - 빌드 도구
- **ULID** - ID 생성

## 시작하기

### 1. 필수 요구사항

- Java 21+
- Gradle 8.10+
- PostgreSQL 15+

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env` 파일을 열어서 필요한 값들을 설정하세요.

**중요**: `DATABASE_URL`은 JDBC 형식이어야 합니다:
```
DATABASE_URL=jdbc:postgresql://localhost:5432/vality_db
```

### 3. 데이터베이스 실행 (Docker)

프로젝트 루트에서:

```bash
docker-compose up -d
```

### 4. 데이터베이스 마이그레이션 (Flyway)

**프로덕션 환경에서는 앱 실행 전에 마이그레이션을 실행해야 합니다:**

```bash
# 마이그레이션 실행
./gradlew flywayMigrate

# 마이그레이션 정보 확인
./gradlew flywayInfo
```

**개발 환경에서는 자동 실행:**
`application.conf`에서 `ktor.flyway.runMigration = true`로 설정하면 앱 실행 시 자동으로 마이그레이션됩니다.

### 5. 애플리케이션 실행

```bash
# Gradle Wrapper를 통한 실행
./gradlew run

# 또는 개발 모드 (자동 재시작)
./gradlew run --continuous
```

서버가 실행되면:
- API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health
- API 문서 (Swagger UI): http://localhost:4000/api/docs
- OpenAPI JSON: http://localhost:4000/api/docs/openapi.json

## 프로젝트 구조

```
src/main/kotlin/io/vality/
├── Application.kt              # 메인 애플리케이션 진입점
├── plugins/                    # Ktor 플러그인
│   ├── SerializationPlugin.kt
│   ├── CORSPlugin.kt
│   ├── StatusPagesPlugin.kt
│   ├── DefaultHeadersPlugin.kt
│   ├── LoggingPlugin.kt
│   ├── DatabasePlugin.kt
│   └── OpenAPIPlugin.kt         # OpenAPI 스펙 생성
├── routing/                    # 라우팅
│   ├── Routing.kt
│   └── health/
│       └── healthRoutes.kt
├── domain/                     # 도메인 모델
│   ├── Tables.kt               # Exposed Table 정의
│   ├── User.kt
│   ├── Newsletter.kt
│   ├── Issue.kt
│   └── Subscriber.kt
├── repository/                 # 데이터베이스 접근
│   ├── UserRepository.kt
│   └── NewsletterRepository.kt
├── service/                    # 비즈니스 로직 (추후 추가)
│   └── ...
└── dto/                        # 데이터 전송 객체
    └── ApiResponse.kt
```

## 주요 특징

### 1. Kotlin 네이티브
- Kotlin으로 작성된 비동기 웹 프레임워크
- Coroutines 완벽 지원
- 타입 안전성

### 2. Exposed ORM
- Kotlin DSL 기반 쿼리 작성
- 타입 안전한 데이터베이스 접근
- Coroutines와 완벽 통합
- HikariCP를 통한 Connection Pool 관리

### 3. 간결한 코드
- DSL 기반 라우팅
- 플러그인 시스템
- 함수형 스타일

## API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:4000/api/docs
- **OpenAPI JSON**: http://localhost:4000/api/docs/openapi.json

### Swagger UI 사용법

1. 브라우저에서 `http://localhost:4000/api/docs` 접속
2. 각 API 엔드포인트의 상세 정보 확인
3. "Try it out" 버튼을 클릭하여 API 테스트
4. JWT 인증이 필요한 API의 경우, 우측 상단의 "Authorize" 버튼을 클릭하여 토큰 입력

### OpenAPI JSON 다운로드

OpenAPI JSON 파일을 다운로드하여 다른 도구에서 사용할 수 있습니다:

```bash
curl http://localhost:4000/api/docs/openapi.json > openapi.json
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `./gradlew run` | 개발 서버 실행 |
| `./gradlew build` | 프로덕션 빌드 |
| `./gradlew test` | 테스트 실행 |
| `./gradlew clean` | 빌드 파일 정리 |
| `./gradlew flywayMigrate` | Flyway 마이그레이션 실행 (프로덕션용) |
| `./gradlew flywayInfo` | Flyway 마이그레이션 정보 확인 |

## 설정

### application.conf

Ktor는 `application.conf` 파일을 통해 설정을 관리합니다:

```hocon
ktor {
    deployment {
        port = 4000
        host = "0.0.0.0"
    }
    
    database {
        url = "r2dbc:postgresql://localhost:5432/vality_db"
        username = "vality"
        password = "vality_password"
    }
}
```

### 환경 변수

환경 변수는 `application.conf`에서 `${?VARIABLE_NAME}` 형식으로 참조할 수 있습니다:

```hocon
ktor {
    deployment {
        port = ${?PORT}
        port = 4000
    }
}
```

## 라우팅 예시

```kotlin
fun Route.userRoutes() {
    route("/api/users") {
        get {
            // GET /api/users
            call.respond(users)
        }
        
        get("/{id}") {
            // GET /api/users/{id}
            val id = call.parameters["id"] ?: return@get call.respond(
                HttpStatusCode.BadRequest
            )
            val user = userService.findById(id)
            call.respond(user)
        }
        
        post {
            // POST /api/users
            val request = call.receive<CreateUserRequest>()
            val user = userService.create(request)
            call.respond(HttpStatusCode.Created, user)
        }
    }
}
```

## Coroutines 사용

모든 핸들러는 자동으로 Coroutines 컨텍스트에서 실행됩니다:

```kotlin
get("/async") {
    val data = async {
        // 비동기 작업
        fetchData()
    }
    call.respond(data.await())
}
```

## 데이터베이스 연결

Exposed를 사용하여 타입 안전한 데이터베이스 접근:

```kotlin
// DatabasePlugin.kt에서 HikariCP 설정
val dataSource = HikariDataSource(poolConfig)
Database.connect(dataSource)

// Repository에서 사용
suspend fun findById(id: String): User? = dbQuery {
    Users.select { Users.id eq id }
        .map { it.toUser() }
        .singleOrNull()
}
```

### Exposed 쿼리 예시

```kotlin
// 조회
suspend fun findByEmail(email: String): User? = dbQuery {
    Users.select { Users.email eq email }
        .map { it.toUser() }
        .singleOrNull()
}

// 생성
suspend fun create(user: User): User = dbQuery {
    Users.insert {
        it[id] = user.id
        it[email] = user.email
        it[username] = user.username
    }
    user
}

// 업데이트
suspend fun update(user: User): User = dbQuery {
    Users.update({ Users.id eq user.id }) {
        it[email] = user.email
        it[updatedAt] = Instant.now()
    }
    user
}

// 삭제
suspend fun delete(id: String): Boolean = dbQuery {
    Users.deleteWhere { Users.id eq id } > 0
}
```

## 다음 단계

- [ ] 도메인 모델 정의 (User, Newsletter, Issue 등)
- [ ] Repository 구현
- [ ] Service 레이어 구현
- [ ] 인증/인가 (JWT)
- [ ] 사용자 관리 API
- [ ] 뉴스레터 관리 API
- [ ] 이슈 관리 API
- [ ] 구독자 관리 API
- [ ] 이메일 발송 기능
- [ ] 파일 업로드 (S3)

## Ktor vs Spring Boot

| 특징 | Ktor | Spring Boot |
|------|------|-------------|
| 언어 | Kotlin 네이티브 | Java/Kotlin |
| 프레임워크 크기 | 경량 | 무거움 |
| 설정 | 최소한 | 많은 설정 |
| 학습 곡선 | 낮음 | 높음 |
| Coroutines 지원 | 완벽 | 제한적 |
| 성능 | 높음 | 높음 |

## 참고 자료

- [Ktor 공식 문서](https://ktor.io/docs/)
- [Kotlin Coroutines 가이드](https://kotlinlang.org/docs/coroutines-guide.html)
- [R2DBC 문서](https://r2dbc.io/)

