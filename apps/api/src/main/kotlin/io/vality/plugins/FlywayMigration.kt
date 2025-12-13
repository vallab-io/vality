package io.vality.plugins

import com.typesafe.config.ConfigFactory
import org.flywaydb.core.Flyway
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("FlywayMigration")

/**
 * Flyway 마이그레이션을 실행하는 독립 실행형 함수
 * 프로덕션 환경에서 앱 실행 전에 마이그레이션을 실행할 때 사용
 */
fun main() {
    runFlywayMigration()
}

fun runFlywayMigration() {
    val config = ConfigFactory.load()

    val databaseUrl = config.getString("ktor.database.url")
    val username = config.getString("ktor.database.username")
    val password = config.getString("ktor.database.password")

    logger.info("🔄 Flyway 마이그레이션 시작...")
    logger.info("📍 데이터베이스: $databaseUrl")

    val flyway: Flyway = Flyway.configure()
        .dataSource(databaseUrl, username, password)
        .locations("classpath:db/migration")
        .baselineOnMigrate(true)
        .baselineVersion("1")
        .load()

    try {
        val result = flyway.migrate()
        logger.info("✅ Flyway 마이그레이션 완료!")
        logger.info("   - 적용된 마이그레이션: ${result.migrationsExecuted}개")
        logger.info("   - 스키마 버전: ${result.targetSchemaVersion}")
    } catch (e: Exception) {
        logger.error("❌ Flyway 마이그레이션 실패", e)
        throw e
    }
}

