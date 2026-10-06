/**
 * TenderPack Main Application Controller & Event Bootstrapper
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // 1. Subscribe UI rendering to state changes
  window.subscribeState((eventType, payload, state) => {
    window.renderAll();
  });

  // 2. Setup Language Switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      window.setLanguage(lang);
    });
  });

  // 3. Setup JSON Requirements File Input
  const jsonFileInput = document.getElementById('json-file-input');
  const btnLoadJson = document.getElementById('btn-load-json');

  if (btnLoadJson && jsonFileInput) {
    btnLoadJson.addEventListener('click', () => {
      jsonFileInput.click();
    });

    jsonFileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const validated = window.validateRequirementsJson(parsed);
        window.setRequirements(validated.tender, validated.requirements);
        window.showToast(window.t('success_json_loaded', { tender_id: validated.tender.tender_id }), 'success');
      } catch (err) {
        window.showToast(err.message || window.t('err_invalid_json'), 'error');
      } finally {
        jsonFileInput.value = '';
      }
    });
  }

  // 4. Setup Sample Tender Loader
  const btnLoadSample = document.getElementById('btn-load-sample-top');
  if (btnLoadSample) {
    btnLoadSample.addEventListener('click', () => {
      window.loadSampleTender();
    });
  }

  // 5. Setup PDF Upload Drop Zone & File Input
  const pdfFileInput = document.getElementById('pdf-file-input');
  const dropZone = document.getElementById('pdf-drop-zone');
  const btnBrowseFiles = document.getElementById('btn-browse-files');

  if (btnBrowseFiles && pdfFileInput) {
    btnBrowseFiles.addEventListener('click', (e) => {
      e.stopPropagation();
      pdfFileInput.click();
    });
  }

  if (dropZone && pdfFileInput) {
    dropZone.addEventListener('click', () => {
      pdfFileInput.click();
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files) {
        await handleIncomingPdfFiles(e.dataTransfer.files);
      }
    });

    pdfFileInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        await handleIncomingPdfFiles(e.target.files);
      }
      pdfFileInput.value = '';
    });
  }

  // 6. Clear All Files
  const btnClearFiles = document.getElementById('btn-clear-all-files');
  if (btnClearFiles) {
    btnClearFiles.addEventListener('click', () => {
      if (window.appState.files.length === 0) return;
      if (confirm('Are you sure you want to remove all uploaded files?')) {
        window.clearAllFiles();
        window.showToast('All files cleared.', 'info');
      }
    });
  }

  // 7. Auto-Match Button
  const btnAutoMatch = document.getElementById('btn-auto-match');
  if (btnAutoMatch) {
    btnAutoMatch.addEventListener('click', () => {
      const result = window.autoMatchFiles(window.appState);
      if (result.matchedCount > 0) {
        window.showToast(window.t('auto_match_success', { count: result.matchedCount }), 'success');
      } else {
        window.showToast('No matching files found for remaining requirements.', 'warning');
      }
    });
  }

  // 8. Reset All Matches Button
  const btnResetMatches = document.getElementById('btn-reset-matches');
  if (btnResetMatches) {
    btnResetMatches.addEventListener('click', () => {
      window.resetAllMatches();
      window.showToast('All document matches have been reset.', 'info');
    });
  }

  // 9. Export Checklist CSV Button
  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      window.exportChecklistToCsv();
    });
  }

  // 10. Generate Final Package Button
  const btnGenerate = document.getElementById('btn-generate-package');
  if (btnGenerate) {
    btnGenerate.addEventListener('click', async () => {
      await executePackageGeneration();
    });
  }

  // 11. Modal Handlers
  const modalOverlay = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDownloadBtn = document.getElementById('modal-download-btn');

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
    });
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('open');
      }
    });
  }

  // Initial render
  window.renderAll();
}

/**
 * Handle incoming PDF file list (from file dialog or drag-and-drop)
 */
