export function PrivacyContentEn() {
  return (
    <div className="mt-12 space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Purpose of Processing Personal Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          Vallab (hereinafter "Company") processes personal information for the following purposes to provide the Vality service. The personal information being processed will not be used for purposes other than the following, and if the purpose of use changes, necessary measures such as obtaining separate consent under Article 18 of the Personal Information Protection Act will be implemented.
        </p>
        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
          <li>Member registration and management: Member identification, identity verification for service use, prevention of illegal or fraudulent use</li>
          <li>Service provision: Newsletter publishing, subscriber management, email delivery</li>
          <li>Marketing and advertising: Development of new services, provision of customized services, provision of events and advertising information</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">2. Processing and Retention Period of Personal Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Company processes and retains personal information within the retention and use period stipulated by law or within the period consented to when collecting personal information from the data subject.
        </p>
        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
          <li>Member information: Until membership withdrawal (However, if investigation or inquiry due to violation of relevant laws is in progress, until the end of such investigation or inquiry)</li>
          <li>Service usage records: Until membership withdrawal (However, if retention for a certain period is required by relevant laws, that period)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">3. Personal Information Items Processed</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Company processes the following personal information items.
        </p>
        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
          <li>Required items: Email address, name (or username)</li>
          <li>Optional items: Profile image</li>
          <li>Automatically collected items: IP address, cookies, service usage records, access logs</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">4. Provision of Personal Information to Third Parties</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Company processes the data subject's personal information only within the scope specified in Section 1 (Purpose of Processing Personal Information) and provides personal information to third parties only in cases falling under Articles 17 and 18 of the Personal Information Protection Act, such as the consent of the data subject or special provisions of law. Currently, the Company does not provide the data subject's personal information to third parties.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Entrustment of Personal Information Processing</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Company entrusts personal information processing as follows for smooth personal information handling:
        </p>
        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
          <li>Cloud service provision: AWS (Amazon Web Services)</li>
          <li>Email delivery service: AWS SES</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-4">
          When entering into entrustment contracts, the Company specifies matters regarding prohibition of processing personal information for purposes other than entrusted work, technical and administrative protective measures, and restrictions on re-entrustment in documents such as contracts pursuant to Article 26 of the Personal Information Protection Act.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">6. Rights and Obligations of Data Subjects and Exercise Methods</h2>
        <p className="text-muted-foreground leading-relaxed">
          Data subjects can exercise the following rights as personal information subjects:
        </p>
        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
          <li>Request for access to personal information</li>
          <li>Request for correction or deletion of personal information</li>
          <li>Request to suspend processing of personal information</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-4">
          The above rights can be exercised by contacting the Company in writing or by email, and the Company will take appropriate measures in accordance with relevant laws.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Destruction of Personal Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Company destroys personal information when it becomes unnecessary due to the expiration of the retention period or achievement of the purpose of processing. The procedures and methods of destruction are as follows:
        </p>
        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
          <li>Destruction procedure: Information entered by the data subject is transferred to a separate database after achieving its purpose and destroyed after being stored for a certain period according to the retention period and relevant laws.</li>
          <li>Destruction method: Information in electronic file format uses technical methods that make it impossible to reproduce records.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">8. Personal Information Protection Officer</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Company designates a Personal Information Protection Officer as follows to take overall responsibility for personal information processing and respond to inquiries from data subjects related to personal information processing:
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-muted-foreground">
          <p>Email: support@vality.io</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">9. Changes to Privacy Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          This Privacy Policy takes effect from January 2025, and changes due to additions, deletions, or corrections in accordance with laws and policies may be announced through notices.
        </p>
      </section>
    </div>
  );
}

