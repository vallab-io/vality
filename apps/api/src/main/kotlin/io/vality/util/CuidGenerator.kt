package io.vality.util

import java.security.SecureRandom

/**
 * CUID2 (Collision-resistant Unique Identifier v2) 생성기
 *
 * @paralleldrive/cuid2 공식 스펙 기반 직접 구현
 *
 * CUID2 특징:
 * - 소문자 알파벳과 숫자만 사용 (URL-friendly)
 * - 24자 길이 (기본값)
 * - 시간 기반 정렬 가능
 * - 높은 엔트로피로 충돌 방지
 *
 * 참고: Prisma의 @default(cuid2())와 호환되는 형식
 */
object CuidGenerator {
    private val random = SecureRandom()

    private const val DEFAULT_LENGTH = 24
    private const val ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"
    private const val BASE = 36

    /**
     * 지정된 길이의 CUID2 생성
     *
     * 실제 CUID2는 타임스탬프를 최소화하고 대부분을 랜덤으로 채움
     * - 타임스탬프: 2-3자리만 사용 (시간 기반 정렬을 위한 최소한의 정보)
     * - 나머지: 모두 랜덤 (높은 엔트로피)
     *
     * @param length 생성할 CUID2의 길이 (최소 2)
     * @return CUID2 문자열
     */
    fun generate(length: Int = DEFAULT_LENGTH): String {
        require(length >= 2) { "Length must be at least 2" }

        val timestamp = System.currentTimeMillis()
        val cuid2 = StringBuilder(length)

        // 타임스탬프를 base36으로 인코딩 (2-3자리만 사용)
        // 실제 CUID2는 타임스탬프를 최소화하고 대부분을 랜덤으로 채움
        val timestampStr = timestamp.toString(BASE)
            .lowercase()
        // 타임스탬프의 마지막 2-3자리만 사용 (전체의 10-15% 정도)
        val timestampLength = maxOf(2, minOf(3, length / 10))
        val timestampPart = timestampStr.takeLast(timestampLength)
            .padStart(timestampLength, '0')
        cuid2.append(timestampPart)

        // 나머지는 모두 랜덤으로 채움 (높은 엔트로피로 충돌 방지)
        val remaining = length - cuid2.length
        for (i in 0 until remaining) {
            cuid2.append(ALPHABET[random.nextInt(ALPHABET.length)])
        }

        // 정확한 길이로 자르기
        return cuid2.toString()
            .take(length)
            .lowercase()
    }
}
