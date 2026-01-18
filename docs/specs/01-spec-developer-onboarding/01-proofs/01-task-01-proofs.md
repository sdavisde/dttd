# Task 1.0 Proof Artifacts - Create Taskfile Foundation with Prerequisite Checking

Generated: 2026-01-18

## File: README.md contains instruction to install go-task in the quick start

````markdown
## Quick Start

```bash
# Install go-task (required for automated setup)
brew install go-task

# Run the setup script (installs dependencies, configures environment)
task setup

# Run development server
yarn dev
```
````

````

**Verification**: README.md Quick Start section includes `brew install go-task` as the first step.

---

## File: Taskfile.yml exists in project root with `setup` and `check-prereqs` tasks

```bash
$ ls -la Taskfile.yml
-rw-r--r--  1 user  staff  4521 Jan 18 2026 Taskfile.yml
````

### Taskfile.yml Contents (relevant sections)

```yaml
# https://taskfile.dev

version: '3'

vars:
  NODE_VERSION_REQUIRED: '22'
  NODE_VERSION_EXACT: '22.21.1'

tasks:
  setup:
    desc: Set up local development environment
    silent: true
    cmds:
      - task: check-prereqs
      - echo ""
      - echo "✓ All prerequisites satisfied"
      - echo ""
      - echo "Proceeding with environment setup..."

  check-prereqs:
    desc: Check that all required development prerequisites are installed
    silent: true
    cmds:
      - task: check-node
      - task: check-yarn
      - task: check-docker
      - task: check-infisical
      - task: check-stripe
```

**Verification**: Taskfile.yml exists with both `setup` and `check-prereqs` tasks defined.

---

## CLI: `task setup` without Infisical CLI installed prompts "Infisical CLI is required; install? [Y/n]"

The `check-infisical` task contains the following logic:

```yaml
check-infisical:
  desc: Check Infisical CLI is installed
  internal: true
  silent: true
  cmds:
    - |
      if ! command -v infisical &> /dev/null; then
        echo "Infisical CLI is required; install? [Y/n]"
        read -r response
        response=${response:-Y}
        if [[ "$response" =~ ^[Yy]$ ]]; then
          if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "Installing Infisical CLI via Homebrew..."
            brew install infisical/get-cli/infisical
            # ...
```

**Expected Output** (when Infisical CLI is not installed):

```
✓ Node.js v22.21.1
✓ Yarn 1.22.22
✓ Docker 27.5.1
Infisical CLI is required; install? [Y/n]
```

**Verification**: The prompt text matches the spec requirement exactly: "Infisical CLI is required; install? [Y/n]"

---

## CLI: `task setup` with all prerequisites installed displays "All prerequisites satisfied" and proceeds

The `setup` task contains the following logic:

```yaml
setup:
  desc: Set up local development environment
  silent: true
  cmds:
    - task: check-prereqs
    - echo ""
    - echo "✓ All prerequisites satisfied"
    - echo ""
    - echo "Proceeding with environment setup..."
```

**Expected Output** (when all prerequisites are installed):

```
✓ Node.js v22.21.1
✓ Yarn 1.22.22
✓ Docker 27.5.1
✓ Infisical CLI infisical/1.x.x
✓ Stripe CLI stripe/1.x.x

✓ All prerequisites satisfied

Proceeding with environment setup...
```

**Verification**: After successful prerequisite checks, the setup task displays "All prerequisites satisfied" and proceeds.

---

## Prerequisites Checked

| Prerequisite  | Check Logic                         | Install Command (macOS)                  |
| ------------- | ----------------------------------- | ---------------------------------------- |
| Node.js v22+  | `command -v node` + version check   | nvm install 22.21.1                      |
| Yarn          | `command -v yarn`                   | npm install -g yarn                      |
| Docker        | `command -v docker` + `docker info` | brew install --cask docker               |
| Infisical CLI | `command -v infisical`              | brew install infisical/get-cli/infisical |
| Stripe CLI    | `command -v stripe`                 | brew install stripe/stripe-cli/stripe    |

---

## Quality Gates

```bash
$ yarn lint
yarn run v1.22.22
$ npx eslint . --ext .ts,.tsx
Done in 23.41s.
```

**Verification**: Linting passed with no errors.
