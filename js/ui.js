/**
 * TenderPack UI Rendering and DOM Interactions
 */

/**
 * Show a toast notification
 */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  } else if (type === 'warning') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  } else {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  toast.innerHTML = `<span>${iconSvg}</span><div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/**
 * Format bytes to human readable KB/MB
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Render Tender Information Section
 */
function renderTenderInfo() {
  const container = document.getElementById('tender-info-container');
  if (!container) return;

  const tender = window.appState.tender;
  if (!tender) {
    container.innerHTML = `
      <div class="empty-tender-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 0.5rem; color: #94a3b8;">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p>${window.t('no_tender_loaded')}</p>
        <div class="empty-tender-actions">
          <button type="button" class="btn-secondary" id="btn-load-sample-tender">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            ${window.t('load_sample_json')}
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-load-sample-tender')?.addEventListener('click', () => {
      window.loadSampleTender();
    });
    return;
  }

  container.innerHTML = `
    <div class="tender-meta-list">
      <div class="meta-item">
        <span class="meta-label">${window.t('tender_id')}</span>
        <span class="meta-value">${tender.tender_id}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">${window.t('tender_title')}</span>
        <span class="meta-value">${tender.title}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">${window.t('procuring_entity')}</span>
        <span class="meta-value">${tender.procuring_entity}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">${window.t('bidder')}</span>
        <span class="meta-value">${tender.bidder}</span>
      </div>
      <div class="meta-item meta-deadline">
        <span class="meta-label">${window.t('submission_deadline')}</span>
        <span class="meta-value deadline-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${tender.submission_deadline}
        </span>
      </div>
    </div>
  `;
}

/**
 * Render Uploaded Files Section
 */
