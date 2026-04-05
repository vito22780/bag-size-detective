// Content script: scans the page for bag/luggage dimensions

(function () {
  if (window.__bagSizeDetectiveLoaded) return;
  window.__bagSizeDetectiveLoaded = true;

  const CM_PER_INCH = 2.54;

  /**
   * Attempt to extract bag dimensions from the current page.
   * Returns an array of detected dimension objects:
   * { l, w, h, unit: 'cm'|'in', source: 'text snippet' }
   */
  function scanPageForDimensions() {
    const results = [];
    const bodyText = document.body.innerText;

    // Common dimension patterns:
    // "56 x 36 x 23 cm", "22 x 14 x 9 in", "56x36x23cm"
    // "56 × 36 × 23 cm", with various spacing
    // Also handle: L x W x H patterns with labels
    const dimPatterns = [
      // 3-number pattern with unit: 56 x 36 x 23 cm
      /(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)\s*(cm|centimeters?|mm|millimeters?|in|inch|inches|"|″|''')/gi,
      // Pattern with unit before: cm: 56 x 36 x 23
      /(cm|centimeters?|mm|millimeters?|in|inch|inches)\s*[:\s]\s*(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)/gi,
      // L x W x H with individual units: 22in x 14in x 9in
      /(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|"|″|''')\s*[x×X]\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|"|″|''')\s*[x×X]\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|"|″|''')/gi,
    ];

    // Pattern 1: number x number x number unit
    const p1 = /(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)\s*(cm|centimeters?|mm|millimeters?|in|inch|inches|"|″|''')/gi;
    let match;
    while ((match = p1.exec(bodyText)) !== null) {
      const nums = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
      const unitRaw = match[4].toLowerCase();
      let unit = 'cm';
      let multiplier = 1;
      if (unitRaw.startsWith('in') || unitRaw === '"' || unitRaw === '″' || unitRaw === "''") {
        unit = 'in';
      } else if (unitRaw.startsWith('mm') || unitRaw === 'millimeters' || unitRaw === 'millimeter') {
        unit = 'cm';
        multiplier = 0.1; // convert mm to cm
      }
      // Sort descending to normalize as L >= W >= H
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
    while ((match = p2.exec(bodyText)) !== null) {
      // Use first unit as the standard
      const unitRaw = match[2].toLowerCase();
      const unit = (unitRaw.startsWith('in') || unitRaw === '"' || unitRaw === '″' || unitRaw === "''") ? 'in' : 'cm';
      const nums = [parseFloat(match[1]), parseFloat(match[3]), parseFloat(match[5])];
      nums.sort((a, b) => b - a);
      // Check if this is a duplicate of p1 results
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

    // Also try to find dimensions from structured data (JSON-LD)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
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
    // Look for Product schema with dimensions
    if (data['@type'] === 'Product' || data['@type'] === 'IndividualProduct') {
      const dims = data.depth || data.width || data.height;
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
    return true; // keep channel open for async response
  });
})();
