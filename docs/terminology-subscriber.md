# 구독 관련 용어 정리 (Subscriber Terminology)

## 📚 용어 정의

### 1. **Subscriber** (구독자) - 명사
**의미**: 뉴스레터를 구독하는 사람/엔티티

**사용 규칙**:
- 엔티티/도메인 모델: `Subscriber`
- 데이터베이스 테이블: `subscribers`
- 서비스/리포지토리: `SubscriberService`, `SubscriberRepository`
- API 엔드포인트: `/api/newsletters/{newsletterId}/subscribers`
- DTO: `SubscriberResponse`, `CreateSubscriberRequest`
- 프론트엔드 타입: `Subscriber`

**예시**:
- "구독자 목록 조회" → `getSubscribers()`
- "구독자 추가" → `createSubscriber()`
- "구독자 삭제" → `deleteSubscriber()`

---

### 2. **Subscribe** (구독하다) - 동사
**의미**: 뉴스레터를 구독하는 행위

**사용 규칙**:
- API 경로: `/subscribe`, `/subscribe/confirm`
- 함수명: `publicSubscribe()`, `confirmSubscription()` (혼란스러움 - 아래 참고)
- 컴포넌트: `SubscribeForm`
- 파일명: `subscribe-form.tsx`, `subscribe/confirm/page.tsx`
- DTO: `PublicSubscribeRequest`

**예시**:
- "구독 신청" → `publicSubscribe()`
- "구독 확인" → `/subscribe/confirm`

---

### 3. **Subscription** (구독) - 명사
**의미**: 구독 행위 자체 또는 구독 상태

**현재 사용 현황**:
- ❌ `SubscriptionConfirmResponse` - 실제로는 구독자 확인 응답이므로 `SubscriberConfirmResponse`가 더 적절
- ❌ `confirmSubscription()` - 실제로는 구독자 확인이므로 `confirmSubscriber()` 또는 `confirmSubscribe()`가 더 적절
- ✅ 문서: `subscription-system.md` (시스템 전체를 다루므로 적절)
- ✅ 문서: `subscription-confirmation-flow.md` (구독 확인 플로우를 다루므로 적절)

**권장 사용**:
- 구독 시스템 전체를 다룰 때: `subscription-system`, `subscription-flow`
- 구독자 관련 작업일 때: `subscriber` 사용 권장

---

## 🔍 현재 구현 현황

### Backend

#### 도메인 모델
```kotlin
// ✅ 올바른 사용
data class Subscriber(
    val id: String,
    val email: String,
    val status: SubStatus,
    val newsletterId: String,
    // ...
)
```

#### 서비스
```kotlin
// ✅ 올바른 사용
class SubscriberService {
    suspend fun createSubscriber(...)
    suspend fun getSubscribersByNewsletter(...)
    suspend fun deleteSubscriber(...)
    suspend fun subscribePublic(...) // 동사형 사용 (적절)
    suspend fun confirmSubscription(...) // ⚠️ 혼란스러움: confirmSubscriber() 또는 confirmSubscribe() 권장
}
```

#### DTO
```kotlin
// ✅ 올바른 사용
data class SubscriberResponse(...)
data class CreateSubscriberRequest(...)

// ✅ 올바른 사용
data class SubscribeConfirmResponse(...)
```

#### 라우트
```kotlin
// ✅ 올바른 사용
route("/api/newsletters/{newsletterId}/subscribers") {
    get { ... } // 구독자 목록
    post { ... } // 구독자 추가
    delete("/{subscriberId}") { ... } // 구독자 삭제
}

// ✅ 동사형 사용 (공개 API)
route("/api/public") {
    post("/newsletter/{newsletterId}/subscribe") { ... } // 구독 신청
    get("/subscribe/confirm") { ... } // 구독 확인
}
```

#### 데이터베이스
```sql
-- ✅ 올바른 사용
CREATE TABLE subscribers (...)
CREATE TABLE subscriber_verification_tokens (...)
```

---

### Frontend

#### 타입 정의
```typescript
// ✅ 올바른 사용
export interface Subscriber {
  id: string;
  email: string;
  status: "PENDING" | "ACTIVE" | "UNSUBSCRIBED";
  // ...
}

// ✅ 올바른 사용
export interface SubscribeConfirmResponse {
  // ...
}
```

#### API 함수
```typescript
// ✅ 올바른 사용
export async function getSubscribers(...)
export async function createSubscriber(...)
export async function deleteSubscriber(...)
export async function publicSubscribe(...) // 동사형 사용 (적절)

// ✅ 올바른 사용
export async function confirmSubscribe(...)
```

