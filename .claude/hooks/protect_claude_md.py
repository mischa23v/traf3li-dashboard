#!/usr/bin/env python3
"""
Pre-tool-use hook that prevents modifications to CLAUDE.md files.

CLAUDE.md files contain user-defined instructions that should only
be modified by the user directly, not by Claude during execution.

Exit codes:
- 0: Allow the operation
- 2: Block the operation
"""

import json
import sys
from pathlib import Path


PROTECTED_FILENAMES = {
    'CLAUDE.md',
    'claude.md',
}


def is_protected_file(file_path: str) -> bool:
    """Check if the file is a protected CLAUDE.md file."""
    if not file_path:
        return False

    path = Path(file_path)
    filename = path.name

    return filename in PROTECTED_FILENAMES


def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)

        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        # Only check file modification tools
        modification_tools = {"Edit", "MultiEdit", "Write", "NotebookEdit"}
        if tool_name not in modification_tools:
            sys.exit(0)

        # Get file path from tool input
        file_path = tool_input.get("file_path", "")

        # Check if it's a protected file
        if is_protected_file(file_path):
            print(
                "BLOCKED: Cannot modify CLAUDE.md\n\n"
                "CLAUDE.md files contain user instructions that should only "
                "be modified by the user directly.\n\n"
                "If you need to update project instructions, please ask the user "
                "to make the changes manually.",
                file=sys.stderr
            )
            sys.exit(2)

        sys.exit(0)

    except Exception:
        # Don't block on unexpected errors
        sys.exit(0)


if __name__ == "__main__":
    main()
