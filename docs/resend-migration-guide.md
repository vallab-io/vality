# AWS SES → Resend 마이그레이션 가이드

## ✅ 마이그레이션 완료

AWS SES에서 Resend로 마이그레이션이 완료되었습니다.

## 📝 변경 사항

### 1. EmailService 변경
- **이전**: AWS SES SDK 사용 (`SesClient`)
- **이후**: Resend REST API 사용 (Ktor HTTP Client)

### 2. 의존성 변경
- **제거**: `software.amazon.awssdk:ses:2.17.106`
- **추가**: Ktor HTTP Client (이미 포함되어 있음)

### 3. 설정 변경
- **이전**: `ktor.aws.ses.*`
- **이후**: `ktor.resend.*`

## 🔧 환경 변수 설정

### application.conf 또는 환경 변수

```hocon
ktor {
    resend {
        # Resend API Key
        apiKey = "re_xxxxxxxxxxxxx"
        
        # 발신자 이메일 주소
        fromEmail = "noreply@mail.vality.io"
        
        # 발신자 이름
        fromName = "Vality"
    }
}
```

### 환경 변수로 설정 (권장)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@mail.vality.io
RESEND_FROM_NAME=Vality
```

## 🚀 Resend 설정 단계

### 1. Resend 계정 생성
1. [Resend 가입](https://resend.com/signup)
2. API Key 생성: Settings → API Keys → Create API Key

### 2. 도메인 추가 및 인증
1. Settings → Domains → Add Domain
2. `mail.vality.io` 입력 (또는 원하는 서브도메인)
3. DNS 레코드 추가:
   - SPF 레코드
   - DKIM 레코드
   - DMARC 레코드 (선택)
4. 인증 완료 대기 (보통 몇 분~몇 시간)

### 3. Custom Return-Path 설정 (선택)
- 기본값 "send" 사용 권장
- 또는 원하는 이름으로 변경 가능

## 📋 체크리스트

- [ ] Resend 계정 생성
- [ ] API Key 발급
- [ ] 도메인 추가 및 DNS 레코드 설정
- [ ] 도메인 인증 완료 확인
- [ ] `application.conf` 또는 환경 변수 설정
- [ ] 테스트 이메일 발송 확인

## 🧪 테스트

### 테스트 이메일 발송

```kotlin
// 테스트 라우트 사용 (개발 환경)
POST /api/test/email
{
  "to": "test@example.com",
  "subject": "Test Email",
  "htmlBody": "<h1>Hello from Resend!</h1>"
}
```

### 실제 이메일 발송 확인
1. 인증 코드 이메일
2. 구독 확인 이메일
3. 뉴스레터 발행 알림 이메일

## 🔄 주요 변경 사항 상세

### EmailService 인터페이스
- **변경 없음**: `sendEmail()`, `sendBulkEmail()` 메서드 시그니처 동일
- **내부 구현만 변경**: AWS SES → Resend API

### 에러 처리
- 동일한 `EmailServiceException` 사용
- 에러 메시지 및 로깅 방식 동일

### 대량 발송
- **이전**: SES는 한 번에 최대 50명
- **이후**: Resend도 한 번에 최대 50명
- 배치 처리 로직 동일

## ⚠️ 주의사항

### 1. 도메인 인증 필수
- 도메인 인증 완료 전까지는 이메일 발송 불가
- 인증 완료까지 몇 분~몇 시간 소요 가능

### 2. Rate Limit
- Resend 무료 플랜: 초당 10개 요청
- Pro 플랜: 더 높은 제한
- 대량 발송 시 배치 처리로 충분히 처리 가능

### 3. API Key 보안
- API Key를 환경 변수로 관리
- Git에 커밋하지 않도록 주의
- `.gitignore`에 `.env` 파일 추가 확인

## 📊 성능 비교

| 항목 | AWS SES | Resend |
|------|---------|--------|
| 발송 속도 | 1-2초 | 1-2초 |
| 대량 발송 | 50명/배치 | 50명/배치 |
| 무료 티어 | Sandbox 제한 | 3,000/월 |
| API 복잡도 | 중간 | 낮음 |

## 🔗 참고 링크

- [Resend 공식 문서](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)

## 🆘 문제 해결

### 이메일 발송 실패
1. 도메인 인증 상태 확인
2. API Key 유효성 확인
3. 발신자 이메일 주소 확인 (인증된 도메인 사용)
4. Resend Dashboard에서 로그 확인

### 인증 실패
1. DNS 레코드가 올바르게 추가되었는지 확인
2. DNS 전파 대기 (최대 48시간)
3. Resend Dashboard에서 인증 상태 확인

## ✨ 다음 단계

1. **웹훅 설정** (선택)
   - 이메일 이벤트 추적
   - 반송 처리 자동화
   - 열람/클릭 추적

2. **모니터링**
   - Resend Dashboard에서 발송 통계 확인
   - 반송률 모니터링
   - 구독자 목록 정리

