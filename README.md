# TenderPack • Tender Document Package Builder

> **AI DevFest 2026 Vibe Coding Contest Project**  
> A 100% client-side, browser-based tender document validation and unified PDF package compiler.

---

## 📌 Project Overview

**TenderPack** empowers office staff, procurement officers, and bidders to take a dynamic `requirements.json` tender specification alongside multiple uploaded PDF documents and instantly assemble a fully validated, ordered, and unified final tender PDF submission package.

All processing, parsing, duplicate hash calculations, and PDF generation happen **100% locally in Google Chrome/the browser**. Files are never uploaded to any remote server or external database.

---

## 👤 Contest & Participant Details

- **Project Name:** TenderPack (Tender Document Package Builder)
- **Participant Name:** `[Participant Name]`
- **Registration Number:** `[Registration Number]`
- **Live HTTPS URL:** `[Live Deployment URL]`
- **License:** MIT License (retained in repository)

---

## 🚀 How to Run Locally

Because the project is built purely with vanilla web standards and browser-side libraries, no complicated build step or package manager is required.

### Method 1: Local HTTP Server (Recommended)
```bash
# In the project root directory
python -m http.server 8000
```
Then navigate to: **`http://localhost:8000`** in Google Chrome.

### Method 2: Direct File Open
Double click or open `index.html` directly in any modern Google Chrome browser.

---

## 🎯 Core Features

1. **Dynamic `requirements.json` Engine:**
   - Dynamically loads any valid tender structure (`tender_id`, `title`, `procuring_entity`, `bidder`, `submission_deadline`, and `requirements` array).
   - Dynamically displays requirement names in English (`title_en`) or Bangla (`title_bn`).
   - Automatically sorts requirements by numeric `order`.

2. **PDF Upload & Validation:**
   - Multi-file drag-and-drop zone and browse button.
   - Enforces limit of maximum 30 PDF files and 50 MB total uploaded size.
   - Live file metadata: filename, exact page count, file size in KB/MB, duplicate tag, and assignment status.
   - Safe error handling: Non-PDF files or damaged/password-protected PDFs are flagged with clear messages without crashing the application. Scanned/image-only PDFs are fully supported.

3. **Content-Based Duplicate Detection (SHA-256):**
   - Employs browser-native Web Crypto API (`crypto.subtle.digest("SHA-256", arrayBuffer)`).
   - Identifies identical file contents even if filenames differ (e.g., `experience_cert.pdf` vs `experience_cert (1).pdf`).
   - Marks duplicate files clearly and prevents duplicate files from causing assignment conflicts.

4. **Strict Document Matching:**
   - Interactive matching interface: one requirement has at most one file, and one file belongs to at most one requirement.
   - Changing or unmatching a file instantly frees it for selection elsewhere.

5. **Expiry Date Validation Engine:**
   - For requirements with `has_expiry = true`, enables an expiry date picker once matched.
   - Compares expiry against `submission_deadline`.
   - Accurate boundary check: `expiry >= submission_deadline` is valid (equal deadline is considered OK).

6. **Reactive Status Engine:**
   - Calculates exact status in real time:
     - 🔴 **Missing:** Mandatory document with no matched file (Blocking).
     - 🟡 **Expiry date needed:** File matched but expiry date is empty (Blocking).
     - 🔴 **Expired:** Expiry date is strictly before tender submission deadline (Blocking).
     - ⚪ **Not provided:** Optional document with no matched file (Non-blocking).
     - 🟢 **OK:** Matched and valid (Non-blocking).

7. **PDF Package Compilation (`pdf-lib`):**
   - Generates English Cover Page with official tender metadata and included documents schedule.
   - Appends all pages of matched source PDFs in strict `requirement.order` sequence (skips unmatched optional requirements).
   - Draws dynamic, non-intrusive footer on **every page** (including cover):  
     `<tender_id> | Page X of Y` (e.g. `T-2026-0417 | Page 3 of 16`).
   - Automatically downloads the package as `<tender_id>_Package.pdf`.

8. **Bilingual Interface (English / বাংলা):**
   - Seamless instant language switcher affecting all UI labels, headings, buttons, notifications, and requirement titles.

---

## 🌟 Bonus Features Implemented

- **✨ Filename-Based Auto-Matcher:** Heuristic keyword matching algorithm that analyzes filename keywords (`trade`, `tin`, `vat`, `bank`, `experience`, `technical`, `financial`, `declaration`) and suggests/applies matches while honoring the 1-file-to-1-requirement rule.
- **📄 Table of Contents / Index Schedule:** Dynamic calculation of starting pages for each included document displayed on the cover page.
- **📊 CSV Checklist Exporter:** One-click export of tender requirements, matched files, and validation statuses to an Excel-compatible CSV file.
- **⚡ 1-Click Sample Acceptance Pack Loader:** Built-in loader buttons to immediately test the acceptance test suite.

---

## 🧪 Acceptance Test Results

Using the contest sample pack:
- **Tender:** `T-2026-0417` (Deadline: `2026-10-20`)
- **Duplicates Detected:** `experience_cert (1).pdf` identified as exact duplicate of `experience_cert.pdf`.
- **Expired Document Filtered:** `trade_license_2025.pdf` correctly flagged as Expired; `trade_license_2026.pdf` (expiry `2027-06-30`) marked OK.
- **Optional Requirements:** `REQ-06` and `REQ-07` correctly marked "Not provided" and skipped from final package.
- **Final Package Output:** `output/T-2026-0417_Package.pdf` (16 total pages, 1 Cover + 15 document pages) with footer on all 16 pages.

---

## 🛠️ Technology Stack

- **Structure:** HTML5 Semantic Markup
- **Styling:** Vanilla CSS3 (Custom Design System with CSS variables, responsive grid, glassmorphism)
- **Logic:** Vanilla JavaScript (ES6+, Web Crypto API)
- **Libraries:** `pdf-lib` (v1.17.1) for PDF creation, merging, and footer rendering

---

## 🤖 AI Tools & Key Prompts

- **AI Tools Used:** Antigravity AI Coding Assistant
- **Most Useful Prompt:**
  > *"Build a generic, 100% browser-side tender document package builder in Vanilla JS and pdf-lib that parses any requirements.json, performs SHA-256 duplicate detection, validates expiry dates against deadline, renders bilingual English/Bangla UI, and compiles a final ordered PDF with cover page and dynamic Page X of Y footers."*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.