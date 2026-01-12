#!/usr/bin/env python3
"""
Post-tool-use hook that warns about RTL-unfriendly CSS classes.

Checks for:
- ml-/mr- classes (should be ms-/me-)
- pl-/pr- classes (should be ps-/pe-)
- left-/right- classes (should be start-/end-)
- text-left/text-right (should be text-start/text-end)

This is critical for TRAF3LI which supports Arabic (RTL).

Exit codes:
- 0: Success (with warnings if issues found)
"""

import json
import re
import sys
from pathlib import Path


# Patterns for RTL-unfriendly classes
RTL_ISSUES = {
    r'\bml-\d+': 'ms-{n} (margin-start)',
    r'\bmr-\d+': 'me-{n} (margin-end)',
    r'\bpl-\d+': 'ps-{n} (padding-start)',
    r'\bpr-\d+': 'pe-{n} (padding-end)',
    r'\bleft-\d+': 'start-{n}',
    r'\bright-\d+': 'end-{n}',
    r'\btext-left\b': 'text-start',
    r'\btext-right\b': 'text-end',
    r'\bborder-l\b': 'border-s (border-start)',
    r'\bborder-r\b': 'border-e (border-end)',
    r'\brounded-l\b': 'rounded-s (rounded-start)',
    r'\brounded-r\b': 'rounded-e (rounded-end)',
    r'\b-translate-x-': '-translate-x- (check if RTL-safe)',
}


def check_for_rtl_issues(content: str) -> list[tuple[str, str]]:
    """Check content for RTL-unfriendly patterns."""
    issues = []

    for pattern, suggestion in RTL_ISSUES.items():
        matches = re.findall(pattern, content)
        if matches:
            for match in set(matches):  # Deduplicate
                issues.append((match, suggestion))

    return issues


def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)

        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        # Only check Edit and Write operations on TSX files
        if tool_name not in ["Edit", "Write", "MultiEdit"]:
            sys.exit(0)

        file_path = tool_input.get("file_path", "")

        # Only check TSX files (React components)
        if not file_path.endswith('.tsx'):
            sys.exit(0)

        # Get the content
        if tool_name == "Write":
            content = tool_input.get("content", "")
        elif tool_name == "Edit":
            content = tool_input.get("new_string", "")
        elif tool_name == "MultiEdit":
            edits = tool_input.get("edits", [])
            content = "\n".join(edit.get("new_string", "") for edit in edits)
        else:
            content = ""

        if not content:
            sys.exit(0)

        # Check for RTL issues
        issues = check_for_rtl_issues(content)

        if issues:
            print(
                "⚠️  RTL/LTR Compatibility Warning\n"
                "=" * 40 + "\n\n"
                "Found CSS classes that may not work correctly in Arabic (RTL) mode:\n\n",
                file=sys.stderr
            )

            for found, suggestion in issues:
                print(f"  • '{found}' → Use '{suggestion}' instead", file=sys.stderr)

            print(
                "\n\nTailwind RTL-safe classes use logical properties:\n"
                "  • ms-/me- for margin-start/margin-end\n"
                "  • ps-/pe- for padding-start/padding-end\n"
                "  • start-/end- for left/right positioning\n"
                "  • text-start/text-end for text alignment\n\n"
                "(This is a warning, operation completed successfully)",
                file=sys.stderr
            )

        sys.exit(0)

    except Exception as e:
        print(f"Warning: rtl_check hook error: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
