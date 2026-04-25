# Booking.com

## Mission
Create implementation-ready, token-driven UI guidance for Booking.com that is optimized for consistency, accessibility, and fast delivery across dashboard web app.

## Brand
- Product/brand: Booking.com
- URL: https://www.booking.com/index.html?aid=8016259&utm_source=coccoc_context&utm_medium=CPC&utm_campaign=Book%20Search%20%C4%90%C3%ADch%2BLand&utm_term=%5Bbooking%2Ecom%5D&utm_content=44634949&ctm_event_id=70754420&chal_t=1777098942969&force_referer=https%3A%2F%2Fcoccoc.com%2Fsearch%3Fquery%3Dbooking.com
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: clean, functional, implementation-oriented
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
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (154), buttons (124), inputs (31), lists (13), navigation (6), tables (3), cards (1).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
