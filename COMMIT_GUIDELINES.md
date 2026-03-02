# Commit Guidelines

Use this workflow to keep commits small, reviewable, and focused on one concern.

## 1) Check repository state first
```bash
git status --short
```

## 2) Stage only intended files
Avoid `git add .` unless you are certain every change belongs together.

```bash
git add path/to/file1 path/to/file2
```

## 3) Verify staged content before commit
```bash
git diff --cached
```

## 4) Commit with a scoped message
Use clear, specific messages that describe user-visible or developer-facing impact.

```bash
git commit -m "feat(ui): add mobile navigation"
```

## 5) If unrelated files are staged, unstage them
```bash
git restore --staged path/to/unrelated-file
```

## 6) If one file has mixed concerns, stage hunks
```bash
git add -p path/to/file
```

## 7) Quick pre-commit checklist
- Does this commit do one thing?
- Are unrelated files unstaged?
- Is the commit message specific?
- Did you review `git diff --cached`?
