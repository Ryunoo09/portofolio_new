import Image from "next/image";
import { isHttpUrl } from "@/lib/url";
import type { Certificate } from "@/types/content";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <li className="certificate-card">
      {certificate.image_path ? (
        <Image
          src={certificate.image_path}
          alt={`Certificate: ${certificate.title}`}
          width={640}
          height={450}
          className="certificate-image"
          sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
        />
      ) : (
        <div className="certificate-image-placeholder" aria-hidden="true">
          <span>Certificate image unavailable</span>
        </div>
      )}
      <div className="certificate-content">
        <p className="certificate-meta">{certificate.issuer} · {certificate.year}</p>
        <h3>{certificate.title}</h3>
        <p className="text-fg-muted text-sm leading-relaxed">{certificate.summary}</p>
        {certificate.verification_url && isHttpUrl(certificate.verification_url) && (
          <a href={certificate.verification_url} target="_blank" rel="noopener noreferrer">
            Verify certificate
            <span aria-hidden="true"> ↗</span>
          </a>
        )}
      </div>
    </li>
  );
}
