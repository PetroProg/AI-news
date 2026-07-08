# Ubuntu Server Setup: Basic Checklist

## Step 0. System Update

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt autoremove -y
sudo reboot
```

After the reboot, reconnect via SSH.

---

## Step 1. Basic Utilities

```bash
sudo apt install -y \
  git \
  curl \
  wget \
  vim \
  nano \
  tree \
  zip \
  unzip \
  jq \
  htop \
  btop \
  tmux \
  build-essential \
  ca-certificates \
  software-properties-common \
  apt-transport-https \
  gnupg \
  lsb-release
```

Verify:

```bash
git --version
curl --version
btop
```

---

## Step 2. Git Configuration

```bash
git config --global user.name "PetroProg"
git config --global user.email "your_email"
```

Verify:

```bash
git config --list
```

---

## Step 3. Python

Install:

```bash
sudo apt install -y \
  python3 \
  python3-pip \
  python3-venv \
  python3-dev \
  pipx
```

Verify:

```bash
python3 --version
pip3 --version
```

Configure pipx:

```bash
pipx ensurepath
```

Reconnect via SSH.

Verify:

```bash
pipx --version
```

---

## Step 4. SSH (if not already done)

Check status:

```bash
sudo systemctl status ssh
```

Enable on startup:

```bash
sudo systemctl enable ssh
```

---

## Step 5. Firewall

Allow only SSH.

```bash
sudo ufw allow OpenSSH
sudo ufw enable
```

Verify:

```bash
sudo ufw status
```