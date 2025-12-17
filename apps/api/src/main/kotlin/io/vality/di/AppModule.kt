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
import io.vality.service.email.EmailService
import io.vality.service.upload.ExternalImageUploadService
import io.vality.service.upload.ImageUploadService
import io.vality.service.upload.ImageUrlService
import io.vality.service.upload.S3Service
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.ses.SesClient

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

    // External Image Upload Service (S3가 설정된 경우에만 생성)
    single<ExternalImageUploadService> {
        val s3Service = get<S3Service>()
        ExternalImageUploadService(s3Service)
    }

    // Image Upload Service
    single {
        val s3Service = get<S3Service>()
        ImageUploadService(s3Service)
    }

    // Image URL Service
    single {
        val config = get<Config>()
        val baseUrl = config.getString("ktor.aws.resourceBaseUrl")
        ImageUrlService(baseUrl)
    }

    // Auth Services
    single {
        val config = get<Config>()
        AuthService(
            userRepository = get(),
            accountRepository = get(),
            verificationCodeRepository = get(),
            refreshTokenRepository = get(),
            externalImageUploadService = get(),
            imageUrlService = get(),
            s3Service = get(),
            jwtSecret = config.getString("ktor.jwt.secret"),
            jwtIssuer = config.getString("ktor.jwt.issuer"),
            jwtAudience = config.getString("ktor.jwt.audience"),
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

    // AWS S3 Services
    single {
        val config = get<Config>()
        val accessKeyId = config.getString("ktor.aws.s3.accessKeyId")
        val secretAccessKey = config.getString("ktor.aws.s3.secretAccessKey")
        val regionStr = config.getString("ktor.aws.region")
        val region = Region.of(regionStr)

        // AWS 자격 증명 설정
        val credentialsProvider = if (accessKeyId.isNotEmpty() && secretAccessKey.isNotEmpty()) {
            StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            )
        } else {
            null // 환경 변수나 시스템 프로퍼티에서 자동으로 읽음
        }

        // S3Client 빌더
        val clientBuilder = S3Client.builder()
            .region(region)

        // 자격 증명이 있으면 설정
        credentialsProvider?.let {
            clientBuilder.credentialsProvider(it)
        }

        clientBuilder.build()
    }

    // S3Presigner (Presigned URL 생성용)
    single {
        val config = get<Config>()
        val accessKeyId = config.getString("ktor.aws.s3.accessKeyId")
        val secretAccessKey = config.getString("ktor.aws.s3.secretAccessKey")
        val regionStr = config.getString("ktor.aws.region")
        val region = Region.of(regionStr)

        // AWS 자격 증명 설정
        val credentialsProvider = if (accessKeyId.isNotEmpty() && secretAccessKey.isNotEmpty()) {
            StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            )
        } else {
            null
        }

        // S3Presigner 빌더
        val presignerBuilder = S3Presigner.builder()
            .region(region)

        credentialsProvider?.let {
            presignerBuilder.credentialsProvider(it)
        }

        presignerBuilder.build()
    }

    single {
        val config = get<Config>()
        val s3Client = get<S3Client>()
        val s3Presigner = get<S3Presigner>()
        val bucketName = config.getString("ktor.aws.s3.bucket")
        val region = config.getString("ktor.aws.region")

        S3Service(
            s3Client = s3Client,
            s3Presigner = s3Presigner,
            bucketName = bucketName,
            region = region,
        )
    }

    // AWS SES Client (vality-ses-user 사용)
    single {
        val config = get<Config>()
        val accessKeyId = config.getString("ktor.aws.ses.accessKeyId")
        val secretAccessKey = config.getString("ktor.aws.ses.secretAccessKey")
        val regionStr = config.getString("ktor.aws.region")
        val region = Region.of(regionStr)

        // AWS 자격 증명 설정 (SES 전용)
        val credentialsProvider = if (accessKeyId.isNotEmpty() && secretAccessKey.isNotEmpty()) {
            StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            )
        } else {
            null // 환경 변수나 시스템 프로퍼티에서 자동으로 읽음
        }

        // SesClient 빌더
        val clientBuilder = SesClient.builder()
            .region(region)

        credentialsProvider?.let {
            clientBuilder.credentialsProvider(it)
        }

        clientBuilder.build()
    }

    // Email Service
    single {
        val config = get<Config>()
        val sesClient = get<SesClient>()
        EmailService(
            sesClient = sesClient,
            fromEmail = config.getString("ktor.aws.ses.fromEmail"),
            fromName = config.getString("ktor.aws.ses.fromName")
        )
    }

}

