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
 * Handles malformed bytes, password protection / encryption, and page counting
 * Returns: { pageCount, isValid, errorType, errorMessage }
 */
async function inspectPdf(arrayBuffer, fileName = '') {
  try {
    if (!window.PDFLib) {
      throw new Error('PDF-lib library is not loaded.');
    }
    const { PDFDocument } = window.PDFLib;
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    
    if (pdfDoc.isEncrypted) {
      return {
        isValid: false,
        pageCount: 0,
        errorType: 'PASSWORD_PROTECTED',
        errorMessage: window.t('err_password_pdf', { name: fileName })
      };
    }

    const pageCount = pdfDoc.getPageCount();
    if (pageCount < 1) {
      return {
        isValid: false,
        pageCount: 0,
        errorType: 'CORRUPTED',
        errorMessage: window.t('err_corrupt_pdf', { name: fileName })
      };
    }

    return {
      isValid: true,
      pageCount: pageCount,
      errorType: null,
      errorMessage: null
    };
  } catch (err) {
    const errMsg = (err && err.message) ? err.message.toLowerCase() : '';
    const isPassword = errMsg.includes('encrypted') || errMsg.includes('password') || errMsg.includes('decrypt');
    
    return {
      isValid: false,
      pageCount: 0,
      errorType: isPassword ? 'PASSWORD_PROTECTED' : 'CORRUPTED',
      errorMessage: isPassword 
        ? window.t('err_password_pdf', { name: fileName })
        : window.t('err_corrupt_pdf', { name: fileName })
    };
  }
}

/**
 * Helper to split text into wrapped lines fitting a maximum width in points
 */
