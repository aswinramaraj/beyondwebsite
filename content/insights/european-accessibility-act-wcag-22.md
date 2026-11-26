---
title: The European Accessibility Act is live. Its technical standard just caught up.
subtitle: The updated EN 301 549 aligns European accessibility requirements with WCAG 2.2. What changed, who it applies to, and a practical checklist for product teams.
date: 2026-10-23
topic: Web
cover: /img/insight-access.webp
coverAlt: A web form with a keyboard-focused Continue button, a Tab key, a contrast ratio label and a WCAG 2.2 AA badge
---

About one in six people worldwide lives with a significant disability. Many more have temporary or situational limits: a broken wrist, bright sunlight on a screen, a noisy train, ageing eyes. Accessible design is how digital products work for all of them.

In Europe it is now also the law for a wide range of products and services, and in 2026 the technical rulebook behind that law was brought up to date.

## The law: the European Accessibility Act

The **European Accessibility Act (EAA)** has applied since **28 June 2025**. It requires many consumer-facing products and services sold in the EU to be accessible, including:

- e-commerce websites and apps,
- banking and payment services,
- e-books and e-readers,
- passenger transport services, such as ticketing and travel information,
- electronic communications services,
- and consumer hardware like computers, phones, ticket machines and payment terminals.

Very small service businesses (fewer than ten employees and annual turnover of no more than €2 million) are exempt from the service requirements. Companies outside the EU are covered if they sell these products or services to people in the EU.

Enforcement is national. Each member state has its own market-surveillance authority. In the Netherlands, for example, the competition and consumer authority ACM oversees compliance.

## The standard: EN 301 549 V4.1.1

The law says products must be accessible. A harmonised European standard says *how*. That standard is **EN 301 549**, and version **4.1.1, published on 2 September 2026**, aligns its web and software requirements with **WCAG 2.2 Level AA**.

Once the new version is cited in the EU's Official Journal, meeting it gives a legal **presumption of conformity**: a strong, practical way to show that a product meets the EAA. Until then, the earlier version, which was based on WCAG 2.1, remains the cited reference. Either way, WCAG 2.2 AA is now clearly the target to build towards.

## What WCAG 2.2 adds

WCAG 2.2 keeps everything in WCAG 2.1 and adds new success criteria. The ones at Level A and AA, which the standard requires, are:

- **Focus not obscured (minimum).** When a control has keyboard focus, sticky headers, cookie banners and chat widgets must not completely hide it.
- **Dragging movements.** Anything you can do by dragging, such as reordering a list or using a slider, must also be possible with a simple tap or click.
- **Target size (minimum).** Buttons and links should be at least **24 × 24 CSS pixels**, or have enough space around them, so they can be hit reliably.
- **Consistent help.** If you offer help, such as contact details, a chat or an FAQ, put it in the same place on every page.
- **Redundant entry.** Don't make people type the same information twice in one process. Pre-fill it or let them select it.
- **Accessible authentication (minimum).** Sign-in must not depend on a memory or puzzle test without an alternative. Allowing password managers and paste, or offering passkeys, satisfies this.

## A practical checklist for product teams

Accessibility is most expensive when it is bolted on at the end. These habits build it in:

1. **Use real HTML elements.** A `<button>` is focusable, clickable and announced correctly for free. A `<div>` with a click handler is none of those.
2. **Test with only a keyboard.** Can you reach, see and use every control with Tab, Shift+Tab, Enter and Space? Is the focus outline always visible?
3. **Check contrast.** Body text needs a contrast ratio of at least 4.5:1 against its background; large text needs 3:1.
4. **Label everything.** Every form field needs a visible label. Every meaningful image needs alt text, and decorative images need empty alt text.
5. **Write clear errors.** Explain what went wrong and how to fix it, next to the field, not only in colour.
6. **Respect user settings.** Support zoom up to 200%, text spacing changes and reduced-motion preferences.
7. **Test with a screen reader** for your most important journeys, such as sign-up, checkout and contact.
8. **Include disabled people in research.** Automated tools catch only part of the problems. Real users find the rest.
9. **Publish an accessibility statement** that says how accessible your service is and how people can report problems.

## The takeaway

The European Accessibility Act made accessibility a legal requirement for much of the digital economy. The updated EN 301 549 makes the target clear: WCAG 2.2 AA. For teams that already care about good design, most of this is familiar. For everyone else, the best time to start was before June 2025. The second-best time is your next sprint.

*This article is a general overview, not legal advice.*

## Sources

- [European Accessibility Act: ICT standards update](https://www.dwt.com/insights/2026/09/european-accessibility-act-ict-standards-update) – Davis Wright Tremaine
- [EN 301 549 V4.1.1 is final: what changed, what it means and what you should do](https://www.deque.com/blog/en-301-549-v4-1-1-is-final-what-changed-what-it-means-and-what-you-should-do/) – Deque
- [EN 301 549 published](https://nda.ie/news/en301549-published) – National Disability Authority, Ireland
