import { Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
import type { Certificate } from "@/types/content";
import { CertificateCard } from "./certificate-card";

export function Certificates({ certificates }: { certificates: Certificate[] }) {
  return (
    <Section id="certificates" eyebrow="Credentials" title="Certificates">
      {certificates.length === 0 ? (
        <p className="text-fg-muted text-sm">Certificates are being added.</p>
      ) : (
        <RevealRows selector="li" distance={18} duration={0.5} stagger={0.06} blur={8}>
          <ul className="certificate-grid">
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </ul>
        </RevealRows>
      )}
    </Section>
  );
}
