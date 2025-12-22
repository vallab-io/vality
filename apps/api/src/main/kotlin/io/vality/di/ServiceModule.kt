package io.vality.di

import com.typesafe.config.Config
import io.vality.service.AuthService
import io.vality.service.IssueService
import io.vality.service.NewsletterService
import io.vality.service.SubscriberService
import io.vality.service.email.EmailService
import io.vality.service.oauth.GoogleOAuthService
import io.vality.service.upload.ExternalImageUploadService
import io.vality.service.upload.ImageUploadService
import io.vality.service.upload.ImageUrlService
import io.vality.service.upload.S3Service
import org.koin.dsl.module
import software.amazon.awssdk.services.ses.SesClient

val serviceModule = module {
    // Image URL Service
    single<ImageUrlService> {
        val config = get<Config>()
        val baseUrl = config.getString("ktor.aws.resourceBaseUrl")
        ImageUrlService(baseUrl)
    }

    // External Image Upload Service
    single<ExternalImageUploadService> {
        val s3Service = get<S3Service>()
        ExternalImageUploadService(s3Service)
    }

    // Image Upload Service
    single<ImageUploadService> {
        val s3Service = get<S3Service>()
        ImageUploadService(s3Service)
    }

    // Email Service
    single<EmailService> {
        val config = get<Config>()
        val sesClient = get<SesClient>()
        EmailService(
            sesClient = sesClient,
            fromEmail = config.getString("ktor.aws.ses.fromEmail"),
            fromName = config.getString("ktor.aws.ses.fromName")
        )
    }

    // OAuth Services
    single<GoogleOAuthService> {
        val config = get<Config>()
        GoogleOAuthService(
            clientId = config.getString("ktor.oauth.google.clientId"),
            clientSecret = config.getString("ktor.oauth.google.clientSecret")
        )
    }

    // Auth Service
    single<AuthService> {
        val config = get<Config>()
        AuthService(
            userRepository = get(),
            accountRepository = get(),
            verificationCodeRepository = get(),
            refreshTokenRepository = get(),
            externalImageUploadService = get(),
            imageUrlService = get(),
            s3Service = get(),
            emailService = get(),
            jwtSecret = config.getString("ktor.jwt.secret"),
            jwtIssuer = config.getString("ktor.jwt.issuer"),
            jwtAudience = config.getString("ktor.jwt.audience"),
        )
    }

    // Newsletter Service
    single<NewsletterService> {
        NewsletterService(
            newsletterRepository = get(),
        )
    }

    // Issue Service
    single<IssueService> {
        IssueService(
            issueRepository = get(),
        )
    }

    // Subscriber Service
    single<SubscriberService> {
        val config = get<Config>()
        SubscriberService(
            subscriberRepository = get(),
            newsletterRepository = get(),
            subscriberVerificationTokenRepository = get(),
            userRepository = get(),
            emailService = get(),
            frontendUrl = config.getString("ktor.web.url"),
        )
    }
}

