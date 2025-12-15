# 이메일 발송 시스템 구현 계획

## 📋 개요

Vality 서비스에서 이메일 발송이 필요한 주요 시나리오와 구현 계획을 정리한 문서입니다.  
**AWS SES**를 이메일 서비스로 사용하며, **Redis Streams**를 활용한 비동기 큐 시스템으로 구현합니다.  
**Email Worker**는 같은 Ktor 애플리케이션 프로세스 내에서 코루틴으로 실행됩니다.

---

## 🎯 이메일 발송이 필요한 시나리오

### 1. 인증 관련 이메일
- **인증 코드 발송** (`/api/auth/send-verification-code`)
  - 이메일 로그인/회원가입 시 6자리 인증 코드 발송
  - 현재 상태: 코드 생성만 하고 콘솔 출력 (`println`)
  - 우선순위: **높음** (MVP 필수)
  - 발송 방식: **즉시 발송** (큐 사용, 우선순위 높음)

### 2. 뉴스레터 발송
- **뉴스레터 발행 시 구독자들에게 일괄 발송**
  - Issue 발행 시 활성 구독자들에게 이메일 발송
  - HTML 템플릿 사용 (마크다운 → HTML 변환)
  - 우선순위: **높음** (핵심 기능)
  - 발송 방식: **배치 발송** (큐 사용, 대량 처리)

### 3. 구독 관련 이메일
- **구독 확인 이메일**
  - 신규 구독 시 확인 이메일 발송
  - 구독 취소 확인 이메일 (선택)
  - 우선순위: **중간**
  - 발송 방식: **즉시 발송** (큐 사용)

### 4. 시스템 알림 (향후)
- **구독자 환영 이메일**
- **뉴스레터 발행 알림**

---

## 🛠 기술 스택

### 이메일 서비스: AWS SES (Amazon Simple Email Service)

**선택 이유:**
- ✅ **가장 저렴한 비용** (대량 발송 시 압도적)
- ✅ EC2에서 발송 시 월 62,000건까지 무료
- ✅ 높은 확장성 및 안정성
- ✅ AWS 인프라와 통합 용이
- ✅ 상세한 통계 및 모니터링

**비용:**
- **EC2에서 발송 시**: 월 62,000건까지 **무료**
- **일반 발송**: 1,000건당 **$0.10** (약 130원)
- **프리 티어**: 처음 12개월간 월 3,000건 무료

**비용 예시:**
- 월 10,000건: **$1.00** (약 1,300원)
- 월 100,000건: **$10.00** (약 13,000원)
- EC2에서 발송 시: 월 62,000건까지 **무료**

---

### 메시지 큐: Redis Streams (추천 ⭐)

**선택 이유:**
- ✅ **Redis 네이티브 기능** (Redis 5.0+, 별도 브로커 불필요)
- ✅ **Kotlin/Ktor와 완벽 호환** (Lettuce 클라이언트 지원)
- ✅ **Consumer Groups** (여러 Worker가 자동으로 작업 분산)
- ✅ **메시지 순서 보장**
- ✅ **PEL (Pending Entry List)** 지원 (처리 실패 시 자동 재처리)
- ✅ **At-least-once delivery** 보장
- ✅ **Redis의 다른 기능 활용** (캐싱, Rate Limiting, Pub/Sub)

**사용 목적:**
- 이메일 발송 작업을 비동기로 처리
- 대량 발송 시 부하 분산 (Consumer Groups)
- 재시도 로직 구현 (PEL 활용)
- 작업 상태 추적 및 모니터링

**Redis Streams의 작동 방식:**
- **Stream** 데이터 구조 사용 (로그 기반)
- **Consumer Groups**로 여러 Worker가 작업 분산 처리
- **XADD**: 작업 추가
- **XREADGROUP**: Consumer Group에서 작업 소비
- **XACK**: 작업 완료 확인
- **XPENDING**: 처리 중인 작업 확인 (재시도용)

**대안: RabbitMQ** (우선순위 큐/지연 작업이 필수인 경우)
- Kotlin/Ktor와 완벽 호환
- 우선순위 큐, 지연 작업 네이티브 지원
- 관리 UI 제공
- 별도 인프라 필요

---

### 캐싱/상태 관리: Redis

**Redis의 다중 역할:**

#### 1. **Redis Streams 큐 백엔드** (주요 역할)
- **작업 데이터 저장**: Stream에 작업 데이터 저장 (JSON 직렬화)
- **Consumer Groups**: 여러 Worker가 자동으로 작업 분산 처리
- **작업 상태 관리**: PEL (Pending Entry List)로 처리 중인 작업 추적
- **재시도 처리**: PEL의 메시지를 주기적으로 확인하여 재시도
- **작업 진행률**: Hash 구조로 진행률 저장 (선택)

#### 2. **캐싱**
- **인증 코드 캐싱**: `verification:code:{email}` (TTL: 10분)
- **이메일 발송 상태 캐싱**: `email:status:{emailId}`
- **템플릿 캐싱**: `template:{templateName}` (선택)

#### 3. **Rate Limiting**
- **이메일 발송 제한**: `rate:limit:{email}` (1시간당 5건)
- **IP 기반 제한**: `rate:limit:ip:{ip}` (DDoS 방지)

#### 4. **Pub/Sub (실시간 업데이트)**
- **발송 상태 알림**: Worker가 발송 완료 시 Pub/Sub으로 알림
- **실시간 모니터링**: 프론트엔드에서 발송 진행률 구독

#### 5. **세션/상태 관리** (선택)
- **사용자 세션**: JWT Refresh Token 저장
- **임시 데이터**: 일시적인 데이터 저장

