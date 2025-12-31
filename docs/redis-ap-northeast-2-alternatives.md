# Redis ap-northeast-2 배포 대안

## 📍 현재 상황

- **EC2**: ap-northeast-2 (서울)
- **Database**: ap-northeast-2 (서울)
- **Redis**: Upstash ap-northeast-1 (도쿄) ← **문제점**
- **요구사항**: Redis를 ap-northeast-2로 이동

**문제**: Upstash는 ap-northeast-2(서울) 리전을 지원하지 않음

---

## 🔍 대안 옵션 비교

### Option 1: AWS ElastiCache (추천) ⭐⭐⭐

#### ✅ 장점

1. **ap-northeast-2 지원**
   - 서울 리전 완벽 지원
   - EC2와 같은 리전 (지연시간 1-5ms)

2. **AWS 생태계 통합**
   - VPC 내부 통신 (보안 강화)
   - CloudWatch 모니터링 통합
   - IAM 통합

3. **관리형 서비스**
   - 자동 백업, 패치
   - 자동 장애 복구 (Multi-AZ)
   - 스케일링 용이

4. **고가용성**
   - Multi-AZ 지원
   - 자동 failover

#### ❌ 단점

1. **비용**
   - cache.t3.micro: ~$15-20/월 (최소)
   - cache.t3.small: ~$30-35/월
   - **Upstash 무료 티어보다 비용 높음**

2. **초기 설정 복잡**
   - VPC, Subnet Group 설정
   - Security Group 규칙 설정
   - 초기 설정 시간 필요

#### 비용

| 인스턴스 타입 | 월 비용 (예상) | 메모리 | 용도 |
|--------------|--------------|--------|------|
| cache.t3.micro | $15-20 | 0.5GB | MVP 초기 |
| cache.t3.small | $30-35 | 1.4GB | 성장 단계 |

---

### Option 2: EC2에 Redis 직접 설치 ⭐⭐

#### ✅ 장점

1. **비용 최소**
   - EC2 인스턴스 비용만 (이미 EC2 사용 중이면 추가 비용 없음)
   - 또는 t3.micro 추가: ~$8-10/월

2. **완전한 제어권**
   - 커스텀 설정 가능
   - 필요한 확장 기능 설치 가능

3. **ap-northeast-2 완벽 지원**
   - EC2와 같은 서버 또는 같은 리전
   - 지연시간 거의 0ms (로컬) 또는 1-5ms (같은 리전)

#### ❌ 단점

1. **관리 부담**
   - 백업 직접 설정
   - 보안 패치 직접 적용
   - 모니터링 직접 구성
   - 장애 복구 직접 처리

2. **고가용성 제한**
   - 단일 인스턴스 (장애 시 중단)
   - Redis Cluster 구축 시 복잡

3. **리소스 경쟁**
   - EC2와 같은 서버 사용 시 리소스 경쟁 가능
   - 별도 EC2 인스턴스 필요 시 추가 비용

#### 구현 방법

**방법 A: 기존 EC2에 Redis 설치** (추천)
```bash
# EC2에 접속 후
sudo yum install redis -y  # Amazon Linux
# 또는
sudo apt-get install redis-server -y  # Ubuntu

# Redis 시작
sudo systemctl start redis
sudo systemctl enable redis
```

**방법 B: 별도 EC2 인스턴스 (t3.micro)**
- 비용: ~$8-10/월
- 리소스 격리
- 더 안정적

---

### Option 3: Redis Cloud (Redis Labs) ⭐

#### ✅ 장점

1. **ap-northeast-2 지원 가능성**
   - 여러 리전 지원 (확인 필요)
   - 관리형 서비스

2. **무료 티어**
   - 30MB 무료
   - 개발/테스트용 적합

#### ❌ 단점

1. **용량 제한**
   - 무료 티어: 30MB (매우 작음)
   - 유료 플랜: 비용 높을 수 있음

2. **확인 필요**
   - ap-northeast-2 지원 여부 확인 필요
   - 한국 사용자 경험 데이터 부족

---

### Option 4: 현재 구성 유지 (ap-northeast-1) ⭐

#### ✅ 장점

1. **비용 무료** (Upstash 무료 티어)
2. **설정 불필요** (이미 완료)
3. **관리 부담 없음**

#### ❌ 단점

1. **지연시간**
   - 서울 → 도쿄: 30-50ms
   - 리전 간 데이터 전송 비용

2. **리전 분산**
   - EC2와 다른 리전
   - 운영 복잡성

#### 평가

- **지연시간 30-50ms는 뉴스레터 발송 큐 작업에는 문제 없음** ✅
- **비용 절감** ✅
- **리전 통합 불가** ❌

---

## 💡 최종 추천

### 🥇 **Phase 1 (MVP): EC2에 Redis 직접 설치** (최우선)

**이유**:
1. ✅ **비용 최소**: 기존 EC2 활용 시 추가 비용 없음
2. ✅ **ap-northeast-2 완벽 지원**: 같은 리전, 지연시간 최소
3. ✅ **빠른 구현**: 1-2시간 내 완료 가능
4. ✅ **초기에는 관리 부담 허용 가능**: MVP 단계

**구현 방법**:
- 기존 EC2에 Redis 설치 (추천)
- 또는 별도 t3.micro 인스턴스 (~$8-10/월)

---

