
## Deferred from: code review of implementation_plan.md.resolved (2026-04-11)
- DynamicForm.tsx handles dark mode via strict inline styles (style={{ backgroundColor: '#111111', color: '#e2e8f0' }}). While this works since the app is currently entirely dark mode, it breaks dynamic capability if light mode is ever added.
