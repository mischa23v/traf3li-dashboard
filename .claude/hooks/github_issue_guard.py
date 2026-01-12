#!/usr/bin/env python3
"""
Pre-tool-use hook that prevents GitHub issues from containing
references to "Claude" or "Anthropic" in issue content.

This ensures GitHub issues focus on the actual problem/feature
rather than the AI tool being used.

Exit codes:
- 0: Allow the operation
- 2: Block the operation
"""

import json
import re
import sys


PROHIBITED_TERMS = [
    r'\bclaude\b',
    r'\banthropic\b',
    r'\bai\s+assistant\b',
    r'\blanguage\s+model\b',
    r'\bllm\b',
]


def contains_prohibited_terms(text: str) -> tuple[bool, list[str]]:
    """Check if text contains prohibited terms."""
    if not text:
        return False, []

    found_terms = []
    text_lower = text.lower()

    for pattern in PROHIBITED_TERMS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            found_terms.append(pattern.replace(r'\b', '').replace(r'\s+', ' '))

    return len(found_terms) > 0, found_terms


def check_mcp_github_tool(tool_name: str, tool_input: dict) -> tuple[bool, str]:
    """Check MCP GitHub tools for prohibited terms."""

    # GitHub issue-related MCP tools
    github_tools = {
        'mcp__github__create_issue',
        'mcp__github__add_issue_comment',
        'mcp__github__update_issue',
    }

    if tool_name not in github_tools:
        return True, ""

    # Check all text fields
    fields_to_check = ['title', 'body', 'comment', 'content']

    for field in fields_to_check:
        value = tool_input.get(field, "")
        if value:
            has_prohibited, terms = contains_prohibited_terms(value)
            if has_prohibited:
                return False, (
                    f"GitHub issue {field} contains prohibited terms: {', '.join(terms)}\n\n"
                    f"Please rephrase without referencing the AI tool.\n"
                    f"Focus on describing the actual problem or feature."
                )

    return True, ""


def check_gh_cli_command(command: str) -> tuple[bool, str]:
    """Check gh CLI commands for prohibited terms."""

    # Only check issue-related commands
    if not re.search(r'gh\s+issue\s+(create|edit|comment)', command):
        return True, ""

    has_prohibited, terms = contains_prohibited_terms(command)
    if has_prohibited:
        return False, (
            f"GitHub issue command contains prohibited terms: {', '.join(terms)}\n\n"
            f"Please rephrase without referencing the AI tool.\n"
            f"Focus on describing the actual problem or feature."
        )

    return True, ""


def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)

        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        # Check MCP GitHub tools
        if tool_name.startswith("mcp__github__"):
            ok, error = check_mcp_github_tool(tool_name, tool_input)
            if not ok:
                print(error, file=sys.stderr)
                sys.exit(2)

        # Check Bash commands with gh CLI
        if tool_name == "Bash":
            command = tool_input.get("command", "")
            if "gh issue" in command:
                ok, error = check_gh_cli_command(command)
                if not ok:
                    print(error, file=sys.stderr)
                    sys.exit(2)

        sys.exit(0)

    except Exception:
        # Don't block on unexpected errors
        sys.exit(0)


if __name__ == "__main__":
    main()