### 🥈 **Phase 2 (성장): AWS ElastiCache로 마이그레이션**

**마이그레이션 시점**:
- 사용자 1,000명 이상
- Redis 사용량 증가
- 고가용성 필요
- 관리 부담 감소 필요

**이점**:
- 자동 백업, 패치
- Multi-AZ 고가용성
- CloudWatch 통합

---

### 🥉 **Option 3: 현재 구성 유지 (임시)**

**유지 가능한 경우**:
- MVP 초기 단계
- 비용 절감 최우선
- 30-50ms 지연 허용 가능

**주의사항**:
- 리전 간 데이터 전송 비용 모니터링
- 성능 모니터링
- 나중에 마이그레이션 계획 수립

---

## 📋 EC2에 Redis 설치 가이드

### Step 1: EC2에 Redis 설치

```bash
# EC2에 SSH 접속
ssh -i your-key.pem ec2-user@your-ec2-ip

# Amazon Linux 2023
sudo yum update -y
sudo yum install redis -y

# Ubuntu
sudo apt-get update
sudo apt-get install redis-server -y
```

### Step 2: Redis 설정

```bash
# Redis 설정 파일 편집
sudo nano /etc/redis.conf

# 주요 설정
bind 127.0.0.1  # 로컬만 접근 (보안)
# 또는 bind 0.0.0.0  # 모든 인터페이스 (VPC 내부만 접근하도록 Security Group 설정)

port 6379
protected-mode yes
requirepass your-strong-password  # 비밀번호 설정 (필수)
```

### Step 3: Redis 시작

```bash
# Redis 시작
sudo systemctl start redis
sudo systemctl enable redis  # 부팅 시 자동 시작

# 상태 확인
sudo systemctl status redis
redis-cli ping  # 연결 테스트
```

### Step 4: Security Group 설정

**EC2 Security Group에 다음 규칙 추가**:
- Type: Custom TCP
- Port: 6379
- Source: EC2 Security Group ID (같은 보안 그룹 내에서만 접근)
- 또는 VPC CIDR (예: 10.0.0.0/16)

### Step 5: application.conf 업데이트

```hocon
ktor {
    redis {
        host = "localhost"  # 또는 EC2 Private IP
        port = 6379
        password = "your-strong-password"
        tls = false
    }
}
```

### Step 6: 백업 설정 (선택사항)

```bash
# Cron으로 일일 백업
0 2 * * * redis-cli --rdb /backup/redis/dump-$(date +\%Y\%m\%d).rdb
```

---

## 🔒 보안 주의사항

### 필수 보안 설정

1. **비밀번호 설정**
   ```bash
   # /etc/redis.conf
   requirepass your-strong-password
   ```

2. **네트워크 접근 제한**
   - Security Group으로 VPC 내부만 접근 허용
   - `bind 127.0.0.1` 또는 Private IP만 바인딩

3. **방화벽 설정**
   ```bash
   # Redis 포트만 허용 (Security Group으로 대체 가능)
   sudo firewall-cmd --permanent --add-port=6379/tcp
   sudo firewall-cmd --reload
   ```

---

## 📊 성능 비교

| 옵션 | 지연시간 | 비용/월 | 관리 부담 | 고가용성 |
|------|---------|---------|----------|---------|
| **EC2 Redis** | 0-5ms | $0-10 | 높음 | 낮음 |
| **ElastiCache** | 1-5ms | $15-35 | 낮음 | 높음 |
| **Upstash (도쿄)** | 30-50ms | $0-20 | 없음 | 중간 |
| **현재 유지** | 30-50ms | $0 | 없음 | 중간 |

---

## ✅ 최종 권장사항

### 즉시 조치 (이번 주)

**옵션 A: EC2에 Redis 설치** (추천)
- ✅ 비용 최소 ($0-10/월)
- ✅ ap-northeast-2 완벽 지원
- ✅ 빠른 구현
- ⚠️ 관리 부담 (초기에는 허용 가능)

**옵션 B: 현재 구성 유지** (임시)
- ✅ 비용 무료
- ✅ 설정 불필요
- ⚠️ 리전 분산 (나중에 해결)

### 장기 전략

**ElastiCache로 마이그레이션** (성장 단계)
- 사용자 1,000명 이상
- 고가용성 필요
- 관리 부담 감소 필요

---

## 📝 체크리스트

### EC2 Redis 설치 시

- [ ] EC2에 Redis 설치
- [ ] Redis 비밀번호 설정
- [ ] Security Group 규칙 추가
- [ ] `application.conf` 업데이트
- [ ] 연결 테스트
- [ ] 백업 설정 (선택)
- [ ] 모니터링 설정

### 현재 구성 유지 시

- [ ] 리전 간 데이터 전송 비용 모니터링
- [ ] 성능 모니터링 (지연시간)
- [ ] 마이그레이션 계획 수립

---

## 🎯 결론

**Upstash가 ap-northeast-2를 지원하지 않으므로**:

1. **즉시**: **EC2에 Redis 설치** (추천) - 비용 최소, 빠른 구현
2. **임시**: **현재 구성 유지** - 비용 절감, 나중에 마이그레이션
3. **장기**: **ElastiCache로 마이그레이션** - 고가용성, 관리 편의

**가장 실용적인 선택은 EC2에 Redis를 직접 설치하는 것입니다.** ✅

