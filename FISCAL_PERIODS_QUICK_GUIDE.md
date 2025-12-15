# Fiscal Periods - Quick Reference Guide

## 🎯 Quick Access
**URL:** `/dashboard/finance/fiscal-periods`
**Navigation:** Sidebar → Finance → Fiscal Periods

## 🎨 Key Features at a Glance

### Status Colors
| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| Future | Gray | 🕐 | Not yet available for posting |
| Open | Green | 🔓 | Active - can post entries |
| Closed | Yellow | 🔒 | No new entries (can reopen) |
| Locked | Red | 🔒 | Permanent (for audit) |

### Available Actions by Status

#### Future Period
- **Open** → Makes the period available for posting entries

#### Open Period
- **Close** → Prevents new entries (reversible)
- **View Balances** → See financial summary

#### Closed Period
- **Reopen** → Allow entries again (if needed)
- **Lock** → Permanent lock (irreversible!)
- **View Balances** → See financial summary

#### Locked Period
- **View Balances** → See financial summary (no modifications possible)

## 🔄 Common Workflows

### 1. Start a New Fiscal Year
```
Click "New Fiscal Year"
  → Enter year (e.g., 2025)
  → Select start month
  → Confirm
  ✓ 12 periods created automatically
```

### 2. Monthly Period Management
```
Month starts
  → Open the period
  → Post journal entries during month
  → End of month → Close the period
  → Review balances
  → Next month → Repeat
```

### 3. Year-End Process
```
End of fiscal year
  → Click "Year-End Closing"
  → Select year to close
  → Review warnings
  → Confirm closing
  ✓ All periods closed
  ✓ Closing entries created
  ✓ Balances carried forward
```

## 📊 View Modes

### Grid View (Default)
- Card-based layout
- Quick status overview
- Easy filtering
- Best for: Quick checks and actions

### Timeline View
- Chronological display
- Visual progress line
- Month labels
- Best for: Sequential review

## ⚠️ Important Warnings

### Before Closing a Period
- ✅ All entries are posted
- ✅ Reconciliation complete
- ✅ No pending transactions

### Before Locking a Period
- ⚠️ **PERMANENT ACTION**
- ⚠️ Cannot be unlocked
- ⚠️ Use only for audit/compliance
- ✅ Period is completely verified

### Before Year-End Closing
- ⚠️ **IRREVERSIBLE**
- ✅ All periods reviewed
- ✅ Balances verified
- ✅ Reports generated
- ✅ Backup created

## 💡 Pro Tips

1. **Sequential Opening**: Open periods in order (Jan → Feb → Mar...)
2. **Monthly Review**: Review balances before closing each period
3. **Backup First**: Create backup before year-end closing
4. **Audit Trail**: Lock periods only after final audit
5. **Permission Control**: Restrict lock/reopen permissions to senior staff

## 🔍 Balance Sheet Check

When viewing period balances, ensure:
```
Assets = Liabilities + Equity ✓ (Balanced)
Assets ≠ Liabilities + Equity ✗ (Unbalanced - Review entries!)
```

## 🌐 Language Support

**Arabic (العربية)**
- RTL layout
- Arabic dates and numbers
- Full translation

**English**
- LTR layout
- International format
- Full translation

Switch using the language toggle in the header.

## 🎯 Keyboard Shortcuts
*(Future enhancement - not yet implemented)*

## 📱 Mobile Access

Fully responsive:
- Swipe through periods
- Tap to view balances
- All actions available
- Optimized touch targets

## 🆘 Troubleshooting

**Problem:** Can't open a period
- Check: Are previous periods open/closed in sequence?
- Solution: Open periods chronologically

**Problem:** Can't close a period
- Check: Are there unposted entries?
- Solution: Post all draft entries first

**Problem:** Year-end closing fails
- Check: Are all periods closed?
- Solution: Close all periods for the year first

**Problem:** Balances don't match
- Check: Are all entries posted?
- Solution: Post pending entries and recalculate

## 📞 Need Help?

Check the Help Center: `/dashboard/help`
Or contact your system administrator

---

**Last Updated:** 2025-12-15
**Version:** 1.0
