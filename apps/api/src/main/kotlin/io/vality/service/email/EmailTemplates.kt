package io.vality.service.email

/**
 * 이메일 템플릿 유틸리티
 */
object EmailTemplates {

    /**
     * 인증 코드 이메일 HTML 템플릿
     * 
     * Vality 사이트 디자인과 일치하는 단순하고 심플한 디자인
     */
    fun verificationCodeHtml(code: String, expiresInMinutes: Int = 10): String {
        return """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>인증 코드 확인</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F8FAFC;">
        <tr>
            <td align="center" style="padding: 48px 20px;">
                <table role="presentation" style="width: 100%; max-width: 560px; border-collapse: collapse; background-color: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px;">
                            <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #1e293b; letter-spacing: -0.02em;">
                                Vality
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 32px 32px 32px;">
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #1e293b;">
                                아래 코드를 입력하여 계정을 인증해주세요.
                            </p>
                            
                            <!-- Verification Code -->
                            <div style="text-align: center; margin: 32px 0;">
                                <div style="display: inline-block; padding: 16px 24px; background-color: #f1f5f9; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    <div style="font-size: 32px; font-weight: 600; letter-spacing: 4px; color: #2563EB; font-family: 'Courier New', monospace;">
                                        $code
                                    </div>
                                </div>
                            </div>
                            
                            <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
                                코드는 ${expiresInMinutes}분 후 만료됩니다.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #f8f9fa; border-top: 1px solid #e2e8f0; border-radius: 0 0 6px 6px;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                                이 요청을 하지 않으셨다면 이 이메일을 무시하시기 바랍니다.
                            </p>
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                                © ${java.time.Year.now()} Vality
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """.trimIndent()
    }

    /**
     * 인증 코드 이메일 텍스트 템플릿
     */
    fun verificationCodeText(code: String, expiresInMinutes: Int = 10): String {
        return """
Vality 인증 코드

아래 코드를 입력하여 계정을 인증해주세요.

인증 코드: $code

코드는 ${expiresInMinutes}분 후 만료됩니다.

이 요청을 하지 않으셨다면 이 이메일을 무시하시기 바랍니다.

© ${java.time.Year.now()} Vality
        """.trimIndent()
    }

    /**
     * 구독 확인 이메일 HTML 템플릿
     * 
     * Vality 사이트 디자인과 일치하는 단순하고 심플한 디자인
     */
    fun subscribeConfirmationHtml(
        newsletterName: String,
        confirmationUrl: String,
    ): String {
        return """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>구독 확인</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F8FAFC;">
        <tr>
            <td align="center" style="padding: 48px 20px;">
                <table role="presentation" style="width: 100%; max-width: 560px; border-collapse: collapse; background-color: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px;">
                            <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #1e293b; letter-spacing: -0.02em;">
                                Vality
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 32px 32px 32px;">
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #1e293b;">
                                <strong>$newsletterName</strong> 구독을 확인해주세요.
                            </p>
                            
                            <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #64748b;">
                                아래 버튼을 클릭하여 구독을 완료하세요.
                            </p>
                            
                            <!-- Confirmation Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="$confirmationUrl" style="display: inline-block; padding: 12px 24px; background-color: #2563EB; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; transition: background-color 0.2s;">
                                    구독 확인하기
                                </a>
                            </div>
                            
                            <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
                                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center; word-break: break-all;">
                                <a href="$confirmationUrl" style="color: #2563EB; text-decoration: none;">$confirmationUrl</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #f8f9fa; border-top: 1px solid #e2e8f0; border-radius: 0 0 6px 6px;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                                이 요청을 하지 않으셨다면 이 이메일을 무시하시기 바랍니다.
                            </p>
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                                © ${java.time.Year.now()} Vality
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """.trimIndent()
    }

