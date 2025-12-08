---

## ⚠️ MOST IMPORTANT RULE - ASK BEFORE ASSUMING

**THIS RULE MUST NEVER BE BROKEN:**

If you need more information about:
- Backend API structure, endpoints, or responses
- Frontend component behavior or data flow
- Database schema or data relationships
- How existing features work
- What the user expects from a feature

**YOU MUST ASK THE USER BEFORE PROCEEDING.**

Do NOT:
- Assume how the backend works
- Guess API response structures
- Make up endpoints that may not exist
- Implement features based on assumptions

This prevents wasted effort and bugs caused by incorrect assumptions. When in doubt, ASK FIRST.

---

## 🎨 Visual Development & Testing

### Design Principles
Follow: `/context/design-principles.md`

### Quick Visual Check

**After EVERY front-end change, you MUST:**

1. Navigate to the changed page: `mcp__playwright__browser_navigate("http://localhost:5173/your-page")`
2. Test Arabic (RTL): Switch language → Take screenshot
3. Test English (LTR): Switch language → Take screenshot
4. Test mobile: `mcp__playwright__browser_resize(375, 667)` → Take screenshot
5. Check console: `mcp__playwright__browser_console_messages()`

### Comprehensive Review

For major changes or before PRs, run:
```
/design-review
```

This will:
- Test both languages (Arabic/English)
- Test all viewports (mobile/tablet/desktop)
- Check accessibility (WCAG AA)
- Verify PDPL compliance
- Check console for errors
- Provide detailed report with screenshots

### When to Use

**Quick Check**: Every small UI change
**Full Review**: Before PRs, major features, production deployment

---

## 🔀 Git & Pull Request Rules

### After Every Push

**MANDATORY: After pushing changes, you MUST:**

1. Create a pull request using the GitHub PR creation URL
2. Provide the PR link to the user

Since `gh` CLI may not be available, use the push output URL format:
```
https://github.com/mischa23v/traf3li-dashboard/pull/new/{branch-name}
```

### Example Workflow
```
git push -u origin claude/feature-branch-xyz
# Then immediately provide:
# "PR can be created here: https://github.com/mischa23v/traf3li-dashboard/pull/new/claude/feature-branch-xyz"
```