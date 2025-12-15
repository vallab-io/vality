# Vality 서비스 문서

> "뉴스레터를 발행하면 곧바로 웹에 기록되고, 검색 엔진에도 노출되는 개인 브랜딩 플랫폼"

## 📁 문서 구조

| 문서 | 설명 | 상태 |
|------|------|:----:|
| [overview.md](./overview.md) | 서비스 핵심 컨셉 및 비전 | ✅ 최신 |
| [target-users.md](./target-users.md) | 타겟 사용자 분석 및 페르소나 | ✅ 최신 |
| [features.md](./features.md) | 핵심 기능 상세 기획 | ✅ 최신 |
| [tech-stack.md](./tech-stack.md) | 기술 스택 및 아키텍처 | ✅ 최신 |
| [roadmap.md](./roadmap.md) | 개발 로드맵 및 마일스톤 | ✅ 최신 |
| [tasks.md](./tasks.md) | 개발 작업 순서 및 체크리스트 | ✅ 최신 |
| [implementation-status.md](./implementation-status.md) | 구현 현황 요약 | ✅ 최신 |
| [email-system.md](./email-system.md) | 이메일 발송 시스템 구현 계획 | ✅ 최신 |
| [oauth-state-management.md](./oauth-state-management.md) | OAuth State 관리 가이드 | ✅ 최신 |

## 🎯 한 줄 요약

**한 번 발행 → 이메일 · 블로그 · 프로필 콘텐츠가 동시에 완성되는 구조**

## 🔑 핵심 가치

1. **이메일 뉴스레터** = 콘텐츠 유통
2. **웹 게시글 동시 노출** = 검색/SEO 확보
3. **Bio(링크트리 확장)** = 링크 기반 개인·브랜드 명함 (추후 개발)

## ✅ 현재 구현 상태 (2025-01-15)

### 완료된 기능
- ✅ 사용자 인증 (이메일 인증, Google OAuth)
- ✅ JWT 인증 및 Refresh Token
- ✅ 사용자 프로필 관리 (회원가입, 로그인, 프로필 업데이트, 계정 삭제)
- ✅ Onboarding 플로우
- ✅ 대시보드 UI (기본 레이아웃)
- ✅ 설정 페이지 (프로필, 계정)
- ✅ 공개 페이지 UI (프로필, 뉴스레터 상세)

### 개발 중인 기능
- 🔄 뉴스레터 API (백엔드)
- 🔄 이슈 API (백엔드)
- 🔄 구독자 API (백엔드)
- 🔄 이메일 발송 시스템 (계획 완료, 구현 예정)

### 예정된 기능
- ⏸️ SEO 최적화
- ⏸️ 파일 업로드 (S3)
- ⏸️ Bio 기능

## 📅 문서 버전

- **최초 작성일**: 2024년 12월 10일
- **최종 수정일**: 2025년 1월 15일
- **버전**: v0.2.0
