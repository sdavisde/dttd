---
name: Use typecheck not build
description: Use yarn tsc or type checking instead of yarn build for quick validation
type: feedback
---

Use `npx tsc --noEmit` or a faster type check instead of `yarn build` when just verifying compilation. Build is slow and unnecessary when only checking types.

**Why:** Build takes 30-80s, type checking is much faster.
**How to apply:** When verifying code changes compile, run type check instead of full build unless specifically testing build output.