    /**
     * 구독 확인 이메일 텍스트 템플릿
     */
    fun subscribeConfirmationText(
        newsletterName: String,
        confirmationUrl: String,
    ): String {
        return """
Vality 구독 확인

$newsletterName 구독을 확인해주세요.

아래 링크를 클릭하여 구독을 완료하세요:
$confirmationUrl

© ${java.time.Year.now()} Vality
        """.trimIndent()
    }

    /**
     * 뉴스레터 이슈 발행 이메일 HTML 템플릿
     * 
     * 새 이슈가 발행되었을 때 구독자들에게 보내는 이메일
     * 이슈 내용 전체를 포함합니다.
     */
    fun issuePublishedHtml(
        newsletterName: String,
        senderName: String,
        ownerImageUrl: String?,
        issueTitle: String,
        issueDescription: String?,
        issueContent: String?,
        issueUrl: String,
        unsubscribeUrl: String,
    ): String {

        // 이슈 내용이 있으면 본문에 포함, 없으면 description만 표시
        val contentSection = if (!issueContent.isNullOrBlank()) {
            """
                            <div style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.75; color: #334155;">
                                $issueContent
                            </div>
            """.trimIndent()
        } else if (!issueDescription.isNullOrBlank()) {
            """
                            <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.75; color: #64748b;">
                                $issueDescription
                            </p>
            """.trimIndent()
        } else {
            ""
        }

        return """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$issueTitle</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F8FAFC;">
        <tr>
            <td align="center" style="padding: 48px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 32px 40px; border-bottom: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #1e293b; letter-spacing: -0.01em;">
                                $newsletterName
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">
                                by $senderName
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 28px 0; font-size: 26px; font-weight: 700; line-height: 1.3; color: #0f172a; letter-spacing: -0.03em;">
                                $issueTitle
                            </h1>
                            
                            $contentSection
                            
                            <!-- Read on Web (텍스트 링크) -->
                            <div style="text-align: center; margin: 40px 0 0 0; padding-top: 28px; border-top: 1px solid #e2e8f0;">
                                <a href="$issueUrl" style="color: #2563EB; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s;">
                                    Read on Web →
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 28px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 6px 6px;">
                            <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #64748b; text-align: center;">
                                You received this email because you subscribed to $newsletterName.
                            </p>
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94a3b8; text-align: center;">
                                <a href="$unsubscribeUrl" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
                                <span style="margin: 0 8px; color: #cbd5e1;">•</span>
                                <a href="https://vality.io" style="color: #64748b; text-decoration: none;">Powered by Vality</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """.trimIndent()
    }

    /**
     * 뉴스레터 이슈 발행 이메일 텍스트 템플릿
     * 
     * HTML 태그를 제거하여 텍스트만 포함합니다.
     */
    fun issuePublishedText(
        newsletterName: String,
        senderName: String,
        ownerImageUrl: String?,
        issueTitle: String,
        issueDescription: String?,
        issueContent: String?,
        issueUrl: String,
        unsubscribeUrl: String,
    ): String {
        // HTML 태그 제거 함수
        fun stripHtml(html: String?): String {
            if (html.isNullOrBlank()) return ""
            return html
                .replace(Regex("<[^>]+>"), "") // HTML 태그 제거
                .replace("&nbsp;", " ")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&#39;", "'")
                .trim()
        }

        // 이슈 내용이 있으면 본문에 포함, 없으면 description만 표시
        val contentSection = if (!issueContent.isNullOrBlank()) {
            val textContent = stripHtml(issueContent)
            if (textContent.isNotBlank()) {
                """
$textContent

---
                """.trimIndent()
            } else {
                ""
            }
        } else if (!issueDescription.isNullOrBlank()) {
            """
$issueDescription

---
            """.trimIndent()
        } else {
            ""
        }

        return """
$newsletterName
by $senderName

$issueTitle

$contentSection

Read on web: $issueUrl

---

You received this email because you subscribed to $newsletterName.
Unsubscribe: $unsubscribeUrl

Powered by Vality (https://vality.io)
        """.trimIndent()
    }
}

