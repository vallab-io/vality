# Ktor 테스트 작성 가이드

## 개요

Ktor는 `testApplication` DSL을 제공하여 애플리케이션을 테스트할 수 있습니다.

## 기본 설정

### 의존성

`build.gradle.kts`에 이미 포함되어 있습니다:

```kotlin
testImplementation("io.ktor:ktor-server-tests-jvm")
testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
testRuntimeOnly("org.junit.platform:junit-platform-launcher")
```

## 기본 테스트 구조

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.vality.Application
import kotlin.test.*

class MyRouteTest {
    @Test
    fun testMyRoute() = testApplication {
        // Application 모듈 설정
        application {
            Application.module()
        }
        
        // HTTP 요청 테스트
        val response = client.get("/my-route")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
```

## 주요 테스트 패턴

### 1. GET 요청 테스트

```kotlin
@Test
fun testGetRequest() = testApplication {
    application {
        Application.module()
    }
    
    val response = client.get("/api/endpoint")
    assertEquals(HttpStatusCode.OK, response.status)
}
```

### 2. POST 요청 테스트

```kotlin
@Test
fun testPostRequest() = testApplication {
    application {
        Application.module()
    }
    
    val response = client.post("/api/endpoint") {
        contentType(ContentType.Application.Json)
        setBody("""
            {
                "key": "value"
            }
        """.trimIndent())
    }
    
    assertEquals(HttpStatusCode.Created, response.status)
}
```

### 3. 인증 헤더 포함 테스트

```kotlin
@Test
fun testAuthenticatedRequest() = testApplication {
    application {
        Application.module()
    }
    
    val token = "your-jwt-token"
    val response = client.get("/api/protected") {
        header(HttpHeaders.Authorization, "Bearer $token")
    }
    
    assertEquals(HttpStatusCode.OK, response.status)
}
```

### 4. 응답 본문 검증

```kotlin
@Test
fun testResponseBody() = testApplication {
    application {
        Application.module()
    }
    
    val response = client.get("/api/endpoint")
    val body = response.bodyAsText()
    
    assertTrue(body.contains("expected-content"))
}
```

### 5. JSON 응답 파싱

```kotlin
import kotlinx.serialization.json.*

@Test
fun testJsonResponse() = testApplication {
    application {
        Application.module()
    }
    
    val response = client.get("/api/endpoint")
    val json = Json.parseToJsonElement(response.bodyAsText())
    
    assertEquals("expected-value", json.jsonObject["key"]?.jsonPrimitive?.content)
}
```

### 6. 에러 응답 테스트

```kotlin
@Test
fun testErrorResponse() = testApplication {
    application {
        Application.module()
    }
    
    val response = client.get("/api/invalid-endpoint")
    assertEquals(HttpStatusCode.NotFound, response.status)
}
```

### 7. 인증 없이 접근 시 401 테스트

```kotlin
@Test
fun testUnauthorizedAccess() = testApplication {
    application {
        Application.module()
    }
    
    val response = client.get("/api/protected-endpoint")
    assertEquals(HttpStatusCode.Unauthorized, response.status)
}
```

## 테스트 모듈 분리

실제 데이터베이스나 외부 서비스에 의존하지 않는 테스트를 위해 테스트용 모듈을 만들 수 있습니다:

```kotlin
fun Application.testModule() {
    // 테스트용 설정
    configureKoin()
    configureSerialization()
    configureRouting()
    // 데이터베이스는 모킹하거나 인메모리 DB 사용
}

@Test
fun testWithMockModule() = testApplication {
    application {
        testModule()
    }
    
    // 테스트 코드
}
```

## 실제 사용 예시

### Newsletter Routes 테스트

```kotlin
class NewsletterRoutesTest {
    @Test
    fun `인증 없이 뉴스레터 목록 조회 시 401 반환`() = testApplication {
        application {
            Application.module()
        }
        
        client.get("/api/newsletters").apply {
            assertEquals(HttpStatusCode.Unauthorized, status)
        }
    }
    
    @Test
    fun `뉴스레터 생성 시 slug 검증`() = testApplication {
        application {
            Application.module()
        }
        
        val response = client.post("/api/newsletters") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "name": "Test",
                    "slug": "INVALID_SLUG"
                }
            """.trimIndent())
        }
        
        assertEquals(HttpStatusCode.BadRequest, response.status)
    }
}
```

## 팁

1. **테스트 격리**: 각 테스트는 독립적으로 실행되어야 합니다.
2. **모킹**: 외부 의존성(DB, 외부 API)은 모킹하거나 테스트용 인스턴스를 사용하세요.
3. **테스트 데이터**: 테스트용 데이터는 테스트 전에 생성하고 후에 정리하세요.
4. **코루틴**: 비동기 코드는 `runTest` 블록을 사용하세요.

## 참고 자료

- [Ktor Testing Documentation](https://ktor.io/docs/testing.html)
- [Kotlin Test Documentation](https://kotlinlang.org/api/latest/kotlin.test/)

