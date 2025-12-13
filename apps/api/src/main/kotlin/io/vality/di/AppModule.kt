package io.vality.di

import com.typesafe.config.ConfigFactory
import io.vality.repository.*
import io.vality.service.AuthService
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module

val appModule = module {
    // Config
    single { ConfigFactory.load() }
    
    // Repositories
    singleOf(::UserRepository)
    singleOf(::AccountRepository)
    singleOf(::VerificationCodeRepository)
    singleOf(::NewsletterRepository)
    singleOf(::IssueRepository)
    singleOf(::SubscriberRepository)
    singleOf(::EmailLogRepository)
    
    // Services
    single {
        val config = get<com.typesafe.config.Config>()
        AuthService(
            userRepository = get(),
            accountRepository = get(),
            verificationCodeRepository = get(),
            jwtSecret = config.getString("ktor.jwt.secret"),
            jwtIssuer = config.getString("ktor.jwt.issuer"),
            jwtAudience = config.getString("ktor.jwt.audience")
        )
    }
    
}

