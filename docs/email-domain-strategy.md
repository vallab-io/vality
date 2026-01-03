# 이메일 도메인 전략 가이드

## 🎯 추천: 서브도메인 사용

### **`mail.vality.io` 또는 `email.vality.io` 사용 권장**

## 📊 비교표

| 항목 | 루트 도메인 (vality.io) | 서브도메인 (mail.vality.io) |
|------|------------------------|----------------------------|
| **이메일 주소** | `noreply@vality.io` | `noreply@mail.vality.io` |
| **브랜딩** | ⭐⭐⭐⭐⭐ 더 깔끔 | ⭐⭐⭐⭐ 약간 길어짐 |
| **DNS 관리** | ⭐⭐ 루트와 충돌 가능 | ⭐⭐⭐⭐⭐ 완전 분리 |
| **유연성** | ⭐⭐ 제한적 | ⭐⭐⭐⭐⭐ 여러 서비스 사용 가능 |
| **보안** | ⭐⭐⭐ 보통 | ⭐⭐⭐⭐⭐ 더 안전 |
| **베스트 프랙티스** | ❌ 비추천 | ✅ 권장 |

## ✅ 서브도메인 사용의 장점

### 1. **DNS 레코드 분리**
- 루트 도메인의 DNS 레코드와 충돌 없음
- 이메일 전용 도메인으로 관리 용이
- 다른 서비스(웹사이트, API 등)와 독립적

### 2. **여러 이메일 서비스 사용 가능**
```
mail.vality.io → Resend (트랜잭션)
marketing.vality.io → 다른 서비스 (마케팅)
```
- 필요시 이메일 서비스 변경 용이
- A/B 테스트나 마이그레이션 시 유연함

### 3. **보안 및 리퍼러 정책**
- 이메일 서비스 문제 시 루트 도메인 영향 없음
- 스팸 필터링 문제 시 루트 도메인 평판 보호
- 루트 도메인은 웹사이트/API 전용으로 유지

### 4. **업계 표준**
- 대부분의 이메일 서비스가 서브도메인 사용 권장
- Gmail, Outlook 등도 서브도메인 사용
- Resend, SendGrid 등도 서브도메인 예시 제공

## 📝 추천 서브도메인

### 옵션 1: `mail.vality.io` (가장 추천)
- ✅ 직관적이고 명확함
- ✅ 짧고 기억하기 쉬움
- ✅ 업계 표준

### 옵션 2: `email.vality.io`
- ✅ 명확함
- ✅ 약간 더 길지만 이해하기 쉬움

### 옵션 3: `send.vality.io`
- ✅ 간결함
- ✅ Resend 같은 서비스와 어울림

## 🔧 Resend 도메인 추가 방법

### 1. Resend Dashboard에서 도메인 추가
```
Settings → Domains → Add Domain
→ mail.vality.io 입력
```

### 2. DNS 레코드 추가
Resend가 제공하는 DNS 레코드를 도메인 관리자에 추가:

**예시 DNS 레코드:**
```
Type: TXT
Name: _resend
Value: [Resend가 제공하는 값]

Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: CNAME
Name: [Resend가 제공하는 이름]
Value: [Resend가 제공하는 값]
```

### 3. 도메인 인증 확인
- Resend Dashboard에서 인증 상태 확인
- 보통 몇 분~몇 시간 소요

## 💻 코드 변경사항

### 현재 코드
```kotlin
fromEmail = "${job.username}@vality.io"
```

### 변경 후
```kotlin
fromEmail = "${job.username}@mail.vality.io"
// 또는
fromEmail = "noreply@mail.vality.io"
```

### 환경 변수
```bash
# .env 또는 application.conf
EMAIL_FROM=noreply@mail.vality.io
EMAIL_FROM_NAME=Vality
```

## 🎨 사용자 경험 고려사항

### 이메일 주소 예시

**서브도메인 사용:**
- `noreply@mail.vality.io` - 트랜잭션 이메일
- `hello@mail.vality.io` - 뉴스레터 발행 알림
- `support@vality.io` - 고객 지원 (루트 도메인 사용 가능)

**장점:**
- 사용자가 보낸 사람을 보고 "Vality에서 온 이메일"임을 인지
- 서브도메인이 있어도 브랜드 인지도에 영향 없음

## ⚠️ 루트 도메인 사용 시 주의사항

만약 `vality.io`를 사용한다면:

1. **DNS 레코드 충돌 가능**
   - 웹사이트, API 등과 DNS 레코드 충돌 가능
   - SPF 레코드가 복잡해질 수 있음

2. **이메일 서비스 변경 시 어려움**
   - 다른 서비스로 마이그레이션 시 DNS 레코드 변경 필요
   - 루트 도메인 레코드 변경은 위험할 수 있음

3. **보안 위험**
   - 이메일 서비스 문제가 루트 도메인에 영향
   - 스팸 필터링 문제 시 전체 도메인 평판 영향

## 🎯 최종 추천

### **`mail.vality.io` 사용을 강력히 권장합니다**

**이유:**
1. ✅ 업계 베스트 프랙티스
2. ✅ DNS 관리 용이
3. ✅ 유연성과 확장성
4. ✅ 보안 및 안정성
5. ✅ 브랜딩에도 문제 없음

**실제 사용 예시:**
- 인증 코드: `noreply@mail.vality.io`
- 구독 확인: `noreply@mail.vality.io`
- 뉴스레터 발행: `hello@mail.vality.io` 또는 `noreply@mail.vality.io`

## 📚 참고

- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
- [SPF Record Best Practices](https://www.dmarcanalyzer.com/spf-record-best-practices/)
- [Email Domain Strategy](https://www.postmarkapp.com/guides/email-domain-setup)

