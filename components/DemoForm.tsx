'use client';
import { useState } from 'react';
import { demo, contact } from '@/lib/content';

/** "Book Your Free Demo" form. */
export default function DemoForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get('company_website')) return; // honeypot
    const data = Object.fromEntries(f.entries()) as Record<string, string>;
    const body = `Name: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nPhone: ${data.cc} ${data.phone}\n\n${data.message || ''}`;
    if (contact.formEndpoint) {
      try {
        setState('sending');
        const r = await fetch(contact.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        setState(r.ok ? 'sent' : 'error');
      } catch {
        setState('error');
      }
    } else {
      // no backend configured: open a pre-filled email instead
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent('Demo request')}&body=${encodeURIComponent(body)}`;
      setState('sent');
    }
  }

  return (
    <form className="bl-demo-form" onSubmit={onSubmit} noValidate={false}>
      <div className="bl-row">
        <input id="bl-first-name" name="firstName" type="text" required placeholder={demo.first} aria-label={demo.first} />
        <input name="lastName" type="text" required placeholder={demo.last} aria-label={demo.last} />
      </div>
      <input name="email" type="email" required placeholder={demo.email} aria-label={demo.email} />
      <div className="bl-row bl-phone">
        <select name="cc" aria-label="Country code" defaultValue="+91">
          {demo.countries.map(([flag, code, dial]) => (
            <option key={code} value={dial}>{`${flag} ${code} ${dial}`}</option>
          ))}
        </select>
        <input name="phone" type="tel" placeholder={demo.phone} aria-label={demo.phone} />
      </div>
      <textarea name="message" rows={3} placeholder={demo.message} aria-label={demo.message} />
      <input name="company_website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="bl-hp" />
      <label className="bl-consent">
        <input name="consent" type="checkbox" required />
        <span>{demo.consent}</span>
      </label>
      <div className="bl-note">{demo.note}</div>
      <button type="submit" className="bl-submit" disabled={state === 'sending'}>{demo.submit}</button>
      {state === 'sent' && <div className="bl-status" role="status">{demo.sent}</div>}
      {state === 'error' && <div className="bl-status is-error" role="alert">Something went wrong. Please email {contact.email}.</div>}
    </form>
  );
}
