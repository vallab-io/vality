import { Metadata } from "next";
import { MarketingHeader } from "../(marketing)/_components/marketing-header";
import { MarketingFooter } from "../(marketing)/_components/marketing-footer";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Vality 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="prose prose-neutral max-w-none dark:prose-invert">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            개인정보처리방침
          </h1>
          <p className="mt-4 text-muted-foreground">
            최종 업데이트: 2025년 1월
          </p>

          <div className="mt-12 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 처리 목적</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vality는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                <li>회원 가입 및 관리: 회원 식별, 서비스 이용에 따른 본인확인, 불법적 또는 부정한 이용 방지</li>
                <li>서비스 제공: 뉴스레터 발행, 구독자 관리, 이메일 발송</li>
                <li>마케팅 및 광고 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. 개인정보의 처리 및 보유기간</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                <li>회원 정보: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)</li>
                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. 처리하는 개인정보의 항목</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 다음의 개인정보 항목을 처리하고 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                <li>필수항목: 이메일 주소, 이름, 비밀번호</li>
                <li>선택항목: 프로필 이미지, 사용자명</li>
                <li>자동 수집 항목: IP 주소, 쿠키, 서비스 이용 기록</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. 개인정보처리의 위탁</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                <li>클라우드 서비스 제공: AWS (Amazon Web Services)</li>
                <li>이메일 발송 서비스: AWS SES</li>
                <li>결제 서비스: 외부 결제 대행사</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
              <p className="text-muted-foreground leading-relaxed">
                정보주체는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정·삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                위 권리 행사는 회사에 대해 서면, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. 개인정보의 파기</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다. 파기의 절차 및 방법은 다음과 같습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                <li>파기절차: 정보주체가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 보관기간 및 관계 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
                <li>파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. 개인정보 보호책임자</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-muted-foreground">
                <p>이메일: privacy@vality.io</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. 개인정보처리방침 변경</h2>
              <p className="text-muted-foreground leading-relaxed">
                이 개인정보처리방침은 2025년 1월부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