**Redis 데이터 구조 예시:**
```
# Redis Streams 큐
email:send                      # Stream: 이메일 발송 작업 큐
email:send:priority            # Sorted Set: 우선순위 큐 (선택, 별도 구현)
email:send:delayed              # Sorted Set: 지연 작업 (선택, 별도 구현)

# Consumer Groups (자동 생성)
email:send:workers              # Consumer Group: Worker 그룹

# 인증 코드 캐싱
verification:code:user@example.com  # "123456" (TTL: 600초)

# Rate Limiting
rate:limit:user@example.com     # "5" (TTL: 3600초)

# 발송 상태 캐싱
email:status:email-123          # "sent" (TTL: 86400초)

# Pub/Sub 채널
email:progress:{issueId}        # 발송 진행률 알림
```

---

## 🏗 아키텍처 설계

### 전체 흐름도

```
┌─────────────────────────────────────────┐
│      Ktor 애플리케이션 (단일 프로세스)  │
│  ┌──────────────────────────────────┐ │
│  │   API Server                     │ │
│  │   (HTTP 요청 처리)                │ │
│  └───────────┬──────────────────────┘ │
│              │                         │
│              │ 1. 이메일 발송 요청     │
│              │    - Redis Streams에   │
│              │      작업 추가 (XADD)  │
│              ▼                         │
│  ┌──────────────────────────────────┐ │
│  │   Email Worker                   │ │
│  │   (백그라운드 코루틴)             │ │
│  │   - 애플리케이션 시작 시 자동 실행│ │
│  └──────────────────────────────────┘ │
└───────────────┬─────────────────────────┘
                │
                │ 2. Redis Streams 작업 소비
                ▼
┌─────────────────────────────────────────────────────────┐
│                    Redis                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Redis Streams 큐 (네이티브 기능)                │  │
│  │ - email:send (Stream)                            │  │
│  │ - email:send:priority (Sorted Set, 선택)        │  │
│  │ - email:send:delayed (Sorted Set, 선택)         │  │
│  │ - Consumer Group: email:workers                  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 캐싱 데이터                                       │  │
│  │ - verification:code:{email} (TTL: 10분)          │  │
│  │ - email:status:{emailId}                         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Rate Limiting                                    │  │
│  │ - rate:limit:{email} (1시간당 5건)              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Pub/Sub 채널                                      │  │
│  │ - email:progress:{issueId}                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │
              │ 2. Worker 코루틴이 큐에서 작업 소비
              │    - Consumer Group에서 작업 가져오기 (XREADGROUP)
              │    - 백그라운드에서 계속 실행
              ▼
              │
              │ 3. SES API 호출
              ▼
┌─────────────────────────────────────┐
│         AWS SES                     │
│  - 이메일 발송                      │
│  - Webhook (이벤트 수신)            │
└─────────────────────────────────────┘
              │
              │ 4. 상태 업데이트
              │    - Redis 캐시 업데이트
              │    - 작업 완료 확인 (XACK)
              │    - Pub/Sub 알림 발송
              ▼
┌─────────────────────────────────────┐
│         Redis (상태 업데이트)       │
│  - 작업 상태: completed/failed      │
│  - 발송 상태 캐싱                   │
│  - 진행률 Pub/Sub 알림              │
└─────────────────────────────────────┘
```

### 각 요소의 역할 상세

#### 1. **Redis Streams의 역할**
- **작업 큐 관리**: Stream에 작업을 저장하고 관리
- **Consumer Groups**: 여러 Worker가 자동으로 작업 분산 처리
- **메시지 순서 보장**: Stream의 로그 기반 구조
- **자동 재시도**: PEL (Pending Entry List)를 통한 재시도 처리
- **작업 상태 추적**: Consumer Group의 PEL로 처리 중인 작업 추적
- **At-least-once delivery**: 메시지 전달 보장

#### 2. **Redis의 역할**

**A. Redis Streams 백엔드 (주요 역할)**
- 작업 데이터 저장 (Stream에 JSON 직렬화)
- Consumer Groups 관리
- PEL (Pending Entry List)로 처리 중인 작업 추적

**B. 캐싱**
- 인증 코드: 빠른 조회를 위한 캐싱
- 이메일 상태: 발송 상태 조회 최적화
- 템플릿: 자주 사용하는 템플릿 캐싱 (선택)

**C. Rate Limiting**
- 이메일 발송 제한: 동일 이메일/IP의 과도한 요청 방지
- SES Rate Limit 준수: AWS SES 제한 내에서 발송

**D. Pub/Sub**
- 실시간 진행률 알림: 프론트엔드에 발송 진행률 전달
- 상태 변경 알림: 작업 완료/실패 시 알림

#### 3. **AWS SES의 역할**
- 실제 이메일 발송
- 발송 통계 제공
- Webhook을 통한 이벤트 수신 (오픈, 클릭, 바운스 등)

---

## 🔍 각 요소의 역할 상세 설명

### 1. Redis Streams의 역할

**Redis Streams는 Redis 5.0+의 네이티브 큐 기능입니다.**

#### 주요 기능:
- **작업 큐 관리**: Stream에 작업을 저장하고 관리 (로그 기반)
- **Consumer Groups**: 여러 Worker가 자동으로 작업 분산 처리
- **메시지 순서 보장**: Stream의 로그 기반 구조로 순서 보장
- **자동 재시도**: PEL (Pending Entry List)를 통한 재시도 처리
- **At-least-once delivery**: 메시지 전달 보장
- **작업 상태 추적**: Consumer Group의 PEL로 처리 중인 작업 추적

#### Redis 데이터 구조 활용:
```
email:send                      → Stream: 이메일 발송 작업 큐
email:send:priority             → Sorted Set: 우선순위 큐 (선택, 별도 구현)
email:send:delayed              → Sorted Set: 지연 작업 (선택, 별도 구현)
email:job:{jobId}               → Hash: 작업 메타데이터 (선택)
```

