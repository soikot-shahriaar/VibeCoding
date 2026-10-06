/**
 * TenderPack PDF Processing & Merging Engine using pdf-lib
 */

/**
 * Calculate SHA-256 hash of an ArrayBuffer using Web Crypto API
 */
async function calculateFileHash(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Inspect and validate an uploaded PDF file
 * Returns: { pageCount, isValid, error }
 */
async function inspectPdf(arrayBuffer) {
  try {
    if (!window.PDFLib) {
      throw new Error('PDF-lib library is not loaded.');
    }
    const { PDFDocument } = window.PDFLib;
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    const pageCount = pdfDoc.getPageCount();
    return {
      isValid: true,
      pageCount: pageCount,
      error: null
    };
  } catch (err) {
    console.warn('PDF Inspection failed:', err);
    return {
      isValid: false,
      pageCount: 0,
      error: err.message || 'Damaged or password-protected PDF'
    };
  }
}

/**
 * Generate the unified Tender PDF Package
 */
async function generateTenderPackage(appState, options = { includeIndexPage: false, onProgress: null }) {
  const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
  const updateProgress = (pct, msg) => {
    if (typeof options.onProgress === 'function') {
      options.onProgress(pct, msg);
    }
  };

  updateProgress(5, 'Validating requirements...');

  // 1. Re-validate state
  const summary = window.getValidationSummary();
  if (!summary.canGenerate) {
    throw new Error('Cannot generate package: Blocking validation issues exist.');
  }

  // 2. Identify included documents sorted by requirement.order
  const includedReqs = appState.requirements
    .filter(req => req.matchedFileId)
    .sort((a, b) => a.order - b.order);

  if (includedReqs.length === 0) {
    throw new Error('No matched documents to include in package.');
  }

  updateProgress(15, 'Initializing new PDF document...');
  const mergedPdf = await PDFDocument.create();
  
  // Embed standard typography
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await mergedPdf.embedFont(StandardFonts.HelveticaOblique);

  // Define colors
  const primaryColor = rgb(0.12, 0.23, 0.36); // #1f3a5b Navy
  const secondaryColor = rgb(0.3, 0.35, 0.4); // Slate
  const textColor = rgb(0.1, 0.1, 0.1);
  const lightBg = rgb(0.96, 0.97, 0.98);
  const borderColor = rgb(0.8, 0.85, 0.9);
  const accentColor = rgb(0.08, 0.52, 0.38); // Emerald

  // Calculate page distribution for Table of Contents / Index
  // Note: Cover page is Page 1.
  // We'll inspect each source PDF to get its exact page count.
  const docMetadataList = [];
  let currentPageOffset = 2; // Starts at 2 after 1-page Cover

  for (let i = 0; i < includedReqs.length; i++) {
    const req = includedReqs[i];
    const file = appState.files.find(f => f.id === req.matchedFileId);
    if (!file) continue;

    const sourceDoc = await PDFDocument.load(file.arrayBuffer);
    const count = sourceDoc.getPageCount();

    docMetadataList.push({
      req,
      file,
      sourceDoc,
      pageCount: count,
      startPage: currentPageOffset,
      endPage: currentPageOffset + count - 1
    });

    currentPageOffset += count;
  }

  updateProgress(30, 'Creating English Cover Page...');

  // ==========================================
  // 3. CREATE COVER PAGE (Page 1)
  // ==========================================
  const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4 Size: 595.28 x 841.89 pt
  const { width: cWidth, height: cHeight } = coverPage.getSize();

  // Top header banner
  coverPage.drawRectangle({
    x: 40,
    y: cHeight - 90,
    width: cWidth - 80,
    height: 50,
    color: primaryColor,
    borderRadius: 4
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 60,
    y: cHeight - 65,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  coverPage.drawText('Official Bid Document Bundle', {
    x: cWidth - 220,
    y: cHeight - 62,
    size: 10,
    font: fontRegular,
    color: rgb(0.85, 0.9, 0.95)
  });

  // Tender Metadata Card
  let curY = cHeight - 115;
  const cardHeight = 160;
  coverPage.drawRectangle({
    x: 40,
    y: curY - cardHeight,
    width: cWidth - 80,
    height: cardHeight,
    color: lightBg,
    borderColor: borderColor,
    borderWidth: 1
  });

  const tender = appState.tender;
  const genDateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const metaRows = [
    { label: 'Tender ID:', value: tender.tender_id, bold: true },
    { label: 'Tender Title:', value: tender.title },
    { label: 'Procuring Entity:', value: tender.procuring_entity },
    { label: 'Bidder Name:', value: tender.bidder, bold: true },
    { label: 'Submission Deadline:', value: tender.submission_deadline },
    { label: 'Package Date:', value: genDateStr }
  ];

  let metaY = curY - 24;
  for (const row of metaRows) {
    coverPage.drawText(row.label, {
      x: 55,
      y: metaY,
      size: 10,
      font: fontBold,
      color: secondaryColor
    });

    // Handle potential text overflow for long titles
    let valText = row.value;
    if (valText.length > 65) {
      valText = valText.substring(0, 62) + '...';
    }

    coverPage.drawText(valText, {
      x: 185,
      y: metaY,
      size: 10,
      font: row.bold ? fontBold : fontRegular,
      color: textColor
    });
    metaY -= 22;
  }

  // Section Heading: Included Documents Table
  curY = curY - cardHeight - 25;
  coverPage.drawText('INCLUDED DOCUMENTS SCHEDULE', {
    x: 40,
    y: curY,
    size: 12,
    font: fontBold,
    color: primaryColor
  });

  curY -= 12;
  coverPage.drawLine({
    start: { x: 40, y: curY },
    end: { x: cWidth - 40, y: curY },
    thickness: 1.5,
    color: primaryColor
  });

  // Table Headers
  curY -= 20;
  coverPage.drawRectangle({
    x: 40,
    y: curY - 5,
    width: cWidth - 80,
    height: 22,
    color: rgb(0.9, 0.93, 0.96)
  });

  coverPage.drawText('Order', { x: 50, y: curY + 2, size: 9, font: fontBold, color: primaryColor });
  coverPage.drawText('Req ID', { x: 90, y: curY + 2, size: 9, font: fontBold, color: primaryColor });
  coverPage.drawText('Document Title (English)', { x: 145, y: curY + 2, size: 9, font: fontBold, color: primaryColor });
  coverPage.drawText('Pages', { x: 440, y: curY + 2, size: 9, font: fontBold, color: primaryColor });
  coverPage.drawText('Start Page', { x: 495, y: curY + 2, size: 9, font: fontBold, color: primaryColor });

  curY -= 10;

  // Table Rows
  for (let idx = 0; idx < docMetadataList.length; idx++) {
    const item = docMetadataList[idx];
    curY -= 18;

    // Alternate row zebra
    if (idx % 2 === 1) {
      coverPage.drawRectangle({
        x: 40,
        y: curY - 4,
        width: cWidth - 80,
        height: 18,
        color: rgb(0.98, 0.98, 0.99)
      });
    }

    coverPage.drawText(String(item.req.order).padStart(2, '0'), {
      x: 55,
      y: curY,
      size: 9,
      font: fontRegular,
      color: textColor
    });

    coverPage.drawText(item.req.id, {
      x: 90,
      y: curY,
      size: 9,
      font: fontRegular,
      color: secondaryColor
    });

    let docTitle = item.req.title_en;
    if (docTitle.length > 48) {
      docTitle = docTitle.substring(0, 45) + '...';
    }
    coverPage.drawText(docTitle, {
      x: 145,
      y: curY,
      size: 9,
      font: fontBold,
      color: textColor
    });

    coverPage.drawText(`${item.pageCount} ${item.pageCount > 1 ? 'pp.' : 'p.'}`, {
      x: 445,
      y: curY,
      size: 9,
      font: fontRegular,
      color: secondaryColor
    });

    coverPage.drawText(`Page ${item.startPage}`, {
      x: 500,
      y: curY,
      size: 9,
      font: fontBold,
      color: primaryColor
    });
  }

  // Cover note at bottom
  coverPage.drawText('All source documents verified and compiled into this single submission dossier.', {
    x: 40,
    y: 50,
    size: 8,
    font: fontOblique,
    color: rgb(0.5, 0.5, 0.5)
  });

  updateProgress(50, 'Appending source document pages...');

  // ==========================================
  // 4. APPEND SOURCE DOCUMENT PAGES
  // ==========================================
  for (let dIdx = 0; dIdx < docMetadataList.length; dIdx++) {
    const item = docMetadataList[dIdx];
    const sourceDoc = item.sourceDoc;
    const pageIndices = sourceDoc.getPageIndices();
    
    // Copy all pages in original page order
    const copiedPages = await mergedPdf.copyPages(sourceDoc, pageIndices);
    for (const copiedPage of copiedPages) {
      mergedPdf.addPage(copiedPage);
    }

    const progressPct = 50 + Math.floor(((dIdx + 1) / docMetadataList.length) * 35);
    updateProgress(progressPct, `Merged ${dIdx + 1} of ${docMetadataList.length} documents...`);
  }

  updateProgress(88, 'Applying dynamic headers and footers to all pages...');

  // ==========================================
  // 5. DRAW FOOTER ON EVERY SINGLE PAGE
  // ==========================================
  const totalPages = mergedPdf.getPageCount();
  const tenderId = appState.tender.tender_id;

  for (let pNum = 1; pNum <= totalPages; pNum++) {
    const page = mergedPdf.getPage(pNum - 1);
    const { width: pWidth, height: pHeight } = page.getSize();

    // Footer text: <tender_id> | Page X of Y
    const footerText = `${tenderId} | Page ${pNum} of ${totalPages}`;
    const footerTextWidth = fontRegular.widthOfTextAtSize(footerText, 9);
    
    // Footer rule line (clean subtle separator at bottom)
    page.drawLine({
      start: { x: 30, y: 28 },
      end: { x: pWidth - 30, y: 28 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8)
    });

    // Left security stamp
    page.drawText('CONFIDENTIAL • TENDER SUBMISSION', {
      x: 30,
      y: 16,
      size: 7,
      font: fontOblique,
      color: rgb(0.6, 0.6, 0.6)
    });

    // Center/Right Page Number footer
    page.drawText(footerText, {
      x: pWidth - footerTextWidth - 30,
      y: 16,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2)
    });
  }

  updateProgress(98, 'Finalizing PDF output bytes...');
  const pdfBytes = await mergedPdf.save();
  updateProgress(100, 'Package generation complete!');

  return {
    pdfBytes,
    totalPages,
    filename: `${tenderId}_Package.pdf`,
    includedDocuments: docMetadataList.map(item => ({
      order: item.req.order,
      id: item.req.id,
      title: item.req.title_en,
      fileName: item.file.name,
      pageCount: item.pageCount,
      startPage: item.startPage,
      endPage: item.endPage
    }))
  };
}

/**
 * Trigger direct file download in browser
 */
function downloadBlob(bytes, filename, mimeType = 'application/pdf') {
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}

if (typeof window !== 'undefined') {
  window.calculateFileHash = calculateFileHash;
  window.inspectPdf = inspectPdf;
  window.generateTenderPackage = generateTenderPackage;
  window.downloadBlob = downloadBlob;
}
