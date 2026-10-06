/**
 * Central State Store for TenderPack
 */
const appState = {
  language: 'en',
  tender: null, // { tender_id, title, procuring_entity, bidder, submission_deadline }
  requirements: [], // Array of { id, order, title_en, title_bn, mandatory, has_expiry, matchedFileId, expiryDate }
  files: [], // Array of { id, name, size, type, arrayBuffer, hash, pageCount, isDuplicate, duplicateOfId, duplicateOfName, error }
  isGenerating: false,
  generationProgress: 0,
  listeners: []
};

/**
 * Register a listener for state changes
 */
function subscribeState(listener) {
  if (typeof listener === 'function') {
    appState.listeners.push(listener);
  }
}

/**
 * Notify all subscribers of state changes
 */
function notifyStateChange(eventType, payload) {
  for (const listener of appState.listeners) {
    try {
      listener(eventType, payload, appState);
    } catch (e) {
      console.error('State listener error:', e);
    }
  }
}

/**
 * Validate and parse requirements.json content
 * Generic schema validation
 */
function validateRequirementsJson(jsonData) {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid JSON: Root must be an object.');
  }

  const { tender, requirements } = jsonData;
  if (!tender || typeof tender !== 'object') {
    throw new Error('Missing "tender" object in requirements.json.');
  }

  const requiredTenderFields = ['tender_id', 'title', 'procuring_entity', 'bidder', 'submission_deadline'];
  for (const field of requiredTenderFields) {
    if (!tender[field] || typeof tender[field] !== 'string' || tender[field].trim() === '') {
      throw new Error(`Missing or empty required tender field: "${field}".`);
    }
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tender.submission_deadline.trim())) {
    throw new Error('Tender "submission_deadline" must be in YYYY-MM-DD format.');
  }

  if (!Array.isArray(requirements) || requirements.length === 0) {
    throw new Error('Invalid or empty "requirements" array in requirements.json.');
  }

  const processedRequirements = requirements.map((req, idx) => {
    if (!req.id || typeof req.id !== 'string') {
      throw new Error(`Requirement at index ${idx} is missing "id".`);
    }
    if (typeof req.order !== 'number') {
      throw new Error(`Requirement "${req.id}" has invalid or missing "order" (must be a number).`);
    }
    if (!req.title_en) {
      throw new Error(`Requirement "${req.id}" is missing "title_en".`);
    }
    return {
      id: req.id.trim(),
      order: req.order,
      title_en: req.title_en.trim(),
      title_bn: (req.title_bn || req.title_en).trim(),
      mandatory: Boolean(req.mandatory),
      has_expiry: Boolean(req.has_expiry),
      matchedFileId: null,
      expiryDate: ''
    };
  });

  // Sort requirements by order
  processedRequirements.sort((a, b) => a.order - b.order);

  return {
    tender: {
      tender_id: tender.tender_id.trim(),
      title: tender.title.trim(),
      procuring_entity: tender.procuring_entity.trim(),
      bidder: tender.bidder.trim(),
      submission_deadline: tender.submission_deadline.trim()
    },
    requirements: processedRequirements
  };
}

/**
 * Load requirements into state
 */
function setRequirements(tender, requirements) {
  appState.tender = tender;
  appState.requirements = requirements;
  
  // Re-verify matches in case files already existed
  recalculateDuplicateAndMatchStatus();
  notifyStateChange('REQUIREMENTS_LOADED', { tender, requirements });
}

/**
 * Calculate pure status for a single requirement
 * Returns: { status: 'MISSING' | 'EXPIRY_NEEDED' | 'EXPIRED' | 'NOT_PROVIDED' | 'OK', isBlocking: boolean, messageKey: string }
 */