#### 작업 흐름:
1. **작업 추가**: `XADD email:send` → Stream에 작업 추가
2. **작업 소비**: Worker가 `XREADGROUP` 호출 → Consumer Group에서 작업 가져오기
3. **작업 완료**: `XACK` → 작업 완료 확인, Stream에서 제거
4. **작업 실패**: ACK하지 않으면 PEL에 남아있어 자동 재시도

---

### 2. Redis의 역할 (다중 역할)

Redis는 **Redis Streams의 백엔드**이면서 동시에 **캐싱, Rate Limiting, Pub/Sub**에도 사용됩니다.

#### A. Redis Streams 백엔드 스토리지 (주요 역할)

**작업 데이터 저장:**
- 작업 내용 (Stream에 JSON 직렬화)
- Consumer Groups 관리
- PEL (Pending Entry List)로 처리 중인 작업 추적

**큐 상태 관리:**
- Stream 구조로 큐 구현 (`XADD`, `XREADGROUP` 등)
- Consumer Groups로 작업 분산 (`XGROUP CREATE`, `XREADGROUP` 등)
- PEL로 재시도 관리 (`XPENDING`, `XCLAIM` 등)

#### B. 캐싱

**인증 코드 캐싱:**
```
키: verification:code:{email}
값: "123456"
TTL: 600초 (10분)
```
- 빠른 조회를 위한 캐싱
- 만료 시간 자동 관리 (TTL)

**이메일 발송 상태 캐싱:**
```
키: email:status:{emailId}
값: "sent" | "failed" | "pending"
TTL: 86400초 (24시간)
```
- 발송 상태 조회 최적화
- DB 조회 부하 감소

**템플릿 캐싱 (선택):**
```
키: template:{templateName}
값: 렌더링된 HTML (또는 템플릿 원본)
TTL: 무제한 (또는 긴 TTL)
```
- 자주 사용하는 템플릿 캐싱
- 템플릿 렌더링 성능 향상

#### C. Rate Limiting

**이메일 발송 제한:**
```
키: rate:limit:{email}
값: 발송 횟수 (예: "5")
TTL: 3600초 (1시간)
```
- 동일 이메일의 과도한 요청 방지
- SES Rate Limit 준수
- DDoS 방지

**구현 방식:**
```kotlin
// Rate Limit 확인
val count = redis.incr("rate:limit:$email")
if (count == 1L) {
    redis.expire("rate:limit:$email", 3600) // 첫 요청 시 TTL 설정
}
if (count > 5) {
    throw RateLimitExceededException()
}
```

#### D. Pub/Sub (실시간 업데이트)

**발송 진행률 알림:**
```
채널: email:progress:{issueId}
메시지: {"completed": 50, "total": 100, "percentage": 50}
```
- Worker가 발송 완료 시 Pub/Sub으로 알림 발송
- 프론트엔드에서 실시간 진행률 구독
- WebSocket과 연동하여 실시간 UI 업데이트

**구현 방식:**
```kotlin
// Worker에서 발송 완료 시
redis.publish("email:progress:$issueId", """
    {
        "completed": $completed,
        "total": $total,
        "percentage": ${(completed * 100 / total)}
    }
""")
```

#### E. 세션/상태 관리 (선택)

**JWT Refresh Token 저장:**
```
키: refresh:token:{userId}
값: refreshToken
TTL: 2592000초 (30일)
```

**임시 데이터 저장:**
- 일시적인 데이터 저장
- TTL로 자동 정리

---

### 3. AWS SES의 역할

**실제 이메일 발송:**
- SMTP 또는 API를 통한 이메일 발송
- HTML 및 텍스트 이메일 지원
- 첨부 파일 지원 (선택)

**발송 통계:**
- 발송 성공/실패 통계
- 바운스율, 오픈율, 클릭율 추적
- 발송 이력 조회

**Webhook 이벤트:**
- 이메일 오픈 이벤트 (`opened`)
- 링크 클릭 이벤트 (`clicked`)
- 바운스 이벤트 (`bounced`)
- 실패 이벤트 (`failed`)

**Rate Limit 관리:**
- 초당 14건 제한 (기본)
- 일일 할당량 확인 필요
- Production 환경에서 제한 증가 요청 가능

---

### 4. 전체 시스템 상호작용

```
1. Ktor 애플리케이션 (단일 프로세스)
   ├── API Server
   │   ↓ 이메일 발송 요청 수신
   │   ↓ EmailQueueService 호출
   │
   └── Email Worker (백그라운드 코루틴)
       ↓ 애플리케이션 시작 시 자동 실행
       ↓ 계속 실행 중 (무한 루프)

2. EmailQueueService
   ↓ Redis Streams에 작업 추가 (XADD)
   
3. Redis (Streams 백엔드)
   - Stream에 작업 데이터 저장
   - Consumer Group 관리
   - Rate Limit 확인 (String with TTL)
   
4. Email Worker 코루틴
   ↓ Redis Streams에서 작업 가져오기 (XREADGROUP)
   ↓ Rate Limit 확인 (Redis)
   ↓ 템플릿 렌더링 (템플릿 캐싱 가능)
   ↓ AWS SES API 호출
   ↓ EmailLog 업데이트 (PostgreSQL)
   ↓ Redis 상태 업데이트
   ↓ 작업 완료 확인 (XACK)
   ↓ Pub/Sub 진행률 알림 (Redis)
   
5. AWS SES
   ↓ 이메일 발송
   ↓ Webhook 이벤트 발송
   
6. Redis (상태 관리)
   - 작업 상태 업데이트 (ACK 완료)
   - 발송 상태 캐싱
   - 진행률 Pub/Sub 알림
```

