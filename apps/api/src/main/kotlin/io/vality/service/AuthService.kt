package io.vality.service

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.vality.domain.Account
import io.vality.domain.AccountProvider
import io.vality.domain.User
import io.vality.domain.VerificationCode
import io.vality.dto.auth.AuthResponse
import io.vality.dto.auth.SignupRequest
import io.vality.dto.auth.UserResponse
import io.vality.dto.auth.toUserResponse
import io.vality.repository.AccountRepository
import io.vality.repository.UserRepository
import io.vality.repository.VerificationCodeRepository
import io.vality.service.oauth.OAuthUserInfo
import io.vality.util.CuidGenerator
import java.time.Instant
import java.util.Date

/**
 * todo: 소셜로그인 회원가입시 이미지 url 내 서버에 저장해서 사용
 */
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

    /**
     * 소셜 로그인/회원가입 처리
     * - 기존 Account가 있으면 로그인
     * - Account가 없고 같은 email의 User가 있으면 Account만 생성 (소셜 계정 연결)
     * - 둘 다 없으면 User와 Account 모두 생성 (신규 회원가입)
     */
    suspend fun socialLogin(
        provider: AccountProvider,
        userInfo: OAuthUserInfo,
    ): AuthResponse {
        val now = Instant.now()

        // 1. 기존 Account 찾기 (provider + providerAccountId)
        accountRepository.findByProviderAndProviderAccountId(
            provider = provider,
            providerAccountId = userInfo.id,
        )
            ?.let { existingAccount ->
                // 기존 Account가 있으면 로그인 처리
                val user = userRepository.findById(existingAccount.userId)
                    ?: throw IllegalStateException("User not found for account: ${existingAccount.id}")

                // 사용자 정보 업데이트 (이름, 아바타 등)
                val updatedUser = user.copy(
                    name = userInfo.name ?: user.name,
                    avatarUrl = userInfo.avatarUrl ?: user.avatarUrl,
                    updatedAt = now
                )
                userRepository.update(updatedUser)

                val accessToken = generateToken(updatedUser.id)
                return AuthResponse(
                    accessToken = accessToken,
                    user = updatedUser.toUserResponse()
                )
            }

        // 2. Account가 없으면, 같은 email의 User 찾기
        val existingUser = if (userInfo.email != null) {
            userRepository.findByEmail(userInfo.email)
        } else {
            null
        }

        if (existingUser != null) {
            // 기존 User가 있으면 Account만 생성 (소셜 계정 연결)
            val account = Account(
                id = CuidGenerator.generate(),
                provider = provider,
                providerAccountId = userInfo.id,
                userId = existingUser.id,
                createdAt = now,
            )
            accountRepository.create(account)

            // 사용자 정보 업데이트
            val updatedUser = existingUser.copy(
                name = userInfo.name ?: existingUser.name,
                avatarUrl = userInfo.avatarUrl ?: existingUser.avatarUrl,
                updatedAt = now
            )
            userRepository.update(updatedUser)

            val accessToken = generateToken(updatedUser.id)
            return AuthResponse(
                accessToken = accessToken,
                user = updatedUser.toUserResponse()
            )
        }

        // 3. 둘 다 없으면 신규 회원가입 (User + Account 생성)
        val newUser = User(
            id = CuidGenerator.generate(),
            email = userInfo.email ?: throw IllegalArgumentException("Email is required for new user"),
            username = null, // 나중에 설정 가능
            name = userInfo.name,
            bio = null,
            avatarUrl = userInfo.avatarUrl,
            createdAt = now,
            updatedAt = now,
        )
        userRepository.create(newUser)

        val account = Account(
            id = CuidGenerator.generate(),
            provider = provider,
            providerAccountId = userInfo.id,
            userId = newUser.id,
            createdAt = now,
        )
        accountRepository.create(account)

        val accessToken = generateToken(newUser.id)
        return AuthResponse(
            accessToken = accessToken,
            user = newUser.toUserResponse()
        )
    }
}

