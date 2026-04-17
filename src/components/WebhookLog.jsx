import React, { useState, useEffect } from 'react';
import { theme } from '../theme';
import { getWebhookEvents } from '../api';

/**
 * WebhookLog — collapsible panel showing webhook events fired to the merchant.
 * This is the "what the merchant receives" view — critical for a Razorpay audience.
 */
export default function WebhookLog({ orderId }) {
  const [events, setEvents] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 2000);
    return () => clearInterval(interval);
  }, [orderId]);

  async function loadEvents() {
    try {
      const res = await getWebhookEvents(orderId);
      setEvents(res.data || []);
    } catch (e) {
      // silently fail
    }
  }

  if (events.length === 0) return null;

  const eventColors = {
    'order.delegation_requested': theme.secondary,
    'order.delegation_approved': theme.accent,
    'order.delegation_declined': theme.danger,
    'order.delegation_expired': theme.warning,
    'payment.captured': theme.accent,
    'payment.failed': theme.danger,
    'order.paid': theme.accent,
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: theme.card, borderTop: `1px solid ${theme.border}`,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
      transition: 'max-height 0.3s ease',
      maxHeight: expanded ? 400 : 48,
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '12px 16px', background: theme.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Webhook Events</span>
          <span style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11, fontWeight: 600,
            padding: '1px 6px', borderRadius: theme.radiusFull,
          }}>{events.length}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
          {expanded ? 'Collapse' : 'What the merchant receives'} {expanded ? '\u25BC' : '\u25B2'}
        </span>
      </button>

      {/* Event list */}
      <div style={{ maxHeight: 350, overflowY: 'auto', padding: '8px 0' }}>
        {events.map((evt) => {
          const color = eventColors[evt.event_type] || theme.textSecondary;
          const isSelected = selectedEvent === evt.id;
          return (
            <div key={evt.id}>
              <button
                onClick={() => setSelectedEvent(isSelected ? null : evt.id)}
                style={{
                  width: '100%', padding: '8px 16px', background: isSelected ? '#F9FAFB' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: theme.text, fontFamily: 'monospace' }}>
                  {evt.event_type}
                </span>
                <span style={{ fontSize: 11, color: theme.textMuted }}>
                  {new Date(evt.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </button>
              {isSelected && (
                <div style={{ padding: '4px 16px 12px 34px' }}>
                  <pre style={{
                    background: '#1A1A2E', color: '#A5F3FC', borderRadius: theme.radiusSm,
                    padding: '10px 12px', fontSize: 11, lineHeight: 1.5,
                    overflow: 'auto', maxHeight: 200,
                  }}>
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