---

## 📁 구현 구조

```
apps/api/src/main/kotlin/io/vality/
├── service/
│   ├── EmailService.kt                    # 이메일 발송 서비스 인터페이스
│   ├── AuthService.kt                     # 인증 코드 발송 로직 수정
│   └── email/
│       ├── SESEmailService.kt             # AWS SES API 클라이언트
│       ├── EmailTemplateService.kt        # 이메일 템플릿 관리
│       ├── EmailQueueService.kt           # Redis Streams 큐 발행 서비스
│       └── EmailWorker.kt                 # Redis Streams 작업 소비 워커 (코루틴)
├── plugins/
│   └── EmailWorkerPlugin.kt              # Worker 플러그인 (애플리케이션 시작 시 Worker 실행)
├── queue/
│   ├── RedisStreamsConfig.kt             # Redis Streams 설정
│   └── EmailJob.kt                        # 큐 작업 DTO
├── cache/
│   └── EmailCacheService.kt               # Redis 캐싱 서비스
├── cache/
│   └── EmailCacheService.kt               # Redis 캐싱 서비스
├── dto/email/
│   ├── SendEmailRequest.kt                # 이메일 발송 요청 DTO
│   ├── SESResponse.kt                     # SES API 응답 DTO
│   └── EmailStatus.kt                      # 이메일 상태 DTO
└── templates/email/                       # 이메일 HTML 템플릿
    ├── verification-code.html              # 인증 코드 템플릿
    ├── newsletter-issue.html               # 뉴스레터 발행 템플릿
    └── subscription-confirm.html           # 구독 확인 템플릿
```

---

## 🔧 구현 단계

### Phase 1: AWS SES 기본 설정 (우선순위: 높음)

#### 1.1 AWS SES 설정
- [ ] AWS 계정 생성 및 SES 활성화
- [ ] 도메인 인증 (DKIM, SPF, DMARC 설정)
- [ ] Sandbox 모드 해제 (프로덕션 환경)
- [ ] IAM 사용자 생성 및 권한 설정
- [ ] 환경 변수 설정 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)

**예상 시간**: 2-3시간

#### 1.2 SES API 클라이언트 구현
- [ ] AWS SDK for Kotlin 의존성 추가
- [ ] `SESEmailService` 클래스 생성
- [ ] SES API 엔드포인트 연동 (`SendEmail`, `SendRawEmail`)
- [ ] 에러 처리 및 재시도 로직

**예상 시간**: 3-4시간

#### 1.3 이메일 템플릿 시스템
- [ ] HTML 템플릿 파일 생성
- [ ] 템플릿 변수 치환 로직 (`{{variable}}` → 실제 값)
- [ ] 인증 코드 템플릿 작성
- [ ] 반응형 디자인 (모바일 최적화)

**예상 시간**: 2-3시간

---

### Phase 2: Redis Streams 큐 시스템 구축 (우선순위: 높음)

#### 2.1 Redis Streams 설정
- [ ] Redis 5.0+ 버전 확인
- [ ] Redis 클라이언트 라이브러리 추가 (Lettuce 권장)
- [ ] Redis 연결 설정
- [ ] Connection Pool 설정

**예상 시간**: 1-2시간

#### 2.2 Redis Streams 큐 구조 설계
- [ ] Stream 이름 정의: `email:send`
- [ ] Consumer Group 이름 정의: `email:workers`
- [ ] 우선순위 큐 (선택): Sorted Set 사용
  - `email:send:priority` (Sorted Set)
  - Score = 우선순위, Value = 작업 ID
- [ ] 지연 작업 큐 (선택): Sorted Set 사용
  - `email:send:delayed` (Sorted Set)
  - Score = 실행 시간 (타임스탬프), Value = 작업 ID

**예상 시간**: 2-3시간

#### 2.3 EmailQueueService 구현
- [ ] `EmailQueueService` 클래스 생성
- [ ] Stream에 작업 추가 (`XADD`)
- [ ] 우선순위 큐 지원 (Sorted Set 활용)
- [ ] 지연 작업 지원 (`XPENDING` + Sorted Set)
- [ ] 작업 데이터 직렬화 (JSON)

**예상 시간**: 3-4시간

#### 2.4 Consumer Group 생성
- [ ] Consumer Group 생성 (`XGROUP CREATE`)
- [ ] Worker별 Consumer 이름 정의
- [ ] 초기 설정 확인

**예상 시간**: 1시간

---

### Phase 3: Redis 캐싱 시스템 (우선순위: 중간)

#### 3.1 Redis 설정
- [ ] Docker Compose에 Redis 추가 (이미 존재)
- [ ] Redis 연결 설정
- [ ] Redis 클라이언트 라이브러리 추가

**예상 시간**: 1시간

#### 3.2 EmailCacheService 구현
- [ ] `EmailCacheService` 클래스 생성
- [ ] 인증 코드 캐싱 (TTL: 10분)
- [ ] Rate Limiting 구현
- [ ] 발송 상태 캐싱
- [ ] Pub/Sub 설정 (실시간 업데이트)

**예상 시간**: 3-4시간

---

### Phase 4: Email Worker 구현 (우선순위: 높음)

#### 4.1 EmailWorker 구현
- [ ] `EmailWorker` 클래스 생성
- [ ] Redis Streams 작업 소비 로직 (`XREADGROUP`)
- [ ] 무한 루프로 계속 실행 (코루틴)
- [ ] Rate Limit 확인 (Redis)
- [ ] 템플릿 렌더링
- [ ] SES API 호출
- [ ] EmailLog 업데이트
- [ ] Redis 상태 업데이트
- [ ] 작업 완료 확인 (`XACK`)
- [ ] Pub/Sub으로 진행률 알림
- [ ] 에러 처리 및 재시도 로직

