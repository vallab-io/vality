# Vality Editor 구현 계획

## 현재 상태

- **현재 에디터**: 마크다운 기반 `textarea` 에디터
- **사용 위치**: 
  - `/dashboard/newsletters/[newsletterId]/issues/new` (이슈 생성)
  - `/dashboard/newsletters/[newsletterId]/issues/[issueId]/edit` (이슈 수정)
- **데이터 형식**: 백엔드는 `String` 타입으로 저장 (현재 마크다운, HTML로 변경 예정)
- **삭제된 파일**: 
  - `apps/web/src/components/editor/notion-editor.tsx`
  - `apps/web/src/components/editor/slash-command.tsx`
  - `apps/web/src/components/editor/floating-menu.tsx`
  - `apps/web/src/lib/utils/markdown.ts`

## 목표

Notion 스타일의 블록 기반 리치 텍스트 에디터 구현:
- 슬래시 명령어 (`/`)로 블록 추가
- 블록 단위 편집 및 이동
- 인라인 포맷팅 (볼드, 이탤릭, 링크 등)
- 이미지 삽입
- **HTML 형식으로 직접 저장** (마크다운 변환 불필요)

## 구현 단계

### Phase 1: 기본 인프라 설정 (우선순위: 높음)

#### 1.1 의존성 설치
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder \
  @tiptap/extension-link @tiptap/extension-image @tiptap/suggestion \
  @tiptap/core
```

**참고**: `turndown`은 제거 (HTML로 직접 저장하므로 변환 불필요)

#### 1.2 기본 디렉토리 구조 생성
```
apps/web/src/components/editor/
  ├── vality-editor.tsx           # 메인 에디터 컴포넌트
  ├── slash-command.tsx           # 슬래시 명령어 확장
  ├── floating-menu.tsx          # 인라인 포맷팅 메뉴
  └── block-menu.tsx              # 블록 메뉴 (선택적)
```

### Phase 2: 기본 에디터 구현 (우선순위: 높음)

#### 2.1 ValityEditor 컴포넌트
- [ ] Tiptap 에디터 초기화
- [ ] StarterKit 확장 설정
- [ ] Placeholder 확장 (빈 상태일 때 "/를 눌러주세요")
- [ ] Link, Image 확장
- [ ] 기본 스타일링 (Notion과 유사한 느낌)
- [ ] HTML 출력 (에디터의 `getHTML()` 사용)

#### 2.2 백엔드 API 확인
- [ ] 백엔드 `content` 필드가 HTML을 받을 수 있는지 확인
- [ ] 기존 마크다운 데이터 마이그레이션 계획 수립 (필요시)

### Phase 3: 슬래시 명령어 구현 (우선순위: 높음)

#### 3.1 SlashCommand 확장
- [ ] `/` 입력 감지
- [ ] 명령어 목록 표시
- [ ] 키보드 네비게이션 (↑↓ 방향키)
- [ ] Enter로 명령 실행
- [ ] Escape로 닫기

#### 3.2 지원할 명령어
- [ ] 제목 1, 2, 3
- [ ] 글머리 기호 목록
- [ ] 번호 매기기 목록
- [ ] 인용 블록
- [ ] 코드 블록
- [ ] 구분선
- [ ] 이미지
- [ ] 링크

### Phase 4: 인라인 포맷팅 (우선순위: 중간)

#### 4.1 FloatingMenu 컴포넌트
- [ ] 텍스트 선택 시 메뉴 표시
- [ ] 볼드, 이탤릭, 취소선
- [ ] 인라인 코드
- [ ] 링크 추가/편집
- [ ] 이미지 업로드

### Phase 5: 페이지 통합 (우선순위: 높음)

#### 5.1 이슈 생성 페이지 수정
- [ ] `textarea` → `ValityEditor` 교체
- [ ] HTML 직접 저장 (변환 없음)
- [ ] 미리보기 기능 유지 (HTML 렌더링)

#### 5.2 이슈 수정 페이지 수정
- [ ] 기존 데이터 로드 (마크다운인 경우 HTML로 변환하여 에디터에 로드)
- [ ] `textarea` → `ValityEditor` 교체
- [ ] 저장 시 HTML 직접 저장 (변환 없음)

#### 5.3 데이터 마이그레이션 (필요시)
- [ ] 기존 마크다운 데이터를 HTML로 변환하는 유틸리티 함수 작성
- [ ] 백엔드에서 마이그레이션 스크립트 실행 (선택적)

### Phase 6: 고급 기능 (우선순위: 낮음)

#### 6.1 블록 드래그 앤 드롭
- [ ] 블록 핸들 추가
- [ ] 드래그 앤 드롭 구현

#### 6.2 이미지 업로드
- [ ] S3 presigned URL 연동
- [ ] 업로드 진행 상태 표시
- [ ] 에러 처리

#### 6.3 추가 블록 타입
- [ ] 체크리스트
- [ ] 토글 리스트
- [ ] 콜아웃 블록

## 기술 스택

- **에디터**: Tiptap (ProseMirror 기반)
- **슬래시 명령어**: `@tiptap/suggestion`
- **데이터 형식**: HTML (직접 저장, 변환 없음)
- **스타일링**: TailwindCSS

## 주의사항

1. **백엔드 호환성**: 백엔드 `content` 필드는 `String` 타입이므로 HTML을 그대로 저장 가능
2. **기존 데이터**: 기존 마크다운 데이터가 있다면, 에디터에 로드할 때만 HTML로 변환 (일회성)
3. **성능**: 큰 문서의 경우 성능 최적화 필요
4. **접근성**: 키보드 네비게이션 및 스크린 리더 지원
5. **보안**: HTML 저장 시 XSS 방지를 위한 sanitization 고려 (Tiptap은 기본적으로 안전함)

## 구현 순서 추천

1. **Phase 1** (인프라) → 2. **Phase 2** (기본 에디터) → 3. **Phase 3** (슬래시 명령어) → 4. **Phase 5** (페이지 통합) → 5. **Phase 4** (인라인 포맷팅) → 6. **Phase 6** (고급 기능)

## 체크리스트

### 필수 기능 (MVP)
- [x] 계획 수립
- [ ] 의존성 설치
- [ ] 기본 에디터 컴포넌트 (ValityEditor)
- [ ] HTML 직접 저장 (변환 없음)
- [ ] 슬래시 명령어 기본 동작
- [ ] 이슈 생성 페이지 통합
- [ ] 이슈 수정 페이지 통합
- [ ] 기존 마크다운 데이터 로드 처리 (일회성 변환)

### 선택 기능 (향후)
- [ ] 인라인 포맷팅 메뉴
- [ ] 블록 드래그 앤 드롭
- [ ] 이미지 업로드 연동
- [ ] 추가 블록 타입

## 참고 자료

- [Tiptap 공식 문서](https://tiptap.dev/)
- [Tiptap Suggestion 예제](https://tiptap.dev/api/extensions/suggestion)
- [Notion 에디터 분석](https://www.notion.so/help/writing-and-editing-basics)

