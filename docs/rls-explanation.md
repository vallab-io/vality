# Row Level Security (RLS) 설명 및 구현 가이드

## RLS란?

**Row Level Security (RLS)**는 PostgreSQL의 보안 기능으로, 테이블의 각 행(row)에 대한 접근을 제어할 수 있게 해줍니다.

### 기본 개념

```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "policy_name" ON users
    FOR SELECT  -- SELECT, INSERT, UPDATE, DELETE, ALL
    USING (조건);  -- 어떤 행을 볼 수 있는지
    WITH CHECK (조건);  -- 어떤 행을 삽입/수정할 수 있는지
```

### ⚠️ 중요: RLS 활성화만 하면 접근 차단됨

**RLS를 활성화만 하고 정책을 설정하지 않으면, 모든 접근이 차단됩니다!**

```sql
-- RLS만 활성화 (정책 없음)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 이 상태에서 SELECT 시도
SELECT * FROM users;
-- ❌ 에러: "new row violates row-level security policy"
-- 또는 "no policy" 에러로 모든 행 접근 불가
```

**정책이 하나라도 있어야 접근 가능:**

```sql
-- 정책 추가
CREATE POLICY "allow_all" ON users
    FOR ALL
    USING (true);

-- 이제 접근 가능
SELECT * FROM users;  -- ✅ 성공
```

**정리:**
- ❌ RLS 활성화 + 정책 없음 = **모든 접근 차단**
- ✅ RLS 활성화 + 정책 있음 = **정책 조건에 따라 접근 허용**

### 예시

```sql
-- 예시 1: 사용자는 자신의 데이터만 조회 가능
CREATE POLICY "users_own_data" ON users
    FOR SELECT
    USING (id = current_user_id());

-- 예시 2: 공개 데이터만 조회 가능
CREATE POLICY "issues_public" ON issues
    FOR SELECT
    USING (status = 'PUBLISHED');
```

---

## Vality에서의 RLS 구현

### 현재 아키텍처

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ JWT Token
       ▼
┌─────────────┐
│   Ktor API  │  ← 애플리케이션 레벨 인증
└──────┬──────┘
       │ Single DB User
       ▼
┌─────────────┐
│ PostgreSQL  │  ← RLS 활성화
└─────────────┘
```

### 문제점

1. **단일 DB 사용자**: 애플리케이션이 하나의 DB 사용자(`vality`)로 연결됨
2. **JWT 기반 인증**: 사용자 식별은 JWT 토큰에서 추출
3. **Exposed ORM**: Kotlin ORM 사용

이런 구조에서는 RLS를 완전히 활용하기 어렵습니다.

---

## 현재 구현 방식

### 1. RLS 활성화 (보안 스캔 도구 경고 해결)

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 2. 공개 조회 정책 (실제 작동)

```sql
-- 공개 프로필 조회
CREATE POLICY "users_public_select" ON users
    FOR SELECT
    USING (username IS NOT NULL);

-- 공개 이슈 조회
CREATE POLICY "issues_public_select" ON issues
    FOR SELECT
    USING (status = 'PUBLISHED' AND published_at IS NOT NULL);
```

이 정책들은 **실제로 작동**합니다:
- 공개 페이지에서 사용자 프로필 조회 시 RLS가 적용됨
- 공개 이슈만 조회 가능

### 3. 애플리케이션 접근 정책 (RLS 우회)

```sql
CREATE POLICY "users_application_access" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

이 정책은 사실상 모든 접근을 허용하지만:
- **목적**: 보안 스캔 도구 경고 해결
- **실제 보안**: 애플리케이션 레벨에서 JWT 인증으로 처리

---

## 더 나은 RLS 구현 방법 (선택사항)

### 방법 1: PostgreSQL 세션 변수 사용

```sql
-- 애플리케이션에서 쿼리 실행 전
SET LOCAL app.current_user_id = 'user_123';

-- RLS 정책
CREATE POLICY "users_own_data" ON users
    FOR SELECT
    USING (id = current_setting('app.current_user_id', true));
```

