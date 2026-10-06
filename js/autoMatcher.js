/**
 * Auto-Matcher Engine for Tender Documents
 * Suggests & matches uploaded PDFs to requirements based on keyword heuristics
 */

const KEYWORD_MAP = [
  {
    terms: ['trade', 'license', 'লাইসেন্স'],
    reqKeywords: ['trade', 'license', 'ট্রেড', 'লাইসেন্স']
  },
  {
    terms: ['tin', 'tax', 'e-tin', 'টিআইএন'],
    reqKeywords: ['tin', 'tax', 'টিআইএন', 'কর']
  },
  {
    terms: ['vat', 'bin', 'ভ্যাট', 'মূসক'],
    reqKeywords: ['vat', 'bin', 'ভ্যাট', 'মূসক']
  },
  {
    terms: ['bank', 'solvency', 'ব্যাংক', 'স্বচ্ছলতা'],
    reqKeywords: ['bank', 'solvency', 'ব্যাংক', 'স্বচ্ছলতা']
  },
  {
    terms: ['experience', 'completion', 'অভিজ্ঞতা', 'অভিজ্ঞতার'],
    reqKeywords: ['experience', 'অভিজ্ঞতা', 'অভিজ্ঞতার']
  },
  {
    terms: ['audit', 'audited', 'financial_statement', 'অডিট'],
    reqKeywords: ['audit', 'audited', 'statement', 'অডিট']
  },
  {
    terms: ['manufacturer', 'authorization', 'maf', 'প্রস্তুতকারক'],
    reqKeywords: ['manufacturer', 'authorization', 'অনুমোদনপত্র']
  },
  {
    terms: ['technical', 'proposal', 'tech', 'কারিগরি'],
    reqKeywords: ['technical', 'কারিগরি']
  },
  {
    terms: ['financial', 'proposal', 'boq', 'commercial', 'আর্থিক'],
    reqKeywords: ['financial', 'commercial', 'boq', 'আর্থিক']
  },
  {
    terms: ['declaration', 'integrity', 'signed', 'scan', 'scanned', 'অঙ্গীকারনামা'],
    reqKeywords: ['declaration', 'integrity', 'অঙ্গীকারনামা', 'signed']
  }
];

/**
 * Calculate match score between a requirement and a filename
 */
function calculateMatchScore(requirement, fileName) {
  const normalizedName = fileName.toLowerCase().replace(/[_\-\(\)\.]+/g, ' ');
  const titleEn = requirement.title_en.toLowerCase();
  const titleBn = requirement.title_bn.toLowerCase();

  let score = 0;

  // Direct word intersection with requirement title
  const titleWords = (titleEn + ' ' + titleBn).split(/\s+/).filter(w => w.length > 2);
  for (const word of titleWords) {
    if (normalizedName.includes(word)) {
      score += 5;
    }
  }

  // Keyword dictionary matches
  for (const group of KEYWORD_MAP) {
    const fileMatches = group.terms.some(t => normalizedName.includes(t));
    const reqMatches = group.reqKeywords.some(k => titleEn.includes(k) || titleBn.includes(k));

    if (fileMatches && reqMatches) {
      score += 15;
    }
  }

  // Prefer newer years if present in filename (e.g. 2026 over 2025)
  const yearMatch = normalizedName.match(/\b20\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0], 10);
    score += (year - 2000) * 0.1;
  }

  return score;
}

/**
 * Run auto-match algorithm across all requirements and uploaded files
 */
function autoMatchFiles(appState) {
  if (!appState.requirements || appState.requirements.length === 0 || !appState.files || appState.files.length === 0) {
    return { matchedCount: 0, matches: [] };
  }

  // Get available primary (non-duplicate) valid files
  const availableFiles = appState.files.filter(f => !f.error && !f.duplicateOfId);

  // Score all candidate pairings
  const pairings = [];

  for (const req of appState.requirements) {
    for (const file of availableFiles) {
      const score = calculateMatchScore(req, file.name);
      if (score >= 10) {
        pairings.push({
          reqId: req.id,
          fileId: file.id,
          reqOrder: req.order,
          fileName: file.name,
          score
        });
      }
    }
  }

  // Sort by highest score descending
  pairings.sort((a, b) => b.score - a.score);

  const assignedReqs = new Set();
  const assignedFiles = new Set();
  const successfulMatches = [];

  for (const pair of pairings) {
    if (!assignedReqs.has(pair.reqId) && !assignedFiles.has(pair.fileId)) {
      assignedReqs.add(pair.reqId);
      assignedFiles.add(pair.fileId);
      successfulMatches.push(pair);
    }
  }

  // Apply matches to state
  let matchedCount = 0;
  for (const match of successfulMatches) {
    const success = window.matchFileToRequirement(match.reqId, match.fileId);
    if (success) matchedCount++;
  }

  return {
    matchedCount,
    matches: successfulMatches
  };
}

if (typeof window !== 'undefined') {
  window.autoMatchFiles = autoMatchFiles;
}
