-- 0002_certificates.sql — certificates table, read-only RLS, and seed data
begin;

create table if not exists public.certificates (
  id text primary key,
  title text not null,
  issuer text not null,
  year integer not null,
  summary text not null,
  image_path text,
  verification_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists certificates_order_idx on public.certificates (sort_order);

-- Permissions & RLS
revoke all on table public.certificates from anon, authenticated;
grant select on table public.certificates to anon, authenticated;

alter table public.certificates enable row level security;

drop policy if exists certificates_public_read on public.certificates;
create policy certificates_public_read on public.certificates
  for select to anon, authenticated using (true);

-- Initial seed data (11 certificates including AWS Certified AI Practitioner)
insert into public.certificates (id, title, issuer, year, summary, image_path, verification_url, sort_order)
values
  (
    'aws-ai-practitioner',
    'AWS Certified AI Practitioner (AIP) — Complete Bootcamp 2026',
    'Udemy',
    2026,
    'Mastered core AI/ML concepts and AWS generative AI services, including Amazon Bedrock, SageMaker, foundation models, and responsible AI governance.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/ai_practitioner.webp',
    'https://ude.my/UC-7b87931b-80e4-4c48-b5d4-261266c662fe',
    1
  ),
  (
    'backend-javascript',
    'Belajar Back-end Pemula dengan JavaScript',
    'Dicoding Academy',
    2025,
    'Built a Node.js REST API with Hapi, deployed a web service, and tested endpoints with Postman.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/backend_javascript.webp',
    'https://www.dicoding.com/certificates/98XWE34L9XM3',
    2
  ),
  (
    'javascript-fundamentals',
    'Belajar Dasar Pemrograman JavaScript',
    'Dicoding Academy',
    2025,
    'Covered JavaScript fundamentals, asynchronous programming, functional and object-oriented patterns, and code quality.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/dasar_javascript.webp',
    'https://www.dicoding.com/certificates/MEPJQ78DLX3V',
    3
  ),
  (
    'aws-cloud-gen-ai',
    'Belajar Dasar Cloud dan Gen AI di AWS',
    'Dicoding Academy',
    2025,
    'Studied AWS cloud foundations, architecture, security, cost management, machine learning, and generative AI.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/dasar_cloud_gen_ai.webp',
    'https://www.dicoding.com/certificates/RVZKW2N9OZD5',
    4
  ),
  (
    'data-science',
    'Belajar Dasar Data Science',
    'Dicoding Academy',
    2025,
    'Learned data science workflows, analysis, SQL, Python, R, visualization, and machine learning fundamentals.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/dasar_data_science.webp',
    'https://www.dicoding.com/certificates/NVP75L65OXR0',
    5
  ),
  (
    'python-programming',
    'Memulai Pemrograman dengan Python',
    'Dicoding Academy',
    2025,
    'Practiced Python fundamentals, object-oriented programming, testing, PEP 8, and common development libraries.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/memulai_dengan_python.webp',
    'https://www.dicoding.com/certificates/L4PQ1ML97XO1',
    6
  ),
  (
    'data-visualization',
    'Belajar Dasar Visualisasi Data',
    'Dicoding Academy',
    2023,
    'Explored data preparation, chart design, visual perception, and data storytelling with Google Sheets.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/dasar_visual.webp',
    'https://www.dicoding.com/certificates/1OP81ND28ZQK',
    7
  ),
  (
    'generative-ai',
    'Belajar Penggunaan Generative AI',
    'Dicoding Academy',
    2025,
    'Studied generative AI, large language models, responsible use, and Gemini in Google Workspace.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/penggunaan_gen_ai.webp',
    'https://www.dicoding.com/certificates/ERZREQ90QXYV',
    8
  ),
  (
    'practical-ai',
    'AI Praktis untuk Produktivitas',
    'Dicoding Academy',
    2025,
    'Learned practical AI tools and prompt engineering with attention to responsible and secure use.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/ai_praktis.webp',
    'https://www.dicoding.com/certificates/GRX535NLKZ0M',
    9
  ),
  (
    'big-data-analyst',
    'Big Data Analyst',
    'Solusi247',
    2025,
    'Certified in big data analytics foundations, data processing, analytical tools, and decision-support insights.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/big_data.webp',
    'https://drive.google.com/file/d/1LulID8eAcOq3BaSYKh6-dHhZdgBiK46v/view?usp=drive_link',
    10
  ),
  (
    'mtcna',
    'MTCNA (MikroTik Certified Network Associate)',
    'MikroTik',
    2026,
    'Covered MikroTik network configuration, routing, IP addressing, firewall, DHCP, DNS, and router management.',
    'https://tgrzltdlgakmxvpdlpcb.supabase.co/storage/v1/object/public/media/certificates/mtcna.webp',
    'https://drive.google.com/file/d/1RI91OnXilQFhLWXbRHyQiC9itWNjMEKm/view?usp=drive_link',
    11
  )
on conflict (id) do update set
  title = excluded.title,
  issuer = excluded.issuer,
  year = excluded.year,
  summary = excluded.summary,
  image_path = excluded.image_path,
  verification_url = excluded.verification_url,
  sort_order = excluded.sort_order;

commit;