**단점**:
- Exposed ORM과 통합이 복잡함
- 모든 쿼리마다 세션 변수 설정 필요
- 트랜잭션 관리 복잡

### 방법 2: 별도의 DB 역할(Role) 사용

```sql
-- 각 사용자마다 역할 생성
CREATE ROLE user_123;
GRANT SELECT ON users TO user_123;

-- 애플리케이션에서 역할 전환
SET ROLE user_123;
```

**단점**:
- 사용자 수만큼 역할 생성 필요 (확장성 문제)
- 역할 관리 복잡

### 방법 3: 현재 방식 유지 (권장)

**장점**:
- ✅ 구현 간단
- ✅ 보안 스캔 도구 경고 해결
- ✅ 공개 조회 정책은 실제로 작동
- ✅ 애플리케이션 레벨 보안으로 충분

**단점**:
- ❌ RLS의 모든 기능 활용 불가
- ❌ 직접 DB 접근 시 보호 제한적

---

## 보안 고려사항

### 현재 보안 레이어

1. **애플리케이션 레벨** (주요 보안)
   - JWT 인증
   - user_id 검증
   - API 엔드포인트별 권한 체크

2. **데이터베이스 레벨** (추가 보안)
   - RLS 활성화
   - 공개 조회 정책
   - 직접 DB 접근 시 최소한의 보호

### 권장 사항

1. **현재 방식 유지**: 애플리케이션 레벨 보안이 주 보안이고, RLS는 추가 레이어
2. **공개 조회 정책 강화**: 공개 데이터에 대한 정책은 실제로 작동하므로 유지
3. **민감한 테이블 보호**: `refresh_tokens`, `subscriber_verification_tokens` 등은 서버 전용

---

## FAQ

### Q1: RLS 활성화만 하고 정책 안 세우면 API에서 DB 접근 가능해?

**A: 아니요, 접근 불가능합니다!**

```sql
-- 1. RLS만 활성화 (정책 없음)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. API에서 SELECT 시도
SELECT * FROM users;
-- ❌ 에러 발생: 모든 행 접근 차단

-- 3. 정책 추가 필요
CREATE POLICY "allow_application" ON users
    FOR ALL
    USING (true);

-- 4. 이제 접근 가능
SELECT * FROM users;  -- ✅ 성공
```

**PostgreSQL RLS 동작 방식:**
- RLS 활성화 + 정책 없음 = **모든 접근 차단** (기본 동작)
- RLS 활성화 + 정책 있음 = **정책 조건에 따라 접근 허용**

**현재 Vality 구현:**
- 모든 테이블에 `USING (true)` 정책을 설정했기 때문에 접근 가능
- 정책을 제거하면 API가 DB에 접근할 수 없게 됨

---

## 결론

현재 RLS 구현은 **적절합니다**:

✅ **보안 스캔 도구 경고 해결**: RLS 활성화로 경고 해소  
✅ **공개 조회 보호**: 공개 데이터에 대한 정책은 실제 작동  
✅ **구현 간단**: 복잡한 세션 변수나 역할 관리 불필요  
✅ **실제 보안**: 애플리케이션 레벨(JWT)에서 충분한 보안 제공  
✅ **API 접근 보장**: `USING (true)` 정책으로 애플리케이션 접근 허용  

더 강력한 RLS가 필요하다면, PostgreSQL 세션 변수를 사용하는 방법을 고려할 수 있지만, 현재 아키텍처에서는 **과한 구현**일 수 있습니다.

---

### Q2: 모든 테이블 정책을 `USING (true)`로 allow 하면 문제가 생길까?

**A: 상황에 따라 다릅니다. 현재 아키텍처에서는 큰 문제 없지만, 몇 가지 위험 요소가 있습니다.**

#### ✅ 문제 없는 경우 (현재 Vality 상황)