**예상 시간**: 4-5시간

#### 4.2 Worker 플러그인 구현
- [ ] `EmailWorkerPlugin` 생성
- [ ] 애플리케이션 시작 시 Worker 코루틴 시작 (`ApplicationStarted` 이벤트)
- [ ] 애플리케이션 종료 시 Worker 정리 (`ApplicationStopped` 이벤트)
- [ ] `Application.module()`에 플러그인 등록

**예상 시간**: 1-2시간

#### 4.3 재시도 로직
- [ ] PEL (Pending Entry List) 활용한 재시도
- [ ] 지수 백오프 설정 (2^attempts 초)
- [ ] 최대 재시도 횟수 설정 (3회)
- [ ] 재시도 실패 시 실패 처리
- [ ] 실패 작업 모니터링

**예상 시간**: 2-3시간

---

### Phase 5: 인증 코드 발송 구현 (우선순위: 높음)

#### 5.1 AuthService 수정
- [ ] `AuthService.sendVerificationCode()`에서 큐 발행
- [ ] `EmailQueueService` 주입 및 호출
- [ ] 인증 코드 Redis 캐싱
- [ ] 에러 처리

**예상 시간**: 2-3시간

#### 5.2 인증 코드 템플릿
- [ ] 인증 코드 이메일 HTML 템플릿 작성
- [ ] 브랜딩 적용 (로고, 색상)
- [ ] 보안 메시지 추가 (10분 유효, 재사용 불가 등)

**예상 시간**: 1-2시간

**테스트 시나리오:**
- [ ] 정상 발송 확인
- [ ] 잘못된 이메일 주소 처리
- [ ] SES API 실패 시 재시도 확인 (PEL 활용)
- [ ] Worker가 애플리케이션 시작 시 자동 실행되는지 확인
- [ ] 애플리케이션 종료 시 Worker가 정상 종료되는지 확인

---

### Phase 6: 뉴스레터 발송 구현 (우선순위: 높음)

#### 6.1 Issue 발행 시 이메일 발송
- [ ] Issue 발행 API에서 구독자 목록 조회
- [ ] 각 구독자에게 큐 메시지 발행 (배치)
- [ ] `EmailLog` 생성 및 상태 추적
- [ ] 발송 진행률 추적

**예상 시간**: 4-5시간

#### 6.2 뉴스레터 템플릿
- [ ] 뉴스레터 HTML 템플릿 작성
- [ ] 마크다운 → HTML 변환 로직
- [ ] 개인화 (구독자 이름, 구독 취소 링크)
- [ ] 트래킹 픽셀 (오픈율 추적)

**예상 시간**: 4-5시간

#### 6.3 배치 발송 최적화
- [ ] 대량 발송 시 Rate Limit 처리 (Redis)
- [ ] 동시 발송 수 제한 (Worker 수 조절)
- [ ] 발송 실패 재시도 로직
- [ ] 발송 진행률 모니터링

**예상 시간**: 3-4시간

---

### Phase 7: 구독 확인 이메일 (우선순위: 중간)

#### 7.1 구독 확인 이메일 발송
- [ ] 신규 구독 시 확인 이메일 큐 발행
- [ ] 구독 확인 링크 포함
- [ ] 템플릿 작성

**예상 시간**: 2-3시간

---

### Phase 8: 이메일 추적 및 모니터링 (우선순위: 중간)

#### 8.1 SES Webhook 연동
- [ ] SES Webhook 엔드포인트 생성
- [ ] 이벤트 수신 처리
  - 오픈 이벤트 (`opened`)
  - 클릭 이벤트 (`clicked`)
  - 바운스 이벤트 (`bounced`)
  - 실패 이벤트 (`failed`)
- [ ] `EmailLog` 상태 업데이트

**예상 시간**: 4-5시간

#### 8.2 모니터링 대시보드
- [ ] 발송 통계 수집
- [ ] 성공률/실패률 추적
- [ ] 바운스율 모니터링
- [ ] 오픈율/클릭율 추적

**예상 시간**: 3-4시간

---

## 📝 구현 상세

### 1. Redis Streams 큐 구조

```kotlin
// Stream 및 Consumer Group 이름
object EmailQueues {
    const val STREAM_NAME = "email:send"
    const val CONSUMER_GROUP = "email:workers"
    
    // 우선순위 큐 (선택, Sorted Set)
    const val PRIORITY_QUEUE = "email:send:priority"
    
    // 지연 작업 큐 (선택, Sorted Set)
    const val DELAYED_QUEUE = "email:send:delayed"
}

// 우선순위
object EmailPriority {
    const val HIGH = 10      // 인증 코드
    const val MEDIUM = 5      // 뉴스레터
    const val LOW = 1         // 구독 확인
}
```

### 2. EmailJob DTO

```kotlin
@Serializable
data class EmailJob(
    val id: String = CuidGenerator.generate(),
    val type: EmailType,
    val to: String,
    val subject: String,
    val template: String,
    val templateData: Map<String, String>,
    val priority: Int = EmailPriority.MEDIUM,
    val delay: Long = 0,  // 지연 시간 (밀리초)
    val attempts: Int = 0,
    val maxAttempts: Int = 3,
    val createdAt: Instant = Instant.now()
)

enum class EmailType {
    VERIFICATION_CODE,
    NEWSLETTER,
    SUBSCRIPTION_CONFIRM,
    SUBSCRIPTION_CANCEL
}
```

### 3. EmailQueueService 구현 예시 (Redis Streams)

