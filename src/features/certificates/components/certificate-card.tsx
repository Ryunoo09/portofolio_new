import Image from "next/image";
import { Button } from "@/components/ui";
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
          <div className="pt-1">
            <Button asChild size="sm" variant="secondary">
              <a href={certificate.verification_url} target="_blank" rel="noopener noreferrer">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Verify certificate
              </a>
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
