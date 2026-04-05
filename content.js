// Content script: scans the page for bag/luggage dimensions

(function () {
  if (window.__bagSizeDetectiveLoaded) return;
  window.__bagSizeDetectiveLoaded = true;

  const CM_PER_INCH = 2.54;

  /**
   * Collect all text content from the page, including hidden sources
   * that innerText would miss:
   * - <select> / <option> elements (dropdown menus)
   * - data- attributes that store dimension info
   * - title / aria-label attributes
   * - hidden elements with product specs
   * - <noscript> content
   */
  function collectAllText() {
    const parts = [];

    // 1. Visible page text
    parts.push(document.body.innerText);

    // 2. All <option> text inside <select> dropdowns
    document.querySelectorAll('select option').forEach(opt => {
      if (opt.textContent.trim()) parts.push(opt.textContent);
      if (opt.value && opt.value !== opt.textContent.trim()) parts.push(opt.value);
    });

    // 3. All data- attributes that may contain dimensions
    //    Common patterns: data-size, data-dimensions, data-variant, data-option,
    //    data-value, data-description, data-specs, data-product-*
    const dataAttrPatterns = [
      'data-size', 'data-dimensions', 'data-dimension', 'data-variant',
      'data-option', 'data-value', 'data-description', 'data-specs',
      'data-product-name', 'data-product-title', 'data-name', 'data-content',
      'data-original-title'
    ];
    document.querySelectorAll('*').forEach(el => {
      // Check specific known attributes
      dataAttrPatterns.forEach(attr => {
        const val = el.getAttribute(attr);
        if (val) parts.push(val);
      });
      // Check all data-* attributes for dimension patterns (lightweight regex)
      for (const attr of el.attributes || []) {
        if (attr.name.startsWith('data-') && /\d+\s*[x×]\s*\d+/.test(attr.value)) {
          parts.push(attr.value);
        }
      }
    });

    // 4. title and aria-label attributes
    document.querySelectorAll('[title], [aria-label]').forEach(el => {
      if (el.title) parts.push(el.title);
      if (el.ariaLabel) parts.push(el.ariaLabel);
    });

    // 5. <noscript> content
    document.querySelectorAll('noscript').forEach(el => {
      parts.push(el.textContent);
    });

    // 6. Hidden spec tables / divs that are display:none
    //    (product pages often hide specs in tabs or accordion panels)
    document.querySelectorAll(
      '.product-specs, .specifications, .spec-table, ' +
      '.product-details, .product-description, .tab-pane, ' +
      '.accordion-content, .panel-body, .collapse, ' +
      '[class*="spec"], [class*="detail"], [class*="dimension"], ' +
      '[id*="spec"], [id*="detail"], [id*="dimension"]'
    ).forEach(el => {
      // Use textContent to get text even from hidden elements
      if (el.textContent.trim()) parts.push(el.textContent);
    });

    // 7. Variant / swatch selectors (common on e-commerce sites)
    //    Buttons or labels that hold size variant names like "Medium - 46x30x15cm"
    document.querySelectorAll(
      '.variant-option, .swatch-option, .size-option, ' +
      '[class*="variant"], [class*="swatch"], [class*="size-select"], ' +
      'label[for*="size"], label[for*="variant"], ' +
      'button[data-variant], button[data-option]'
    ).forEach(el => {
      parts.push(el.textContent);
      // Also check value attributes on associated inputs
      const forId = el.getAttribute('for');
      if (forId) {
        const input = document.getElementById(forId);
        if (input && input.value) parts.push(input.value);
      }
    });

    // 8. Custom dropdown components (non-native <select>)
    //    Many sites use div-based dropdowns with role="listbox" or role="option"
    document.querySelectorAll(
      '[role="listbox"] [role="option"], ' +
      '[role="combobox"], ' +
      '.dropdown-item, .dropdown-menu li, ' +
      '.custom-select-option, ' +
      '[class*="dropdown"] li, [class*="dropdown"] a, ' +
      '[class*="listbox"] [class*="option"]'
    ).forEach(el => {
      if (el.textContent.trim()) parts.push(el.textContent);
    });

    return parts.join('\n');
  }

  /**
   * Parse a unit string into a normalized unit and multiplier.
   */
  function parseUnit(unitRaw) {
    const u = unitRaw.toLowerCase().trim();
    if (u.startsWith('in') || u === '"' || u === '″' || u === "''") {
      return { unit: 'in', multiplier: 1 };
    }
    if (u.startsWith('mm') || u === 'millimeter' || u === 'millimeters') {
      return { unit: 'cm', multiplier: 0.1 };
    }
    return { unit: 'cm', multiplier: 1 };
  }

  /**
   * Run dimension regex patterns against a text string.
   */
  function extractDimensionsFromText(text, results) {
    // Pattern 1: number x number x number unit
    const p1 = /(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)\s*(cm|centimeters?|mm|millimeters?|in|inch|inches|"|″|''')/gi;
    let match;
    while ((match = p1.exec(text)) !== null) {
      const nums = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
      const { unit, multiplier } = parseUnit(match[4]);
      nums.sort((a, b) => b - a);
      results.push({
        l: Math.round(nums[0] * multiplier * 100) / 100,
        w: Math.round(nums[1] * multiplier * 100) / 100,
        h: Math.round(nums[2] * multiplier * 100) / 100,
        unit,
        source: match[0].trim(),
      });
    }

    // Pattern 2: individual units per number like 22in x 14in x 9in
    const p2 = /(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|"|″|''')\s*[x×X]\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|"|″|''')\s*[x×X]\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|"|″|''')/gi;
    while ((match = p2.exec(text)) !== null) {
      const { unit } = parseUnit(match[2]);
      const nums = [parseFloat(match[1]), parseFloat(match[3]), parseFloat(match[5])];
      nums.sort((a, b) => b - a);
      const isDuplicate = results.some(r =>
        r.l === nums[0] && r.w === nums[1] && r.h === nums[2] && r.unit === unit
      );
      if (!isDuplicate) {
        results.push({
          l: nums[0], w: nums[1], h: nums[2], unit,
          source: match[0].trim(),
        });
      }
    }

    // Pattern 3: labeled dimensions like "Height: 56cm, Width: 36cm, Depth: 23cm"
    //            or "L: 22" W: 14" H: 9""
    const labelPattern = /(?:length|height|depth|width|long|tall|wide|deep|L|W|H|D)\s*[:\s]\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|mm|"|″|''')?/gi;
    const labelMatches = [];
    while ((match = labelPattern.exec(text)) !== null) {
      labelMatches.push({
        value: parseFloat(match[1]),
        unitRaw: match[2] || '',
        pos: match.index,
      });
    }
    // If we found exactly 3 labeled dimensions near each other, treat as a set
    if (labelMatches.length >= 3) {
      for (let i = 0; i <= labelMatches.length - 3; i++) {
        const group = labelMatches.slice(i, i + 3);
        const span = group[2].pos - group[0].pos;
        // Only group if within 200 chars of each other
        if (span < 200) {
          const unitStr = group.find(g => g.unitRaw)?.unitRaw || 'cm';
          const { unit, multiplier } = parseUnit(unitStr);
          const nums = group.map(g => Math.round(g.value * multiplier * 100) / 100);
          nums.sort((a, b) => b - a);
          const isDuplicate = results.some(r =>
            r.l === nums[0] && r.w === nums[1] && r.h === nums[2] && r.unit === unit
          );
          if (!isDuplicate) {
            results.push({
              l: nums[0], w: nums[1], h: nums[2], unit,
              source: `Labeled: ${nums.join(' x ')} ${unit}`,
            });
          }
        }
      }
    }
  }

  /**
   * Main scan function. Collects text from all page sources and extracts dimensions.
   */
  function scanPageForDimensions() {
    const results = [];

    // Collect text from all sources (including dropdowns, hidden elements, etc.)
    const allText = collectAllText();
    extractDimensionsFromText(allText, results);

    // Also try JSON-LD structured data
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        extractFromJsonLd(data, results);
      } catch (e) { /* ignore parse errors */ }
    });

    // Try meta tags for product dimensions
    const metaDims = extractFromMetaTags();
    if (metaDims) {
      const isDuplicate = results.some(r =>
        r.l === metaDims.l && r.w === metaDims.w && r.h === metaDims.h
      );
      if (!isDuplicate) results.push(metaDims);
    }

    return deduplicateResults(results);
  }

  function extractFromJsonLd(data, results) {
    if (!data) return;
    if (Array.isArray(data)) {
      data.forEach(item => extractFromJsonLd(item, results));
      return;
    }
    if (data['@type'] === 'Product' || data['@type'] === 'IndividualProduct') {
      if (data.depth && data.width && data.height) {
        const unit = (data.depth.unitCode === 'CMT' || data.depth.unitText === 'cm') ? 'cm' : 'in';
        const nums = [
          parseFloat(data.depth.value || data.depth),
          parseFloat(data.width.value || data.width),
          parseFloat(data.height.value || data.height),
        ].filter(n => !isNaN(n));
        if (nums.length === 3) {
          nums.sort((a, b) => b - a);
          results.push({ l: nums[0], w: nums[1], h: nums[2], unit, source: 'JSON-LD structured data' });
        }
      }
    }
    // Recurse into nested objects
    for (const key of Object.keys(data)) {
      if (typeof data[key] === 'object' && data[key] !== null) {
        extractFromJsonLd(data[key], results);
      }
    }
  }

  function extractFromMetaTags() {
    const getProp = (name) => {
      const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
      return el ? parseFloat(el.content) : null;
    };
    const l = getProp('product:length') || getProp('og:product:length');
    const w = getProp('product:width') || getProp('og:product:width');
    const h = getProp('product:height') || getProp('og:product:height');
    if (l && w && h) {
      const nums = [l, w, h].sort((a, b) => b - a);
      return { l: nums[0], w: nums[1], h: nums[2], unit: 'cm', source: 'Meta tags' };
    }
    return null;
  }

  function deduplicateResults(results) {
    const seen = new Set();
    return results.filter(r => {
      const key = `${r.l}-${r.w}-${r.h}-${r.unit}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanPage') {
      const dimensions = scanPageForDimensions();
      sendResponse({ dimensions });
    }
    return true;
  });
})();
