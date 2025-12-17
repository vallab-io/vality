package io.vality.di

import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import org.koin.dsl.module

val configModule = module {
    // Config
    single<Config> { ConfigFactory.load() }
}