async function handleIncomingPdfFiles(fileList) {
  const incomingFiles = Array.from(fileList);
  const validFilesToProcess = [];

  for (const rawFile of incomingFiles) {
    // 1. Validate MIME / Extension
    const isPdf = rawFile.type === 'application/pdf' || rawFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      window.showToast(window.t('err_not_a_pdf', { name: rawFile.name }), 'error');
      continue;
    }

    try {
      const arrayBuffer = await rawFile.arrayBuffer();
      
      // Calculate SHA-256 hash for exact duplicate detection
      const hash = await window.calculateFileHash(arrayBuffer);
      
      // Inspect PDF structure and page count using pdf-lib
      const inspection = await window.inspectPdf(arrayBuffer);

      validFilesToProcess.push({
        id: 'file_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
        name: rawFile.name,
        size: rawFile.size,
        type: rawFile.type,
        arrayBuffer: arrayBuffer,
        hash: hash,
        pageCount: inspection.pageCount,
        error: inspection.error,
        isDuplicate: false,
        duplicateOfId: null,
        duplicateOfName: null,
        isAssigned: false
      });
    } catch (err) {
      console.error('Error processing uploaded file:', rawFile.name, err);
      window.showToast(`Error loading ${rawFile.name}: ${err.message}`, 'error');
    }
  }

  if (validFilesToProcess.length > 0) {
    try {
      window.addFiles(validFilesToProcess);
      window.showToast(`Uploaded ${validFilesToProcess.length} PDF file(s).`, 'success');
    } catch (err) {
      window.showToast(err.message, 'error');
    }
  }
}

/**
 * Load Sample Tender Data
 */
window.loadSampleTender = async function() {
  try {
    const res = await fetch('sample_data/requirements.json');
    if (!res.ok) throw new Error('Could not fetch sample requirements.json');
    const json = await res.json();
    const validated = window.validateRequirementsJson(json);
    window.setRequirements(validated.tender, validated.requirements);
    window.showToast(window.t('success_json_loaded', { tender_id: validated.tender.tender_id }), 'success');
  } catch (err) {
    // Fallback embedded sample data if fetch fails
    const sampleData = {
      tender: {
        tender_id: "T-2026-0417",
        title: "Procurement of IT Equipment and Networking Infrastructure for Digital Land Management System",
        procuring_entity: "Ministry of Land, Government of Bangladesh",
        bidder: "Apex Tech Solutions Ltd.",
        submission_deadline: "2026-10-20"
      },
      requirements: [
        { id: "REQ-01", order: 1, title_en: "Trade License (Valid)", title_bn: "হালনাগাদ ট্রেড লাইসেন্স", mandatory: true, has_expiry: true },
        { id: "REQ-02", order: 2, title_en: "TIN Certificate", title_bn: "টিআইএন সার্টিফিকেট", mandatory: true, has_expiry: false },
        { id: "REQ-03", order: 3, title_en: "VAT Registration Certificate", title_bn: "ভ্যাট নিবন্ধন সনদপত্র", mandatory: true, has_expiry: false },
        { id: "REQ-04", order: 4, title_en: "Bank Solvency Certificate", title_bn: "ব্যাংক স্বচ্ছলতা সনদ", mandatory: true, has_expiry: false },
        { id: "REQ-05", order: 5, title_en: "Experience Certificate", title_bn: "অভিজ্ঞতার সনদপত্র", mandatory: true, has_expiry: false },
        { id: "REQ-06", order: 6, title_en: "Audited Financial Statement", title_bn: "অডিটকৃত আর্থিক বিবরণী", mandatory: false, has_expiry: false },
        { id: "REQ-07", order: 7, title_en: "Manufacturer's Authorization", title_bn: "প্রস্তুতকারকের অনুমোদনপত্র", mandatory: false, has_expiry: false },
        { id: "REQ-08", order: 8, title_en: "Technical Proposal", title_bn: "কারিগরি প্রস্তাবনা", mandatory: true, has_expiry: false },
        { id: "REQ-09", order: 9, title_en: "Financial Proposal", title_bn: "আর্থিক প্রস্তাবনা", mandatory: true, has_expiry: false },
        { id: "REQ-10", order: 10, title_en: "Signed Declaration", title_bn: "স্বাক্ষরিত অঙ্গীকারনামা", mandatory: true, has_expiry: false }
      ]
    };
    const validated = window.validateRequirementsJson(sampleData);
    window.setRequirements(validated.tender, validated.requirements);
    window.showToast(window.t('success_json_loaded', { tender_id: validated.tender.tender_id }), 'success');
  }
};

