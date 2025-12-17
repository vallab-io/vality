package io.vality.di

import com.typesafe.config.Config
import io.vality.service.upload.S3Service
import org.koin.dsl.module
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.ses.SesClient

val awsModule = module {
    // AWS S3 Client (vality-s3-user)
    single<S3Client> {
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
    single<S3Presigner> {
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

    // S3 Service
    single<S3Service> {
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

    // AWS SES Client (vality-ses-user)
    single<SesClient> {
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
}