```kotlin
class EmailQueueService(
    private val redis: RedisCommands<String, String>,
    private val objectMapper: ObjectMapper
) {
    suspend fun addJob(job: EmailJob) {
        val jobData = objectMapper.writeValueAsString(job)
        
        // 지연 작업인 경우
        if (job.delay > 0) {
            val executeAt = Instant.now().toEpochMilli() + job.delay
            redis.zadd(
                EmailQueues.DELAYED_QUEUE,
                executeAt.toDouble(),
                job.id
            )
            // 작업 데이터 저장 (Hash)
            redis.hset("email:job:${job.id}", "data", jobData)
            return
        }
        
        // 우선순위가 높은 경우 우선순위 큐에 추가
        if (job.priority > EmailPriority.MEDIUM) {
            redis.zadd(
                EmailQueues.PRIORITY_QUEUE,
                job.priority.toDouble(),
                job.id
            )
            redis.hset("email:job:${job.id}", "data", jobData)
            // 우선순위 큐에서 Stream으로 이동하는 별도 프로세스 필요
            return
        }
        
        // 일반 작업: Stream에 직접 추가
        redis.xadd(
            EmailQueues.STREAM_NAME,
            mapOf(
                "id" to job.id,
                "data" to jobData,
                "priority" to job.priority.toString()
            )
        )
    }
    
    suspend fun getNextJob(consumerName: String): EmailJob? {
        // Consumer Group에서 작업 가져오기
        val messages = redis.xreadgroup(
            Consumer.from(EmailQueues.CONSUMER_GROUP, consumerName),
            XReadArgs.StreamOffset.from(EmailQueues.STREAM_NAME, ">")
        )
        
        if (messages.isEmpty()) return null
        
        val message = messages.first()
        val jobData = message.body["data"] ?: return null
        
        return objectMapper.readValue<EmailJob>(jobData)
    }
    
    suspend fun completeJob(messageId: String) {
        // 작업 완료 확인 (ACK)
        redis.xack(
            EmailQueues.STREAM_NAME,
            EmailQueues.CONSUMER_GROUP,
            messageId
        )
    }
    
    suspend fun failJob(messageId: String, error: String) {
        // ACK하지 않으면 PEL에 남아있어 자동 재시도됨
        // 또는 명시적으로 실패 처리
        redis.xack(
            EmailQueues.STREAM_NAME,
            EmailQueues.CONSUMER_GROUP,
            messageId
        )
        // 실패 로그 저장 (선택)
        redis.hset("email:failed:$messageId", "error", error)
    }
    
    suspend fun checkPendingJobs(consumerName: String): List<EmailJob> {
        // PEL에서 처리 중인 작업 확인 (재시도용)
        val pending = redis.xpending(
            EmailQueues.STREAM_NAME,
            EmailQueues.CONSUMER_GROUP
        )
        
        // 일정 시간 이상 처리 중인 작업은 재시도
        val retryJobs = pending.filter { 
            it.idleTime > 60000 // 60초 이상 처리 중
        }
        
        return retryJobs.map { 
            val message = redis.xrange(
                EmailQueues.STREAM_NAME,
                Range.from(it.id, it.id)
            ).firstOrNull()
            message?.let { 
                objectMapper.readValue<EmailJob>(it.body["data"] ?: "") 
            }
        }.filterNotNull()
    }
}
```

### 4. EmailWorker 구현 예시 (Redis Streams)

```kotlin
class EmailWorker(
    private val queueService: EmailQueueService,
    private val emailService: SESEmailService,
    private val templateService: EmailTemplateService,
    private val cacheService: EmailCacheService,
    private val emailLogRepository: EmailLogRepository,
    private val logger: Logger
) {
    private val workerId = "worker-${UUID.randomUUID()}"
    private var isRunning = false
    
    suspend fun start() {
        if (isRunning) return
        
        isRunning = true
        logger.info("Starting Email Worker: $workerId")
        
        // Consumer Group 생성 (최초 1회)
        try {
            queueService.createConsumerGroup()
        } catch (e: Exception) {
            // 이미 존재하면 무시
            logger.debug("Consumer group already exists")
        }
        
        // 무한 루프로 계속 실행
        while (isRunning) {
            try {
                val job = queueService.getNextJob(workerId)
                
                if (job != null) {
                    val messageId = job.id // 실제로는 Stream 메시지 ID 사용
                    try {
                        processEmail(job)
                        queueService.completeJob(messageId)
                    } catch (e: Exception) {
                        handleError(job, messageId, e)
                    }
                } else {
                    // PEL에서 재시도 필요한 작업 확인
                    val pendingJobs = queueService.checkPendingJobs(workerId)
                    pendingJobs.forEach { retryJob ->
                        try {
                            processEmail(retryJob)
                            queueService.completeJob(retryJob.id)
                        } catch (e: Exception) {
                            handleError(retryJob, retryJob.id, e)
                        }
                    }
                    
                    delay(1000) // 큐가 비어있으면 1초 대기
                }
            } catch (e: Exception) {
                logger.error("Worker error", e)
                delay(5000) // 에러 시 5초 대기
            }
        }
        
        logger.info("Email Worker stopped: $workerId")
    }
    
    fun stop() {
        isRunning = false
        logger.info("Stopping Email Worker: $workerId")
    }
    
    private suspend fun processEmail(job: EmailJob) {
        // Rate Limit 확인
        if (!cacheService.checkRateLimit(job.to)) {
            throw RateLimitExceededException("Rate limit exceeded for ${job.to}")
        }
        
        // 템플릿 렌더링
        val html = templateService.render(job.template, job.templateData)
        
        // SES 발송
        val result = emailService.sendEmail(
            to = job.to,
            subject = job.subject,
            html = html
        )
        
        // EmailLog 업데이트
        emailLogRepository.updateStatus(job.id, EmailStatus.SENT)
        
        // Redis 상태 업데이트
        cacheService.cacheEmailStatus(job.id, "sent")
        
        // Pub/Sub으로 진행률 알림 (뉴스레터 발송 시)
        if (job.type == EmailType.NEWSLETTER) {
            cacheService.publishProgress(job.templateData["issueId"] ?: "", 1)
        }
    }
    
    private suspend fun handleError(job: EmailJob, messageId: String, error: Exception) {
        val attempts = job.attempts + 1
        
        if (attempts < job.maxAttempts) {
            // 재시도: 지수 백오프 (2^attempts 초)
            val delay = (2.0.pow(attempts) * 1000).toLong()
            val retryJob = job.copy(attempts = attempts, delay = delay)
            queueService.addJob(retryJob)
            // 원래 메시지는 ACK하지 않아 PEL에 남아있음
        } else {
            // 최대 재시도 초과: 실패 처리
            queueService.failJob(messageId, error.message ?: "Unknown error")
            emailLogRepository.updateStatus(job.id, EmailStatus.FAILED)
        }
    }
}
```

