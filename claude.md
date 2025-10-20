# Claude.md

**Documentation Search with blz**

This project uses `blz` - a fast CLI tool for searching llms.txt documentation files. Use it to quickly find documentation for the tech stack and this project.

Available documentation sources (add if not already indexed):

```bash
# This project's documentation (IMPORTANT - add this first)
# Option 1: Local file (if you have the repo cloned)


# React Router v7 (community-maintained)
blz add react-router https://gist.githubusercontent.com/luiisca/14eb031a892163502e66adb687ba6728/raw/27437452506bec6764d3bf9391a80eed94a53826/ReactRouter_LLMs.txt

# JavaScript/TypeScript ecosystem
blz add bun https://bun.sh/llms.txt
blz add turborepo https://turborepo.com/llms.txt

# Clerk auth
blz add clerk https://clerk.com/llms.txt

# Tailwind CSS (community-maintained, AI-generated April 2025)
blz add tailwind https://gist.githubusercontent.com/ConstantinHvber/0e521eafaa34e9a70f2254ae8c629ad0/raw/tailwind-llms.txt

# React Native (official)
blz add react-native https://reactnative.dev/llms.txt

# ReScript React (official, includes llms-full.txt and llms-small.txt)
blz add rescript-react https://rescript-lang.org/llms/react/latest/llms.txt

# Check https://llmstxthub.com for more documentation sources
# Note: The following don't have llms.txt yet (as of 2025):
# - better-sqlite3 (no official llms.txt found)
# - react-pdf (no official llms.txt found)
# - Google Cloud Platform / Vertex AI (no official llms.txt found)
```

Common blz commands:

- Search documentation: `blz "search term"`
- Get specific lines: `blz get source:line-range` (e.g., `blz get cardlessid:100-150`)
- List indexed sources: `blz list`

**When encountering questions about this project or the tech stack, ALWAYS use blz to search relevant documentation before making assumptions. The llms.txt file contains comprehensive information about the entire codebase.**

**Coding Conventions**

Route files are named in lower case, but their components inside the file are capitalize - e.g. Home, Contact. Components are named in CamelCase with the first word capitalized
