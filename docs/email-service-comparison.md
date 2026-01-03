# 이메일 서비스 비교 및 선택 가이드

AWS SES Sandbox 승인을 받지 못한 경우를 위한 대안 서비스 비교입니다.

## 📊 서비스 비교표

| 서비스 | 무료 티어 | 가격 (유료) | 장점 | 단점 | 추천도 |
|--------|----------|------------|------|------|--------|
| **Resend** | 3,000/월 | $20/월 (50,000) | • 최신 서비스, 개발자 친화적<br>• API 간단<br>• React Email 지원<br>• 웹훅 지원 | • 비교적 신규 서비스<br>• 한국어 문서 부족 | ⭐⭐⭐⭐⭐ |
| **Mailgun** | 5,000/월 (3개월) | $35/월 (50,000) | • 개발자 친화적<br>• 좋은 API<br>• 상세한 분석<br>• 웹훅 지원 | • 무료 티어 제한적<br>• 가격이 비쌈 | ⭐⭐⭐⭐ |
| **SendGrid** | 100/일 | $19.95/월 (50,000) | • 대규모 서비스<br>• 기능 다양<br>• 마케팅 도구 포함 | • API 복잡<br>• 설정 복잡<br>• 무료 티어 제한적 | ⭐⭐⭐ |
| **Postmark** | 100/월 | $15/월 (10,000) | • 높은 deliverability<br>• 트랜잭션 특화<br>• 빠른 발송 | • 무료 티어 매우 제한적<br>• 마케팅 이메일 별도 서비스 필요 | ⭐⭐⭐ |

## 🎯 뉴스레터 플랫폼에 적합한 서비스

### 1. **Resend** (최고 추천) ⭐⭐⭐⭐⭐

**추천 이유:**
- ✅ 무료 티어가 충분함 (3,000/월)
- ✅ API가 매우 간단하고 직관적
- ✅ Kotlin/Ktor와 통합이 쉬움
- ✅ 웹훅 지원 (이메일 이벤트 추적)
- ✅ 최신 서비스로 지속적인 업데이트
- ✅ React Email 템플릿 지원 (프론트엔드 연동 시 유용)

**가격:**
- 무료: 3,000 이메일/월
- Pro: $20/월 (50,000 이메일)
- 추가: $0.30/1,000 이메일

**통합 난이도:** ⭐⭐ (매우 쉬움)

---

### 2. **Mailgun** (차선책) ⭐⭐⭐⭐

**추천 이유:**
- ✅ 무료 티어가 좋음 (5,000/월, 3개월)
- ✅ 개발자 친화적인 API
- ✅ 상세한 이메일 분석 및 로그
- ✅ 웹훅 지원
- ✅ 오래된 서비스로 안정적

**단점:**
- ❌ 무료 티어는 3개월만 제공
- ❌ 가격이 Resend보다 비쌈

**가격:**
- 무료: 5,000 이메일/월 (첫 3개월)
- Foundation: $35/월 (50,000 이메일)
- 추가: $0.80/1,000 이메일

**통합 난이도:** ⭐⭐⭐ (보통)

---

### 3. **SendGrid** ⭐⭐⭐

**추천 이유:**
- ✅ 대규모 서비스로 안정적
- ✅ 다양한 기능 (마케팅 자동화 등)
- ✅ 무료 티어 제공

**단점:**
- ❌ API가 복잡함
- ❌ 무료 티어가 매우 제한적 (100/일)
- ❌ 설정이 복잡함

**가격:**
- 무료: 100 이메일/일
- Essentials: $19.95/월 (50,000 이메일)
- 추가: $0.60/1,000 이메일

**통합 난이도:** ⭐⭐⭐⭐ (복잡)

---

### 4. **Postmark** ⭐⭐⭐

**추천 이유:**
- ✅ 매우 높은 deliverability
- ✅ 트랜잭션 이메일에 특화
- ✅ 빠른 발송 속도

**단점:**
- ❌ 무료 티어가 매우 제한적 (100/월)
- ❌ 마케팅 이메일은 별도 서비스 필요
- ❌ 뉴스레터 발행에는 부적합

**가격:**
- 무료: 100 이메일/월
- 10K: $15/월 (10,000 이메일)
- 추가: $1.25/1,000 이메일

**통합 난이도:** ⭐⭐⭐ (보통)

---

## 💡 최종 추천

### **Resend를 추천하는 이유:**

1. **무료 티어가 충분함**
   - 3,000 이메일/월은 MVP 단계에서 충분
   - 인증 코드, 구독 확인, 뉴스레터 발행 모두 커버 가능

2. **통합이 가장 쉬움**
   - REST API가 간단하고 직관적
   - Kotlin/Ktor에서 HTTP 클라이언트로 쉽게 통합
   - AWS SES와 유사한 구조로 마이그레이션 쉬움

3. **개발자 경험**
   - 깔끔한 문서
   - 빠른 응답 속도
   - 웹훅으로 이메일 이벤트 추적 가능

4. **확장성**
   - 유료 플랜도 합리적 ($20/월)
   - 대량 발송도 문제없음

---

## 🔧 통합 방법

### Resend 통합 예시

**1. build.gradle.kts에 의존성 추가 (필요 없음 - Ktor HTTP Client 사용)**

**2. EmailService 구현**

```kotlin
class EmailService(
    private val apiKey: String,
    private val defaultFromEmail: String,
    private val defaultFromName: String,
) {
    private val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json()
        }
    }
    
    suspend fun sendEmail(
        to: String,
        subject: String,
        htmlBody: String,
        textBody: String? = null,
        fromEmail: String = defaultFromEmail,
        fromName: String = defaultFromName,
    ): String {
        val response = httpClient.post("https://api.resend.com/emails") {
            header("Authorization", "Bearer $apiKey")
            contentType(ContentType.Application.Json)
            setBody(
                mapOf(
                    "from" to "$fromName <$fromEmail>",
                    "to" to listOf(to),
                    "subject" to subject,
                    "html" to htmlBody,
                    "text" to textBody
                )
            )
        }
        
        val result = response.body<Map<String, Any>>()
        return result["id"] as String
    }
}
```

**3. 환경 변수 설정**

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@vality.io
EMAIL_FROM_NAME=Vality
```

---

## 📝 마이그레이션 체크리스트

- [ ] Resend 계정 생성 및 도메인 인증
- [ ] API Key 발급
- [ ] EmailService 구현 변경
- [ ] 환경 변수 업데이트
- [ ] 테스트 이메일 발송 확인
- [ ] 기존 AWS SES 코드 제거
- [ ] build.gradle.kts에서 AWS SDK 제거 (선택)

---

## 🔗 참고 링크

- [Resend 공식 문서](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Mailgun 문서](https://documentation.mailgun.com/)
- [SendGrid 문서](https://docs.sendgrid.com/)
- [Postmark 문서](https://postmarkapp.com/developer)