#### 컴포넌트
```typescript
// ✅ 올바른 사용
export function SubscribeForm(...) // 동사형 사용 (적절)
```

#### 파일/경로
```
✅ 올바른 사용:
- subscriber.ts
- subscribe-form.tsx
- subscribe/confirm/page.tsx
```

---

## 🎯 권장 사항

### 1. 용어 사용 원칙

| 용도 | 권장 용어 | 예시 |
|------|----------|------|
| 엔티티/도메인 모델 | `Subscriber` | `Subscriber`, `SubscriberResponse` |
| 데이터베이스 테이블 | `subscribers` | `subscribers`, `subscriber_verification_tokens` |
| 서비스/리포지토리 | `Subscriber*` | `SubscriberService`, `SubscriberRepository` |
| API 엔드포인트 (명사) | `subscribers` | `/api/newsletters/{id}/subscribers` |
| API 엔드포인트 (동사) | `subscribe` | `/api/public/newsletter/{id}/subscribe` |
| 함수명 (명사) | `Subscriber*` | `getSubscribers()`, `createSubscriber()` |
| 함수명 (동사) | `subscribe*` | `publicSubscribe()`, `confirmSubscribe()` |
| 컴포넌트명 | `Subscribe*` | `SubscribeForm` |

### 2. 개선이 필요한 부분

#### Backend
1. **`SubscriptionConfirmResponse` → `SubscriberConfirmResponse` 또는 `SubscribeConfirmResponse`**
   - 현재: `SubscriptionConfirmResponse`
   - 권장: `SubscriberConfirmResponse` (구독자 확인 응답이므로)
   - 또는: `SubscribeConfirmResponse` (구독 확인 응답이므로)

2. **`confirmSubscription()` → `confirmSubscribe()` 또는 `confirmSubscriber()`**
   - 현재: `confirmSubscription(token: String)`
   - 권장: `confirmSubscribe(token: String)` (동사형 일관성)
   - 또는: `confirmSubscriber(token: String)` (구독자 확인 의미)

3. **`getSubscriptionConfirmResponse()` → `getSubscriberConfirmResponse()`**
   - 현재: `getSubscriptionConfirmResponse(subscriber: Subscriber)`
   - 권장: `getSubscriberConfirmResponse(subscriber: Subscriber)`

#### Frontend
1. **`SubscriptionConfirmResponse` → `SubscriberConfirmResponse` 또는 `SubscribeConfirmResponse`**
   - Backend와 동일하게 변경

2. **`confirmSubscription()` → `confirmSubscribe()`**
   - 현재: `confirmSubscription(token: string)`
   - 권장: `confirmSubscribe(token: string)` (동사형 일관성)

---

## 📋 용어 매핑표

| 변경 완료 | 새로운 용어 | 이유 |
|----------|----------|------|
| ✅ `SubscriptionConfirmResponse` | `SubscribeConfirmResponse` | 구독 확인 응답이므로 |
| ✅ `confirmSubscription()` | `confirmSubscribe()` | 동사형 일관성 (publicSubscribe와 일치) |
| ✅ `getSubscriptionConfirmResponse()` | `getSubscribeConfirmResponse()` | 구독 확인 관련이므로 |

---

## ✅ 일관성 체크리스트

### Backend
- [x] 도메인 모델: `Subscriber` 사용
- [x] 테이블명: `subscribers` 사용
- [x] 서비스: `SubscriberService` 사용
- [x] 리포지토리: `SubscriberRepository` 사용
- [x] 기본 DTO: `SubscriberResponse` 사용
- [x] 확인 응답: `SubscribeConfirmResponse` 사용
- [x] 확인 메서드: `confirmSubscribe()` 사용

### Frontend
- [x] 기본 타입: `Subscriber` 사용
- [x] API 함수: `getSubscribers()`, `createSubscriber()` 사용
- [x] 공개 구독: `publicSubscribe()` 사용
- [x] 확인 응답: `SubscribeConfirmResponse` 사용
- [x] 확인 함수: `confirmSubscribe()` 사용
- [x] 컴포넌트: `SubscribeForm` 사용

---

## 📝 요약

1. **Subscriber** (구독자): 엔티티, 도메인 모델, 서비스, 리포지토리에서 사용
2. **Subscribe** (구독하다): 동사형으로 API 경로, 함수명, 컴포넌트명에서 사용
3. **Subscription** (구독): 시스템 전체를 다룰 때만 사용, 구체적인 엔티티/작업에는 사용 지양

**핵심 원칙**: 
- 구체적인 엔티티/작업 → `Subscriber` 또는 `Subscribe`
- 시스템 전체/플로우 → `Subscription`