### 5. EmailWorkerPlugin 구현 예시

```kotlin
// plugins/EmailWorkerPlugin.kt
fun Application.configureEmailWorker() {
    val emailWorker = get<EmailWorker>()
    val logger = get<Logger>()
    
    // 애플리케이션 시작 시 Worker 시작
    environment.monitor.subscribe(ApplicationStarted) {
        launch {
            logger.info("Starting Email Worker...")
            emailWorker.start()
        }
    }
    
    // 애플리케이션 종료 시 Worker 정리
    environment.monitor.subscribe(ApplicationStopped) {
        logger.info("Stopping Email Worker...")
        emailWorker.stop()
    }
}

// Application.kt 또는 Application.module()
fun Application.module() {
    // ... 기존 설정 ...
    
    // Koin DI 설정
    install(Koin) {
        // ... 기존 모듈 ...
        modules(emailWorkerModule)
    }
    
    // Email Worker 플러그인 설치
    configureEmailWorker()
    
    // ... 기존 라우팅 ...
}
```

### 5. SESEmailService 구현 예시

```kotlin
class SESEmailService(
    private val sesClient: SesClient,
    private val region: String
) {
    suspend fun sendEmail(
        to: String,
        subject: String,
        html: String,
        from: String = "noreply@vality.io"
    ): SendEmailResponse {
        val request = SendEmailRequest.builder()
            .source(from)
            .destination { it.toAddresses(to) }
            .message {
                it.subject { it.data(subject) }
                it.body {
                    it.html { it.data(html) }
                }
            }
            .build()
        
        return sesClient.sendEmail(request)
    }
}
```

### 6. Redis 캐싱 예시

```kotlin
class EmailCacheService(
    private val redis: RedisCommands<String, String>
) {
    suspend fun cacheVerificationCode(email: String, code: String) {
        val key = "verification:code:$email"
        redis.setex(key, 600, code) // 10분 TTL
    }
    
    suspend fun getVerificationCode(email: String): String? {
        val key = "verification:code:$email"
        return redis.get(key)
    }
    
    suspend fun checkRateLimit(email: String, limit: Int = 5): Boolean {
        val key = "rate:limit:$email"
        val count = redis.incr(key) ?: 0
        if (count == 1L) {
            redis.expire(key, 3600) // 1시간
        }
        return count <= limit
    }
}
```

### 7. 환경 변수 설정

```env
# apps/api/.env
# AWS SES
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-2
SES_FROM_EMAIL=noreply@vality.io

# Redis (BullMQ 백엔드 + 캐싱)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0

# Redis Streams 설정
REDIS_STREAM_NAME=email:send
REDIS_CONSUMER_GROUP=email:workers
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=2000  # 밀리초

# Frontend
FRONTEND_URL=http://localhost:3000
```

**참고**: Redis Streams는 Redis만 사용하므로 추가 인프라가 필요 없습니다.

### 8. Docker Compose 설정

```yaml
version: '3.8'

services:
  postgres:
    # ... 기존 설정

  redis:
    image: redis:7-alpine
    container_name: vality-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - vality-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    # Redis는 Streams 큐의 백엔드로 사용되므로 별도 설정 불필요

volumes:
  postgres_data:
  redis_data:

networks:
  vality-network:
    driver: bridge
```

**참고**: Redis Streams는 Redis만 사용하므로 RabbitMQ 같은 별도 메시지 브로커가 필요 없습니다.

---

## 🔍 에러 처리 및 모니터링

### 에러 처리 전략

1. **SES API 실패 시**
   - Redis Streams PEL을 통한 자동 재시도 (지수 백오프, 최대 3회)
   - 재시도 실패 시 실패 처리
   - 로그 기록 및 알림

2. **Redis 연결 실패 시**
   - 자동 재연결 로직 (Lettuce 자동 재연결)
   - 작업 데이터 지속성 보장 (Redis Persistence 설정)

3. **Rate Limit 처리**
   - Redis를 이용한 Rate Limiting
   - SES Rate Limit 준수 (초당 14건, 일일 할당량 확인)
   - Rate Limit 초과 시 작업을 지연 큐로 이동

4. **실패 작업 모니터링**
   - PEL (Pending Entry List) 모니터링 (`XPENDING` 명령어)
   - 주기적 실패 작업 처리 (수동 또는 자동)
   - 실패 원인 분석 및 알림

5. **Worker 프로세스 관리**
   - Worker는 같은 프로세스에서 실행되므로 API 서버 재시작 시 함께 재시작
   - 애플리케이션 종료 시 Worker가 정상 종료되는지 확인
   - Worker 에러가 API 서버에 영향을 주지 않도록 예외 처리

### 모니터링

- **Redis CLI/Monitor**: 큐 상태, 메시지 수, 처리 속도
  - `XLEN email:send` (Stream의 총 메시지 수)
  - `XPENDING email:send email:workers` (PEL의 처리 중인 작업 수)
  - `XINFO GROUPS email:send` (Consumer Group 정보)
