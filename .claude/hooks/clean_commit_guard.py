#!/usr/bin/env python3
"""
Pre-tool-use hook that validates git commits for TRAF3LI Dashboard.

Prevents commits containing:
- Emojis (clean commit messages only)
- console.log statements in staged files
- Hardcoded localhost URLs
- Sensitive patterns (API keys, passwords)

Exit codes:
- 0: Allow the operation
- 2: Block the operation
"""

import json
import re
import sys
import subprocess


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


def check_staged_files_for_issues() -> tuple[bool, str]:
    """Check staged files for common issues."""
    try:
        # Get list of staged files
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True
        )
        staged_files = result.stdout.strip().split('\n')

        issues = []

        for file in staged_files:
            if not file or not file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                continue

            try:
                # Get staged content
                content_result = subprocess.run(
                    ["git", "show", f":{file}"],
                    capture_output=True,
                    text=True
                )
                content = content_result.stdout

                # Check for console.log (but not console.error which might be intentional)
                if re.search(r'console\.log\s*\(', content):
                    issues.append(f"console.log found in {file}")

                # Check for hardcoded localhost
                if re.search(r'localhost:\d+|127\.0\.0\.1', content):
                    issues.append(f"Hardcoded localhost found in {file}")

                # Check for potential secrets
                if re.search(r'(api[_-]?key|password|secret)\s*[:=]\s*["\'][^"\']+["\']', content, re.IGNORECASE):
                    issues.append(f"Potential secret found in {file}")

            except Exception:
                pass

        if issues:
            return False, "Issues found in staged files:\n- " + "\n- ".join(issues)

        return True, ""

    except Exception:
        return True, ""  # Don't block on error


def check_commit_message(command: str) -> tuple[bool, str]:
    """Validate commit message format and content."""

    # Extract commit message from -m flag
    match = re.search(r'-m\s+["\']([^"\']+)["\']', command)
    if not match:
        match = re.search(r'-m\s+"([^"]+)"', command)
    if not match:
        match = re.search(r"-m\s+'([^']+)'", command)

    if not match:
        return True, ""  # No message found, let git handle it

    message = match.group(1)

    # Check for emojis
    if contains_emoji(message):
        clean_message = re.sub(
            r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF'
            r'\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U000024C2-\U0001F251'
            r'\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF'
            r'\U00002600-\U000026FF]+',
            '',
            message
        ).strip()
        return False, (
            f"Commit messages should not contain emojis.\n"
            f"Suggested clean message: {clean_message}"
        )

    return True, ""


def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)

        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        # Only check Bash commands related to git commit
        if tool_name != "Bash":
            sys.exit(0)

        command = tool_input.get("command", "")

        # Only check git commit commands
        if "git commit" not in command:
            sys.exit(0)

        # Check commit message
        msg_ok, msg_error = check_commit_message(command)
        if not msg_ok:
            print(msg_error, file=sys.stderr)
            sys.exit(2)

        # Check staged files for issues
        files_ok, files_error = check_staged_files_for_issues()
        if not files_ok:
            print(files_error, file=sys.stderr)
            print("\nPlease fix these issues before committing.", file=sys.stderr)
            sys.exit(2)

        sys.exit(0)

    except Exception:
        # Don't block on unexpected errors
        sys.exit(0)


if __name__ == "__main__":
    main()
