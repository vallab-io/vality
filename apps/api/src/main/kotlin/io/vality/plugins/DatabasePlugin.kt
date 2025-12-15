package io.vality.plugins

import com.typesafe.config.Config
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.transactions.experimental.newSuspendedTransaction

fun Application.configureDatabase(config: Config) {
    val databaseUrl = config.getString("ktor.database.url")
    val username = config.getString("ktor.database.username")
    val password = config.getString("ktor.database.password")
    val driver = config.getString("ktor.database.driver")

    val poolConfig = HikariConfig().apply {
        jdbcUrl = databaseUrl
        driverClassName = driver
        this.username = username
        this.password = password
        maximumPoolSize = config.getInt("ktor.database.pool.maximumPoolSize")
        minimumIdle = config.getInt("ktor.database.pool.minimumIdle")
        connectionTimeout = config.getLong("ktor.database.pool.connectionTimeout")
        idleTimeout = config.getLong("ktor.database.pool.idleTimeout")
        maxLifetime = config.getLong("ktor.database.pool.maxLifetime")
        isAutoCommit = false
        transactionIsolation = "TRANSACTION_REPEATABLE_READ"
        // PostgreSQL prepared statement 이름 충돌 방지
        addDataSourceProperty("prepareThreshold", 0)
        validate()
    }

    val dataSource = HikariDataSource(poolConfig)

    Database.connect(dataSource)

    // 애플리케이션 종료 시 연결 풀 정리
    environment.monitor.subscribe(ApplicationStopped) {
        dataSource.close()
    }
}

// Exposed를 Coroutines와 함께 사용하기 위한 확장 함수
suspend fun <T> dbQuery(block: suspend () -> T): T {
    return newSuspendedTransaction(Dispatchers.IO) { block() }
}
