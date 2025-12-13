package io.vality.util

import java.security.SecureRandom
import java.util.concurrent.atomic.AtomicInteger

/**
 * CUID (Collision-resistant Unique Identifier) 생성기
 * 
 * CUID 특징:
 * - 소문자 알파벳과 숫자만 사용 (URL-friendly)
 * - 약 25자 길이
 * - 시간 기반 정렬 가능
 * - 예: "cjld2cjxh0000qzrmn831i7rn"
 * 
 * 참고: Prisma의 @default(cuid())와 호환되는 형식
 */
object CuidGenerator {
    private val counter = AtomicInteger(0)
    private val random = SecureRandom()
    private val fingerprint = generateFingerprint()
    
    private const val CUID_LENGTH = 25
    private const val ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"
    
    /**
     * 새로운 CUID 생성
     * 
     * CUID 형식: c[timestamp][counter][fingerprint][random]
     * - 'c'로 시작
     * - 타임스탬프 (base36, 8자리)
     * - 카운터 (base36, 4자리)
     * - 랜덤 문자열 (나머지)
     */
    fun generate(): String {
        val timestamp = System.currentTimeMillis()
        val count = counter.incrementAndGet()
        
        val cuid = StringBuilder()
        
        // 'c'로 시작 (CUID 표시)
        cuid.append('c')
        
        // 타임스탬프 (base36, 8자리)
        val timestampStr = timestamp.toString(36).lowercase()
        cuid.append(timestampStr.takeLast(8).padStart(8, '0'))
        
        // 카운터 (base36, 4자리)
        val countStr = count.toString(36).lowercase()
        cuid.append(countStr.takeLast(4).padStart(4, '0'))
        
        // 랜덤 부분 (나머지, 최소 12자리)
        val remaining = CUID_LENGTH - cuid.length
        for (i in 0 until remaining) {
            cuid.append(ALPHABET[random.nextInt(ALPHABET.length)])
        }
        
        return cuid.toString().take(CUID_LENGTH).lowercase()
    }
    
    /**
     * 호스트 기반 fingerprint 생성 (간단한 버전)
     */
    private fun generateFingerprint(): String {
        val hostname = try {
            java.net.InetAddress.getLocalHost().hostName
        } catch (e: Exception) {
            "unknown"
        }
        
        // 간단한 해시 기반 fingerprint
        return hostname.hashCode().toString(36).take(4).padStart(4, '0')
    }
}