function calculateStatus(req, tender) {
  const deadline = tender ? tender.submission_deadline : null;
  const isMatched = Boolean(req.matchedFileId);

  // 1. Mandatory document without matched file
  if (req.mandatory && !isMatched) {
    return {
      status: 'MISSING',
      isBlocking: true,
      labelKey: 'status_missing',
      descKey: 'status_desc_missing',
      badgeClass: 'badge-missing'
    };
  }

  // 4. Optional document without matched file
  if (!req.mandatory && !isMatched) {
    return {
      status: 'NOT_PROVIDED',
      isBlocking: false,
      labelKey: 'status_not_provided',
      descKey: 'status_desc_not_provided',
      badgeClass: 'badge-not-provided'
    };
  }

  // File is matched from this point forward
  if (req.has_expiry) {
    // 2. Expiry date required but not provided
    if (!req.expiryDate || req.expiryDate.trim() === '') {
      return {
        status: 'EXPIRY_NEEDED',
        isBlocking: true,
        labelKey: 'status_expiry_needed',
        descKey: 'status_desc_expiry_needed',
        badgeClass: 'badge-expiry-needed'
      };
    }

    // 3. Expiry date comparison (expiry < deadline => expired)
    // Note: expiry >= deadline is VALID / OK
    if (deadline && req.expiryDate < deadline) {
      return {
        status: 'EXPIRED',
        isBlocking: true,
        labelKey: 'status_expired',
        descKey: 'status_desc_expired',
        badgeClass: 'badge-expired'
      };
    }
  }

  // 5. OK
  return {
    status: 'OK',
    isBlocking: false,
    labelKey: 'status_ok',
    descKey: 'status_desc_ok',
    badgeClass: 'badge-ok'
  };
}

/**
 * Get overall validation metrics and blocking issue list
 */
function getValidationSummary() {
  if (!appState.tender || appState.requirements.length === 0) {
    return {
      requiredReady: 0,
      optionalNotProvided: 0,
      blockingIssuesCount: 0,
      duplicateCount: 0,
      blockingIssues: [],
      canGenerate: false,
      disabledReason: 'disabled_reason_no_tender'
    };
  }

  let requiredReady = 0;
  let optionalNotProvided = 0;
  const blockingIssues = [];
  const duplicateFiles = appState.files.filter(f => f.isDuplicate);

  for (const req of appState.requirements) {
    const statusObj = calculateStatus(req, appState.tender);
    const title = appState.language === 'bn' ? req.title_bn : req.title_en;

    if (statusObj.status === 'OK') {
      if (req.mandatory) requiredReady++;
    } else if (statusObj.status === 'NOT_PROVIDED') {
      optionalNotProvided++;
    }

    if (statusObj.isBlocking) {
      blockingIssues.push({
        requirementId: req.id,
        order: req.order,
        title: title,
        status: statusObj.status,
        labelKey: statusObj.labelKey,
        descKey: statusObj.descKey,
        deadline: appState.tender.submission_deadline,
        expiryDate: req.expiryDate
      });
    }
  }

  const matchedCount = appState.requirements.filter(r => r.matchedFileId).length;
  let canGenerate = blockingIssues.length === 0 && matchedCount > 0;
  let disabledReason = '';

  if (!appState.tender) {
    disabledReason = 'disabled_reason_no_tender';
  } else if (blockingIssues.length > 0) {
    disabledReason = 'disabled_reason_blocking';
  } else if (matchedCount === 0) {
    disabledReason = 'disabled_reason_no_files';
  }

  return {
    requiredReady,
    optionalNotProvided,
    blockingIssuesCount: blockingIssues.length,
    duplicateCount: duplicateFiles.length,
    blockingIssues,
    canGenerate,
    disabledReason
  };
}

/**
 * Recalculate duplicate file statuses across all files based on exact SHA-256 hash
 */
function recalculateDuplicateAndMatchStatus() {
  const hashGroups = new Map();

  // Group by hash
  for (const file of appState.files) {
    if (!file.hash) continue;
    if (!hashGroups.has(file.hash)) {
      hashGroups.set(file.hash, []);
    }
    hashGroups.get(file.hash).push(file);
  }

  // Determine duplicate markers
  for (const [hash, fileList] of hashGroups.entries()) {
    if (fileList.length > 1) {
      // The first file uploaded/retained is primary, others are duplicates
      const primary = fileList[0];
      primary.isDuplicate = true;
      primary.duplicateOfId = null;
      primary.duplicateOfName = fileList.slice(1).map(f => f.name).join(', ');

      for (let i = 1; i < fileList.length; i++) {
        fileList[i].isDuplicate = true;
        fileList[i].duplicateOfId = primary.id;
        fileList[i].duplicateOfName = primary.name;
        
        // If a duplicate file was matched to a requirement, unmatch it to enforce the duplicate rule
        for (const req of appState.requirements) {
          if (req.matchedFileId === fileList[i].id) {
            req.matchedFileId = null;
          }
        }
      }
    } else {
      fileList[0].isDuplicate = false;
      fileList[0].duplicateOfId = null;
      fileList[0].duplicateOfName = null;
    }
  }

  // Update assigned status
  const matchedFileIds = new Set(appState.requirements.map(r => r.matchedFileId).filter(Boolean));
  for (const file of appState.files) {
    file.isAssigned = matchedFileIds.has(file.id);
  }
}