function renderFileList() {
  const container = document.getElementById('uploaded-files-container');
  const countSpan = document.getElementById('stat-file-count');
  const sizeSpan = document.getElementById('stat-total-size');
  const progressBar = document.getElementById('size-progress-bar');
  if (!container) return;

  const files = window.appState.files;
  const totalCount = files.length;
  const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const maxBytes = 50 * 1024 * 1024;
  const sizePct = Math.min(100, (totalBytes / maxBytes) * 100);

  if (countSpan) {
    countSpan.textContent = window.t('file_count', { count: totalCount });
  }
  if (sizeSpan) {
    sizeSpan.textContent = window.t('total_size', { size: formatBytes(totalBytes) });
  }
  if (progressBar) {
    progressBar.style.width = `${sizePct}%`;
    progressBar.className = 'progress-bar-fill' + (sizePct > 90 ? ' danger' : sizePct > 70 ? ' warning' : '');
  }

  if (files.length === 0) {
    container.innerHTML = `<p style="font-size: 0.8rem; color: #94a3b8; text-align: center; padding: 0.75rem;">${window.t('no_files_uploaded')}</p>`;
    return;
  }

  container.innerHTML = files.map(file => {
    let duplicateTag = '';
    if (file.isDuplicate) {
      const dupText = file.duplicateOfId 
        ? window.t('duplicate_of', { name: file.duplicateOfName }) 
        : window.t('duplicate');
      duplicateTag = `<span class="badge badge-duplicate">${dupText}</span>`;
    }

    let assignedTag = '';
    if (file.isAssigned) {
      assignedTag = `<span class="badge badge-assigned">${window.t('assigned')}</span>`;
    }

    let errorTag = '';
    if (file.error) {
      const isPassword = file.errorType === 'PASSWORD_PROTECTED';
      const badgeText = isPassword ? window.t('password_pdf') : window.t('corrupted_pdf');
      errorTag = `<span class="badge badge-expired" title="${file.error}">${badgeText}</span>`;
    }

    const pagesLabel = file.pageCount === 1 ? window.t('page') : window.t('pages');

    return `
      <div class="file-item ${file.isDuplicate ? 'is-duplicate' : ''} ${file.error ? 'is-error' : ''}" data-file-id="${file.id}">
        <div class="file-info">
          <div class="file-name" title="${file.name}">${file.name}</div>
          <div class="file-meta">
            ${file.pageCount > 0 ? `<span>${file.pageCount} ${pagesLabel}</span><span>•</span>` : ''}
            <span>${formatBytes(file.size)}</span>
            ${duplicateTag}
            ${assignedTag}
            ${errorTag}
          </div>
        </div>
        <div class="file-actions">
          <button type="button" class="btn-icon-remove btn-remove-file" data-file-id="${file.id}" title="${window.t('remove')}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Bind remove handlers
  container.querySelectorAll('.btn-remove-file').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fileId = btn.getAttribute('data-file-id');
      window.removeFile(fileId);
    });
  });
}

/**
 * Render Requirements Checklist Table
 */
function renderRequirements() {
  const container = document.getElementById('requirements-table-body');
  if (!container) return;

  const requirements = window.appState.requirements;
  const files = window.appState.files;
  const isBn = window.appState.language === 'bn';

  if (!requirements || requirements.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">
          ${window.t('no_tender_loaded')}
        </td>
      </tr>
    `;
    return;
  }

  // Set of assigned file IDs across other requirements
  const matchedFileMap = new Map();
  for (const r of requirements) {
    if (r.matchedFileId) {
      matchedFileMap.set(r.matchedFileId, r.id);
    }
  }

  container.innerHTML = requirements.map(req => {
    const statusObj = window.calculateStatus(req, window.appState.tender);
    const title = isBn ? req.title_bn : req.title_en;
    const typeBadge = req.mandatory
      ? `<span class="badge badge-mandatory">${window.t('mandatory')}</span>`
      : `<span class="badge badge-optional">${window.t('optional')}</span>`;

    // Dropdown options
    // Available files: unassigned OR currently matched to this requirement
    // Must NOT be erroneous or duplicate secondary file
    const availableFiles = files.filter(f => !f.error && (!f.duplicateOfId || f.id === req.matchedFileId));
    
    let selectOptions = `<option value="">${window.t('select_file_placeholder')}</option>`;
    for (const f of availableFiles) {
      const isCurrentlyAssignedElsewhere = matchedFileMap.has(f.id) && matchedFileMap.get(f.id) !== req.id;
      if (isCurrentlyAssignedElsewhere) continue;

      const isSelected = req.matchedFileId === f.id ? 'selected' : '';
      selectOptions += `<option value="${f.id}" ${isSelected}>${f.name} (${f.pageCount} ${f.pageCount === 1 ? window.t('page') : window.t('pages')})</option>`;
    }

    // Expiry Input Column
    let expiryInputHtml = `<span style="color: #94a3b8; font-size: 0.78rem;">—</span>`;
    if (req.has_expiry) {
      if (req.matchedFileId) {
        const isExpired = statusObj.status === 'EXPIRED';
        const isMissingDate = statusObj.status === 'EXPIRY_NEEDED';
        expiryInputHtml = `
          <div class="expiry-input-wrapper">
            <input type="date" class="expiry-input ${isExpired || isMissingDate ? 'invalid' : ''}" 
                   data-req-id="${req.id}" 
                   value="${req.expiryDate || ''}"
                   placeholder="YYYY-MM-DD" />
            <span class="expiry-helper-text">${window.t('submission_deadline')}: ${window.appState.tender?.submission_deadline || ''}</span>
          </div>
        `;
      } else {
        expiryInputHtml = `<span style="color: #94a3b8; font-size: 0.76rem;">${window.t('col_expiry')}</span>`;
      }
    }

    // Status Badge
    const statusBadge = `<span class="badge ${statusObj.badgeClass}" title="${window.t(statusObj.descKey, { date: window.appState.tender?.submission_deadline, expiry: req.expiryDate })}">${window.t(statusObj.labelKey)}</span>`;

    return `
      <tr data-req-id="${req.id}">
        <td><span class="req-order-badge">#${String(req.order).padStart(2, '0')}</span></td>
        <td>
          <div class="req-name-container">
            <span class="req-title">${title}</span>
            <span class="req-id">${req.id}</span>
          </div>
        </td>
        <td>${typeBadge}</td>
        <td>
          <div class="match-selector-wrapper">
            <select class="match-select" data-req-id="${req.id}">
              ${selectOptions}
            </select>
            ${req.matchedFileId ? `
              <button type="button" class="btn-icon-remove btn-unmatch" data-req-id="${req.id}" title="${window.t('unmatch')}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            ` : ''}
          </div>
        </td>
        <td>${expiryInputHtml}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');

  // Bind dropdown change handlers
  container.querySelectorAll('.match-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const reqId = select.getAttribute('data-req-id');
      const fileId = select.value || null;
      try {
        window.matchFileToRequirement(reqId, fileId);
      } catch (err) {
        window.showToast(err.message || 'Matching error', 'error');
        renderRequirements();
      }
    });
  });

  // Bind unmatch button handlers
  container.querySelectorAll('.btn-unmatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const reqId = btn.getAttribute('data-req-id');
      window.matchFileToRequirement(reqId, null);
    });
  });

  // Bind expiry input handlers
  container.querySelectorAll('.expiry-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const reqId = input.getAttribute('data-req-id');
      window.setRequirementExpiry(reqId, input.value);
    });
  });
}

/**
 * Render Validation Summary Section & Enable/Disable Generate Button
 */
