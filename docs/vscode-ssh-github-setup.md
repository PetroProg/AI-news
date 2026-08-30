# Developer Setup Guide: VS Code Remote-SSH & GitHub Integration

This guide documents the step-by-step setup for headless remote development on an Ubuntu Server from a Windows workstation using VS Code Remote - SSH, as well as configuring SSH authentication with GitHub.

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Part 1: Windows Client Configuration (VS Code Remote - SSH)](#2-part-1-windows-client-configuration-vs-code-remote---ssh)
3. [Part 2: Server-Side Git & GitHub Integration](#3-part-2-server-side-git--github-integration)
4. [Part 3: Troubleshooting & Common Pitfalls](#4-part-3-troubleshooting--common-pitfalls)
5. [Part 4: Daily Workflow Cheatsheet](#5-part-4-daily-workflow-cheatsheet)

## 1. Architecture Overview

- **Client Workstation:** Windows 10/11 (VS Code GUI, Git Bash).
- **Headless Server:** Lenovo laptop running Ubuntu Server LTS, IP: `192.168.178.65`, user: `petroprog`.
- **Development Model:** Source code, Docker daemon, database, and background jobs run exclusively on the Ubuntu server. The Windows client connects via encrypted SSH tunnel for editing, debugging, and terminal access.

```
[ Windows Workstation ]                               [ Ubuntu Server (Lenovo) ]
  ├── VS Code (GUI) ────────── (SSH Port 22) ──────────► ├── ~/.vscode-server
  └── ~/.ssh/ai-server/id_ed25519 (Private Key)          ├── ~/.ssh/authorized_keys (Public Key)
                                                          └── ~/Projects/news-ai (Source + Docker)
                                                                      │
                                                                 (SSH Port 22)
                                                                      ▼
                                                              [ GitHub Repository ]
```

## 2. Part 1: Windows Client Configuration (VS Code Remote - SSH)

All steps in this section are executed on your Windows machine in Git Bash or PowerShell (prompt shows `Admin@DESKTOP-...`).

### Step 1.1: Generate SSH Key Pair on Windows

1. Open Git Bash on Windows.
2. Generate a secure Ed25519 key pair:

```bash
ssh-keygen -t ed25519 -C "lenovo-server"
```

3. When prompted for file path:
   - Enter your preferred path (for example, `~/.ssh/ai-server/id_ed25519`).
   - Press Enter twice for an empty passphrase (enables seamless passwordless login).

### Step 1.2: Copy Public Key to the Ubuntu Server

Run the following command in Git Bash on Windows:

```bash
cat ~/.ssh/ai-server/id_ed25519.pub | ssh petroprog@192.168.178.65 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

(Enter the `petroprog` user password one last time when prompted.)

### Step 1.3: Configure SSH Client Config on Windows

Open the SSH config file:

```bash
nano ~/.ssh/config
```

Add the host entry:

```ssh
Host petroprog
    HostName 192.168.178.65
    User petroprog
    Port 22
    IdentityFile ~/.ssh/ai-server/id_ed25519
```

(Save and exit: `Ctrl + O` -> `Enter` -> `Ctrl + X`.)

Verify passwordless connection:

```bash
ssh petroprog
```

(You should immediately access the remote prompt `petroprog@petroprog:~$` without password prompts. Type `exit` to return.)

### Step 1.4: Configure VS Code

1. Launch VS Code on Windows.
2. Open Extensions (`Ctrl + Shift + X`), search for and install:
   - **Remote - SSH** (Publisher: Microsoft, ID: `ms-vscode-remote.remote-ssh`).
3. Press `Ctrl + Shift + P` -> choose **Remote-SSH: Connect to Host...** -> select `petroprog`.
4. When prompted for the platform type, select **Linux**.
5. Once connected (status bar shows `SSH: petroprog` in bottom-left), open the project directory:
   - `File -> Open Folder... -> /home/petroprog/Projects/news-ai`.
6. Install remote extensions (under **SSH: PETROPROG** section in Extensions tab):
   - Python (Microsoft)
   - Docker (Microsoft)

## 3. Part 2: Server-Side Git & GitHub Integration

All steps in this section are executed in the VS Code integrated terminal (`` Ctrl + ` ``) on the Ubuntu server (`petroprog@petroprog:~/Projects/news-ai$`).

### Step 2.1: Configure Global Git Identity

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
git config --global init.defaultBranch main
```

### Step 2.2: Generate Server SSH Key for GitHub

Generate an Ed25519 key on the Ubuntu server:

```bash
ssh-keygen -t ed25519 -C "petroprog-server"
```

(Press Enter for all prompts to accept default path `/home/petroprog/.ssh/id_ed25519` and empty passphrase.)

Display and copy the public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

(Copy the output string starting with `ssh-ed25519 AAAA...`.)

### Step 2.3: Register the Key with GitHub

1. Go to your GitHub account: **Settings -> SSH and GPG keys -> New SSH key**.
2. Set **Title:** `Lenovo Server (Ubuntu)`.
3. Paste the copied public key into the **Key** field.
4. Click **Add SSH key**.
5. Test the connection from the server terminal:

```bash
ssh -T git@github.com
```

(Type `yes` when prompted to verify host authenticity. Expected output: `Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.`)

### Step 2.4: Link Local Repository to Existing GitHub Repo

```bash
cd ~/Projects/news-ai
# Initialize Git repository
git init
git branch -M main
# Add GitHub remote (ensure forward slashes '/' are used)
git remote add origin git@github.com:PetroProg/AI-news.git
# Pull remote branch contents (README, LICENSE, docs)
git pull origin main --allow-unrelated-histories
```

### Step 2.5: Stage, Commit, and Push

```bash
# Create local development .env from example template
cp .env.example .env
# Stage all files (tracked according to .gitignore)
git add .
# Create initial structured commit
git commit -m "feat: setup project structure, dockerfile and compose"
# Push to GitHub
git push -u origin main
```

## 4. Part 3: Troubleshooting & Common Pitfalls

**1. `cat: ~/.ssh/...: No such file or directory`**
- **Cause:** Running the key copy command on the Ubuntu server instead of the local Windows terminal.
- **Solution:** Verify the active shell prompt. `Admin@DESKTOP-...` is your Windows machine; `petroprog@petroprog:...` is your remote server.

**2. `ERROR: Repository not found` / `Could not read from remote repository`**
- **Cause:** Windows-style backslashes (`\`) were used in the Git URL (e.g., `PetroProg\AI-news.git`).
- **Solution:** Fix the remote URL using POSIX forward slashes:

```bash
git remote set-url origin git@github.com:PetroProg/AI-news.git
```

**3. `error: untracked working tree files would be overwritten by merge: README.md`**
- **Cause:** A local untracked file was created with the same name as a file incoming from GitHub.
- **Solution:** Delete the untracked local stub (`rm README.md`) and rerun `git pull origin main`.

**4. `Admin@petroprog's password: Permission denied`**
- **Cause:** Running `ssh petroprog` before configuring `~/.ssh/config` on Windows causes OpenSSH to default the username to the Windows user (`Admin`).
- **Solution:** Explicitly define `User petroprog` inside `~/.ssh/config`.

**5. `Permission denied (publickey)` on Linux Server**
- **Cause:** OpenSSH rejects keys if directory permissions are too open (`StrictModes`).
- **Solution:** Enforce secure permissions on the server:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 755 ~
```

## 5. Part 4: Daily Workflow Cheatsheet

```bash
# Check repository status
git status
# Stage and commit changes
git add .
git commit -m "feat: describe your change"
# Push to GitHub
git push
# Pull latest changes
git pull
# Inspect Docker services
docker compose ps
docker compose logs -f
```

To save this guide to your repository, you can create the file `docs/vscode-ssh-github-setup.md`, paste the content above, and commit it:

```bash
git add docs/vscode-ssh-github-setup.md
git commit -m "docs: add vscode remote ssh and github setup guide"
git push
```