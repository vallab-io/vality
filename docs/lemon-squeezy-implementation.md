# Lemon Squeezy 결제 시스템 구현 방안

## 📋 개요

Lemon Squeezy를 사용하여 Vality의 요금제 시스템을 구현하는 방법을 설명합니다.

**참고**: [Lemon Squeezy API 문서](https://docs.lemonsqueezy.com/api)

---

## 🛒 Lemon Squeezy Product 등록 (필수)

### ⚠️ 중요: Product 등록은 필수입니다

Lemon Squeezy를 사용하려면 **반드시** 다음을 설정해야 합니다:

1. **Store 생성** (최초 1회)
2. **Product 생성** (각 플랜/애드온마다)
3. **Variant 생성** (가격별)
4. **API Key 생성**

---

## 📦 Product 등록 전략

### 전략 1: 플랜별 Product 생성 (권장)

각 플랜을 별도 Product로 생성:

| Product 이름 | Variant | 가격 | 설명 |
|-------------|---------|------|------|
| Vality Free | Free Plan | $0/월 | 무료 플랜 |
| Vality Paid Tier 1 | 1,001-5,000통 | $9/월 | 기본 유료 플랜 |
| Vality Paid Tier 2 | 5,001-10,000통 | $19/월 | 중급 플랜 |
| Vality Paid Tier 3 | 10,001-50,000통 | $39/월 | 고급 플랜 |
| Vality Paid Tier 4 | 50,001-100,000통 | $79/월 | 프리미엄 플랜 |

**장점:**
- 각 플랜을 독립적으로 관리 가능
- 플랜별 통계 추적 용이
- 업그레이드/다운그레이드 시 Variant만 변경

### 전략 2: 단일 Product + 여러 Variant (대안)

하나의 Product에 여러 Variant 생성:

| Product 이름 | Variant | 가격 |
|-------------|---------|------|
| Vality Subscription | Free | $0/월 |
| Vality Subscription | Tier 1 | $9/월 |
| Vality Subscription | Tier 2 | $19/월 |
| Vality Subscription | Tier 3 | $39/월 |
| Vality Subscription | Tier 4 | $79/월 |

---

## 🔌 애드온 Product 설정

각 애드온을 별도 Product로 생성 (권장):

| Product 이름 | Variant | 가격 | 설명 |
|-------------|---------|------|------|
| 예약 발송 | Monthly | $9/월 | 예약 발송 기능 |
| 고급 분석 | Monthly | $9/월 | 고급 분석 기능 |
| 여러 뉴스레터 | Monthly | $9/월 | 여러 뉴스레터 생성 |
| 태깅 & 세그먼트 | Monthly | $9/월 | 태깅 및 세그먼트 관리 |
| 자동화 | Monthly | $29/월 | 자동화 워크플로우 |
| 화이트라벨링 | Monthly | $79/월 | 화이트라벨링 |

---

## 🏪 Lemon Squeezy 설정 단계

### 1. Store 생성

1. Lemon Squeezy 대시보드 접속
2. "Stores" → "Create Store"
3. Store 이름, 도메인 등 설정
4. Store ID 기록 (API에서 사용)

### 2. Product 생성

**방법 A: 대시보드에서 생성**

1. "Products" → "Create Product"
2. Product 이름 입력 (예: "Vality Paid Tier 1")
3. Product 설명 입력
4. "Create Product" 클릭

**방법 B: API로 생성**

```kotlin
// Product 생성
POST https://api.lemonsqueezy.com/v1/products
{
  "data": {
    "type": "products",
    "attributes": {
      "name": "Vality Paid Tier 1",
      "description": "1,001-5,000통 발송 플랜",
      "status": "published"
    },
    "relationships": {
      "store": {
        "data": {
          "type": "stores",
          "id": "STORE_ID"
        }
      }
    }
  }
}
```

### 3. Variant 생성

각 Product에 대해 Variant 생성:

```kotlin
// Variant 생성
POST https://api.lemonsqueezy.com/v1/variants
{
  "data": {
    "type": "variants",
    "attributes": {
      "name": "Monthly",
      "price": 900, // $9 (센트 단위)
      "interval": "month", // 월간 구독
      "interval_count": 1,
      "is_usage_based": false
    },
    "relationships": {
      "product": {
        "data": {
          "type": "products",
          "id": "PRODUCT_ID"
        }
      }
    }
  }
}
```

### 4. API Key 생성

1. "Settings" → "API"
2. "Create API Key" 클릭
3. API Key 복사 및 안전하게 보관
4. 환경 변수에 저장

---

## 🔑 환경 변수 설정

```env
# Lemon Squeezy 설정
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id_here

# Product IDs (플랜별)
LEMON_SQUEEZY_PRODUCT_ID_FREE=product_id_for_free
LEMON_SQUEEZY_PRODUCT_ID_TIER_1=product_id_for_tier_1
LEMON_SQUEEZY_PRODUCT_ID_TIER_2=product_id_for_tier_2
LEMON_SQUEEZY_PRODUCT_ID_TIER_3=product_id_for_tier_3
LEMON_SQUEEZY_PRODUCT_ID_TIER_4=product_id_for_tier_4

# Variant IDs (플랜별)
LEMON_SQUEEZY_VARIANT_ID_FREE=variant_id_for_free
LEMON_SQUEEZY_VARIANT_ID_TIER_1=variant_id_for_tier_1
LEMON_SQUEEZY_VARIANT_ID_TIER_2=variant_id_for_tier_2
LEMON_SQUEEZY_VARIANT_ID_TIER_3=variant_id_for_tier_3
LEMON_SQUEEZY_VARIANT_ID_TIER_4=variant_id_for_tier_4

# Add-on Product IDs
LEMON_SQUEEZY_PRODUCT_ID_ADDON_SCHEDULED_SENDING=product_id_for_scheduled_sending
LEMON_SQUEEZY_PRODUCT_ID_ADDON_ADVANCED_ANALYTICS=product_id_for_advanced_analytics
LEMON_SQUEEZY_PRODUCT_ID_ADDON_MULTIPLE_NEWSLETTERS=product_id_for_multiple_newsletters
# ... 기타 애드온들

# Add-on Variant IDs
LEMON_SQUEEZY_VARIANT_ID_ADDON_SCHEDULED_SENDING=variant_id_for_scheduled_sending
LEMON_SQUEEZY_VARIANT_ID_ADDON_ADVANCED_ANALYTICS=variant_id_for_advanced_analytics
# ... 기타 애드온들

# Webhook Secret
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 📋 Product/Variant 매핑 테이블

데이터베이스에 Product/Variant ID를 저장하는 것이 좋습니다:

```sql
-- Product/Variant 매핑 테이블
CREATE TABLE lemon_squeezy_products (
    id VARCHAR(25) PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL,
    -- 'PLAN_FREE' | 'PLAN_TIER_1' | 'PLAN_TIER_2' | 'ADDON_SCHEDULED_SENDING' | ...
    lemon_squeezy_product_id VARCHAR(255) NOT NULL UNIQUE,
    lemon_squeezy_variant_id VARCHAR(255) NOT NULL UNIQUE,
    price INTEGER NOT NULL, -- 센트 단위
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 초기 데이터 삽입
INSERT INTO lemon_squeezy_products (id, product_type, lemon_squeezy_product_id, lemon_squeezy_variant_id, price, name) VALUES
('prod_free', 'PLAN_FREE', 'LS_PRODUCT_ID_FREE', 'LS_VARIANT_ID_FREE', 0, 'Free Plan'),
('prod_tier1', 'PLAN_TIER_1', 'LS_PRODUCT_ID_TIER_1', 'LS_VARIANT_ID_TIER_1', 900, 'Paid Tier 1'),
('prod_tier2', 'PLAN_TIER_2', 'LS_PRODUCT_ID_TIER_2', 'LS_VARIANT_ID_TIER_2', 1900, 'Paid Tier 2'),
('prod_tier3', 'PLAN_TIER_3', 'LS_PRODUCT_ID_TIER_3', 'LS_VARIANT_ID_TIER_3', 3900, 'Paid Tier 3'),
('prod_tier4', 'PLAN_TIER_4', 'LS_PRODUCT_ID_TIER_4', 'LS_VARIANT_ID_TIER_4', 7900, 'Paid Tier 4'),
('addon_scheduled', 'ADDON_SCHEDULED_SENDING', 'LS_PRODUCT_ID_ADDON_SCHEDULED', 'LS_VARIANT_ID_ADDON_SCHEDULED', 900, '예약 발송'),
('addon_analytics', 'ADDON_ADVANCED_ANALYTICS', 'LS_PRODUCT_ID_ADDON_ANALYTICS', 'LS_VARIANT_ID_ADDON_ANALYTICS', 900, '고급 분석');
-- ... 기타 애드온들
```

---

## 💳 Free 플랜과 결제 정보

### ⚠️ 중요: Free 플랜은 결제 정보 없이 시작 가능

**Free 플랜 ($0/월)의 경우:**
- ✅ **결제 정보 입력 불필요** - $0 가격이므로 결제 수단이 필요 없음
- ✅ 사용자는 즉시 Free 플랜으로 시작 가능
- ✅ Lemon Squeezy에서 $0 Product/Variant는 Checkout 없이 Subscription 생성 가능

**Free → Paid 전환 시:**
- 1,000통 초과 시 업그레이드 필요
- 이때 **처음으로 결제 정보 입력 요구**
- Checkout 페이지로 리다이렉트하여 결제 정보 입력 후 업그레이드 완료

---

## ✅ 구현 가능한 시나리오

### 1. 기본 플랜($9/월) 사용 중 애드온 추가

**구현 방법:**
- Lemon Squeezy의 **Subscription Update API**를 사용하여 구독에 Line Items(애드온) 추가
- 자동으로 **Proration(비례 배분)** 처리됨
- 다음 청구일에 추가 요금이 반영됨
- **결제 정보는 이미 등록되어 있으므로 추가 입력 불필요**

### 2. Free 플랜 사용 중 월 발송량 1,000통 초과 시 Paid 플랜으로 전환

**구현 방법:**
- **Usage-based Billing** 또는 **Subscription Upgrade API** 사용
- 월간 발송량 모니터링 후 자동 업그레이드
- **1,000통 초과 시 Checkout 페이지로 리다이렉트하여 결제 정보 입력 요구**
- 결제 정보 입력 후 Subscription 업그레이드 완료
- 웹훅을 통한 자동 처리 가능

---

## 🔧 구현 상세

### 시나리오 1: 애드온 추가

#### 방법 A: Subscription Update API (권장)

```kotlin
// Lemon Squeezy API를 통한 애드온 추가
suspend fun addAddonToSubscription(
    subscriptionId: String,
    addonProductId: String,
    addonVariantId: String
): Subscription {
    val response = httpClient.patch("https://api.lemonsqueezy.com/v1/subscriptions/$subscriptionId") {
        header("Authorization", "Bearer $apiKey")
        header("Content-Type", "application/vnd.api+json")
        setBody(buildJsonObject {
            put("data", buildJsonObject {
                put("type", "subscriptions")
                put("id", subscriptionId)
                put("attributes", buildJsonObject {
                    put("product_id", addonProductId)
                    put("variant_id", addonVariantId)
                })
            })
        })
    }
    
    // Proration이 자동으로 계산되어 다음 청구일에 반영됨
    return parseSubscriptionResponse(response)
}
```

#### 방법 B: Line Items 사용 (더 유연함)

Lemon Squeezy는 Subscription에 Line Items를 추가할 수 있습니다:

```kotlin
// Subscription에 Line Item 추가
suspend fun addLineItemToSubscription(
    subscriptionId: String,
    addonPrice: Int // 센트 단위 (예: $9 = 900)
): Subscription {
    // Subscription 업데이트 시 line_items 추가
    val response = httpClient.patch("https://api.lemonsqueezy.com/v1/subscriptions/$subscriptionId") {
        header("Authorization", "Bearer $apiKey")
        setBody(buildJsonObject {
            put("data", buildJsonObject {
                put("type", "subscriptions")
                put("id", subscriptionId)
                put("attributes", buildJsonObject {
                    put("custom_price", null) // 기본 가격 유지
                    put("line_items", buildJsonArray {
                        add(buildJsonObject {
                            put("name", "예약 발송 애드온")
                            put("price", addonPrice)
                            put("quantity", 1)
                        })
                    })
                })
            })
        })
    }
    
    return parseSubscriptionResponse(response)
}
```

**장점:**
- ✅ 자동 Proration 처리
- ✅ 다음 청구일에 자동 반영
- ✅ 사용자가 별도 결제할 필요 없음

**주의사항:**
- Line Items는 Subscription 업데이트 시에만 추가 가능
- 각 애드온을 별도 Product/Variant로 생성하는 것이 더 관리하기 쉬움

---

### 시나리오 2: Free → Paid 플랜 자동 전환

#### 방법 A: Usage-based Billing (Lemon Squeezy 네이티브)

Lemon Squeezy는 Usage-based Billing을 지원하지만, 제한적입니다.

**구현 방식:**
1. **Usage Records API**를 사용하여 월간 발송량 추적
2. 1,000통 초과 시 자동으로 Subscription 업그레이드

```kotlin
// 월간 발송량 추적 및 자동 업그레이드
suspend fun checkAndUpgradeSubscription(userId: String) {
    val monthlyEmailCount = getMonthlyEmailCount(userId)
    
    if (monthlyEmailCount > 1000) {
        val subscription = getSubscriptionByUserId(userId)
        
        if (subscription?.planType == "FREE") {
            // Paid 플랜으로 업그레이드
            upgradeSubscription(
                subscriptionId = subscription.id,
                newVariantId = PAID_PLAN_VARIANT_ID
            )
        }
    }
}
```

#### 방법 B: 백엔드에서 모니터링 후 수동 업그레이드 (권장)

**구현 방식:**
1. 매일 또는 실시간으로 월간 발송량 모니터링
2. 1,000통 초과 시 Subscription 업그레이드 API 호출
3. 웹훅을 통해 결제 처리 확인

```kotlin
// 발송량 모니터링 및 자동 업그레이드
class SubscriptionUpgradeService(
    private val emailLogRepository: EmailLogRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val lemonSqueezyClient: LemonSqueezyClient
) {
    /**
     * 월간 발송량 확인 및 자동 업그레이드
     */
    suspend fun checkMonthlyUsageAndUpgrade(userId: String) {
        val currentMonth = LocalDate.now().withDayOfMonth(1)
        val monthlyEmailCount = emailLogRepository.countByUserIdAndMonth(
            userId = userId,
            month = currentMonth
        )
        
        val subscription = subscriptionRepository.findByUserId(userId)
            ?: return // 구독이 없으면 무시
        
        // Free 플랜이고 1,000통 초과 시
        if (subscription.planType == PlanType.FREE && monthlyEmailCount > 1000) {
            // 적절한 Paid 플랜 선택 (발송량에 따라)
            val newPlanType = determinePlanType(monthlyEmailCount)
            
            // 결제 정보가 이미 등록되어 있는지 확인
            val hasPaymentMethod = lemonSqueezyClient.hasPaymentMethod(
                customerId = getCustomerId(userId)
            )
            
            if (hasPaymentMethod) {
                // 결제 정보가 있으면 자동 업그레이드
                val updatedSubscription = lemonSqueezyClient.upgradeSubscription(
                    subscriptionId = subscription.lemonSqueezySubscriptionId,
                    newVariantId = getVariantIdForPlan(newPlanType)
                )
                
                // DB 업데이트
                subscriptionRepository.update(
                    subscription.copy(
                        planType = newPlanType,
                        lemonSqueezySubscriptionId = updatedSubscription.id
                    )
                )
                
                // 사용자에게 알림
                sendUpgradeNotification(userId, newPlanType)
            } else {
                // 결제 정보가 없으면 업그레이드 요청 알림만 발송
                // 사용자가 직접 업그레이드 버튼을 클릭하면 Checkout 페이지로 이동
                sendUpgradeRequiredNotification(userId, newPlanType, monthlyEmailCount)
            }
        }
    }
    
    private fun determinePlanType(emailCount: Long): PlanType {
        return when {
            emailCount <= 1000 -> PlanType.FREE
            emailCount <= 5000 -> PlanType.PAID_TIER_1 // $9/월
            emailCount <= 10000 -> PlanType.PAID_TIER_2 // $19/월
            emailCount <= 50000 -> PlanType.PAID_TIER_3 // $39/월
            emailCount <= 100000 -> PlanType.PAID_TIER_4 // $79/월
            else -> PlanType.CUSTOM
        }
    }
}
```

**실시간 모니터링:**
```kotlin
// 이메일 발송 시 발송량 체크
suspend fun sendIssueEmail(issueId: String) {
    // 이메일 발송 로직...
    
    // 발송 후 발송량 체크
    val userId = getUserIdFromIssue(issueId)
    subscriptionUpgradeService.checkMonthlyUsageAndUpgrade(userId)
}
```

**배치 작업 (매일 실행):**
```kotlin
// 매일 자정에 모든 사용자의 발송량 체크
@Scheduled(fixedRate = 86400000) // 24시간마다
suspend fun checkAllUsersUsage() {
    val allUsers = userRepository.findAll()
    
    allUsers.forEach { user ->
        subscriptionUpgradeService.checkMonthlyUsageAndUpgrade(user.id)
    }
}
```

---

## 📊 데이터베이스 스키마

### Subscription 테이블

```sql
CREATE TABLE subscriptions (
    id VARCHAR(25) PRIMARY KEY,
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'FREE',
    -- 'FREE' | 'PAID_TIER_1' | 'PAID_TIER_2' | 'PAID_TIER_3' | 'PAID_TIER_4' | 'CUSTOM'
    lemon_squeezy_subscription_id VARCHAR(255) UNIQUE,
    lemon_squeezy_variant_id VARCHAR(255), -- 현재 플랜의 Variant ID
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    -- 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'EXPIRED'
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

### Subscription Addons 테이블

```sql
CREATE TABLE subscription_addons (
    id VARCHAR(25) PRIMARY KEY,
    subscription_id VARCHAR(25) NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    addon_type VARCHAR(50) NOT NULL,
    -- 'SCHEDULED_SENDING' | 'ADVANCED_ANALYTICS' | 'MULTIPLE_NEWSLETTERS' 등
    lemon_squeezy_product_id VARCHAR(255),
    lemon_squeezy_variant_id VARCHAR(255),
    price INTEGER NOT NULL, -- 센트 단위
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    -- 'ACTIVE' | 'CANCELED'
    added_at TIMESTAMP NOT NULL DEFAULT NOW(),
    canceled_at TIMESTAMP NULL
);

CREATE INDEX idx_subscription_addons_subscription_id ON subscription_addons(subscription_id);
CREATE INDEX idx_subscription_addons_status ON subscription_addons(status);
```

---

## 🔄 플로우 다이어그램

### 시나리오 1: 애드온 추가 플로우

```
[사용자] → [프론트엔드] → [백엔드 API] → [Lemon Squeezy]
   ↓
1. 사용자가 "예약 발송" 애드온 추가 클릭
   ↓
2. POST /api/subscriptions/addons
   {
     "addonType": "SCHEDULED_SENDING",
     "subscriptionId": "sub_xxx"
   }
   ↓
3. 백엔드에서:
   - Subscription에 Line Item 추가 또는
   - Subscription Update API 호출
   ↓
4. Lemon Squeezy에서:
   - Proration 계산
   - 다음 청구일에 추가 요금 반영
   ↓
5. 웹훅 수신:
   - subscription.updated 이벤트
   - DB 업데이트
   ↓
6. 사용자에게 확인 메시지 표시
```

### 시나리오 2: Free → Paid 자동 전환 플로우

```
[이메일 발송] → [발송량 체크] → [결제 정보 입력 요구] → [업그레이드 완료]
   ↓
1. 이슈 발행 시 이메일 발송
   ↓
2. EmailLog에 발송 기록 저장
   ↓
3. 발송 후 발송량 체크:
   - 월간 발송량 조회
   - 1,000통 초과 확인
   ↓
4. Free 플랜인 경우:
   - 적절한 Paid 플랜 결정
   - 사용자에게 업그레이드 알림 표시
   - "업그레이드" 버튼 클릭 시 Checkout 페이지로 이동
   ↓
5. Checkout 페이지:
   - 결제 정보 입력 (카드 등)
   - 결제 완료
   ↓
6. Lemon Squeezy에서:
   - Subscription 생성/업그레이드
   - 결제 처리
   ↓
7. 웹훅 수신:
   - subscription.created 또는 subscription.updated 이벤트
   - DB 업데이트
   ↓
8. 사용자에게 업그레이드 완료 알림
```

**또는 자동 업그레이드 (결제 정보 미리 등록된 경우):**

```
[이메일 발송] → [발송량 체크] → [자동 업그레이드]
   ↓
1-3. 동일
   ↓
4. Free 플랜이지만 결제 정보가 이미 등록된 경우:
   - 자동으로 Subscription 업그레이드
   - 즉시 결제 처리
   ↓
5-8. 동일
```

---

## 🛠️ API 엔드포인트

### 1. 애드온 추가

```kotlin
POST /api/subscriptions/addons
{
  "addonType": "SCHEDULED_SENDING" | "ADVANCED_ANALYTICS" | ...
}

Response:
{
  "success": true,
  "subscription": {
    "id": "sub_xxx",
    "planType": "PAID_TIER_1",
    "addons": [
      {
        "type": "SCHEDULED_SENDING",
        "price": 900, // $9
        "status": "ACTIVE"
      }
    ],
    "nextBillingDate": "2025-02-01",
    "proratedAmount": 450 // 현재 청구 주기의 남은 기간에 대한 비례 배분 금액
  }
}
```

### 2. 애드온 제거

```kotlin
DELETE /api/subscriptions/addons/:addonId

Response:
{
  "success": true,
  "subscription": { ... }
}
```

### 3. 발송량 조회

```kotlin
GET /api/subscriptions/usage

Response:
{
  "currentMonth": {
    "emailCount": 1250,
    "freeLimit": 1000,
    "overLimit": 250,
    "willUpgrade": true // 1,000통 초과로 자동 업그레이드 예정
  },
  "subscription": {
    "planType": "FREE",
    "willUpgradeTo": "PAID_TIER_1" // 다음 업그레이드 예정 플랜
  }
}
```

---

## ⚠️ 주의사항 및 제한사항

### 1. Lemon Squeezy의 제한사항

- **Usage-based Billing**: Lemon Squeezy는 Usage-based Billing을 지원하지만, 제한적입니다
- **Line Items**: Subscription 업데이트 시에만 추가 가능
- **Proration**: 자동으로 처리되지만, 정확한 계산을 위해 확인 필요

### 2. 구현 시 고려사항

**애드온 추가:**
- 각 애드온을 별도 Product/Variant로 생성하는 것이 관리하기 쉬움
- 또는 Subscription Update API로 Line Items 추가
- Proration 계산이 자동으로 처리되지만, 사용자에게 명확히 안내 필요

**자동 업그레이드:**
- 실시간 모니터링 vs 배치 작업 선택
- 실시간: 발송 즉시 체크 (정확하지만 부하 증가)
- 배치: 매일/매시간 체크 (부하 감소하지만 지연 가능)
- **권장**: 하이브리드 방식 (발송 시 체크 + 매일 배치 확인)

### 3. 웹훅 처리

```kotlin
POST /api/webhooks/lemon-squeezy

// subscription.updated 이벤트 처리
when (eventType) {
    "subscription.updated" -> {
        // Subscription 정보 동기화
        // 애드온 추가/제거 확인
        // DB 업데이트
    }
    "subscription.payment_success" -> {
        // 결제 성공 시 Subscription 활성화
    }
    "subscription.payment_failure" -> {
        // 결제 실패 시 처리
    }
}
```

---

## 💡 최종 권장 구현 방안

### 애드온 추가
✅ **Subscription Update API 사용** (Line Items 또는 Variant 변경)
- 자동 Proration 처리
- 다음 청구일에 반영
- 구현이 간단함

### Free → Paid 자동 전환
✅ **백엔드 모니터링 + Subscription Upgrade API**
- 실시간 발송량 체크 (발송 시)
- 매일 배치 확인 (백업)
- 1,000통 초과 시 자동 업그레이드
- 웹훅으로 결제 확인

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15  
**참고**: 
- [Lemon Squeezy API 문서](https://docs.lemonsqueezy.com/api)
- [Lemon Squeezy Usage-based Billing](https://docs.lemonsqueezy.com/help/products/usage-based-billing)