function wrapTextToWidth(text, font, fontSize, maxWidth) {
  if (!text) return [''];
  const words = String(text).split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      // If a single word is wider than maxWidth, keep it on its own line
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Generate the unified Tender PDF Package
 */
async function generateTenderPackage(appState, options = { onProgress: null }) {
  const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
  const updateProgress = (pct, msg) => {
    if (typeof options.onProgress === 'function') {
      options.onProgress(pct, msg);
    }
  };

  updateProgress(5, window.t('generating_btn'));

  // 1. Re-validate state
  const summary = window.getValidationSummary();
  if (!summary.canGenerate) {
    throw new Error(window.t('disabled_reason_blocking', { count: summary.blockingIssuesCount }));
  }

  // 2. Identify included documents sorted by requirement.order
  const includedReqs = appState.requirements
    .filter(req => req.matchedFileId)
    .sort((a, b) => a.order - b.order);

  if (includedReqs.length === 0) {
    throw new Error(window.t('disabled_reason_no_files'));
  }

  updateProgress(15, 'Initializing PDF structure...');
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

  // Calculate page distribution for Schedule / Index
  // Note: Cover page is Page 1.
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

  updateProgress(30, 'Creating generic cover page...');

  // ==========================================
  // 3. CREATE GENERIC COVER PAGE (Page 1)
  // ==========================================
  const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4 Size: 595.28 x 841.89 pt
  const { width: cWidth, height: cHeight } = coverPage.getSize();

  // Top header banner
  coverPage.drawRectangle({
    x: 40,
    y: cHeight - 80,
    width: cWidth - 80,
    height: 44,
    color: primaryColor,
    borderRadius: 4
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 55,
    y: cHeight - 58,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  coverPage.drawText('Official Bid Submission Dossier', {
    x: cWidth - 210,
    y: cHeight - 56,
    size: 9,
    font: fontRegular,
    color: rgb(0.85, 0.9, 0.95)
  });

  // Prepare Metadata Rows with dynamic text wrapping to prevent any truncation
  const tender = appState.tender;
  const genDateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const metaValueMaxWidth = cWidth - 80 - 150; // Total card width minus label width
  const metaFontSize = 9.5;
  const metaLineHeight = 13;

  const rawMetaRows = [
    { label: 'Tender ID:', value: tender.tender_id, bold: true },
    { label: 'Tender Title:', value: tender.title, bold: false },
    { label: 'Procuring Entity:', value: tender.procuring_entity, bold: false },
    { label: 'Bidder Name:', value: tender.bidder, bold: true },
    { label: 'Submission Deadline:', value: tender.submission_deadline, bold: false },
    { label: 'Package Date:', value: genDateStr, bold: false }
  ];

  // Calculate wrapped lines and dynamic card height
  let computedMetaHeight = 16;
  const preparedMetaRows = rawMetaRows.map(row => {
    const font = row.bold ? fontBold : fontRegular;
    const lines = wrapTextToWidth(row.value, font, metaFontSize, metaValueMaxWidth);
    const rowHeight = Math.max(16, lines.length * metaLineHeight + 4);
    computedMetaHeight += rowHeight;
    return {
      label: row.label,
      lines: lines,
      bold: row.bold,
      rowHeight: rowHeight
    };
  });

  // Draw Tender Metadata Card
  let curY = cHeight - 96;
  coverPage.drawRectangle({
    x: 40,
    y: curY - computedMetaHeight,
    width: cWidth - 80,
    height: computedMetaHeight,
    color: lightBg,
    borderColor: borderColor,
    borderWidth: 1
  });

  let metaY = curY - 16;
  for (const row of preparedMetaRows) {
    // Draw Label
    coverPage.drawText(row.label, {
      x: 52,
      y: metaY,
      size: metaFontSize,
      font: fontBold,
      color: secondaryColor
    });

    // Draw Wrapped Value Lines
    let lineY = metaY;
    const valFont = row.bold ? fontBold : fontRegular;
    for (const line of row.lines) {
      coverPage.drawText(line, {
        x: 180,
        y: lineY,
        size: metaFontSize,
        font: valFont,
        color: textColor
      });
      lineY -= metaLineHeight;
    }

    metaY -= row.rowHeight;
  }

  // Section Heading: Included Documents Table
  curY = curY - computedMetaHeight - 20;
  coverPage.drawText('INCLUDED DOCUMENTS SCHEDULE', {
    x: 40,
    y: curY,
    size: 11,
    font: fontBold,
    color: primaryColor
  });

  curY -= 8;
  coverPage.drawLine({
    start: { x: 40, y: curY },
    end: { x: cWidth - 40, y: curY },
    thickness: 1.2,
    color: primaryColor
  });

  // Table Headers
  curY -= 18;
  coverPage.drawRectangle({
    x: 40,
    y: curY - 4,
    width: cWidth - 80,
    height: 18,
    color: rgb(0.9, 0.93, 0.96)
  });

  coverPage.drawText('Order', { x: 50, y: curY + 2, size: 8.5, font: fontBold, color: primaryColor });
  coverPage.drawText('Req ID', { x: 88, y: curY + 2, size: 8.5, font: fontBold, color: primaryColor });
  coverPage.drawText('Document Title (English)', { x: 140, y: curY + 2, size: 8.5, font: fontBold, color: primaryColor });
  coverPage.drawText('Pages', { x: 440, y: curY + 2, size: 8.5, font: fontBold, color: primaryColor });
  coverPage.drawText('Start Page', { x: 495, y: curY + 2, size: 8.5, font: fontBold, color: primaryColor });

  curY -= 6;

  // Compute row height dynamically based on number of documents to fit page comfortably
  const availableTableHeight = curY - 55; // reserve 55pt for footer margin
  const rowHeight = Math.min(18, Math.max(12, Math.floor(availableTableHeight / (docMetadataList.length + 1))));
  const tableFontSize = rowHeight < 15 ? 7.5 : 8.5;

  // Table Rows
  for (let idx = 0; idx < docMetadataList.length; idx++) {
    const item = docMetadataList[idx];
    curY -= rowHeight;

    // Alternate row zebra striping
    if (idx % 2 === 1) {
      coverPage.drawRectangle({
        x: 40,
        y: curY - 2,
        width: cWidth - 80,
        height: rowHeight,
        color: rgb(0.98, 0.98, 0.99)
      });
    }

    coverPage.drawText(String(item.req.order).padStart(2, '0'), {
      x: 52,
      y: curY + 2,
      size: tableFontSize,
      font: fontRegular,
      color: textColor
    });

    coverPage.drawText(item.req.id, {
      x: 88,
      y: curY + 2,
      size: tableFontSize,
      font: fontRegular,
      color: secondaryColor
    });

    // Safely wrap or fit document title
    const titleMaxWidth = 290;
    const titleLines = wrapTextToWidth(item.req.title_en, fontBold, tableFontSize, titleMaxWidth);
    const displayTitle = titleLines[0] + (titleLines.length > 1 ? '...' : '');

    coverPage.drawText(displayTitle, {
      x: 140,
      y: curY + 2,
      size: tableFontSize,
      font: fontBold,
      color: textColor
    });

    coverPage.drawText(`${item.pageCount} ${item.pageCount > 1 ? 'pp.' : 'p.'}`, {
      x: 445,
      y: curY + 2,
      size: tableFontSize,
      font: fontRegular,
      color: secondaryColor
    });

    coverPage.drawText(`Page ${item.startPage}`, {
      x: 500,
      y: curY + 2,
      size: tableFontSize,
      font: fontBold,
      color: primaryColor
    });
  }

  // Cover note at bottom
  coverPage.drawText('All source documents verified and compiled locally in-browser into this unified package.', {
    x: 40,
    y: 44,
    size: 7.5,
    font: fontOblique,
    color: rgb(0.5, 0.5, 0.5)
  });

  updateProgress(50, 'Appending source document pages in order...');

  // ==========================================
  // 4. APPEND SOURCE DOCUMENT PAGES IN ORDER
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

  updateProgress(88, 'Applying official footers to every page...');

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
      start: { x: 30, y: 26 },
      end: { x: pWidth - 30, y: 26 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8)
    });

    // Left security stamp
    page.drawText('CONFIDENTIAL • TENDER SUBMISSION', {
      x: 30,
      y: 14,
      size: 7,
      font: fontOblique,
      color: rgb(0.55, 0.55, 0.55)
    });

    // Center/Right Page Number footer
    page.drawText(footerText, {
      x: pWidth - footerTextWidth - 30,
      y: 14,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2)
    });
  }

  updateProgress(98, 'Finalizing output PDF...');
  const pdfBytes = await mergedPdf.save();
  updateProgress(100, 'Tender package compiled successfully!');

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
