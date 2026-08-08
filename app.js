/**
 * Nokib's Keyword Check — Application Core Logic
 * Fiverr Compliance & Keyword Checker
 */

(function () {
  'use strict';

  // Default forbidden keywords (33+ compliance terms)
  const DEFAULT_KEYWORDS = [
    { text: 'crypto', category: 'financial' },
    { text: 'payment', category: 'financial' },
    { text: 'instagram', category: 'contact' },
    { text: 'linkedin', category: 'contact' },
    { text: 'facebook', category: 'contact' },
    { text: 'negative', category: 'reviews' },
    { text: 'star', category: 'reviews' },
    { text: 'transferwise', category: 'financial' },
    { text: 'account', category: 'financial' },
    { text: 'bank', category: 'financial' },
    { text: 'messenger', category: 'contact' },
    { text: 'skype', category: 'contact' },
    { text: 'card', category: 'financial' },
    { text: 'credit', category: 'financial' },
    { text: 'purchase', category: 'financial' },
    { text: 'whatsapp', category: 'contact' },
    { text: 'sms', category: 'contact' },
    { text: 'transaction', category: 'financial' },
    { text: 'stripe', category: 'financial' },
    { text: 'paypal', category: 'financial' },
    { text: 'rating', category: 'reviews' },
    { text: 'review', category: 'reviews' },
    { text: 'euro', category: 'financial' },
    { text: 'dollar', category: 'financial' },
    { text: 'money', category: 'financial' },
    { text: 'pay', category: 'financial' },
    { text: 'contact', category: 'contact' },
    { text: 'email', category: 'contact' },
    { text: 'gmail', category: 'contact' },
    { text: 'mail', category: 'contact' },
    { text: '@', category: 'contact' },
    { text: 'feedback', category: 'reviews' },
    { text: 'telegram', category: 'contact' },
    { text: '5 star', category: 'reviews' },
    { text: '5-star', category: 'reviews' },
    { text: 'five star', category: 'reviews' },
    { text: 'pay outside', category: 'financial' },
    { text: 'call me', category: 'contact' },
    { text: 'phone', category: 'contact' }
  ];

  // App State
  let state = {
    keywords: [],
    theme: 'dark',
    isUnlocked: false,
    pin: '6746',
    appsScriptUrl: '',
    currentCategoryFilter: 'all',
    searchFilter: '',
    client: 'ClientA',
    profile: 'Nokib_fiverr',
    action: 'update',
    appendSignature: true
  };

  // DOM Elements
  const DOM = {
    inputText: document.getElementById('input-text'),
    valWords: document.getElementById('val-words'),
    valChars: document.getElementById('val-chars'),
    valBanned: document.getElementById('val-banned'),
    valGrammar: document.getElementById('val-grammar'),
    cardBanned: document.getElementById('card-banned'),
    statusBanned: document.getElementById('status-banned'),
    statusGrammar: document.getElementById('status-grammar'),
    
    // Editor Actions
    btnPaste: document.getElementById('btn-paste'),
    btnClear: document.getElementById('btn-clear'),
    btnFixRewrite: document.getElementById('btn-fix-rewrite'),
    btnCopyOutput: document.getElementById('btn-copy-output'),
    
    // Signature Elements
    toggleSignature: document.getElementById('toggle-signature'),
    inputClientId: document.getElementById('input-client-id'),
    inputProfileName: document.getElementById('input-profile-name'),
    selectActionType: document.getElementById('select-action-type'),
    previewSignatureText: document.getElementById('preview-signature-text'),
    btnAppendSignature: document.getElementById('btn-append-signature'),

    // Tabs & Panels
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    badgeViolationsCount: document.getElementById('badge-violations-count'),
    badgeGrammarCount: document.getElementById('badge-grammar-count'),
    violationsListEmpty: document.getElementById('violations-list-empty'),
    violationsList: document.getElementById('violations-list'),
    grammarListEmpty: document.getElementById('grammar-list-empty'),
    grammarList: document.getElementById('grammar-list'),
    sanitizedOutputText: document.getElementById('sanitized-output-text'),
    btnCopySanitized: document.getElementById('btn-copy-sanitized'),

    // Keywords Management
    keywordsContainer: document.getElementById('keywords-container'),
    totalKeywordsCount: document.getElementById('total-keywords-count'),
    searchKeywords: document.getElementById('search-keywords'),
    presetBtns: document.querySelectorAll('.preset-pills .pill-btn'),
    btnAddKeywordModal: document.getElementById('btn-add-keyword-modal'),
    btnResetKeywords: document.getElementById('btn-reset-keywords'),

    // Header & Theme
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    btnLockStatus: document.getElementById('btn-lock-status'),
    lockIcon: document.getElementById('lock-icon'),
    lockStatusText: document.getElementById('lock-status-text'),
    btnOpenSettings: document.getElementById('btn-open-settings'),

    // Settings Modal
    modalSettings: document.getElementById('modal-settings'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    authLockSection: document.getElementById('auth-lock-section'),
    settingsContentSection: document.getElementById('settings-content-section'),
    inputPin: document.getElementById('input-pin'),
    btnUnlockPin: document.getElementById('btn-unlock-pin'),
    pinErrorMsg: document.getElementById('pin-error-msg'),
    inputAppsScriptUrl: document.getElementById('input-apps-script-url'),
    inputCustomPin: document.getElementById('input-custom-pin'),
    btnSaveSettings: document.getElementById('btn-save-settings'),

    // Add Keyword Modal
    modalAddKeyword: document.getElementById('modal-add-keyword'),
    btnCloseAddKeyword: document.getElementById('btn-close-add-keyword'),
    btnCancelAddKeyword: document.getElementById('btn-cancel-add-keyword'),
    btnSubmitAddKeyword: document.getElementById('btn-submit-add-keyword'),
    inputNewKeywordText: document.getElementById('input-new-keyword-text'),
    selectNewKeywordCategory: document.getElementById('select-new-keyword-category'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // --- Initialize App ---
  function init() {
    loadState();
    setupEventListeners();
    updateThemeUI();
    renderKeywords();
    updateSignaturePreview();
    analyzeContent();
  }

  // --- State & LocalStorage Management ---
  function loadState() {
    try {
      const savedState = localStorage.getItem('nokib_keyword_check_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        state.keywords = parsed.keywords && parsed.keywords.length > 0 ? parsed.keywords : DEFAULT_KEYWORDS;
        state.theme = parsed.theme || 'dark';
        state.pin = parsed.pin || '6746';
        state.appsScriptUrl = parsed.appsScriptUrl || '';
        state.client = parsed.client || 'ClientA';
        state.profile = parsed.profile || 'Nokib_fiverr';
        state.action = parsed.action || 'update';
        state.appendSignature = parsed.appendSignature !== undefined ? parsed.appendSignature : true;
      } else {
        state.keywords = [...DEFAULT_KEYWORDS];
      }
    } catch (e) {
      console.warn('Could not load saved state:', e);
      state.keywords = [...DEFAULT_KEYWORDS];
    }

    DOM.inputClientId.value = state.client;
    DOM.inputProfileName.value = state.profile;
    DOM.selectActionType.value = state.action;
    DOM.toggleSignature.checked = state.appendSignature;
    DOM.inputAppsScriptUrl.value = state.appsScriptUrl;
  }

  function saveState() {
    try {
      localStorage.setItem('nokib_keyword_check_state', JSON.stringify({
        keywords: state.keywords,
        theme: state.theme,
        pin: state.pin,
        appsScriptUrl: state.appsScriptUrl,
        client: state.client,
        profile: state.profile,
        action: state.action,
        appendSignature: state.appendSignature
      }));
    } catch (e) {
      console.warn('Could not save state:', e);
    }
  }

  // --- Theme Handler ---
  function updateThemeUI() {
    document.documentElement.setAttribute('data-theme', state.theme);
    if (state.theme === 'dark') {
      DOM.themeIcon.className = 'fa-solid fa-sun';
      DOM.btnThemeToggle.title = 'Switch to Light Mode';
    } else {
      DOM.themeIcon.className = 'fa-solid fa-moon';
      DOM.btnThemeToggle.title = 'Switch to Dark Mode';
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    updateThemeUI();
    saveState();
    showToast(`Switched to ${state.theme} theme`, 'success');
  }

  // --- Authentication Lock ---
  function updateLockUI() {
    if (state.isUnlocked) {
      DOM.btnLockStatus.className = 'btn-glass lock-badge unlocked';
      DOM.lockIcon.className = 'fa-solid fa-lock-open';
      DOM.lockStatusText.textContent = 'Unlocked';
      DOM.authLockSection.classList.add('hidden');
      DOM.settingsContentSection.classList.remove('hidden');
    } else {
      DOM.btnLockStatus.className = 'btn-glass lock-badge locked';
      DOM.lockIcon.className = 'fa-solid fa-lock';
      DOM.lockStatusText.textContent = 'Protected';
      DOM.authLockSection.classList.remove('hidden');
      DOM.settingsContentSection.classList.add('hidden');
    }
  }

  function checkPin(pinInput) {
    if (pinInput.trim() === state.pin) {
      state.isUnlocked = true;
      updateLockUI();
      DOM.pinErrorMsg.classList.add('hidden');
      DOM.inputPin.value = '';
      showToast('Admin section unlocked!', 'success');
      return true;
    } else {
      DOM.pinErrorMsg.classList.remove('hidden');
      showToast('Invalid Security PIN', 'danger');
      return false;
    }
  }

  // --- Obfuscation Engine ---
  function obfuscateTerm(word) {
    if (word.length <= 2) return word;
    if (word === '@') return '(at)';
    if (word.includes(' ')) {
      // Multi-word term like "pay outside" -> "pay out-side"
      const parts = word.split(' ');
      return parts.map(p => obfuscateTerm(p)).join(' ');
    }
    const mid = Math.floor(word.length / 2);
    return word.substring(0, mid) + '-' + word.substring(mid);
  }

  // --- Content Analysis ---
  function analyzeContent() {
    const text = DOM.inputText.value;
    
    // Stats calculation
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    DOM.valWords.textContent = words.toLocaleString();
    DOM.valChars.textContent = chars.toLocaleString();

    // 1. Check Banned Keywords
    const foundViolations = [];
    const lowerText = text.toLowerCase();

    state.keywords.forEach(kw => {
      const term = kw.text.toLowerCase();
      if (!term) return;

      let matches = 0;
      if (term === '@') {
        matches = (lowerText.match(/@/g) || []).length;
      } else {
        // Escaped regex search
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        const found = lowerText.match(regex);
        matches = found ? found.length : 0;
      }

      if (matches > 0) {
        foundViolations.push({
          term: kw.text,
          category: kw.category || 'general',
          count: matches,
          obfuscated: obfuscateTerm(kw.text)
        });
      }
    });

    const totalViolationsCount = foundViolations.reduce((sum, v) => sum + v.count, 0);
    DOM.valBanned.textContent = totalViolationsCount;
    DOM.badgeViolationsCount.textContent = totalViolationsCount;

    if (totalViolationsCount > 0) {
      DOM.cardBanned.classList.add('alert-active');
      DOM.statusBanned.textContent = `${totalViolationsCount} terms violate Fiverr policy!`;
      DOM.statusBanned.style.color = 'var(--danger)';
    } else {
      DOM.cardBanned.classList.remove('alert-active');
      DOM.statusBanned.textContent = 'No compliance risk detected';
      DOM.statusBanned.style.color = 'var(--text-muted)';
    }

    renderViolationsList(foundViolations);

    // 2. Check Grammar & Style Issues
    const grammarIssues = [];
    if (text.length > 0) {
      // Double spaces
      const doubleSpaces = (text.match(/ {2,}/g) || []).length;
      if (doubleSpaces > 0) {
        grammarIssues.push({
          type: 'Consecutive Spaces',
          desc: `Found ${doubleSpaces} instances of extra spaces between words.`,
          fix: 'Combine multiple spaces into single spaces.'
        });
      }

      // Space before punctuation
      const spacePunct = (text.match(/\s+[,.!?;:]/g) || []).length;
      if (spacePunct > 0) {
        grammarIssues.push({
          type: 'Punctuation Spacing',
          desc: `Found ${spacePunct} space(s) placed right before punctuation marks.`,
          fix: 'Remove spaces before punctuation marks.'
        });
      }

      // Repeated words
      const repeated = (text.match(/\b(\w+)\s+\1\b/gi) || []).length;
      if (repeated > 0) {
        grammarIssues.push({
          type: 'Repeated Words',
          desc: `Found ${repeated} duplicate consecutive word(s) (e.g., "the the").`,
          fix: 'Remove duplicate repeated word.'
        });
      }

      // Missing end period
      const trimmed = text.trim();
      if (trimmed.length > 0 && !/[.!?]$/.test(trimmed)) {
        grammarIssues.push({
          type: 'Missing Sentence End',
          desc: 'Text does not end with standard sentence punctuation (., !, or ?).',
          fix: 'Append a period at the end.'
        });
      }
    }

    DOM.valGrammar.textContent = grammarIssues.length;
    DOM.badgeGrammarCount.textContent = grammarIssues.length;
    renderGrammarList(grammarIssues);
  }

  // --- Render Violations List ---
  function renderViolationsList(violations) {
    if (violations.length === 0) {
      DOM.violationsListEmpty.classList.remove('hidden');
      DOM.violationsList.classList.add('hidden');
      DOM.violationsList.innerHTML = '';
      return;
    }

    DOM.violationsListEmpty.classList.add('hidden');
    DOM.violationsList.classList.remove('hidden');

    DOM.violationsList.innerHTML = violations.map(v => `
      <div class="violation-card">
        <div class="violation-info">
          <div class="violation-term">
            <i class="fa-solid fa-triangle-exclamation"></i> "${escapeHtml(v.term)}"
            <span class="badge-tag">${v.count} match${v.count > 1 ? 'es' : ''}</span>
          </div>
          <div class="violation-reason">
            Violates platform terms. Recommended rewrite: <strong>${escapeHtml(v.obfuscated)}</strong>
          </div>
        </div>
        <button class="btn-secondary btn-xs btn-quick-fix" data-term="${escapeHtml(v.term)}" data-obf="${escapeHtml(v.obfuscated)}">
          <i class="fa-solid fa-wand-magic"></i> Auto-Fix Term
        </button>
      </div>
    `).join('');

    // Attach listeners to quick-fix buttons
    DOM.violationsList.querySelectorAll('.btn-quick-fix').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const term = e.currentTarget.getAttribute('data-term');
        const obf = e.currentTarget.getAttribute('data-obf');
        replaceSingleTerm(term, obf);
      });
    });
  }

  function replaceSingleTerm(term, replacement) {
    let text = DOM.inputText.value;
    if (term === '@') {
      text = text.replace(/@/g, replacement);
    } else {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      text = text.replace(regex, replacement);
    }
    DOM.inputText.value = text;
    analyzeContent();
    showToast(`Replaced "${term}" with "${replacement}"`, 'success');
  }

  // --- Render Grammar List ---
  function renderGrammarList(issues) {
    if (issues.length === 0) {
      DOM.grammarListEmpty.classList.remove('hidden');
      DOM.grammarList.classList.add('hidden');
      DOM.grammarList.innerHTML = '';
      return;
    }

    DOM.grammarListEmpty.classList.add('hidden');
    DOM.grammarList.classList.remove('hidden');

    DOM.grammarList.innerHTML = issues.map(issue => `
      <div class="grammar-card">
        <div class="grammar-info">
          <div class="grammar-type">
            <i class="fa-solid fa-circle-info"></i> ${escapeHtml(issue.type)}
          </div>
          <div class="grammar-desc">${escapeHtml(issue.desc)}</div>
        </div>
      </div>
    `).join('');
  }

  // --- Fix & Rewrite Logic ---
  function fixAndRewriteText() {
    let text = DOM.inputText.value;
    if (!text.trim()) {
      showToast('Please enter or paste text to fix.', 'warning');
      return;
    }

    // 1. Obfuscate all forbidden terms
    state.keywords.forEach(kw => {
      const term = kw.text;
      if (!term) return;
      const obf = obfuscateTerm(term);
      if (term === '@') {
        text = text.replace(/@/g, obf);
      } else {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        text = text.replace(regex, obf);
      }
    });

    // 2. Fix Grammar Issues
    // Fix multiple spaces
    text = text.replace(/ {2,}/g, ' ');
    // Fix spaces before punctuation
    text = text.replace(/\s+([,.!?;:])(?=\s|$)/g, '$1');
    // Fix repeated words
    text = text.replace(/\b(\w+)\s+\1\b/gi, '$1');
    // Ensure sentence ending punctuation
    text = text.trim();
    if (text.length > 0 && !/[.!?]$/.test(text)) {
      text += '.';
    }

    // 3. Append Signature if enabled
    if (state.appendSignature) {
      const sig = buildSignatureString();
      if (!text.includes(sig)) {
        text += `\n\n${sig}`;
      }
    }

    DOM.inputText.value = text;
    DOM.sanitizedOutputText.textContent = text;
    analyzeContent();
    showToast('Text successfully fixed & sanitized!', 'success');

    // Switch active tab to Sanitized Output
    switchTab('tab-sanitized');
  }

  // --- Signature Builder ---
  function buildSignatureString() {
    const c = DOM.inputClientId.value.trim() || 'ClientA';
    const p = DOM.inputProfileName.value.trim() || 'Nokib_fiverr';
    const a = DOM.selectActionType.value || 'update';
    return `[${c}] // [${p}] // [${a}]`;
  }

  function updateSignaturePreview() {
    DOM.previewSignatureText.textContent = buildSignatureString();
    state.client = DOM.inputClientId.value.trim();
    state.profile = DOM.inputProfileName.value.trim();
    state.action = DOM.selectActionType.value;
    state.appendSignature = DOM.toggleSignature.checked;
    saveState();
  }

  function appendSignatureToEditor() {
    const sig = buildSignatureString();
    let text = DOM.inputText.value;
    if (!text.includes(sig)) {
      DOM.inputText.value = text ? `${text.trim()}\n\n${sig}` : sig;
      analyzeContent();
      showToast('Signature appended to text', 'success');
    } else {
      showToast('Signature is already in the text', 'warning');
    }
  }

  // --- Tab Switching ---
  function switchTab(tabId) {
    DOM.tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    DOM.tabPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  }

  // --- Keywords Rendering & Management ---
  function renderKeywords() {
    let filtered = state.keywords;

    // Filter by category
    if (state.currentCategoryFilter !== 'all') {
      filtered = filtered.filter(k => (k.category || 'general') === state.currentCategoryFilter);
    }

    // Filter by search query
    if (state.searchFilter.trim()) {
      const q = state.searchFilter.toLowerCase().trim();
      filtered = filtered.filter(k => k.text.toLowerCase().includes(q));
    }

    DOM.totalKeywordsCount.textContent = `${state.keywords.length} Keywords Active`;

    if (filtered.length === 0) {
      DOM.keywordsContainer.innerHTML = `<div class="empty-state" style="padding: 1.5rem;"><p>No keywords match your search query.</p></div>`;
      return;
    }

    DOM.keywordsContainer.innerHTML = filtered.map(k => `
      <div class="keyword-tag">
        <span>${escapeHtml(k.text)}</span>
        <i class="fa-solid fa-xmark remove-btn" data-text="${escapeHtml(k.text)}" title="Delete term"></i>
      </div>
    `).join('');

    // Attach click handlers to delete buttons
    DOM.keywordsContainer.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const textToRemove = e.target.getAttribute('data-text');
        removeKeyword(textToRemove);
      });
    });
  }

  function addKeyword(term, category) {
    if (!term.trim()) return;
    const cleanTerm = term.trim().toLowerCase();

    if (state.keywords.some(k => k.text.toLowerCase() === cleanTerm)) {
      showToast(`"${cleanTerm}" is already in the forbidden keyword library.`, 'warning');
      return;
    }

    state.keywords.push({
      text: cleanTerm,
      category: category || 'general'
    });

    saveState();
    renderKeywords();
    analyzeContent();
    showToast(`Added "${cleanTerm}" to forbidden keywords!`, 'success');
  }

  function removeKeyword(term) {
    if (!state.isUnlocked) {
      // Prompt user to unlock first
      DOM.modalSettings.classList.remove('hidden');
      updateLockUI();
      showToast('Please enter Security PIN to modify keywords.', 'warning');
      return;
    }

    state.keywords = state.keywords.filter(k => k.text.toLowerCase() !== term.toLowerCase());
    saveState();
    renderKeywords();
    analyzeContent();
    showToast(`Removed "${term}" from library.`, 'success');
  }

  function resetDefaultKeywords() {
    if (!state.isUnlocked) {
      DOM.modalSettings.classList.remove('hidden');
      updateLockUI();
      showToast('Please enter Security PIN to reset defaults.', 'warning');
      return;
    }

    state.keywords = [...DEFAULT_KEYWORDS];
    saveState();
    renderKeywords();
    analyzeContent();
    showToast('Reset library to default 33 keywords!', 'success');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Theme toggle
    DOM.btnThemeToggle.addEventListener('click', toggleTheme);

    // Live Text Input Analysis
    DOM.inputText.addEventListener('input', analyzeContent);

    // Editor Actions
    DOM.btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        DOM.inputText.value = text;
        analyzeContent();
        showToast('Pasted text from clipboard!', 'success');
      } catch (err) {
        showToast('Clipboard access denied. Use Ctrl+V instead.', 'warning');
      }
    });

    DOM.btnClear.addEventListener('click', () => {
      DOM.inputText.value = '';
      DOM.sanitizedOutputText.textContent = 'Text will appear here after clicking "Fix & Rewrite"...';
      analyzeContent();
      showToast('Editor cleared', 'success');
    });

    DOM.btnFixRewrite.addEventListener('click', fixAndRewriteText);

    DOM.btnCopyOutput.addEventListener('click', () => {
      copyToClipboard(DOM.inputText.value, 'Editor content copied to clipboard!');
    });

    DOM.btnCopySanitized.addEventListener('click', () => {
      copyToClipboard(DOM.sanitizedOutputText.textContent, 'Sanitized text copied to clipboard!');
    });

    // Signature Inputs
    [DOM.inputClientId, DOM.inputProfileName, DOM.selectActionType, DOM.toggleSignature].forEach(el => {
      el.addEventListener('change', updateSignaturePreview);
      el.addEventListener('keyup', updateSignaturePreview);
    });

    DOM.btnAppendSignature.addEventListener('click', appendSignatureToEditor);

    // Tabs
    DOM.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
      });
    });

    // Keywords Filtering
    DOM.searchKeywords.addEventListener('input', (e) => {
      state.searchFilter = e.target.value;
      renderKeywords();
    });

    DOM.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentCategoryFilter = btn.getAttribute('data-category');
        renderKeywords();
      });
    });

    DOM.btnResetKeywords.addEventListener('click', resetDefaultKeywords);

    // Settings Modal & Authentication
    DOM.btnLockStatus.addEventListener('click', () => {
      DOM.modalSettings.classList.remove('hidden');
      updateLockUI();
    });

    DOM.btnOpenSettings.addEventListener('click', () => {
      DOM.modalSettings.classList.remove('hidden');
      updateLockUI();
    });

    DOM.btnCloseSettings.addEventListener('click', () => {
      DOM.modalSettings.classList.add('hidden');
    });

    DOM.btnUnlockPin.addEventListener('click', () => {
      checkPin(DOM.inputPin.value);
    });

    DOM.inputPin.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') checkPin(DOM.inputPin.value);
    });

    DOM.btnSaveSettings.addEventListener('click', () => {
      state.appsScriptUrl = DOM.inputAppsScriptUrl.value.trim();
      if (DOM.inputCustomPin.value.trim()) {
        state.pin = DOM.inputCustomPin.value.trim();
        DOM.inputCustomPin.value = '';
      }
      saveState();
      DOM.modalSettings.classList.add('hidden');
      showToast('Settings saved successfully!', 'success');
    });

    // Add Keyword Modal
    DOM.btnAddKeywordModal.addEventListener('click', () => {
      if (!state.isUnlocked) {
        DOM.modalSettings.classList.remove('hidden');
        updateLockUI();
        showToast('Please enter Security PIN to add new keywords.', 'warning');
        return;
      }
      DOM.modalAddKeyword.classList.remove('hidden');
    });

    DOM.btnCloseAddKeyword.addEventListener('click', () => {
      DOM.modalAddKeyword.classList.add('hidden');
    });

    DOM.btnCancelAddKeyword.addEventListener('click', () => {
      DOM.modalAddKeyword.classList.add('hidden');
    });

    DOM.btnSubmitAddKeyword.addEventListener('click', () => {
      const term = DOM.inputNewKeywordText.value;
      const cat = DOM.selectNewKeywordCategory.value;
      if (term) {
        addKeyword(term, cat);
        DOM.inputNewKeywordText.value = '';
        DOM.modalAddKeyword.classList.add('hidden');
      } else {
        showToast('Please enter a keyword term.', 'warning');
      }
    });

    // Modal Background Click Closes Modal
    [DOM.modalSettings, DOM.modalAddKeyword].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });
  }

  // --- Utility Functions ---
  function copyToClipboard(text, successMessage) {
    if (!text || text.trim() === '' || text.includes('Text will appear here')) {
      showToast('Nothing to copy!', 'warning');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage, 'success');
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'danger');
    });
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'warning') iconClass = 'fa-solid fa-circle-exclamation';
    if (type === 'danger') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `<i class="${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run app on DOMReady
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