function renderValidationSummary() {
  const summary = window.getValidationSummary();

  const reqReadyEl = document.getElementById('metric-required-ready');
  const optSkippedEl = document.getElementById('metric-optional-skipped');
  const blockingEl = document.getElementById('metric-blocking-issues');
  const duplicatesEl = document.getElementById('metric-duplicates');
  const alertsContainer = document.getElementById('validation-alerts-container');
  const generateBtn = document.getElementById('btn-generate-package');

  if (reqReadyEl) reqReadyEl.textContent = summary.requiredReady;
  if (optSkippedEl) optSkippedEl.textContent = summary.optionalNotProvided;
  if (blockingEl) {
    blockingEl.textContent = summary.blockingIssuesCount;
    blockingEl.className = 'metric-value ' + (summary.blockingIssuesCount > 0 ? 'danger' : 'success');
  }
  if (duplicatesEl) {
    duplicatesEl.textContent = summary.duplicateCount;
    duplicatesEl.className = 'metric-value ' + (summary.duplicateCount > 0 ? 'warning' : 'neutral');
  }

  if (alertsContainer) {
    if (summary.blockingIssuesCount > 0) {
      const issueItems = summary.blockingIssues.map(issue => `
        <li>
          <strong>#${String(issue.order).padStart(2, '0')} ${issue.title}</strong>: 
          ${window.t(issue.descKey, { date: issue.deadline, expiry: issue.expiryDate })}
        </li>
      `).join('');

      alertsContainer.innerHTML = `
        <div class="blocking-alert-box">
          <div class="blocking-alert-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ${window.t('blocking_warning_msg')}
          </div>
          <ul class="blocking-alert-list">
            ${issueItems}
          </ul>
        </div>
      `;
    } else if (summary.canGenerate) {
      alertsContainer.innerHTML = `
        <div class="ready-alert-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ${window.t('all_ready_msg')}
        </div>
      `;
    } else {
      alertsContainer.innerHTML = '';
    }
  }

  if (generateBtn) {
    generateBtn.disabled = !summary.canGenerate || window.appState.isGenerating;
    if (!summary.canGenerate && summary.disabledReason) {
      generateBtn.title = window.t(summary.disabledReason, { count: summary.blockingIssuesCount });
    } else {
      generateBtn.title = '';
    }
  }
}

/**
 * Export current checklist state to CSV (Bonus Feature)
 */
function exportChecklistToCsv() {
  const tender = window.appState.tender;
  if (!tender || window.appState.requirements.length === 0) {
    window.showToast(window.t('disabled_reason_no_tender'), 'warning');
    return;
  }

  const isBn = window.appState.language === 'bn';
  const rows = [];
  rows.push(['Tender ID', tender.tender_id]);
  rows.push(['Tender Title', `"${tender.title.replace(/"/g, '""')}"`]);
  rows.push(['Procuring Entity', `"${tender.procuring_entity.replace(/"/g, '""')}"`]);
  rows.push(['Bidder', `"${tender.bidder.replace(/"/g, '""')}"`]);
  rows.push(['Submission Deadline', tender.submission_deadline]);
  rows.push([]);
  rows.push(['Order', 'Requirement ID', 'Title (EN)', 'Title (BN)', 'Type', 'Matched File', 'Expiry Date', 'Status']);

  for (const req of window.appState.requirements) {
    const statusObj = window.calculateStatus(req, tender);
    const matchedFile = window.appState.files.find(f => f.id === req.matchedFileId);
    rows.push([
      req.order,
      req.id,
      `"${req.title_en.replace(/"/g, '""')}"`,
      `"${req.title_bn.replace(/"/g, '""')}"`,
      req.mandatory ? (isBn ? 'বাধ্যতামূলক' : 'Mandatory') : (isBn ? 'ঐচ্ছিক' : 'Optional'),
      matchedFile ? `"${matchedFile.name.replace(/"/g, '""')}"` : (isBn ? 'নেই' : 'None'),
      req.expiryDate || 'N/A',
      window.t(statusObj.labelKey)
    ]);
  }

  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `${tender.tender_id}_Checklist.csv`;
  window.downloadBlob(blob, filename, 'text/csv');
  window.showToast(window.t('toast_csv_exported', { filename }), 'success');
}

/**
 * Translate all static text on page according to active language
 */
function updateStaticTranslations() {
  document.body.className = window.appState.language === 'bn' ? 'lang-bn' : '';
  
  // Language button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === window.appState.language);
  });

  // Data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = window.t(key);
  });

  // Data-i18n-title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = window.t(key);
  });
}

/**
 * Full UI Re-render
 */
function renderAll() {
  updateStaticTranslations();
  renderTenderInfo();
  renderFileList();
  renderRequirements();
  renderValidationSummary();
}

// Export functions to window
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.renderTenderInfo = renderTenderInfo;
  window.renderFileList = renderFileList;
  window.renderRequirements = renderRequirements;
  window.renderValidationSummary = renderValidationSummary;
  window.exportChecklistToCsv = exportChecklistToCsv;
  window.updateStaticTranslations = updateStaticTranslations;
  window.renderAll = renderAll;
}
