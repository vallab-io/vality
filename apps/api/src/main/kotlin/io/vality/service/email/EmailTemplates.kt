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
}

