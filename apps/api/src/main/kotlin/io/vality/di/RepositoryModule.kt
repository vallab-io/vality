package io.vality.di

import io.vality.repository.AccountRepository
import io.vality.repository.EmailLogRepository
import io.vality.repository.IssueRepository
import io.vality.repository.NewsletterRepository
import io.vality.repository.RefreshTokenRepository
import io.vality.repository.SubscriberRepository
import io.vality.repository.SubscriberVerificationTokenRepository
import io.vality.repository.SubscriptionRepository
import io.vality.repository.SubscriptionWebhookEventRepository
import io.vality.repository.UserRepository
import io.vality.repository.VerificationCodeRepository
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module

val repositoryModule = module {
    // Repositories
    singleOf(::UserRepository)
    singleOf(::AccountRepository)
    singleOf(::VerificationCodeRepository)
    singleOf(::RefreshTokenRepository)
    singleOf(::NewsletterRepository)
    singleOf(::IssueRepository)
    singleOf(::SubscriberRepository)
    singleOf(::SubscriberVerificationTokenRepository)
    singleOf(::EmailLogRepository)
    singleOf(::SubscriptionRepository)
    singleOf(::SubscriptionWebhookEventRepository)
}

