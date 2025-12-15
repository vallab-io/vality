package io.vality.di

import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import io.vality.repository.AccountRepository
import io.vality.repository.EmailLogRepository
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import io.vality.repository.RefreshTokenRepository
import io.vality.repository.SubscriberRepository
import io.vality.repository.UserRepository
import io.vality.repository.VerificationCodeRepository
import io.vality.service.AuthService
import io.vality.service.oauth.GoogleOAuthService
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module

val appModule = module {
    // Config
    single { ConfigFactory.load() }
    
    // Repositories
    singleOf(::UserRepository)
    singleOf(::AccountRepository)
    singleOf(::VerificationCodeRepository)
    singleOf(::RefreshTokenRepository)
    singleOf(::NewsletterRepository)
    singleOf(::IssueRepository)
    singleOf(::SubscriberRepository)
    singleOf(::EmailLogRepository)

    // Auth Services
    single {
        val config = get<Config>()
        AuthService(
            userRepository = get(),
            accountRepository = get(),
            verificationCodeRepository = get(),
            refreshTokenRepository = get(),
            jwtSecret = config.getString("ktor.jwt.secret"),
            jwtIssuer = config.getString("ktor.jwt.issuer"),
            jwtAudience = config.getString("ktor.jwt.audience")
        )
    }

    // OAuth Services
    single {
        val config = get<Config>()
        GoogleOAuthService(
            clientId = config.getString("ktor.oauth.google.clientId"),
            clientSecret = config.getString("ktor.oauth.google.clientSecret")
        )
    }
    
}

