package io.vality.plugins

import com.typesafe.config.ConfigFactory
import org.flywaydb.core.Flyway
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("FlywayInfo")

/**
 * Flyway 마이그레이션 정보를 확인하는 독립 실행형 함수
 */
fun showFlywayInfo() {
    val config = ConfigFactory.load()

    val databaseUrl = config.getString("ktor.database.url")
    val username = config.getString("ktor.database.username")
    val password = config.getString("ktor.database.password")

    logger.info("📊 Flyway 마이그레이션 정보 확인...")
    logger.info("📍 데이터베이스: $databaseUrl")

    val flyway: Flyway = Flyway.configure()
        .dataSource(databaseUrl, username, password)
        .locations("classpath:db/migration")
        .load()

    val info = flyway.info()
    val current = info.current()
    val pending = info.pending()

    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("현재 스키마 버전: ${current?.version ?: "없음"}")
    logger.info("설명: ${current?.description ?: "없음"}")
    logger.info("대기 중인 마이그레이션: ${pending.size}개")

    if (pending.isNotEmpty()) {
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        logger.info("대기 중인 마이그레이션 목록:")
        pending.forEach { migration ->
            logger.info("  - ${migration.version}: ${migration.description}")
        }
    }
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

fun main() {
    showFlywayInfo()
}

