Read and strictly follow AI_CHAT_NOTION_DESIGN.md (Notion style).

Refactor ONLY the AI chat component inside the tenant homepage.

Context:
- This is NOT a standalone page
- It is a component embedded within a larger UI (Linear + Airbnb layout)
- Must NOT break or override the main layout

Requirements:
- Keep ALL existing chat logic, API calls, and message flow unchanged
- Only refactor UI of the chat component

Design rules (VERY IMPORTANT):
- Use Notion-style minimal design (white, gray, black palette)
- Use clean typography and clear spacing (8px grid)
- No heavy shadows, no gradients, no flashy UI
- Use soft borders and subtle separation

Component structure:
- Compact chat container (card or panel)
- Message list (short history, scrollable)
- Input box (simple, clean)
- Optional suggestion prompts (small buttons)

Message design:
- Simple message bubbles or text blocks
- Clear distinction between user and AI
- Good spacing between messages
- High readability

Layout behavior:
- Chat must be compact (NOT full screen)
- Should be:
  + side panel OR
  + floating panel OR
  + section within page

- Must NOT:
  + take over the entire page
  + hide main content (room cards, filters)
  + interrupt browsing experience

UX rules:
- Chat supports user decision, not replaces UI
- Keep interaction fast and simple
- Ensure user can browse rooms while chatting

Technical constraints:
- Use reusable React component
- Maintain responsiveness (mobile + desktop)
- Keep performance smooth

Output:
- Clean, minimal Notion-style chat component
- Fully integrated within tenant homepage
- Consistent with overall design system

Improve the AI chat component to feel closer to a high-quality Notion-style interface.

Focus on:
- Better spacing between messages
- Improved readability and typography
- Cleaner message grouping
- Subtle UI feedback (typing, loading)

Enhance UX:
- Make chat easier to follow
- Improve input experience
- Add smooth interaction (focus, hover)

Integration improvements:
- Ensure chat blends naturally with the main UI
- Avoid visual conflict with Airbnb-style cards
- Keep chat visually lightweight

Do NOT:
- Expand chat to full screen
- Add unnecessary UI elements
- Break layout or main browsing experience

Goal:
- Minimal, clean, highly usable AI chat component
- Seamless integration with homepage