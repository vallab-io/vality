package io.vality.service

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.util.*
import io.vality.domain.*
import io.vality.dto.auth.AuthResponse
import io.vality.dto.auth.SignupRequest
import io.vality.dto.auth.UserResponse
import io.vality.repository.*
import java.time.Instant
import io.vality.util.CuidGenerator
import io.vality.dto.auth.toUserResponse

class AuthService(
    private val userRepository: UserRepository,
    private val accountRepository: AccountRepository,
    private val verificationCodeRepository: VerificationCodeRepository,
    private val jwtSecret: String,
    private val jwtIssuer: String,
    private val jwtAudience: String
) {
    
    suspend fun sendVerificationCode(email: String): Boolean {
        // TODO: 이메일 발송 로직 구현 (Resend 등)
        // 지금은 인증 코드만 생성하고 저장
        
        val code = generateVerificationCode()
        val expiresAt = Instant.now().plusSeconds(600) // 10분 후 만료
        
        val verificationCode = VerificationCode(
            id = CuidGenerator.generate(),
            email = email,
            code = code,
            expiresAt = expiresAt,
            createdAt = Instant.now(),
        )
        
        verificationCodeRepository.create(verificationCode)
        
        // TODO: 실제 이메일 발송
        println("Verification code for $email: $code")
        
        return true
    }
    
    suspend fun verifyCode(email: String, code: String): Boolean {
        val verificationCode = verificationCodeRepository.findValidByEmailAndCode(email, code)
        return verificationCode != null
    }
    
    suspend fun signup(request: SignupRequest): AuthResponse {
        // 인증 코드 검증
        if (!verifyCode(request.email, request.code)) {
            throw IllegalArgumentException("Invalid verification code")
        }
        
        // 사용자 생성
        val now = Instant.now()
        val user = User(
            id = CuidGenerator.generate(),
            email = request.email,
            username = request.username,
            name = request.name,
            createdAt = now,
            updatedAt = now,
        )
        
        userRepository.create(user)
        
        // 인증 코드 삭제
        verificationCodeRepository.findByEmailAndCode(request.email, request.code)?.let {
            verificationCodeRepository.delete(it.id)
        }
        
        // JWT 토큰 생성
        val accessToken = generateToken(user.id)
        
        return AuthResponse(
            accessToken = accessToken,
            user = user.toUserResponse()
        )
    }
    
    suspend fun getCurrentUser(userId: String): UserResponse {
        val user = userRepository.findById(userId)
            ?: throw IllegalStateException("User not found")
        return user.toUserResponse()
    }
    
    private fun generateToken(userId: String): String {
        return JWT.create()
            .withIssuer(jwtIssuer)
            .withAudience(jwtAudience)
            .withSubject(userId)
            .withExpiresAt(Date.from(Instant.now().plusSeconds(86400))) // 24시간
            .withIssuedAt(Date.from(Instant.now()))
            .sign(Algorithm.HMAC256(jwtSecret))
    }
    
    private fun generateVerificationCode(): String {
        return (100000..999999).random().toString()
    }
}

