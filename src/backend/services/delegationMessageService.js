/**
 * Delegation Message Generation Service
 *
 * Per MESSAGE_TEMPLATES.md:
 * - Server-side generation ensures anti-spoofing
 * - Preamble is sanitized (strip URLs, phone numbers, RTL chars, homoglyphs)
 * - Template chosen by merchant data tier (T1-T4, where T4 is low-trust warning overlay)
 * - System block is tamper-proof, generated server-side
 */

/**
 * Sanitize preamble to prevent spoofing
 * Per MESSAGE_TEMPLATES.md Anti-spoofing section
 */
function sanitizePreamble(text) {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // Strip all URLs (http://, https://, www., etc.)
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '');
  sanitized = sanitized.replace(/www\.[^\s]+/g, '');

  // Strip phone-number-shaped strings (10-digit, +91, etc.)
  sanitized = sanitized.replace(/\+?91[-.\s]?\d{10}/g, '');
  sanitized = sanitized.replace(/\b\d{10}\b/g, '');

  // Strip Unicode bidirectional override characters (U+202A–U+202E, U+2066–U+2069)
  sanitized = sanitized.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');

  // Strip homoglyphs for "Razorpay" (basic check for common variations)
  // This is a simplified version; in production would be more comprehensive
  sanitized = sanitized.replace(/[Rr][aÐ@][z2][oØ][r][pP][aÐ@][y¥]/g, '');

  // Trim and cap at 140 chars
  sanitized = sanitized.trim().substring(0, 140);

  return sanitized;
}

/**
 * Format amount in rupees with comma formatting
 */
function formatAmount(paise) {
  const rupees = Math.floor(paise / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Format expiry timestamp for display (inferred timezone from country code)
 * For now, returns UTC with "UTC" suffix. In production, would infer from approver phone country code
 */
function formatExpiry(expiresAt) {
  const date = new Date(expiresAt);
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  }) + ' UTC';
}

/**
 * Pick template based on merchant data tier
 * Per MESSAGE_TEMPLATES.md pickTemplate pseudocode
 *
 * Returns template type: 'T1' | 'T2' | 'T3' | 'T4' (where T4 = low-trust warning overlay)
 * v1 only supports Razorpay merchants; no non-Razorpay VPA support.
 */
function pickTemplate(merchantDataTier) {
  // Tier selection is done at delegation creation time
  // based on merchant's actual data availability
  return merchantDataTier;  // T1|T2|T3|T4 (T4 is warning overlay)
}

/**
 * Generate system block (non-editable, tamper-proof portion)
 *
 * Per MESSAGE_TEMPLATES.md §2 System block:
 * - Always present, always same structure
 * - Verification mark: " ✓ Verified" if merchant KYC complete, else nothing
 * - Context line: present only when we have tier-appropriate data
 * - URL: always rzp.io/r/{delegation_id}
 * - Expiry: in approver's inferred timezone
 */
function generateSystemBlock(delegation, order, merchant, requesterName = null) {
  const template = pickTemplate(delegation.trust_tier);
  let block = '';

  // v1 only supports Razorpay merchants (T1-T4 where T4 is warning overlay)
  block += 'Razorpay payment request\n';
  block += `Amount: ${formatAmount(order.amount)}\n`;
  block += `Merchant: ${merchant.name}`;
  if (merchant.kyc_status === 'kyc_approved') {
    block += ' ✓ Verified';
  }
  block += '\n';

  // Context line by tier
  if (template === 'T1' && order.line_items && order.line_items.length > 0) {
    // T1: Item summary
    const firstItem = order.line_items[0];
    const itemName = firstItem.description || firstItem.name || 'Item';
    const summary = itemName.substring(0, 40);
    const suffix = order.line_items.length > 1 ? ` +${order.line_items.length - 1} more` : '';
    block += `For: ${summary}${suffix}\n`;
  } else if (template === 'T2' && merchant.mcc_label) {
    // T2: Category
    block += `Category: ${merchant.mcc_label}\n`;
  }
  // T3/T4: No context line, just amount and merchant

  // URL and expiry (same for all tiers)
  block += `Approve: rzp.io/r/${delegation.id}\n`;
  block += `Expires: ${formatExpiry(delegation.expires_at)}`;

  // v1 design: no requester signature in the system block.
  // The WhatsApp/SMS delivery channel already carries the requester's identity
  // (saved contact name on the approver's phone). Adding a separate name inside
  // the Razorpay-rendered block is redundant at best and fabricated at worst
  // (the name is user-declared and not cryptographically bound to the requester).

  return block;
}

/**
 * Generate complete outgoing message
 *
 * Returns object with:
 * - message: complete SMS/WhatsApp text
 * - preview: what will display in WhatsApp card
 * - template: which template was used (T1-T4, where T4 is warning overlay)
 */
function generateMessage(delegation, order, merchant, requesterName = null) {
  const sanitized = sanitizePreamble(delegation.preamble_text);
  const systemBlock = generateSystemBlock(delegation, order, merchant, requesterName);
  const template = pickTemplate(delegation.trust_tier);

  // Build complete message: preamble + hard separator + system block
  let message = '';
  if (sanitized) {
    message = sanitized + '\n\n' + systemBlock;
  } else {
    message = systemBlock;
  }

  return {
    message,
    preamble: sanitized,
    system_block: systemBlock,
    template,
    preview: {
      title: `Payment request • ${formatAmount(order.amount)} • ${merchant.name}`,
      description: `Expires ${formatExpiry(delegation.expires_at)}`,
      amount: formatAmount(order.amount),
      merchant_name: merchant.name,
      merchant_verified: merchant.kyc_status === 'kyc_approved'
    }
  };
}

/**
 * Validate preamble text
 * Returns { valid: boolean, error?: string }
 */
function validatePreamble(text) {
  if (!text) return { valid: true };
  if (typeof text !== 'string') {
    return { valid: false, error: 'Preamble must be a string' };
  }
  if (text.length > 140) {
    return { valid: false, error: 'Preamble must be 140 characters or less' };
  }
  return { valid: true };
}

module.exports = {
  generateMessage,
  generateSystemBlock,
  sanitizePreamble,
  formatAmount,
  formatExpiry,
  pickTemplate,
  validatePreamble
};
