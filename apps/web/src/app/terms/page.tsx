import { Metadata } from "next";
import { MarketingHeader } from "../(marketing)/_components/marketing-header";
import { MarketingFooter } from "../(marketing)/_components/marketing-footer";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Vality 이용약관",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="prose prose-neutral max-w-none dark:prose-invert">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            이용약관
          </h1>
          <p className="mt-4 text-muted-foreground">
            최종 업데이트: 2025년 1월
          </p>

          <div className="mt-12 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
              <p className="text-muted-foreground leading-relaxed">
                이 약관은 Vallab(이하 "회사"라 함)가 제공하는 Vality 뉴스레터 발행 및 구독 서비스(이하 "서비스"라 함)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
              <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                <li>"서비스"란 회사가 제공하는 뉴스레터 발행, 구독, 이메일 발송 및 웹 아카이빙 서비스를 의미합니다.</li>
                <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                <li>"뉴스레터"란 회원이 회사의 서비스를 통해 발행하는 이메일 기반 콘텐츠를 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 게시와 개정)</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다. 약관이 개정되는 경우 회사는 개정된 약관의 내용과 시행일을 명시하여 현행약관과 함께 서비스의 초기화면에 그 시행일 7일 이전부터 시행일 후 상당한 기간 동안 공지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제4조 (회원가입)</h2>
              <p className="text-muted-foreground leading-relaxed">
                이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다. 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제5조 (서비스의 제공 및 변경)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                회사는 다음과 같은 서비스를 제공합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>뉴스레터 발행 및 관리 서비스</li>
                <li>구독자 관리 서비스</li>
                <li>이메일 발송 서비스</li>
                <li>웹 아카이빙 및 블로그 기능</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                회사는 필요한 경우 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 현행 서비스의 초기화면에 그 제공일자 이전 7일 이전부터 공지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제6조 (서비스의 중단)</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절, 기타 불가항력적 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제7조 (회원의 의무)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                회원은 다음 행위를 하여서는 안 됩니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제8조 (개인정보보호)</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다. 회사는 이용자의 개인정보를 수집·이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다. 회사는 수집된 개인정보를 목적외의 용도로 이용할 수 없으며, 새로운 이용목적이 발생한 경우 또는 제3자에게 제공하는 경우에는 이용·제공단계에서 당해 이용자에게 그 목적을 고지하고 동의를 받습니다. 개인정보의 처리 목적과 항목, 보유기간 등에 대한 자세한 내용은 개인정보처리방침을 참고하시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제9조 (회원의 계정 관리 의무)</h2>
              <p className="text-muted-foreground leading-relaxed">
                회원은 자신의 계정(이메일 주소, OAuth 연동 계정 등)에 대한 관리책임을 부담하며, 이를 제3자가 이용하도록 하여서는 안 됩니다. 회원은 자신의 계정이 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 이를 즉시 회사에 통지하고 회사의 안내에 따라야 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제10조 (면책사항)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                회사는 무료로 제공되는 서비스와 관련하여 회원에게 발생한 손해에 대하여 책임을 지지 않습니다. 다만, 회사의 고의 또는 중과실로 인한 손해의 경우에는 그러하지 아니합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                회사는 다음 각 호의 사유로 인한 손해에 대하여는 책임을 지지 않습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>천재지변, 전쟁, 기간통신사업자의 회선 장애 등 불가항력으로 인한 경우</li>
                <li>회원의 귀책사유로 인한 서비스 이용의 장애</li>
                <li>서비스에 게시된 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 보증하지 않음</li>
                <li>회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않음</li>
                <li>회원이 서비스를 이용하면서 얻은 자료로 인한 손해에 대하여 책임을 지지 않음</li>
                <li>회원 상호간 또는 회원과 제3자 상호간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임이 없음</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제11조 (분쟁의 해결)</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사와 이용자 간에 발생한 서비스 이용과 관련한 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만, 제소 당시 이용자의 주소 또는 거소가 분명하지 않거나 외국 거주자의 경우에는 민사소송법상의 관할법원에 제기합니다.
              </p>
            </section>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

