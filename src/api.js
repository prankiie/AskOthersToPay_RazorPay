/**
 * API client for Ask Others to Pay demo backend.
 * All calls go to the Express server on port 3001.
 */

const BASE = 'http://localhost:3001/v1';

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.description || 'API error');
  return json;
}

// ── Scenarios ─────────────────────────────────────────────────────────────

export const getScenarios = () => api('/scenarios');

export const resetScenario = (id) => api(`/scenarios/${id}/reset`, { method: 'POST' });

// ── Delegations ───────────────────────────────────────────────────────────

export const createDelegation = (body) =>
  api('/delegations', { method: 'POST', body: JSON.stringify(body) });

export const getDelegation = (id) => api(`/delegations/${id}`);

export const shareDelegation = (id) =>
  api(`/delegations/${id}/share`, { method: 'POST' });

export const openDelegation = (id) =>
  api(`/delegations/${id}/open`, { method: 'POST' });

export const startPayment = (id, payment_method) =>
  api(`/delegations/${id}/pay`, { method: 'POST', body: JSON.stringify({ payment_method }) });

export const capturePayment = (id) =>
  api(`/delegations/${id}/capture`, { method: 'POST' });

export const failPayment = (id) =>
  api(`/delegations/${id}/fail`, { method: 'POST' });

export const declineDelegation = (id, reason) =>
  api(`/delegations/${id}/decline`, { method: 'POST', body: JSON.stringify({ reason }) });

export const redelegate = (id, body) =>
  api(`/delegations/${id}/redelegate`, { method: 'POST', body: JSON.stringify(body) });

// ── Webhooks ──────────────────────────────────────────────────────────────

export const getWebhookEvents = (orderId) =>
  api(`/webhook-events${orderId ? `?order_id=${orderId}` : ''}`);