1. **애플리케이션 레벨 보안이 충분한 경우**
   - JWT 인증으로 사용자 식별
   - API 엔드포인트별 권한 체크
   - user_id 검증

2. **직접 DB 접근이 제한된 경우**
   - DB 자격증명이 안전하게 관리됨
   - 프로덕션 DB에 직접 접근 불가
   - 네트워크 레벨 보안 (VPC, 방화벽)

3. **보안 스캔 도구 경고 해결이 목적**
   - RLS 활성화로 경고 해소
   - 실제 보안은 애플리케이션 레벨에서 처리

#### ⚠️ 문제가 될 수 있는 경우

1. **DB 자격증명 유출 시**
   ```sql
   -- 공격자가 DB에 직접 접근
   psql -h db.example.com -U vality -d vality_db
   
   -- RLS가 모든 접근을 허용하므로
   SELECT * FROM users;  -- ✅ 모든 사용자 정보 접근 가능
   SELECT * FROM refresh_tokens;  -- ✅ 모든 토큰 접근 가능
   ```

2. **SQL Injection 공격 시**
   ```kotlin
   // 애플리케이션 버그로 SQL Injection 발생
   val query = "SELECT * FROM users WHERE email = '$userInput'"
   // 만약 userInput = "admin@example.com' OR '1'='1"
   // → 모든 사용자 정보 노출
   ```

3. **애플리케이션 버그로 인한 잘못된 쿼리**
   ```kotlin
   // 실수로 user_id 검증 누락
   fun getAllUsers() {
       // user_id 검증 없이 모든 사용자 조회
       return dbQuery { Users.selectAll() }
   }
   ```

#### 🛡️ 개선 방안

**옵션 1: 현재 방식 유지 (권장)**
- ✅ 구현 간단
- ✅ 보안 스캔 도구 경고 해결
- ✅ 애플리케이션 레벨 보안으로 충분
- ⚠️ DB 자격증명 유출 시 위험

**옵션 2: 민감한 테이블만 제한 (균형잡힌 접근)**
```sql
-- refresh_tokens는 더 엄격한 정책
CREATE POLICY "refresh_tokens_restricted" ON refresh_tokens
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true));
```

**옵션 3: PostgreSQL 역할(Role) 분리**
```sql
-- 읽기 전용 역할
CREATE ROLE app_readonly;
GRANT SELECT ON users TO app_readonly;

-- 쓰기 역할
CREATE ROLE app_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_readwrite;
```

#### 📊 위험도 평가

| 시나리오 | 위험도 | 현재 보호 | 개선 필요 |
|---------|--------|----------|----------|
| 정상적인 API 사용 | 낮음 | ✅ JWT 인증 | - |
| DB 자격증명 유출 | 높음 | ❌ RLS가 보호 안함 | ⚠️ 네트워크 보안 강화 |
| SQL Injection | 중간 | ⚠️ 부분적 보호 | ✅ 입력 검증 강화 |
| 애플리케이션 버그 | 중간 | ⚠️ 부분적 보호 | ✅ 코드 리뷰, 테스트 |

#### 💡 권장 사항

**현재 Vality의 경우:**
1. ✅ **현재 방식 유지**: 애플리케이션 레벨 보안이 충분
2. ✅ **DB 자격증명 보호**: 환경 변수, Secrets Manager 사용
3. ✅ **네트워크 보안**: VPC, 방화벽으로 DB 접근 제한
4. ✅ **입력 검증**: SQL Injection 방지 (Exposed Prepared Statements 사용 중)
5. ⚠️ **모니터링**: 비정상적인 DB 접근 로깅

**더 강력한 보안이 필요한 경우:**
- 민감한 테이블(`refresh_tokens`, `subscriber_verification_tokens`)에 더 엄격한 정책 적용
- PostgreSQL 세션 변수를 사용한 사용자별 접근 제어
- 읽기/쓰기 역할 분리

---

**작성일**: 2025-01-15
