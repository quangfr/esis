---
name: github-workflows
description: Guidelines and commands for managing issues, pull requests, releases, and branches via the GitHub CLI (gh) and Git. Use this skill when interacting with GitHub repositories, reviewing PRs, checking CI runs, or creating branches.
---

# GitHub Workflows Skill

This skill provides procedures for interacting with GitHub repositories using the official `gh` CLI and Git commands.

## Prerequisites

- GitHub CLI installed (`gh --version`).
- Authenticate if not already logged in:
  ```bash
  gh auth login
  ```

## Common Workflows

### 1. Issues & Pull Requests
- View open issues:
  ```bash
  gh issue list
  ```
- View pull requests:
  ```bash
  gh pr list
  ```
- View PR details or checks:
  ```bash
  gh pr view <pr_number>
  gh pr checks <pr_number>
  ```
- Checkout a PR branch locally:
  ```bash
  gh pr checkout <pr_number>
  ```

### 2. CI/CD & Workflow Runs
- View recent GitHub Actions workflow runs:
  ```bash
  gh run list
  ```
- View workflow logs:
  ```bash
  gh run view <run_id> --log
  ```
