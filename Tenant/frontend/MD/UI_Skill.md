---
name: design-system-booking-com
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---



# Booking.com

## Mission
Deliver implementation-ready design-system guidance for Booking.com that can be applied consistently across dashboard web app interfaces.

## Brand
- Product/brand: Booking.com
- URL: https://www.booking.com/index.html?aid=8016259&utm_source=coccoc_context&utm_medium=CPC&utm_campaign=Book%20Search%20%C4%90%C3%ADch%2BLand&utm_term=%5Bbooking%2Ecom%5D&utm_content=44634949&ctm_event_id=70754420&chal_t=1777098942969&force_referer=https%3A%2F%2Fcoccoc.com%2Fsearch%3Fquery%3Dbooking.com
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=BlinkMacSystemFont`, `font.family.stack=BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`, `font.size.base=14px`, `font.weight.base=400`, `font.lineHeight.base=20px`
- Typography scale: `font.size.xs=14px`, `font.size.sm=16px`, `font.size.md=20px`, `font.size.lg=23px`, `font.size.xl=24px`
- Color palette: `color.text.primary=#1a1a1a`, `color.text.secondary=#006ce4`, `color.text.tertiary=#595959`, `color.surface.muted=#ffffff`, `color.surface.base=#000000`
- Spacing scale: `space.1=2px`, `space.2=4px`, `space.3=5px`, `space.4=8px`, `space.5=11px`, `space.6=12px`, `space.7=16px`, `space.8=32px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.sm=8px`, `radius.md=50px`, `radius.lg=9999px` | `shadow.1=rgba(26, 26, 26, 0.16) 0px 2px 8px 0px`, `shadow.2=rgb(170, 170, 170) 0px 0px 3px 0px` | `motion.duration.instant=120ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.


