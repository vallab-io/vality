package io.vality.di

import com.typesafe.config.Config
import io.vality.service.AuthService
import io.vality.service.DashboardService
import io.vality.service.IssuePublishService
import io.vality.service.IssueService
import io.vality.service.LemonSqueezyService
import io.vality.service.NewsletterService
import io.vality.service.SubscriberService
import io.vality.service.SubscriptionService
import io.vality.service.UserService
import io.vality.service.email.EmailQueueService
import io.vality.service.email.EmailService
import io.vality.service.email.EmailWorker
import io.vality.service.oauth.GoogleOAuthService
import io.vality.service.upload.ExternalImageUploadService
import io.vality.service.upload.ImageUploadService
import io.vality.service.upload.ImageUrlService
import io.vality.service.upload.S3Service
import org.koin.dsl.module

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
        val imageUrlService = get<ImageUrlService>()
        ExternalImageUploadService(s3Service, imageUrlService)
    }

    // Image Upload Service
    single<ImageUploadService> {
        val s3Service = get<S3Service>()
        val imageUrlService = get<ImageUrlService>()
        ImageUploadService(s3Service, imageUrlService)
    }

    // Email Service (Resend)
    single<EmailService> {
        val config = get<Config>()
        EmailService(
            apiKey = config.getString("ktor.resend.apiKey"),
            defaultFromEmail = config.getString("ktor.resend.fromEmail"),
            defaultFromName = config.getString("ktor.resend.fromName")
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

    // User Service
    single<UserService> {
        UserService(
            userRepository = get(),
            imageUrlService = get(),
        )
    }

    // Newsletter Service
    single<NewsletterService> {
        NewsletterService(
            newsletterRepository = get(),
            subscriberRepository = get(),
            userRepository = get(),
        )
    }

    // Email Queue Service (Redis 기반)
    single<EmailQueueService> {
        EmailQueueService(
            redisConfig = get(),
        )
    }

    // Issue Publish Service (이슈 발행 시 이메일 큐잉)
    single<IssuePublishService> {
        val config = get<Config>()
        IssuePublishService(
            emailQueueService = get(),
            subscriberRepository = get(),
            newsletterRepository = get(),
            userRepository = get(),
            emailLogRepository = get(),
            frontendUrl = config.getString("ktor.web.url"),
        )
    }

    // Issue Service
    single<IssueService> {
        IssueService(
            issueRepository = get(),
            newsletterRepository = get(),
            userRepository = get(),
            imageUrlService = get(),
            issuePublishService = get(),
        )
    }

    // Subscription Service
    single<SubscriptionService> {
        SubscriptionService(
            subscriptionRepository = get(),
            newsletterRepository = get(),
        )
    }

    // Lemon Squeezy Service
    single<LemonSqueezyService> {
        LemonSqueezyService(
            subscriptionRepository = get(),
            subscriptionWebhookEventRepository = get(),
            subscriptionService = get(),
            config = get(),
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

    // Dashboard Service
    single<DashboardService> {
        DashboardService(
            newsletterRepository = get(),
            issueRepository = get(),
            subscriberRepository = get(),
            userRepository = get(),
        )
    }

    // Email Worker (백그라운드 이메일 발송)
    single<EmailWorker> {
        val config = get<Config>()
        EmailWorker(
            emailQueueService = get(),
            emailService = get(),
            emailLogRepository = get(),
            subscriberRepository = get(),
        )
    }
}

