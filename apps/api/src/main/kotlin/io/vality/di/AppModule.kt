package io.vality.di

import org.koin.dsl.module

/**
 * 메인 App Module
 *
 * 모든 서브 모듈을 통합합니다.
 */
val appModule = module {
    includes(
        configModule,
        repositoryModule,
        awsModule,
        serviceModule,
    )
}

