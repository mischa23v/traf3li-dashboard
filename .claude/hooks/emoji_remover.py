#!/usr/bin/env python3
"""
Post-tool-use hook that removes emojis from edited files.

This hook runs after Edit/Write operations and removes any emojis
that might have been added to the code, ensuring clean code style.

Exit codes:
- 0: Success (file cleaned or no action needed)
- Non-zero: Error (but don't block workflow)
"""

import json
import re
import sys
from pathlib import Path


def contains_emoji(text: str) -> bool:
    """Check if text contains emoji characters."""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002702-\U000027B0"  # dingbats
        "\U000024C2-\U0001F251"  # enclosed characters
        "\U0001F900-\U0001F9FF"  # supplemental symbols
        "\U0001FA00-\U0001FA6F"  # chess symbols
        "\U0001FA70-\U0001FAFF"  # symbols extended
        "\U00002600-\U000026FF"  # misc symbols
        "]+",
        flags=re.UNICODE
    )
    return bool(emoji_pattern.search(text))


def remove_emojis(text: str) -> str:
    """Remove emoji characters from text."""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"
        "\U0001FA00-\U0001FA6F"
        "\U0001FA70-\U0001FAFF"
        "\U00002600-\U000026FF"
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern.sub("", text)


def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)

        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        # Only process Edit and Write operations
        if tool_name not in ["Edit", "Write", "MultiEdit"]:
            sys.exit(0)

        # Get file path from tool input
        file_path = tool_input.get("file_path", "")
        if not file_path:
            sys.exit(0)

        # Skip non-code files
        path = Path(file_path)
        code_extensions = {'.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.md'}
        if path.suffix not in code_extensions:
            sys.exit(0)

        # Skip files in node_modules or dist
        if 'node_modules' in str(path) or 'dist' in str(path):
            sys.exit(0)

        # Read the file
        if not path.exists():
            sys.exit(0)

        content = path.read_text(encoding='utf-8')

        # Check for emojis
        if not contains_emoji(content):
            sys.exit(0)

        # Remove emojis
        clean_content = remove_emojis(content)

        # Only write if content changed
        if clean_content != content:
            path.write_text(clean_content, encoding='utf-8')
            print(f"Removed emojis from {file_path}", file=sys.stderr)

        sys.exit(0)

    except Exception as e:
        # Don't block workflow on errors
        print(f"Warning: emoji_remover hook error: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
