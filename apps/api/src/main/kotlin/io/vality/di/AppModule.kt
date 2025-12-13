package io.vality.di

import io.vality.repository.UserRepository
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module

val appModule = module {
    // Repositories
    singleOf(::UserRepository)

    // Services (추후 추가)
    // singleOf(::UserService)
    // singleOf(::NewsletterService)
}

