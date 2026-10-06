/**
 * TenderPack Bilingual (English / বাংলা) Translations Dictionary
 */
const translations = {
  en: {
    app_title: "TenderPack",
    app_tagline: "Tender Document Package Builder",
    app_description: "Automate requirement verification, duplicate detection, and unified tender package generation.",
    lang_en: "English",
    lang_bn: "বাংলা",
    
    // Tender Section
    tender_info: "Tender Information",
    tender_id: "Tender ID",
    tender_title: "Tender Title",
    procuring_entity: "Procuring Entity",
    bidder: "Bidder Name",
    submission_deadline: "Submission Deadline",
    load_json: "Load requirements.json",
    load_sample_json: "Sample Tender",
    sample_pdfs_btn: "Sample PDFs",
    no_tender_loaded: "No tender configuration loaded. Upload a requirements.json file or load the sample tender to begin.",
    tender_loaded_success: "Tender configuration loaded successfully.",
    
    // Upload Section
    upload_title: "PDF Document Upload",
    upload_drop_zone: "Drag & drop PDF files here, or click to browse",
    upload_limits: "Max 30 PDF files • Up to 50 MB total limit",
    browse_files: "Browse Files",
    uploaded_files_heading: "Uploaded Documents",
    no_files_uploaded: "No PDF files uploaded yet.",
    file_count: "Files: {count} / 30",
    total_size: "Total Size: {size} / 50 MB",
    clear_all_files: "Clear All Files",
    pages: "pages",
    page: "page",
    remove: "Remove",
    duplicate: "Duplicate",
    duplicate_of: "Duplicate of {name}",
    assigned: "Assigned",
    unassigned: "Unassigned",
    corrupted_pdf: "Damaged / Unreadable PDF",
    password_pdf: "Password Protected / Encrypted",
    
    // Checklist Section
    checklist_heading: "Document Matching Checklist",
    checklist_description: "Match uploaded PDFs to required tender documents. Ensure expiry dates are valid where applicable.",
    col_order: "#",
    col_requirement: "Requirement Name",
    col_type: "Type",
    col_matched_file: "Matched PDF Document",
    col_expiry: "Document Expiry Date",
    col_status: "Status",
    col_actions: "Action",
    mandatory: "Mandatory",
    optional: "Optional",
    select_file_placeholder: "-- Select Uploaded PDF --",
    no_files_available: "No unassigned files available",
    unmatch: "Unmatch",
    auto_match_btn: "Auto-Match Files",
    auto_match_success: "Auto-matched {count} document(s) based on filename keywords.",
    clear_matches_btn: "Reset All Matches",
    
    // Status Labels
    status_missing: "Missing",
    status_expiry_needed: "Expiry date needed",
    status_expired: "Expired",
    status_not_provided: "Not provided",
    status_ok: "OK",
    
    // Status descriptions/reasons
    status_desc_missing: "Mandatory document has no matched file.",
    status_desc_expiry_needed: "Please enter the expiry date for this document.",
    status_desc_expired: "Document expires on {expiry} before the submission deadline ({date}).",
    status_desc_not_provided: "Optional document was not provided (allowed).",
    status_desc_ok: "Document is ready and valid.",
    
    // Validation Summary
    summary_heading: "Validation Summary",
    metric_required_ready: "Required Ready",
    metric_optional_missing: "Optional Skipped",
    metric_blocking_issues: "Blocking Issues",
    metric_duplicates: "Duplicate Files",
    all_ready_msg: "All tender requirements are satisfied! You can now generate the final package.",
    blocking_warning_msg: "Package generation is blocked until all issues are resolved:",
    
    // Generate Section
    generate_btn: "Generate Tender Package PDF",
    generating_btn: "Generating Final Package...",
    export_csv_btn: "Export CSV",
    preview_btn: "Preview Package",
    client_side_notice: "All documents are processed purely in your browser. No files are uploaded to any server.",
    disabled_reason_no_tender: "Please load a tender requirements.json file first.",
    disabled_reason_blocking: "{count} blocking issue(s) remain to be resolved.",
    disabled_reason_no_files: "No files have been matched to mandatory requirements.",
    
    // Success Modal
    modal_success_title: "Tender Package Generated Successfully!",
    modal_success_desc: "Your final compiled tender submission package is ready. All source documents have been merged in exact order with official cover and page footers.",
    modal_package_name: "Package Filename:",
    modal_total_pages: "Total Pages:",
    modal_included_docs: "Included Documents:",
    modal_download_btn: "Download PDF Package",
    modal_close_btn: "Close",
    
    // Toast & Alerts & Confirmations
    confirm_clear_all_files: "Are you sure you want to remove all uploaded files?",
    toast_all_files_cleared: "All files cleared.",
    toast_no_auto_matches: "No matching files found for remaining requirements.",
    toast_matches_reset: "All document matches have been reset.",
    toast_files_uploaded: "Uploaded {count} PDF file(s).",
    toast_loading_samples: "Loading 10 sample PDF files for acceptance testing...",
    toast_loaded_samples: "Loaded {count} sample PDF files.",
    toast_csv_exported: "Exported {filename}",
    err_invalid_json: "Invalid JSON format or corrupted file.",
    err_missing_json_fields: "JSON is missing required tender or requirements fields.",
    err_not_a_pdf: "File '{name}' is not a valid PDF document.",
    err_corrupt_pdf: "File '{name}' is damaged, invalid, or corrupted.",
    err_password_pdf: "File '{name}' is password-protected or encrypted. Please provide an unencrypted PDF.",
    err_file_limit_exceeded: "Cannot upload more than 30 files.",
    err_size_limit_exceeded: "Total uploaded size exceeds 50 MB limit.",
    err_duplicate_file_assign: "This file is an exact duplicate of another uploaded file and cannot be assigned.",
    err_generation_failed: "PDF generation encountered an error: {error}",
    success_json_loaded: "Successfully loaded requirements for: {tender_id}",
    success_package_ready: "Tender package compiled ({pages} pages). Download ready.",
    
    // Cover Page & Index Page
    pdf_cover_title: "TENDER SUBMISSION PACKAGE",
    pdf_tender_details: "TENDER DETAILS",
    pdf_submission_info: "SUBMISSION INFORMATION",
    pdf_generation_date: "Generated On",
    pdf_table_of_contents: "TABLE OF CONTENTS & DOCUMENT INDEX",
    pdf_th_order: "No.",
    pdf_th_doc: "Document Title",
    pdf_th_pages: "Pages",
    pdf_th_start_page: "Starting Page",
    pdf_footer_text: "{tender_id} | Page {page} of {total}",
    pp_label: "pp.",
    p_label: "p."
  },
  bn: {
    app_title: "টেন্ডারপ্যাক (TenderPack)",
    app_tagline: "টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার",
    app_description: "টেন্ডার রিকোয়ারমেন্ট যাচাই, ডুপ্লিকেট শনাক্তকরণ এবং চূড়ান্ত টেন্ডার পিডিএফ প্যাকেজ তৈরি করুন।",
    lang_en: "English",
    lang_bn: "বাংলা",
    
    // Tender Section
    tender_info: "টেন্ডার সংক্রান্ত তথ্য",
    tender_id: "টেন্ডার আইডি",
    tender_title: "টেন্ডার শিরোনাম",
    procuring_entity: "ক্রয়কারী সংস্থা (Procuring Entity)",
    bidder: "দরপত্রদাতার নাম (Bidder)",
    submission_deadline: "জমা দেওয়ার শেষ সময়",
    load_json: "requirements.json আপলোড করুন",
    load_sample_json: "নমুনা টেন্ডার",
    sample_pdfs_btn: "নমুনা পিডিএফ",
    no_tender_loaded: "কোনো টেন্ডার কনফিগারেশন লোড করা হয়নি। requirements.json ফাইল আপলোড করুন অথবা নমুনা টেন্ডার লোড করুন।",
    tender_loaded_success: "টেন্ডার কনফিগারেশন সফলভাবে লোড হয়েছে।",
    
    // Upload Section
    upload_title: "পিডিএফ ডকুমেন্ট আপলোড",
    upload_drop_zone: "এখানে পিডিএফ ফাইল ড্র্যাগ ও ড্রপ করুন, অথবা ব্রাউজ করুন",
    upload_limits: "সর্বোচ্চ ৩০টি পিডিএফ ফাইল • মোট ৫০ মেগাবাইট সীমা",
    browse_files: "ফাইল ব্রাউজ করুন",
    uploaded_files_heading: "আপলোডকৃত ডকুমেন্টসমূহ",
    no_files_uploaded: "এখনো কোনো পিডিএফ আপলোড করা হয়নি।",
    file_count: "ফাইল সংখ্যা: {count} / ৩০",
    total_size: "মোট সাইজ: {size} / ৫০ MB",
    clear_all_files: "সব ফাইল মুছুন",
    pages: "পৃষ্ঠা",
    page: "পৃষ্ঠা",
    remove: "মুছুন",
    duplicate: "ডুপ্লিকেট ফাইল",
    duplicate_of: "{name} ফাইলের হুবহু নকল",
    assigned: "সংযুক্ত",
    unassigned: "অসংযুক্ত",
    corrupted_pdf: "ত্রুটিপূর্ণ / অপাঠ্য পিডিএফ",
    password_pdf: "পাসওয়ার্ড সুরক্ষিত / এনক্রিপ্ট করা",
    
    // Checklist Section
    checklist_heading: "ডকুমেন্ট মেলানোর চেকলিস্ট",
    checklist_description: "আপলোডকৃত পিডিএফ ফাইলগুলো টেন্ডারের শর্তাবলীর সাথে সংযুক্ত করুন। প্রয়োজনীয় ক্ষেত্রে মেয়াদ উত্তীর্ণের তারিখ নিশ্চিত করুন।",
    col_order: "ক্রম",
    col_requirement: "ডকুমেন্টের নাম",
    col_type: "ধরণ",
    col_matched_file: "সংযুক্ত পিডিএফ ফাইল",
    col_expiry: "মেয়াদ উত্তীর্ণের তারিখ",
    col_status: "বর্তমান অবস্থা",
    col_actions: "অ্যাকশন",
    mandatory: "বাধ্যতামূলক",
    optional: "ঐচ্ছিক",
    select_file_placeholder: "-- আপলোডকৃত পিডিএফ নির্বাচন করুন --",
    no_files_available: "কোনো খালি ফাইল নেই",
    unmatch: "সংযোগ বাতিল",
    auto_match_btn: "স্বয়ংক্রিয় ম্যাচিং (Auto-Match)",
    auto_match_success: "ফাইলের নামের ভিত্তিতে {count}টি ডকুমেন্ট স্বয়ংক্রিয়ভাবে সংযুক্ত করা হয়েছে।",
    clear_matches_btn: "সব সংযোগ রিসেট",
    
    // Status Labels
    status_missing: "অনুপস্থিত (Missing)",
    status_expiry_needed: "মেয়াদের তারিখ প্রয়োজন",
    status_expired: "মেয়াদোত্তীর্ণ (Expired)",
    status_not_provided: "প্রদান করা হয়নি (Not provided)",
    status_ok: "সঠিক (OK)",
    
    // Status descriptions/reasons
    status_desc_missing: "বাধ্যতামূলক ডকুমেন্ট সংযুক্ত করা হয়নি।",
    status_desc_expiry_needed: "অনুগ্রহ করে এই ডকুমেন্টের মেয়াদ উত্তীর্ণের তারিখ লিখুন।",
    status_desc_expired: "ডকুমেন্টের মেয়াদ ({expiry}) টেন্ডার জমা দেওয়ার তারিখের ({date}) পূর্বে শেষ হয়েছে।",
    status_desc_not_provided: "ঐচ্ছিক ডকুমেন্ট প্রদান করা হয়নি (অনুমোদিত)।",
    status_desc_ok: "ডকুমেন্ট সম্পূর্ণ এবং বৈধ।",
    
    // Validation Summary
    summary_heading: "যাচাইকরণ সারসংক্ষেপ",
    metric_required_ready: "প্রয়োজনীয় প্রস্তুত",
    metric_optional_missing: "ঐচ্ছিক বাদ দেওয়া",
    metric_blocking_issues: "অমীমাংসিত সমস্যা",
    metric_duplicates: "ডুপ্লিকেট ফাইল",
    all_ready_msg: "সব টেন্ডার শর্তাবলী পূরণ হয়েছে! আপনি এখন চূড়ান্ত পিডিএফ প্যাকেজ তৈরি করতে পারেন।",
    blocking_warning_msg: "সমস্যাগুলো সমাধান না করা পর্যন্ত প্যাকেজ তৈরি করা যাবে না:",
    
    // Generate Section
    generate_btn: "চূড়ান্ত টেন্ডার প্যাকেজ তৈরি করুন",
    generating_btn: "প্যাকেজ তৈরি হচ্ছে...",
    export_csv_btn: "চেকলিস্ট (CSV)",
    preview_btn: "প্যাকেজ প্রিভিউ",
    client_side_notice: "সব ডকুমেন্ট সম্পূর্ণভাবে আপনার ব্রাউজারে প্রক্রিয়াকৃত। কোনো ফাইল সার্ভারে আপলোড করা হয় না।",
    disabled_reason_no_tender: "অনুগ্রহ করে প্রথমে requirements.json ফাইল লোড করুন।",
    disabled_reason_blocking: "{count}টি অমীমাংসিত সমস্যা সমাধান করতে হবে।",
    disabled_reason_no_files: "বাধ্যতামূলক ডকুমেন্টে কোনো ফাইল সংযুক্ত করা হয়নি।",
    
    // Success Modal
    modal_success_title: "টেন্ডার প্যাকেজ সফলভাবে তৈরি হয়েছে!",
    modal_success_desc: "আপনার চূড়ান্ত টেন্ডার প্যাকেজ প্রস্তুত হয়েছে। সকল ডকুমেন্ট সঠিক ক্রমানুসারে অফিশিয়াল কভার ও পেজ ফুটারসহ মার্জ করা হয়েছে।",
    modal_package_name: "প্যাকেজ ফাইলনাম:",
    modal_total_pages: "মোট পৃষ্ঠা সংখ্যা:",
    modal_included_docs: "সংযুক্ত ডকুমেন্টস:",
    modal_download_btn: "পিডিএফ প্যাকেজ ডাউনলোড",
    modal_close_btn: "বন্ধ করুন",
    
    // Toast & Alerts & Confirmations
    confirm_clear_all_files: "আপনি কি সব আপলোডকৃত ফাইল মুছে ফেলতে চান?",
    toast_all_files_cleared: "সব ফাইল মুছে ফেলা হয়েছে।",
    toast_no_auto_matches: "অবশিষ্ট রিকোয়ারমেন্টের জন্য কোনো উপযুক্ত ফাইল পাওয়া যায়নি।",
    toast_matches_reset: "সব ডকুমেন্ট সংযোগ রিসেট করা হয়েছে।",
    toast_files_uploaded: "{count}টি পিডিএফ ফাইল আপলোড হয়েছে।",
    toast_loading_samples: "নমুনা পরীক্ষার জন্য ১০টি পিডিএফ ফাইল লোড হচ্ছে...",
    toast_loaded_samples: "{count}টি নমুনা পিডিএফ ফাইল লোড করা হয়েছে।",
    toast_csv_exported: "{filename} এক্সপোর্ট সম্পন্ন হয়েছে।",
    err_invalid_json: "ভুল JSON ফরম্যাট অথবা ক্ষতিগ্রস্ত ফাইল।",
    err_missing_json_fields: "JSON ফাইলে প্রয়োজনীয় টেন্ডার অথবা রিকোয়ারমেন্ট তথ্য অনুপস্থিত।",
    err_not_a_pdf: "'{name}' ফাইলটি বৈধ পিডিএফ নয়।",
    err_corrupt_pdf: "'{name}' ফাইলটি ক্ষতিগ্রস্ত বা অপাঠ্য।",
    err_password_pdf: "'{name}' ফাইলটি পাসওয়ার্ড সুরক্ষিত বা এনক্রিপ্ট করা। পাসওয়ার্ড ছাড়া পিডিএফ প্রদান করুন।",
    err_file_limit_exceeded: "সর্বোচ্চ ৩০টির বেশি ফাইল আপলোড করা যাবে না।",
    err_size_limit_exceeded: "ফাইলের মোট সাইজ ৫০ মেগাবাইটের বেশি হতে পারবে না।",
    err_duplicate_file_assign: "এই ফাইলটি অন্য একটি ফাইলের হুবহু প্রতিলিপি (ডুপ্লিকেট), তাই সংযুক্ত করা যাবে না।",
    err_generation_failed: "পিডিএফ তৈরিতে ত্রুটি দেখা দিয়েছে: {error}",
    success_json_loaded: "টেন্ডার তথ্য সফলভাবে লোড হয়েছে: {tender_id}",
    success_package_ready: "টেন্ডার প্যাকেজ প্রস্তুত ({pages} পৃষ্ঠা)। ডাউনলোড করুন।",
    
    // Cover Page & Index Page
    pdf_cover_title: "TENDER SUBMISSION PACKAGE",
    pdf_tender_details: "TENDER DETAILS",
    pdf_submission_info: "SUBMISSION INFORMATION",
    pdf_generation_date: "Generated On",
    pdf_table_of_contents: "TABLE OF CONTENTS & DOCUMENT INDEX",
    pdf_th_order: "No.",
    pdf_th_doc: "Document Title",
    pdf_th_pages: "Pages",
    pdf_th_start_page: "Starting Page",
    pdf_footer_text: "{tender_id} | Page {page} of {total}",
    pp_label: "পৃ.",
    p_label: "পৃ."
  }
};

/**
 * Helper to fetch translation string with parameter interpolation
 */
function t(key, params = {}) {
  const lang = (window.appState && window.appState.language) || 'en';
  let text = (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || key;
  for (const [paramKey, paramVal] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
  }
  return text;
}

if (typeof window !== 'undefined') {
  window.translations = translations;
  window.t = t;
}
