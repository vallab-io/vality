package io.vality.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import io.ktor.server.application.log
import io.vality.service.email.EmailWorker
import org.koin.core.context.GlobalContext

/**
 * 이메일 워커 플러그인
 *
 * 애플리케이션 시작 시 이메일 워커를 시작하고,
 * 종료 시 정리합니다.
 */
fun Application.configureEmailWorker() {
    val emailWorker = GlobalContext.get().get<EmailWorker>()

    // 워커 시작
    emailWorker.start()

    // 애플리케이션 종료 시 워커 중지
    environment.monitor.subscribe(ApplicationStopped) {
        try {
            emailWorker.stop()
        } catch (e: Exception) {
            log.error("Failed to stop email worker: ${e.message}", e)
        }
    }
}

