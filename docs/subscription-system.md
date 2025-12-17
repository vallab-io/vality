# 구독 시스템 설계 문서 (Subscription System Design)

## 📋 목차

1. [개요](#개요)
2. [구독 플랜 정의](#구독-플랜-정의)
3. [데이터베이스 스키마](#데이터베이스-스키마)
4. [결제 프로바이더 선택](#결제-프로바이더-선택)
5. [API 엔드포인트 설계](#api-엔드포인트-설계)
6. [결제 플로우](#결제-플로우)
7. [웹훅 처리](#웹훅-처리)
8. [프론트엔드 UI/UX](#프론트엔드-uiux)
9. [구현 단계](#구현-단계)

---

## 개요

Vality 플랫폼의 구독 시스템은 **Free**, **Starter**, **Pro** 세 가지 플랜을 제공하며, 월간 구독료를 받는 형태로 운영됩니다.

### 주요 기능

- ✅ Free 플랜: 기본 기능 제공 (무료, 월 1,000통)
- ✅ Starter 플랜: 소규모 뉴스레터 (월 $9, 월 5,000통)
- ✅ Pro 플랜: 무제한 이메일 발송 (월 $29)
- ✅ 월간 자동 갱신 구독
- ✅ 결제 실패 시 자동 재시도
- ✅ 구독 취소/해지 기능
- ✅ 플랜 업그레이드/다운그레이드
- ✅ 결제 내역 조회

---

## 구독 플랜 정의

### Free 플랜

| 기능 | 제한 |
|------|------|
| 뉴스레터 개수 | 1개 |
| 구독자 수 | 최대 100명 |
| 월간 발행 이슈 수 | 무제한 |
| 이메일 발송량 | 월 1,000통 |
| 예약 발송 | ❌ |
| 커스텀 도메인 | ❌ |
| 고급 분석 | ❌ |

### Starter 플랜

| 기능 | 제한 |
|------|------|
| 뉴스레터 개수 | 무제한 |
| 구독자 수 | 무제한 |
| 월간 발행 이슈 수 | 무제한 |
| 이메일 발송량 | 월 5,000통 |
| 예약 발송 | ✅ |
| 커스텀 도메인 | ❌ |
| 고급 분석 | ❌ |

### Pro 플랜

| 기능 | 제한 |
|------|------|
| 뉴스레터 개수 | 무제한 |
| 구독자 수 | 무제한 |
| 월간 발행 이슈 수 | 무제한 |
| 이메일 발송량 | **무제한** |
| 예약 발송 | ✅ |
| 커스텀 도메인 | ✅ |
| 고급 분석 | ✅ |
| 우선 지원 | ✅ |

### 가격 정책

#### 월간 결제
- **Free**: $0/월 (무료, 월 1,000통)
- **Starter**: $9/월 (월 5,000통)
- **Pro**: $29/월 (무제한)

#### 연간 결제 (2개월 할인)
- **Free**: $0/년 (무료)
- **Starter**: $90/년 (월 $9 × 10개월 = 연간 2개월 할인)
- **Pro**: $290/년 (월 $29 × 10개월 = 연간 2개월 할인)

**가격 책정 근거:**
- **Free ($0/월)**: 개인 크리에이터를 위한 무료 플랜. 월 1,000통으로 시작하기에 충분한 용량
- **Starter ($9/월, $90/년)**: 소규모 뉴스레터를 위한 플랜. 월 5,000통으로 중소 규모 뉴스레터에 적합
- **Pro ($29/월, $290/년)**: 대량 발송 고객을 위한 플랜. 무제한 발송으로 마케팅 집중형 비즈니스에 적합
- **연간 결제 할인**: 연간 결제 시 2개월치 요금을 할인하여 고객 유지율 향상 및 현금 흐름 개선
- **달러 결제**: Lemon Squeezy를 통한 글로벌 결제 지원

---

## 데이터베이스 스키마

### 1. `subscriptions` 테이블

구독 정보를 저장하는 메인 테이블입니다.

```sql
CREATE TABLE subscriptions (
    id VARCHAR(25) PRIMARY KEY,
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'FREE', -- 'FREE' | 'STARTER' | 'PRO'
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- 'MONTHLY' | 'YEARLY'
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'EXPIRED'
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);
```

### 2. `payments` 테이블

결제 내역을 저장하는 테이블입니다.

```sql
CREATE TABLE payments (
    id VARCHAR(25) PRIMARY KEY,
    subscription_id VARCHAR(25) NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- 센트 단위 (예: 1900 = $19.00)
    currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- 'USD'
    status VARCHAR(20) NOT NULL, -- 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
    payment_provider VARCHAR(20) NOT NULL, -- 'LEMON_SQUEEZY'
    payment_provider_payment_id VARCHAR(255) NULL, -- 결제 프로바이더의 결제 ID
    payment_method VARCHAR(50) NULL, -- 'CARD' | 'BANK_TRANSFER' | 'VIRTUAL_ACCOUNT'
    failure_reason TEXT NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_provider_payment_id ON payments(payment_provider_payment_id);
```

### 3. `payment_attempts` 테이블

결제 시도 내역을 저장하는 테이블입니다 (재시도 추적용).

```sql
CREATE TABLE payment_attempts (
    id VARCHAR(25) PRIMARY KEY,
    payment_id VARCHAR(25) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'PENDING' | 'SUCCEEDED' | 'FAILED'
    failure_reason TEXT NULL,
    payment_provider_attempt_id VARCHAR(255) NULL,
    attempted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_attempts_payment_id ON payment_attempts(payment_id);
```

### 4. `users` 테이블 수정

기존 `users` 테이블에 구독 관련 필드를 추가합니다.

```sql
-- users 테이블에 subscription_id 추가 (선택적, 성능 최적화용)
ALTER TABLE users ADD COLUMN subscription_id VARCHAR(25) NULL REFERENCES subscriptions(id) ON DELETE SET NULL;
CREATE INDEX idx_users_subscription_id ON users(subscription_id);
```

---

## 결제 프로바이더 선택

### Lemon Squeezy

**선택 이유:**
- ✅ SaaS 제품에 최적화된 구독 관리 시스템
- ✅ 낮은 수수료 (약 3.5% + $0.30, Stripe 대비 경쟁력)
- ✅ 간편한 통합 (REST API)
- ✅ 강력한 웹훅 시스템
- ✅ 자동 갱신 및 결제 재시도 자동 처리
- ✅ 글로벌 결제 지원 (달러 결제)
- ✅ 세금 자동 계산 및 처리
- ✅ 직관적인 대시보드

**주요 기능:**
- Subscription 관리 (생성, 업그레이드, 다운그레이드, 취소)
- 자동 갱신 결제
- 결제 실패 시 자동 재시도
- 웹훅 이벤트 (subscription.created, subscription.updated, subscription.cancelled 등)
- 고객 포털 (고객이 직접 구독 관리 가능)

**통합 방식:**
- Lemon Squeezy Checkout을 통한 결제 처리
- 또는 Lemon Squeezy API를 통한 직접 통합
- 웹훅을 통한 구독 상태 동기화

---

## API 엔드포인트 설계

### 1. 구독 관리

#### `GET /api/subscriptions/me`
현재 사용자의 구독 정보 조회

**Response:**
```json
{
  "subscription": {
    "id": "sub_xxx",
    "planType": "PRO",
    "billingCycle": "MONTHLY",
    "status": "ACTIVE",
    "currentPeriodStart": "2025-01-01T00:00:00Z",
    "currentPeriodEnd": "2025-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

#### `POST /api/subscriptions/upgrade`
플랜 업그레이드 (Free → Starter, Starter → Pro)

**Request:**
```json
{
  "planType": "STARTER", // 또는 "PRO"
  "billingCycle": "MONTHLY" // 또는 "YEARLY"
}
```

**Response:**
```json
{
  "subscription": { ... },
  "checkoutUrl": "https://app.lemonsqueezy.com/checkout/buy/xxx" // Lemon Squeezy Checkout URL
}
```

#### `POST /api/subscriptions/downgrade`
플랜 다운그레이드 (Pro → Starter/Free, Starter → Free)

**Request:**
```json
{
  "planType": "FREE" // 또는 "STARTER"
}
```

**Response:**
```json
{
  "subscription": {
    "planType": "FREE",
    "status": "ACTIVE"
  }
}
```

**참고:**
- 다운그레이드는 현재 기간 종료 시 적용 (pro-rated 환불 가능)
- 또는 즉시 적용 (환불 없음, 사용자 선택)

#### `POST /api/subscriptions/cancel`
구독 취소 (현재 기간 종료 시 해지)

**Response:**
```json
{
  "subscription": {
    "cancelAtPeriodEnd": true,
    "canceledAt": "2025-01-15T10:00:00Z"
  }
}
```

#### `POST /api/subscriptions/resume`
구독 재개 (취소 예정인 구독 복구)

**Response:**
```json
{
  "subscription": {
    "cancelAtPeriodEnd": false,
    "canceledAt": null
  }
}
```

### 2. 결제 관리

#### `GET /api/payments`
결제 내역 조회 (페이지네이션)

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지 크기 (기본값: 20)

**Response:**
```json
{
  "payments": [
    {
      "id": "pay_xxx",
      "amount": 1900,
      "currency": "USD",
      "status": "SUCCEEDED",
      "paymentMethod": "CARD",
      "paidAt": "2025-01-01T00:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

#### `GET /api/payments/:paymentId`
특정 결제 내역 상세 조회

**Response:**
```json
{
  "payment": {
    "id": "pay_xxx",
    "subscriptionId": "sub_xxx",
    "amount": 1900,
    "currency": "USD",
    "status": "SUCCEEDED",
    "paymentProvider": "LEMON_SQUEEZY",
    "paymentMethod": "CARD",
    "paidAt": "2025-01-01T00:00:00Z",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### 3. 웹훅

#### `POST /api/webhooks/lemon-squeezy`
Lemon Squeezy 웹훅 수신

**보안:**
- 서명 검증 필수 (X-Signature 헤더)
- Idempotency 키를 통한 중복 처리 방지

---

## 결제 플로우

### 1. 플랜 업그레이드 플로우 (Free → Starter, Starter → Pro)

```
[사용자] → [프론트엔드] → [백엔드 API] → [Lemon Squeezy]
   ↓
1. 사용자가 "업그레이드" 클릭
   ↓
2. POST /api/subscriptions/upgrade
   ↓
3. 백엔드에서:
   - Lemon Squeezy API로 Checkout Session 생성
   - Subscription 생성 (status: PENDING)
   ↓
4. Lemon Squeezy에서 Checkout URL 반환
   ↓
5. 프론트엔드에서 Checkout 페이지로 리다이렉트
   ↓
6. 사용자가 결제 완료
   ↓
7. Lemon Squeezy → 웹훅 → 백엔드
   ↓
8. 백엔드에서:
   - subscription.created 또는 subscription.updated 이벤트 처리
   - Payment 생성 (status: SUCCEEDED)
   - Subscription status: ACTIVE
   - currentPeriodStart/End 설정
   ↓
9. 프론트엔드에서 결제 완료 페이지 표시
```

### 2. 자동 갱신 플로우 (월간/연간)

```
[Lemon Squeezy] → [웹훅] → [백엔드]
   ↓
1. Lemon Squeezy가 자동으로 구독 갱신 처리
   - billingCycle이 MONTHLY인 경우: 매월 갱신
   - billingCycle이 YEARLY인 경우: 매년 갱신
   ↓
2. 결제 성공 시:
   - subscription.payment_success 웹훅 이벤트 발생
   - 백엔드에서:
     * Payment 생성 (status: SUCCEEDED)
     * Subscription의 currentPeriodStart/End 업데이트
       - MONTHLY: +1개월
       - YEARLY: +1년
     * status: ACTIVE 유지
   ↓
3. 결제 실패 시:
   - subscription.payment_failure 웹훅 이벤트 발생
   - 백엔드에서:
     * Payment 생성 (status: FAILED)
     * Subscription status: PAST_DUE
     * 사용자에게 알림 발송
   ↓
4. Lemon Squeezy가 자동으로 재시도 (설정에 따라)
   ↓
5. 최대 재시도 실패 시:
   - subscription.cancelled 웹훅 이벤트 발생
   - 백엔드에서:
     * Subscription status: EXPIRED
     * User의 planType을 FREE로 변경
```

**참고:** 
- Lemon Squeezy가 자동 갱신과 재시도를 처리하므로, 별도의 크론 작업이 필요 없습니다.
- 연간 결제의 경우 1년 후 자동으로 갱신되며, 월간 결제는 매월 갱신됩니다.

### 3. 결제 실패 재시도 플로우

```
[결제 실패] → [재시도 스케줄링] → [재시도 실행]
   ↓
1. 결제 실패 시:
   - Payment status: FAILED
   - PaymentAttempt 생성
   - 재시도 스케줄링 (1일 후, 3일 후, 7일 후)
   ↓
2. 재시도 실행:
   - 결제 프로바이더에 재결제 요청
   - 성공 시: Subscription 활성화
   - 실패 시: 다음 재시도 스케줄링
   ↓
3. 최대 재시도 횟수(3회) 초과 시:
   - Subscription status: EXPIRED
   - User의 planType을 FREE로 변경
```

---

## 웹훅 처리

### Lemon Squeezy 웹훅

**주요 이벤트 타입:**

1. **`subscription.created`**
   - 새 구독 생성 시
   - 처리: Subscription 생성, Payment 생성 (초기 결제)

2. **`subscription.updated`**
   - 구독 정보 변경 시 (플랜 변경, 취소 등)
   - 처리: Subscription 정보 업데이트

3. **`subscription.cancelled`**
   - 구독 취소 시
   - 처리: Subscription status를 CANCELED 또는 EXPIRED로 변경

4. **`subscription.resumed`**
   - 취소된 구독 재개 시
   - 처리: Subscription status를 ACTIVE로 변경

5. **`subscription.payment_success`**
   - 결제 성공 시 (초기 또는 갱신)
   - 처리: Payment 생성 (SUCCEEDED), Subscription 기간 연장

6. **`subscription.payment_failure`**
   - 결제 실패 시
   - 처리: Payment 생성 (FAILED), Subscription status를 PAST_DUE로 변경

7. **`subscription.payment_recovered`**
   - 실패한 결제가 재시도로 성공 시
   - 처리: Payment 상태 업데이트, Subscription status를 ACTIVE로 변경

**처리 로직:**
```kotlin
when (eventType) {
    "subscription.created" -> {
        // 초기 구독 생성
        // Payment 생성 (SUCCEEDED)
        // Subscription status: ACTIVE
    }
    "subscription.updated" -> {
        // 구독 정보 업데이트 (플랜 변경 등)
        // Subscription 정보 동기화
    }
    "subscription.cancelled" -> {
        // 구독 취소
        // Subscription status: CANCELED 또는 EXPIRED
    }
    "subscription.payment_success" -> {
        // 결제 성공 (갱신 포함)
        // Payment 생성 (SUCCEEDED)
        // Subscription 기간 연장
    }
    "subscription.payment_failure" -> {
        // 결제 실패
        // Payment 생성 (FAILED)
        // Subscription status: PAST_DUE
        // 사용자 알림 발송
    }
    "subscription.payment_recovered" -> {
        // 결제 복구
        // Payment 상태 업데이트
        // Subscription status: ACTIVE
    }
}
```

### 웹훅 보안

- **서명 검증**: Lemon Squeezy에서 전송한 요청인지 검증 (X-Signature 헤더)
- **Idempotency**: 동일한 웹훅 이벤트 중복 처리 방지 (event ID 기반)
- **로깅**: 모든 웹훅 이벤트 로깅 (디버깅 및 감사용)

---

## 프론트엔드 UI/UX

### 1. 구독 설정 페이지 (`/dashboard/settings/billing`)

**구성 요소:**
- 현재 플랜 표시 (Free/Pro/Unlimited)
- 플랜 비교 테이블 (3개 플랜)
- 업그레이드/다운그레이드 버튼
- 결제 내역 테이블
- 구독 취소 버튼

### 2. 결제 완료 페이지 (`/dashboard/settings/billing/success`)

**구성 요소:**
- 결제 완료 메시지
- 구독 정보 요약
- 대시보드로 돌아가기 버튼

### 3. 결제 실패 페이지 (`/dashboard/settings/billing/failed`)

**구성 요소:**
- 결제 실패 메시지
- 재시도 버튼
- 고객 지원 링크

### 4. 플랜 제한 알림

**시나리오:**
- Free 플랜 사용자가 뉴스레터 2개 생성 시도 → "Pro 플랜으로 업그레이드하세요" 모달
- Free 플랜 사용자가 구독자 100명 초과 시도 → "Pro 플랜으로 업그레이드하세요" 모달
- Pro 플랜 사용자가 월 10,000통 초과 발송 시도 → "Unlimited 플랜으로 업그레이드하세요" 모달

---

## 구현 단계

### Phase 1: 데이터베이스 및 도메인 모델 (1-2일)

- [ ] Flyway 마이그레이션 파일 생성
  - `V5__Create_subscriptions_table.sql`
  - `V6__Create_payments_table.sql`
  - `V7__Create_payment_attempts_table.sql`
- [ ] Domain 모델 구현
  - `Subscription.kt`
  - `Payment.kt`
  - `PaymentAttempt.kt`
- [ ] Exposed Tables 정의 업데이트
- [ ] Repository 구현
  - `SubscriptionRepository.kt`
  - `PaymentRepository.kt`
  - `PaymentAttemptRepository.kt`

### Phase 2: 결제 프로바이더 통합 (2-3일)

- [ ] Lemon Squeezy API 통합
  - REST API 클라이언트 구현
  - Checkout Session 생성
  - Subscription 조회/업데이트
  - 웹훅 처리
  - 서명 검증
- [ ] 결제 프로바이더 추상화 인터페이스
  - `PaymentProvider.kt`
  - `LemonSqueezyPaymentProvider.kt`

### Phase 3: 구독 서비스 구현 (2-3일)

- [ ] `SubscriptionService.kt` 구현
  - 구독 생성
  - 구독 업그레이드/다운그레이드
  - 구독 취소/재개
  - 구독 상태 확인
- [ ] `PaymentService.kt` 구현
  - 결제 생성
  - 결제 상태 업데이트
  - 결제 재시도
- [ ] 자동 갱신 배치 작업 (선택적, Phase 4로 이동 가능)

### Phase 4: API 엔드포인트 구현 (2일)

- [ ] `subscriptionRoutes.kt` 구현
  - `GET /api/subscriptions/me`
  - `POST /api/subscriptions/upgrade`
  - `POST /api/subscriptions/downgrade`
  - `POST /api/subscriptions/cancel`
  - `POST /api/subscriptions/resume`
- [ ] `paymentRoutes.kt` 구현
  - `GET /api/payments`
  - `GET /api/payments/:paymentId`
- [ ] `webhookRoutes.kt` 구현
  - `POST /api/webhooks/lemon-squeezy`

### Phase 5: 프론트엔드 구현 (2-3일)

- [ ] 구독 상태 관리 (Jotai)
  - `subscriptionAtom`
- [ ] API 클라이언트
  - `apps/web/src/lib/api/subscription.ts`
  - `apps/web/src/lib/api/payment.ts`
- [ ] UI 컴포넌트
  - 구독 설정 페이지
  - 플랜 비교 테이블
  - 결제 내역 테이블
  - 결제 완료/실패 페이지
- [ ] 플랜 제한 체크 및 알림

### Phase 6: 자동 갱신 및 재시도 로직 (1일)

- [ ] Lemon Squeezy 웹훅 처리 완성
  - 자동 갱신은 Lemon Squeezy가 처리하므로 웹훅만 처리하면 됨
  - 결제 실패 알림 발송
  - 구독 만료 시 사용자 알림

### Phase 7: 테스트 및 문서화 (1-2일)

- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] 웹훅 테스트 (Lemon Squeezy 테스트 모드)
- [ ] API 문서 업데이트

---

## 환경 변수

### Lemon Squeezy

```env
LEMON_SQUEEZY_API_KEY=xxx
LEMON_SQUEEZY_STORE_ID=xxx
LEMON_SQUEEZY_WEBHOOK_SECRET=xxx
LEMON_SQUEEZY_PRODUCT_ID_FREE=xxx
LEMON_SQUEEZY_PRODUCT_ID_STARTER_MONTHLY=xxx
LEMON_SQUEEZY_PRODUCT_ID_STARTER_YEARLY=xxx
LEMON_SQUEEZY_PRODUCT_ID_PRO_MONTHLY=xxx
LEMON_SQUEEZY_PRODUCT_ID_PRO_YEARLY=xxx
```

**설정 방법:**
1. Lemon Squeezy 대시보드에서 Store 생성
2. 각 플랜에 대한 Product 생성:
   - Free (무료)
   - Starter Monthly ($9/월)
   - Starter Yearly ($90/년)
   - Pro Monthly ($29/월)
   - Pro Yearly ($290/년)
3. API Key 생성 (Settings → API)
4. Webhook URL 설정 및 Secret 생성

---

## 보안 고려사항

1. **결제 정보 보호**
   - 카드 정보는 절대 서버에 저장하지 않음
   - 결제 프로바이더에만 저장

2. **웹훅 보안**
   - 서명 검증 필수 (X-Signature 헤더)
   - Idempotency 키를 통한 중복 처리 방지

3. **구독 상태 검증**
   - API 요청 시마다 구독 상태 확인
   - 만료된 구독은 즉시 차단

4. **결제 금액 검증**
   - 웹훅에서 받은 금액과 DB의 금액 비교
   - 불일치 시 알림 및 로깅

---

## 모니터링 및 알림

1. **결제 실패 알림**
   - 결제 실패 시 관리자에게 알림
   - 사용자에게 이메일 발송

2. **구독 만료 알림**
   - 만료 7일 전 이메일 알림
   - 만료 1일 전 이메일 알림

3. **메트릭 수집**
   - 구독 전환율
   - 결제 성공률
   - 평균 구독 기간

---

---

## 이메일 발송량 초과 처리

### Starter 플랜 (월 5,000통 초과 시)

**옵션 1: 발송 차단 (권장)**
- 월 5,000통 도달 시 자동으로 발송 중단
- 사용자에게 "Pro 플랜으로 업그레이드하세요" 알림 표시
- 다음 달 1일 자동으로 발송 재개

**옵션 2: 초과분 과금**
- 5,000통 초과 시 추가 과금 (예: $0.01/통)
- 다음 결제일에 자동으로 청구
- 사용자에게 사전 알림 발송

**옵션 3: 경고 후 제한**
- 5,000통 도달 시 경고 알림
- 5,500통 도달 시 발송 중단
- Pro 플랜으로 업그레이드 유도

**권장:** 옵션 1 (발송 차단) - 가장 명확하고 예측 가능한 정책

### Pro 플랜

- 무제한 발송이므로 별도 제한 없음
- 다만, 남용 방지를 위한 모니터링 권장
- 비정상적인 발송량 감지 시 수동 검토

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15

