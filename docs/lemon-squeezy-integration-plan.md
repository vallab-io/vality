# Lemon Squeezy 구독 결제 시스템 통합 계획

## 개요
Lemon Squeezy를 사용하여 Starter와 Pro 구독 플랜을 구현합니다. 초기 단계로 월간 결제만 지원합니다.

## 플랜 정의

### Free Plan
- 구독자 500명까지
- 월 1,000건 이메일 발송
- 웹 아카이빙
- 기본 분석

### Starter Plan (월간)
- 구독자 2,000명까지
- 월 5,000건 이메일 발송
- 커스텀 도메인
- 고급 분석
- 가격: $9.99/월

### Pro Plan (월간)
- 구독자 무제한
- 이메일 발송 무제한
- 커스텀 도메인
- 고급 분석 및 리포트
- 유료 구독 기능
- 우선 지원
- 가격: $29.99/월

---

## 구현 단계

### Phase 1: 데이터베이스 스키마 설계

#### 1.1 `subscriptions` 테이블 생성
```sql
CREATE TABLE subscriptions (
    id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lemon_squeezy_subscription_id VARCHAR(255) UNIQUE, -- Lemon Squeezy subscription ID
    lemon_squeezy_order_id VARCHAR(255), -- Lemon Squeezy order ID
    plan_type VARCHAR(20) NOT NULL DEFAULT 'FREE', -- FREE, STARTER, PRO
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED, EXPIRED, PAST_DUE
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_lemon_squeezy_subscription_id ON subscriptions(lemon_squeezy_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### 1.2 `subscription_webhook_events` 테이블 생성 (웹훅 로그)
```sql
CREATE TABLE subscription_webhook_events (
    id VARCHAR(24) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- subscription_created, subscription_updated, subscription_cancelled, etc.
    lemon_squeezy_event_id VARCHAR(255) UNIQUE,
    subscription_id VARCHAR(24) REFERENCES subscriptions(id) ON DELETE SET NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_events_lemon_squeezy_event_id ON subscription_webhook_events(lemon_squeezy_event_id);
CREATE INDEX idx_webhook_events_subscription_id ON subscription_webhook_events(subscription_id);
CREATE INDEX idx_webhook_events_processed ON subscription_webhook_events(processed);
```

---

### Phase 2: 백엔드 구현

#### 2.1 Domain 모델 생성
- `apps/api/src/main/kotlin/io/vality/domain/Subscription.kt`
- `apps/api/src/main/kotlin/io/vality/domain/SubscriptionWebhookEvent.kt`
- `Tables.kt`에 Exposed 테이블 정의 추가

#### 2.2 Repository 생성
- `apps/api/src/main/kotlin/io/vality/repository/SubscriptionRepository.kt`
  - `findByUserId(userId: String): Subscription?`
  - `findByLemonSqueezySubscriptionId(subscriptionId: String): Subscription?`
  - `create(subscription: Subscription): Subscription`
  - `update(subscription: Subscription): Subscription`
  - `updateStatus(subscriptionId: String, status: SubscriptionStatus): Subscription`

#### 2.3 Service 생성
- `apps/api/src/main/kotlin/io/vality/service/SubscriptionService.kt`
  - `getUserSubscription(userId: String): Subscription?`
  - `getUserPlan(userId: String): PlanType`
  - `checkPlanLimits(userId: String, planType: PlanType): Boolean`
  - `canCreateNewsletter(userId: String): Boolean`
  - `canSendEmail(userId: String, count: Int): Boolean`

- `apps/api/src/main/kotlin/io/vality/service/LemonSqueezyService.kt`
  - `verifyWebhookSignature(payload: String, signature: String): Boolean`
  - `processWebhookEvent(event: WebhookEvent): Subscription`
  - `handleSubscriptionCreated(event: SubscriptionCreatedEvent)`
  - `handleSubscriptionUpdated(event: SubscriptionUpdatedEvent)`
  - `handleSubscriptionCancelled(event: SubscriptionCancelledEvent)`
  - `handleSubscriptionResumed(event: SubscriptionResumedEvent)`
  - `handleSubscriptionExpired(event: SubscriptionExpiredEvent)`

#### 2.4 DTO 생성
- `apps/api/src/main/kotlin/io/vality/dto/subscription/SubscriptionResponse.kt`
- `apps/api/src/main/kotlin/io/vality/dto/subscription/PlanInfoResponse.kt`
- `apps/api/src/main/kotlin/io/vality/dto/subscription/WebhookEventRequest.kt`

#### 2.5 API Routes 생성
- `apps/api/src/main/kotlin/io/vality/routing/subscription/subscriptionRoutes.kt`
  - `GET /api/subscriptions/me` - 현재 사용자의 구독 정보 조회
  - `GET /api/subscriptions/plans` - 사용 가능한 플랜 목록 조회

- `apps/api/src/main/kotlin/io/vality/routing/subscription/lemonSqueezyRoutes.kt`
  - `POST /api/webhooks/lemon-squeezy` - Lemon Squeezy 웹훅 엔드포인트
    - 서명 검증
    - 이벤트 타입별 처리
    - 멱등성 보장 (중복 처리 방지)

---

### Phase 3: 프론트엔드 구현

#### 3.1 API 클라이언트
- `apps/web/src/lib/api/subscription.ts`
  - `getMySubscription(): Promise<Subscription>`
  - `getAvailablePlans(): Promise<Plan[]>`
  - `createCheckoutSession(planType: 'STARTER' | 'PRO'): Promise<{ checkoutUrl: string }>`

#### 3.2 컴포넌트
- `apps/web/src/components/subscription/PlanCard.tsx` - 플랜 카드 컴포넌트
- `apps/web/src/components/subscription/SubscriptionStatus.tsx` - 구독 상태 표시
- `apps/web/src/components/subscription/UpgradeButton.tsx` - 업그레이드 버튼

#### 3.3 페이지
- `apps/web/src/app/(dashboard)/dashboard/subscription/page.tsx` - 구독 관리 페이지
  - 현재 플랜 표시
  - 플랜 업그레이드/다운그레이드
  - 결제 내역
  - 구독 취소

#### 3.4 통합
- Dashboard Header에 현재 플랜 표시
- Newsletter 생성 시 플랜 제한 체크
- 이메일 발송 시 플랜 제한 체크

---

### Phase 4: Lemon Squeezy 설정

#### 4.1 제품 생성
1. Lemon Squeezy 대시보드에서 제품 생성
   - Starter Plan: ₩4,900/월
   - Pro Plan: ₩9,900/월
2. 각 제품의 Variant ID 기록

#### 4.2 웹훅 설정
1. Lemon Squeezy 대시보드에서 웹훅 URL 설정
   - `https://your-domain.com/api/webhooks/lemon-squeezy`
2. 웹훅 시크릿 키 환경 변수에 저장
   - `LEMON_SQUEEZY_WEBHOOK_SECRET`

#### 4.3 환경 변수 추가
```env
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_STARTER_VARIANT_ID=variant_id_for_starter
LEMON_SQUEEZY_PRO_VARIANT_ID=variant_id_for_pro
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMON_SQUEEZY_CHECKOUT_URL=https://your-store.lemonsqueezy.com/checkout
```

---

## 구현 순서

### Step 1: 데이터베이스 마이그레이션
1. `V3__Create_subscriptions_table.sql` 생성
2. `V4__Create_subscription_webhook_events_table.sql` 생성
3. Exposed Tables 정의 업데이트

### Step 2: Domain 모델 및 Repository
1. `Subscription.kt` 도메인 모델 생성
2. `SubscriptionWebhookEvent.kt` 도메인 모델 생성
3. `SubscriptionRepository.kt` 생성 및 테스트

### Step 3: Service 레이어
1. `SubscriptionService.kt` 생성
   - 플랜 제한 체크 로직
   - 구독 상태 관리
2. `LemonSqueezyService.kt` 생성
   - 웹훅 서명 검증
   - 이벤트 처리 로직

### Step 4: API Routes
1. `subscriptionRoutes.kt` 생성
   - 구독 정보 조회 API
2. `lemonSqueezyRoutes.kt` 생성
   - 웹훅 엔드포인트
   - 서명 검증 미들웨어

### Step 5: 프론트엔드 통합
1. API 클라이언트 생성
2. 구독 관리 페이지 생성
3. Dashboard에 플랜 표시 통합
4. 플랜 제한 체크 통합

### Step 6: 테스트
1. 웹훅 이벤트 테스트
2. 플랜 제한 체크 테스트
3. 결제 플로우 테스트

---

## 보안 고려사항

1. **웹훅 서명 검증**
   - 모든 웹훅 요청의 서명을 검증
   - HMAC-SHA256 사용

2. **멱등성 보장**
   - 동일한 이벤트의 중복 처리 방지
   - `lemon_squeezy_event_id`로 중복 체크

3. **인증 및 권한**
   - 구독 정보 조회는 JWT 인증 필요
   - 사용자는 자신의 구독 정보만 조회 가능

---

## 플랜 제한 체크 로직

### Newsletter 생성 제한
- Free: 1개
- Starter: 3개
- Pro: 무제한

### 구독자 수 제한
- Free: 500명
- Starter: 2,000명
- Pro: 무제한

### 이메일 발송 제한
- Free: 월 1,000건
- Starter: 월 5,000건
- Pro: 무제한

---

## 다음 단계 (향후 구현)

1. 연간 결제 옵션 추가
2. 플랜 업그레이드/다운그레이드 처리
3. 결제 실패 처리 및 재시도
4. 환불 처리
5. 사용량 기반 과금 (이메일 발송량 초과 시)

