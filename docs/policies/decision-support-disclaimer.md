# PrintSahaj - Decision-Support & Verification Disclaimer

**Last Updated:** 18 August 2026

---

## 1. Core Principle: We Never Output PASS / FAIL / APPROVED
PrintSahaj is engineered under strict industrial product standards:
1. **Never Certify:** The platform will never declare a print job as "PASS", "FAIL", "APPROVED", or "COMPLIANT".
2. **Surface Findings:** The platform surfaces deterministic discrepancies, visual coordinates, colour count deltas, and advisory warnings.
3. **Assist, Not Decide:** Technology assists human judgment; it never replaces the expertise of a qualified pre-press operator or plant QC in-charge.

---

## 2. Explicit Statement of What is NOT Checked
Every PrintSahaj audit report and verification module explicitly declares what parameters were **OUT OF SCOPE** and **NOT CHECKED** by automation:

- **Colour Accuracy & Delta-E:** PrintSahaj checks colour names and plate channel presence (e.g. Pantone 7483 C vs Yellow). It does not measure physical ink viscosity, Delta-E colour matching under D50/D65 light booths, anilox cell volume transfer, or ink mixing formulation.
- **Aesthetics & Creative Intent:** PrintSahaj does not review design appeal, brand aesthetics, artistic composition, or subjective visual balance.
- **Trapping & Overprint Intent:** Automated layer inspection highlights overlapping text blocks and knockouts, but physical trapping tolerance (choke/spread) on specific substrates must be approved by the pre-press specialist.
- **Substrate Physics & Press Dynamics:** Web stretch under tension, corona treatment levels, static charge, plate mounting tape thickness compression, and die-cutting registration drift are mechanical variables outside digital file verification.

---

## 3. Barcode & QR Code Decodability Scope
- **Digital Check:** Barcodes and 2D QR codes detected within artwork files are tested for **character string decodability and check-digit mathematical validity**.
- **No ISO 15416 Hardware Grade Claim:** Digital verification cannot and does not assign an ISO/IEC 15416 or ISO/IEC 15415 verification grade (A, B, C, D, F). ISO grading requires calibrated hardware optical verification with 45°/0° reflectance geometry on final physical substrates.

---

## 4. Human Sign-Off Requirement
A PrintSahaj audit report is only complete when an authorized plant professional digitally enters their name and employee/operator ID to confirm:
- All surfaced flags have been reviewed.
- All out-of-scope manual checks have been performed physically.
- Plate exposure or press run authorization is granted under their professional judgment.
