# PrintSahaj - Privacy & Customer Data Isolation Policy

**Last Updated:** 18 August 2026

---

## 1. The Converter Confidentiality Imperative
In the printing and packaging industry, digital artworks, proprietary dielines, confidential FMCG brand launches, ingredient lists, and vendor separation techniques are vital commercial trade secrets.

PrintSahaj is built from the ground up with a **Zero Cross-Contamination Security Architecture**.

---

## 2. How Your Files Are Handled
### 2.1 Multi-Tenant Data Isolation
- Each manufacturing plant/converter operates in a strictly isolated logical tenant environment.
- No tenant can view, query, index, or access artwork files, audit records, or job sheets of any other converter.

### 2.2 Ephemeral Processing
- Uploaded composite PDFs and separation files are processed in isolated runtime memory environments.
- Upon completion of the verification algorithm and audit PDF generation, source PDF files are automatically purged or archived according to the plant's configured data retention schedule (default: immediate purge).

### 2.3 Zero AI Training on Customer Artworks
- **We DO NOT use your customer artworks, dielines, or separations to train, fine-tune, or benchmark public or multi-tenant machine learning models.**
- Your designs remain 100% yours.

---

## 3. On-Premise & Enterprise Deployment
For converters handling high-security pharmaceutical packaging, defense labels, or government security printing:
- PrintSahaj offers **Local On-Premise / Air-Gapped Deployments**.
- In on-premise mode, 100% of data processing, verification algorithms, and audit logs remain within your factory's local network with zero external data transmission.

---

## 4. Information We Collect
- **Account & Billing Details:** Name, company/plant name, GSTIN, business email, contact number, and plant location for invoicing and license management.
- **Operational Telemetry:** Timestamp of audit run, job code (e.g., CGM2026-27-1326), number of plates processed, and execution duration for system health monitoring.
- **User Feedback & Bug Reports:** Crash logs or explicitly submitted feedback.

---

## 5. Security Safeguards
- All data transmitted between your browser/desktop and PrintSahaj servers is encrypted using standard TLS 1.3 encryption.
- Restrictive role-based access control (RBAC) ensuring only authorized plant operators and QC in-charges have access to plant logs.

---

## 6. Contact Data Privacy Officer
For security assessments, data deletion requests, or NDAs:
- **Email:** privacy@printsahaj.com
- **Address:** PrintSahaj Legal & Security Desk, Mumbai / Vasai-Virar, Maharashtra, India.