/**
 * Match a file to a requirement
 * Enforces one-file-to-one-requirement and disallows duplicate secondary files
 */
function matchFileToRequirement(requirementId, fileId) {
  const req = appState.requirements.find(r => r.id === requirementId);
  if (!req) return false;

  if (!fileId) {
    // Unmatching
    req.matchedFileId = null;
    recalculateDuplicateAndMatchStatus();
    notifyStateChange('MATCH_CHANGED', { requirementId, fileId: null });
    return true;
  }

  const targetFile = appState.files.find(f => f.id === fileId);
  if (!targetFile) return false;

  // Cannot match secondary duplicate file
  if (targetFile.duplicateOfId) {
    throw new Error('Cannot assign a duplicate file.');
  }

  // If another requirement was already using this file, unmatch it first
  for (const otherReq of appState.requirements) {
    if (otherReq.id !== requirementId && otherReq.matchedFileId === fileId) {
      otherReq.matchedFileId = null;
    }
  }

  req.matchedFileId = fileId;
  recalculateDuplicateAndMatchStatus();
  notifyStateChange('MATCH_CHANGED', { requirementId, fileId });
  return true;
}

/**
 * Update expiry date on requirement
 */
function setRequirementExpiry(requirementId, dateStr) {
  const req = appState.requirements.find(r => r.id === requirementId);
  if (req) {
    req.expiryDate = dateStr;
    notifyStateChange('EXPIRY_CHANGED', { requirementId, expiryDate: dateStr });
  }
}

/**
 * Add uploaded files to state
 */
function addFiles(newFiles) {
  // Max limit check: 30 files
  if (appState.files.length + newFiles.length > 30) {
    throw new Error('Total files cannot exceed 30.');
  }

  // Total size check: 50MB
  const currentTotal = appState.files.reduce((sum, f) => sum + (f.size || 0), 0);
  const newTotal = newFiles.reduce((sum, f) => sum + (f.size || 0), 0);
  if (currentTotal + newTotal > 50 * 1024 * 1024) {
    throw new Error('Total file size cannot exceed 50 MB.');
  }

  appState.files.push(...newFiles);
  recalculateDuplicateAndMatchStatus();
  notifyStateChange('FILES_ADDED', { count: newFiles.length });
}

/**
 * Remove a file from state and unmatch from any requirement
 */
function removeFile(fileId) {
  appState.files = appState.files.filter(f => f.id !== fileId);
  for (const req of appState.requirements) {
    if (req.matchedFileId === fileId) {
      req.matchedFileId = null;
    }
  }
  recalculateDuplicateAndMatchStatus();
  notifyStateChange('FILE_REMOVED', { fileId });
}

/**
 * Clear all files
 */
function clearAllFiles() {
  appState.files = [];
  for (const req of appState.requirements) {
    req.matchedFileId = null;
  }
  notifyStateChange('ALL_FILES_CLEARED');
}

/**
 * Reset all matches
 */
function resetAllMatches() {
  for (const req of appState.requirements) {
    req.matchedFileId = null;
  }
  recalculateDuplicateAndMatchStatus();
  notifyStateChange('ALL_MATCHES_RESET');
}

/**
 * Switch language
 */
function setLanguage(lang) {
  if (lang === 'en' || lang === 'bn') {
    appState.language = lang;
    notifyStateChange('LANGUAGE_CHANGED', { language: lang });
  }
}

// Export to window
if (typeof window !== 'undefined') {
  window.appState = appState;
  window.subscribeState = subscribeState;
  window.notifyStateChange = notifyStateChange;
  window.validateRequirementsJson = validateRequirementsJson;
  window.setRequirements = setRequirements;
  window.calculateStatus = calculateStatus;
  window.getValidationSummary = getValidationSummary;
  window.matchFileToRequirement = matchFileToRequirement;
  window.setRequirementExpiry = setRequirementExpiry;
  window.addFiles = addFiles;
  window.removeFile = removeFile;
  window.clearAllFiles = clearAllFiles;
  window.resetAllMatches = resetAllMatches;
  window.setLanguage = setLanguage;
}
