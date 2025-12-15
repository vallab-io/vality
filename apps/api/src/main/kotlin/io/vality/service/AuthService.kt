package io.vality.service

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.vality.domain.Account
import io.vality.domain.AccountProvider
import io.vality.domain.RefreshToken
import io.vality.domain.User
import io.vality.domain.VerificationCode
import io.vality.dto.auth.AuthResponse
import io.vality.dto.auth.UserResponse
import io.vality.dto.auth.toUserResponse
import io.vality.repository.AccountRepository
import io.vality.repository.RefreshTokenRepository
import io.vality.repository.UserRepository
import io.vality.repository.VerificationCodeRepository
import io.vality.service.oauth.OAuthUserInfo
import io.vality.util.CuidGenerator
import java.security.SecureRandom
import java.time.Instant
import java.util.Base64
import java.util.Date

/**
 * todo: 소셜로그인 회원가입시 이미지 url 내 서버에 저장해서 사용
 */
class AuthService(
    private val userRepository: UserRepository,
    private val accountRepository: AccountRepository,
    private val verificationCodeRepository: VerificationCodeRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
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

    private suspend fun verifyCode(email: String, code: String): Boolean {
        val verificationCode = verificationCodeRepository.findValidByEmailAndCode(email, code)
        return verificationCode != null
    }


    /**
     * 이메일 인증으로 로그인/회원가입 처리
     * - 기존 사용자가 있으면 로그인
     * - 기존 사용자가 없으면 회원가입
     */
    suspend fun authenticateWithEmail(email: String, code: String): AuthResponse {
        // 인증 코드 검증
        if (!verifyCode(email, code)) {
            throw IllegalArgumentException("Invalid verification code")
        }

        // 기존 사용자 확인
        val existingUser = userRepository.findByEmail(email)

        val user = if (existingUser != null) {
            // 기존 사용자: 로그인 처리
            existingUser
        } else {
            // 신규 사용자: 회원가입 처리
            val now = Instant.now()
            val newUser = User(
                id = CuidGenerator.generate(),
                email = email,
                username = null, // 나중에 설정
                name = null, // 나중에 설정
                createdAt = now,
                updatedAt = now,
            )
            userRepository.create(newUser)
            newUser
        }
        
        // 인증 코드 삭제
        verificationCodeRepository.findByEmailAndCode(email, code)
            ?.let { verificationCodeRepository.delete(it.id) }
        
        // JWT 토큰 및 RefreshToken 생성
        val accessToken = generateToken(user.id)
        val refreshToken = generateRefreshToken(user.id)
        
        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken.token,
            user = user.toUserResponse()
        )
    }
    
    suspend fun getCurrentUser(userId: String): UserResponse {
        val user = userRepository.findById(userId)
            ?: throw IllegalStateException("User not found")
        return user.toUserResponse()
    }
    
    suspend fun checkUsernameAvailability(username: String): Boolean {
        return !userRepository.existsByUsername(username)
    }
    
    suspend fun updateProfile(userId: String, username: String, name: String?, bio: String?): UserResponse {
        val user = userRepository.findById(userId)
            ?: throw IllegalStateException("User not found")
        
        // username 중복 확인 (변경하는 경우)
        if (username != user.username) {
            if (userRepository.existsByUsername(username)) {
                throw IllegalArgumentException("Username already exists")
            }
        }
        
        val updatedUser = user.copy(
            username = username,
            name = name ?: user.name,
            bio = bio ?: user.bio,
            updatedAt = Instant.now(),
        )
        
        userRepository.update(updatedUser)
        return updatedUser.toUserResponse()
    }
    
    private fun generateToken(userId: String): String {
        return JWT.create()
            .withIssuer(jwtIssuer)
            .withAudience(jwtAudience)
            .withSubject(userId)
            .withExpiresAt(Date.from(Instant.now().plusSeconds(3600))) // 1시간 (refreshToken으로 갱신 가능)
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
                val refreshToken = generateRefreshToken(updatedUser.id)
                return AuthResponse(
                    accessToken = accessToken,
                    refreshToken = refreshToken.token,
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
            val refreshToken = generateRefreshToken(updatedUser.id)
            return AuthResponse(
                accessToken = accessToken,
                refreshToken = refreshToken.token,
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
        val refreshToken = generateRefreshToken(newUser.id)
        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken.token,
            user = newUser.toUserResponse()
        )
    }

    /**
     * RefreshToken으로 새로운 AccessToken 발급
     */
    suspend fun refreshAccessToken(refreshTokenString: String): AuthResponse {
        // RefreshToken 검증
        val refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
            ?: throw IllegalArgumentException("Invalid or expired refresh token")

        // 사용자 정보 조회
        val user = userRepository.findById(refreshToken.userId)
            ?: throw IllegalStateException("User not found")

        // 기존 RefreshToken 삭제 (rotation 방식)
        refreshTokenRepository.deleteByToken(refreshTokenString)

        // 새로운 AccessToken 및 RefreshToken 발급
        val accessToken = generateToken(user.id)
        val newRefreshToken = generateRefreshToken(user.id)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = newRefreshToken.token,
            user = user.toUserResponse()
        )
    }

    /**
     * RefreshToken 생성 및 저장
     * 만료 기간: 30일
     */
    private suspend fun generateRefreshToken(userId: String): RefreshToken {
        val token = generateSecureRandomToken()
        val expiresAt = Instant.now().plusSeconds(30 * 24 * 60 * 60) // 30일
        val now = Instant.now()

        val refreshToken = RefreshToken(
            id = CuidGenerator.generate(),
            userId = userId,
            token = token,
            expiresAt = expiresAt,
            createdAt = now,
        )

        refreshTokenRepository.create(refreshToken)
        return refreshToken
    }

    /**
     * 보안 랜덤 토큰 생성 (Base64 URL-safe)
     */
    private fun generateSecureRandomToken(): String {
        val random = SecureRandom()
        val bytes = ByteArray(32) // 256 bits
        random.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }
}