- **RedisInsight** (선택): Redis 데이터 시각화 도구
- **Redis**: 캐시 히트율, Rate Limit 상태
- **SES 콘솔**: 발송 통계, 바운스율, 오픈율
- **EmailLog**: 발송 성공률, 실패 원인 분석

---

## 🚀 향후 개선 사항

### 단기 (MVP 이후)
- [ ] 이메일 발송 진행률 실시간 표시 (WebSocket + Redis Pub/Sub)
- [ ] 템플릿 에디터 (관리자 페이지)
- [ ] A/B 테스트 (제목, 내용)
- [ ] Worker 성능 모니터링 (처리 속도, 에러율)

### 중기
- [ ] 다국어 지원
- [ ] 개인화 강화 (사용자별 맞춤 콘텐츠)
- [ ] 예약 발송 기능

### 장기
- [ ] 이메일 분석 대시보드
- [ ] 자동화 워크플로우 (예: 구독자 환영 시리즈)
- [ ] 이메일 발송 최적화 (시간대별 발송)
- [ ] Worker를 별도 프로세스로 분리 (필요 시 스케일링)

---

## 📊 비용 예상

### AWS SES 비용
- **EC2에서 발송 시**: 월 62,000건까지 **무료**
- **일반 발송**: 1,000건당 **$0.10** (약 130원)

### 예상 사용량 (MVP 단계)
- 인증 코드: 사용자당 1-2건 (회원가입/로그인)
- 뉴스레터 발송: 발행당 구독자 수만큼

**예시 (MVP 단계)**: 
- 월 100명 신규 가입 → 200건
- 월 10개 뉴스레터 발행, 평균 50명 구독 → 500건
- **총 약 700건/월** → **무료** (EC2 발송 시)

**예시 (성장 단계)**: 
- 월 1,000명 신규 가입 → 2,000건
- 월 50개 뉴스레터 발행, 평균 200명 구독 → 10,000건
- **총 약 12,000건/월** → **무료** (EC2 발송 시, 62,000건 이하)

**예시 (대량 발송 단계)**: 
- 월 5,000명 신규 가입 → 10,000건
- 월 200개 뉴스레터 발행, 평균 500명 구독 → 100,000건
- **총 약 110,000건/월**
  - EC2 발송 시: **$4.80/월** (약 6,240원) - 62,000건 무료 + 48,000건 유료
  - 일반 발송: **$11.00/월** (약 14,300원)

### 인프라 비용 (추가)
- **Redis**: 자체 호스팅 (EC2 내) 또는 ElastiCache (선택)
  - **참고**: Redis Streams는 Redis만 사용하므로 별도 메시지 브로커 비용 없음
  - **참고**: Worker는 같은 프로세스에서 코루틴으로 실행되므로 별도 서버/컨테이너 불필요

---

## ✅ 체크리스트

### MVP 필수 기능
- [x] EmailLog 도메인 및 Repository 구현
- [ ] AWS SES 설정 및 인증
- [ ] SES API 클라이언트 구현
- [ ] Redis Streams 큐 구조 설계 및 구현
- [ ] EmailQueueService 구현 (Redis Streams)
- [ ] EmailWorker 구현 (같은 프로세스 코루틴)
- [ ] EmailWorkerPlugin 구현 (애플리케이션 시작 시 Worker 실행)
- [ ] Redis 캐싱 서비스 구현
- [ ] 인증 코드 이메일 발송
- [ ] 뉴스레터 발송 기능
- [ ] 기본 이메일 템플릿

### 선택 기능
- [ ] 구독 확인 이메일
- [ ] SES Webhook 연동 (이메일 추적)
- [ ] 모니터링 대시보드
- [ ] DLQ 자동 처리

---

## 📚 참고 자료

- [AWS SES 문서](https://docs.aws.amazon.com/ses/)
- [AWS SDK for Kotlin](https://github.com/awslabs/aws-sdk-kotlin)
- [Redis Streams 공식 문서](https://redis.io/docs/data-types/streams/)
- [Redis Streams 튜토리얼](https://redis.io/docs/data-types/streams-tutorial/)
- [Lettuce Redis 클라이언트](https://github.com/lettuce-io/lettuce-core)
- [Ktor HTTP Client 가이드](https://ktor.io/docs/http-client.html)
- [이메일 템플릿 모범 사례](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Redis Streams vs RabbitMQ 비교](docs/email-system-queue-comparison.md)

---

---

## 🎯 구현 요약

### 핵심 아키텍처
- **이메일 서비스**: AWS SES
- **메시지 큐**: Redis Streams (Redis 5.0+)
- **Worker 실행 방식**: 같은 Ktor 프로세스 내에서 코루틴으로 실행
- **추가 인프라**: 없음 (Redis만 사용)

### Worker 실행 흐름
1. Ktor 애플리케이션 시작
2. `EmailWorkerPlugin`이 `ApplicationStarted` 이벤트 수신
3. Worker 코루틴 시작 (백그라운드에서 계속 실행)
4. Redis Streams에서 작업 소비 (`XREADGROUP`)
5. 이메일 발송 처리
6. 작업 완료 확인 (`XACK`)
7. 애플리케이션 종료 시 Worker 정리 (`ApplicationStopped` 이벤트)

### 장점
- ✅ 추가 인프라 불필요 (Redis만 사용)
- ✅ 구현 간단 (별도 프로세스 관리 불필요)
- ✅ 비용 효율적 (단일 프로세스)
- ✅ 리소스 공유 용이 (DB 연결, DI 등)

---

**작성일**: 2025-01-15  
**최종 수정**: 2025-01-15
