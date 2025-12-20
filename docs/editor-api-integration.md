# Lexical 에디터와 API 연동 가이드

## 현재 상태 분석

### 1. 에디터 구현 상태
- **에디터**: Lexical 기반 ValityEditor
- **데이터 형식**: HTML 문자열로 저장
- **변환 방식**: `$generateHtmlFromNodes(editor, null)`로 HTML 생성
- **저장 위치**: `formData.content` (HTML 문자열)

### 2. 백엔드 API 상태
- **엔드포인트**: `POST /api/newsletters/{newsletterId}/issues`
- **DTO**: `CreateIssueRequest`
  ```kotlin
  data class CreateIssueRequest(
      val title: String,
      val slug: String,
      val content: String,  // String 타입 (형식 제한 없음)
      val excerpt: String? = null,
      val coverImageUrl: String? = null,
      val status: String? = null,
      val scheduledAt: Instant? = null,
  )
  ```

### 3. 데이터베이스 상태
- **테이블**: `issues`
- **컬럼**: `content TEXT NOT NULL`
- **타입**: PostgreSQL TEXT (제한 없음)

## 연동 방법

### ✅ 현재 구현 (이미 완료됨)

현재 구현은 **이미 올바르게 연동되어 있습니다**:

1. **에디터 → API 흐름**:
   ```
   Lexical Editor (HTML)
   → OnChange Plugin ($generateHtmlFromNodes)
   → handleContentChange(htmlContent: string)
   → formData.content (HTML 문자열)
   → createIssue API 호출
   → 백엔드 저장 (TEXT 컬럼)
   ```

2. **현재 코드**:
   ```typescript
   // vality-editor.tsx
   function OnChange({onChange}: { onChange: (content: string) => void }) {
     const [editor] = useLexicalComposerContext();
     useEffect(() => {
       return editor.registerUpdateListener(({editorState}) => {
         editorState.read(() => {
           const htmlString = $generateHtmlFromNodes(editor, null);
           onChange(htmlString); // HTML 문자열 전달
         });
       });
     }, [editor, onChange]);
     return null;
   }

   // issues/new/page.tsx
   const handleContentChange = (htmlContent: string) => {
     setFormData((prev) => ({ ...prev, content: htmlContent }));
   };

   const handleSaveDraft = async () => {
     const request: CreateIssueRequest = {
       title: formData.title.trim(),
       slug: slug,
       content: formData.content, // HTML 문자열 그대로 전송
       status: "DRAFT",
     };
     await createIssue(newsletterId, request);
   };
   ```

### 📋 추가로 확인/구현해야 할 사항

#### 1. **이슈 조회 시 HTML 로드**

현재 `issues/new` 페이지는 생성만 하고, `issues/[issueId]/edit` 페이지는 아직 구현되지 않았습니다.

**구현 필요**:
- `GET /api/newsletters/{newsletterId}/issues/{issueId}` API 호출
- 받은 HTML을 `InitialContentPlugin`에 전달하여 에디터에 로드

```typescript
// 예시 코드
useEffect(() => {
  const loadIssue = async () => {
    const issue = await getIssueById(newsletterId, issueId);
    setFormData({
      title: issue.title,
      content: issue.content, // HTML 문자열
    });
  };
  loadIssue();
}, [issueId]);
```

#### 2. **HTML Sanitization (보안)**

현재는 HTML을 그대로 저장하므로 XSS 공격에 취약할 수 있습니다.

**권장 사항**:
- **백엔드에서**: HTML sanitization 라이브러리 사용 (예: OWASP Java HTML Sanitizer)
- **프론트엔드에서**: Lexical은 기본적으로 안전하지만, 외부에서 받은 HTML은 sanitize 필요

#### 3. **이미지 처리**

현재 이미지 업로드는 미구현 상태입니다.

**구현 필요**:
- 이미지 업로드 → S3 Presigned URL
- 에디터에 이미지 삽입 시 `<img src="https://s3...">` 형태로 저장
- 또는 이미지 URL을 별도로 관리하고 에디터에는 참조만 저장

#### 4. **이메일 발송 시 HTML 변환**

이메일 발송 시 HTML을 이메일 호환 형식으로 변환해야 할 수 있습니다.

**고려 사항**:
- 이메일 클라이언트 호환성 (Gmail, Outlook 등)
- 인라인 CSS 변환
- 테이블 기반 레이아웃 (이메일 호환)

## 데이터 흐름 다이어그램

```
┌─────────────────┐
│  Lexical Editor │
│  (Rich Text)    │
└────────┬────────┘
         │ $generateHtmlFromNodes()
         ▼
┌─────────────────┐
│  HTML String    │
│  "<p>...</p>"   │
└────────┬────────┘
         │ handleContentChange()
         ▼
┌─────────────────┐
│  formData       │
│  { content:     │
│    "<p>...</p>" │
│  }              │
└────────┬────────┘
         │ createIssue()
         ▼
┌─────────────────┐
│  POST /api/     │
│  newsletters/   │
│  {newsletterId}/│
│  issues         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API   │
│  (Kotlin)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  issues.content │
│  (TEXT)         │
└─────────────────┘
```

## 역방향 흐름 (조회 시)

```
┌─────────────────┐
│  GET /api/      │
│  issues/{id}    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Issue Response │
│  { content:     │
│    "<p>...</p>" │
│  }              │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  InitialContent │
│  Plugin         │
│  $generateNodes │
│  FromDOM()      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lexical Editor │
│  (Rich Text)    │
└─────────────────┘
```

## 결론

**현재 구현은 이미 올바르게 연동되어 있습니다!**

- ✅ HTML 형식으로 저장
- ✅ API에 HTML 문자열 전송
- ✅ 백엔드에서 TEXT 컬럼에 저장

**추가로 구현해야 할 것**:
1. 이슈 조회 API 연동 (edit 페이지)
2. HTML Sanitization (보안)
3. 이미지 업로드 기능
4. 이메일 발송 시 HTML 변환

현재는 **새 이슈 생성**만 구현되어 있고, **이슈 수정/조회**는 아직 목업 데이터를 사용하고 있습니다.

