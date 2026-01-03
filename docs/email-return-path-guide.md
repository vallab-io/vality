# Custom Return-Path 가이드

## 🔍 Return-Path란?

**Return-Path**는 이메일이 반송(bounce)되거나 전달 실패 시 돌아올 주소를 지정하는 이메일 헤더입니다.

### 기본 개념

```
발신자: noreply@mail.vality.io
Return-Path: bounce@mail.vality.io (또는 다른 주소)
```

- **발신자(From)**: 사용자가 보는 "보낸 사람" 주소
- **Return-Path**: 시스템이 사용하는 반송 주소 (일반적으로 보이지 않음)

## 📧 Return-Path의 역할

### 1. **반송 처리 (Bounce Handling)**
```
이메일 전달 실패 시:
→ Return-Path 주소로 반송 알림 수신
→ 시스템이 자동으로 처리
```

### 2. **스팸 필터링 개선**
- 올바른 Return-Path 설정은 이메일 신뢰도 향상
- SPF, DKIM, DMARC 인증과 함께 작동

### 3. **분석 및 추적**
- 반송률 추적
- 전달 실패 원인 분석
- 구독자 목록 정리 (유효하지 않은 이메일 제거)

## 🎯 Custom Return-Path 사용 여부

### ✅ **사용하는 경우 (권장)**

**장점:**
1. **전문적인 이메일 관리**
   - 반송 이메일을 전용 주소로 수집
   - 발신 주소와 분리하여 관리

2. **자동화된 처리**
   - `bounce@mail.vality.io` 같은 전용 주소 사용
   - 웹훅으로 자동 처리 가능

3. **분석 용이**
   - 반송 이메일만 모아서 분석
   - 발신 이메일과 혼동 없음

4. **보안**
   - 발신 주소를 노출하지 않고 반송 처리
   - 스팸 봇으로부터 보호

### ❌ **사용하지 않는 경우**

**단점:**
- Return-Path가 발신 주소와 동일
- 반송 이메일이 발신 주소로 돌아옴
- 수동 처리 필요

## 🔧 Resend에서 Custom Return-Path 설정

### 옵션 1: Resend가 자동 생성 (권장)

Resend는 기본적으로 자동으로 Return-Path를 설정합니다:
```
Return-Path: <bounce+[unique-id]@resend.com>
```

**장점:**
- ✅ 별도 설정 불필요
- ✅ Resend가 자동으로 반송 처리
- ✅ 웹훅으로 이벤트 수신 가능

### 옵션 2: Custom Return-Path 설정

도메인에 Custom Return-Path를 설정하면:
```
Return-Path: bounce@mail.vality.io
```

**설정 방법:**
1. Resend Dashboard → Domains → [도메인 선택]
2. Custom Return-Path 활성화
3. `bounce@mail.vality.io` 같은 주소 입력
4. DNS 레코드 추가 (Resend가 제공)

## 📊 비교표

| 방식 | Return-Path | 장점 | 단점 |
|------|-------------|------|------|
| **자동 (기본)** | `bounce+xxx@resend.com` | ✅ 설정 간단<br>✅ Resend가 자동 처리 | ❌ 커스터마이징 제한 |
| **Custom** | `bounce@mail.vality.io` | ✅ 브랜드 일관성<br>✅ 직접 관리 가능 | ❌ 추가 설정 필요<br>❌ 웹훅 설정 필요 |

## 💡 추천 설정

### **초기 단계: 자동 Return-Path 사용 (권장)**

**이유:**
1. ✅ 설정이 간단함
2. ✅ Resend가 자동으로 반송 처리
3. ✅ 웹훅으로 이벤트 수신 가능
4. ✅ 별도 인프라 불필요

**설정:**
- Custom Return-Path 비활성화
- Resend 기본 설정 사용

### **고급 단계: Custom Return-Path 사용**

**필요한 경우:**
- 반송 이메일을 직접 처리해야 할 때
- 브랜드 일관성이 중요한 경우
- 자체 반송 처리 시스템이 있는 경우

**설정:**
```
Return-Path: bounce@mail.vality.io
```

**추가 작업:**
1. DNS 레코드 추가
2. 반송 이메일 수신 서버 설정 (선택)
3. 웹훅 설정 (Resend 이벤트 수신)

## 🔄 실제 동작 예시

### 시나리오: 이메일 전달 실패

**자동 Return-Path 사용 시:**
```
1. 이메일 발송: noreply@mail.vality.io → user@example.com
2. 전달 실패 (예: 주소 없음)
3. 반송 알림: bounce+abc123@resend.com으로 수신
4. Resend가 자동 처리 → 웹훅으로 알림
5. 시스템이 구독자 목록에서 제거
```

**Custom Return-Path 사용 시:**
```
1. 이메일 발송: noreply@mail.vality.io → user@example.com
2. 전달 실패
3. 반송 알림: bounce@mail.vality.io로 수신
4. 자체 시스템이 처리 (또는 Resend 웹훅)
```

## ⚙️ Resend 웹훅 설정 (중요)

Custom Return-Path를 사용하지 않아도, Resend 웹훅으로 반송 이벤트를 받을 수 있습니다:

### 웹훅 이벤트
- `email.bounced` - 이메일 반송
- `email.delivered` - 이메일 전달 완료
- `email.opened` - 이메일 열람
- `email.clicked` - 링크 클릭

### 웹훅 설정
```
Resend Dashboard → Webhooks → Add Webhook
→ Endpoint: https://api.vality.io/api/webhooks/resend
→ Events: email.bounced, email.delivered
```

## 🎯 최종 추천

### **초기에는 Custom Return-Path 비활성화 (기본값 사용)**

**이유:**
1. ✅ 설정 간단
2. ✅ Resend가 자동 처리
3. ✅ 웹훅으로 충분한 정보 수신
4. ✅ 나중에 변경 가능

### **나중에 필요하면 Custom Return-Path 활성화**

- 반송 이메일을 직접 처리해야 할 때
- 브랜드 일관성이 중요한 경우
- 자체 반송 처리 시스템 구축 시

## 📚 참고

- [Resend Return-Path Documentation](https://resend.com/docs/dashboard/domains/return-path)
- [Email Bounce Handling Best Practices](https://www.postmarkapp.com/guides/bounce-handling)
- [RFC 5321 - Return-Path](https://tools.ietf.org/html/rfc5321)