/**
 * Helper to load all sample test PDFs (Acceptance Testing helper)
 */
window.loadSamplePdfPack = async function() {
  const sampleFilenames = [
    'trade_license_2025.pdf',
    'trade_license_2026.pdf',
    'tin_certificate.pdf',
    'vat_certificate.pdf',
    'bank_solvency.pdf',
    'experience_cert.pdf',
    'experience_cert (1).pdf',
    'technical_proposal.pdf',
    'financial_proposal.pdf',
    'signed_declaration.pdf'
  ];

  window.showToast('Loading 10 sample PDF files for acceptance testing...', 'info');
  const loadedFiles = [];

  for (const filename of sampleFilenames) {
    try {
      const res = await fetch(`sample_data/sample_pdfs/${encodeURIComponent(filename)}`);
      if (!res.ok) continue;
      const arrayBuffer = await res.arrayBuffer();
      const hash = await window.calculateFileHash(arrayBuffer);
      const inspection = await window.inspectPdf(arrayBuffer);

      loadedFiles.push({
        id: 'file_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
        name: filename,
        size: arrayBuffer.byteLength,
        type: 'application/pdf',
        arrayBuffer: arrayBuffer,
        hash: hash,
        pageCount: inspection.pageCount,
        error: inspection.error,
        isDuplicate: false,
        duplicateOfId: null,
        duplicateOfName: null,
        isAssigned: false
      });
    } catch (e) {
      console.warn('Failed to load sample pdf:', filename, e);
    }
  }

  if (loadedFiles.length > 0) {
    window.addFiles(loadedFiles);
    window.showToast(`Loaded ${loadedFiles.length} sample PDF files.`, 'success');
  }
};

/**
 * Execute Package Generation
 */
async function executePackageGeneration() {
  const generateBtn = document.getElementById('btn-generate-package');
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<span class="spinner"></span> <span>${window.t('generating_btn')}</span>`;
  }

  window.appState.isGenerating = true;

  try {
    const result = await window.generateTenderPackage(window.appState, {
      onProgress: (pct, msg) => {
        if (generateBtn) {
          generateBtn.innerHTML = `<span class="spinner"></span> <span>${msg} (${pct}%)</span>`;
        }
      }
    });

    // Download package
    window.downloadBlob(result.pdfBytes, result.filename);
    window.showToast(window.t('success_package_ready', { pages: result.totalPages }), 'success', 6000);

    // Show success modal
    const modal = document.getElementById('success-modal');
    if (modal) {
      document.getElementById('modal-pkg-filename').textContent = result.filename;
      document.getElementById('modal-pkg-pages').textContent = result.totalPages;
      
      const docListContainer = document.getElementById('modal-pkg-doclist');
      if (docListContainer) {
        docListContainer.innerHTML = result.includedDocuments.map(d => `
          <div class="modal-stat-row">
            <span class="modal-stat-label">#${String(d.order).padStart(2, '0')} ${d.title} (${d.fileName})</span>
            <span class="modal-stat-value">Pages ${d.startPage}–${d.endPage} (${d.pageCount} ${d.pageCount > 1 ? 'pp.' : 'p.'})</span>
          </div>
        `).join('');
      }

      const modalDlBtn = document.getElementById('modal-download-btn');
      if (modalDlBtn) {
        modalDlBtn.onclick = () => {
          window.downloadBlob(result.pdfBytes, result.filename);
        };
      }

      modal.classList.add('open');
    }
  } catch (err) {
    console.error('Package generation failed:', err);
    window.showToast(window.t('err_generation_failed', { error: err.message }), 'error', 7000);
  } finally {
    window.appState.isGenerating = false;
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>${window.t('generate_btn')}</span>
      `;
    }
    window.renderValidationSummary();
  }
}
