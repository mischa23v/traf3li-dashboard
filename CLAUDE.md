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