#!/usr/bin/env python3
"""
Pre-tool-use hook that warns about hardcoded values that should use
centralized constants in TRAF3LI Dashboard.

Checks for:
- Hardcoded route strings instead of ROUTES constant
- Hardcoded query keys instead of QueryKeys
- Hardcoded cache times instead of CACHE_TIMES

Exit codes:
- 0: Allow (with warning if issues found)
- Does NOT block, only warns
"""

import json
import re
import sys


# Patterns to check for hardcoded values
PATTERNS = {
    'routes': {
        'pattern': r'["\']/dashboard[/\w-]*["\']',
        'constant': 'ROUTES',
        'import': "import { ROUTES } from '@/constants/routes'",
        'example': 'ROUTES.dashboard.clients.list',
    },
    'query_keys': {
        'pattern': r'queryKey:\s*\[\s*["\'][^"\']+["\']',
        'constant': 'QueryKeys',
        'import': "import { QueryKeys } from '@/lib/query-keys'",
        'example': 'QueryKeys.clients.list()',
    },
    'cache_times': {
        'pattern': r'staleTime:\s*\d{4,}',  # Numbers >= 1000
        'constant': 'CACHE_TIMES',
        'import': "import { CACHE_TIMES } from '@/config/cache'",
        'example': 'CACHE_TIMES.MEDIUM',
    },
}


def check_for_hardcoded_values(content: str, file_path: str) -> list[str]:
    """Check content for hardcoded values that should use constants."""
    warnings = []

    # Skip if file is in constants directory (those define the constants)
    if '/constants/' in file_path or '/config/' in file_path or '/lib/query-keys' in file_path:
        return warnings

    # Skip non-code files
    if not file_path.endswith(('.ts', '.tsx')):
        return warnings

    for name, config in PATTERNS.items():
        matches = re.findall(config['pattern'], content)
        if matches:
            # Check if the constant is already imported
            if config['constant'] not in content:
                warnings.append(
                    f"[{name}] Found hardcoded value(s): {matches[:3]}\n"
                    f"  → Use {config['constant']} instead\n"
                    f"  → {config['import']}\n"
                    f"  → Example: {config['example']}"
                )

    return warnings


def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)

        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        # Only check Edit and Write operations
        if tool_name not in ["Edit", "Write", "MultiEdit"]:
            sys.exit(0)

        # Get the content being written
        file_path = tool_input.get("file_path", "")

        # For Write, check the content directly
        if tool_name == "Write":
            content = tool_input.get("content", "")
        # For Edit, check the new_string
        elif tool_name == "Edit":
            content = tool_input.get("new_string", "")
        # For MultiEdit, check all edits
        elif tool_name == "MultiEdit":
            edits = tool_input.get("edits", [])
            content = "\n".join(edit.get("new_string", "") for edit in edits)
        else:
            content = ""

        if not content or not file_path:
            sys.exit(0)

        # Check for hardcoded values
        warnings = check_for_hardcoded_values(content, file_path)

        if warnings:
            print(
                "⚠️  Centralized Constants Warning\n"
                "=" * 40 + "\n\n" +
                "The following hardcoded values were detected:\n\n" +
                "\n\n".join(warnings) + "\n\n" +
                "Consider using centralized constants for maintainability.\n"
                "(This is a warning, operation will proceed)",
                file=sys.stderr
            )

        # Always allow - this is just a warning
        sys.exit(0)

    except Exception:
        # Don't block on unexpected errors
        sys.exit(0)


if __name__ == "__main__":
    main()
