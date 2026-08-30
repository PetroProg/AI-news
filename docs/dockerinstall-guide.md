# Docker Engine — Installation on Ubuntu 26.04 LTS

Step-by-step installation of **Docker Engine** on a server running **Ubuntu 26.04 LTS (Resolute Raccoon)**.

This setup is intended for my local project server: Docker Engine + Docker Compose, without Docker Desktop.

> Verified against the official Docker documentation.
>
> Official docs: https://docs.docker.com/engine/install/ubuntu/

---

## 1. Requirements

Check Ubuntu version:

```bash
cat /etc/os-release
```

Expected:

```text
PRETTY_NAME="Ubuntu 26.04 LTS"
VERSION_ID="26.04"
VERSION_CODENAME=resolute
```

Check architecture:

```bash
dpkg --print-architecture
```

For a standard x86-64 PC/laptop, expect:

```text
amd64
```

---

## 2. Update the system

Before installing Docker, update the package index and install available updates:

```bash
sudo apt update
sudo apt upgrade -y
```

If Ubuntu reports that `dpkg` is locked by the `unattended-upgrade` process, do **not** remove the lock files manually. Wait for the automatic update to finish.

Check:

```bash
ps aux | grep -E 'apt|dpkg|unattended'
```

---

## 3. Remove potentially conflicting packages

Docker recommends removing old/unofficial Docker packages and conflicting `containerd`/`runc` installations, if present:

```bash
sudo apt remove -y \
docker.io \
docker-compose \
docker-compose-v2 \
docker-doc \
docker-buildx \
podman-docker \
containerd \
runc
```

If some packages aren't installed, that's fine.

---

## 4. Install dependencies

```bash
sudo apt install -y ca-certificates curl
```

---

## 5. Add Docker's official GPG key

Create the keyrings directory:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

Download the official key:

```bash
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
-o /etc/apt/keyrings/docker.asc
```

Make the key readable by APT:

```bash
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

---

## 6. Add the official Docker repository

For Ubuntu 26.04, the codename `resolute` is used.

Docker recommends using the modern `.sources` format:

```bash
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Update the package list:

```bash
sudo apt update
```

---

## 7. Verify that APT sees Docker

Before installing, you can check:

```bash
apt-cache policy docker-ce
```

The output should show a `Candidate` with a version from:

```text
https://download.docker.com/linux/ubuntu
```

If:

```text
Candidate: (none)
```

do not proceed with the installation — fix the repository configuration first.

You can also check the source:

```bash
apt-cache madison docker-ce
```

---

## 8. Install Docker Engine

Install Docker Engine, CLI, containerd, Buildx, and Compose:

```bash
sudo apt install -y \
docker-ce \
docker-ce-cli \
containerd.io \
docker-buildx-plugin \
docker-compose-plugin
```

After installation, check the service:

```bash
sudo systemctl status docker
```

Expected:

```text
Active: active (running)
```

If Docker isn't running:

```bash
sudo systemctl start docker
```

Enable Docker to start automatically on boot:

```bash
sudo systemctl enable docker
```

Check:

```bash
sudo systemctl is-enabled docker
```

Expected:

```text
enabled
```

---

## 9. Verify Docker

Check the version:

```bash
docker --version
```

Check Compose:

```bash
docker compose version
```

Check Buildx:

```bash
docker buildx version
```

Run the official test container:

```bash
sudo docker run hello-world
```

If everything is installed correctly, Docker will pull the test image and print:

```text
Hello from Docker!
```

---

## 10. Allow running Docker without sudo

By default, Docker requires `sudo`.

Add the current user to the `docker` group:

```bash
sudo usermod -aG docker $USER
```

You then need to refresh your group membership.

Option without rebooting/reconnecting:

```bash
newgrp docker
```

Or simply log out of SSH completely and reconnect.

Check:

```bash
groups
```

`docker` should appear in the list.

Now test:

```bash
docker run hello-world
```

The command should work without `sudo`.

> **Important:** membership in the `docker` group effectively grants root-level privileges via the Docker daemon. Only add trusted users to this group.

---

## 11. Final check

Run:

```bash
docker --version
docker compose version
docker buildx version
systemctl is-active docker
systemctl is-enabled docker
docker run hello-world
```

Expected result:

- Docker is installed
- Docker Compose is available as `docker compose`
- Buildx is installed
- Docker is running
- Docker starts automatically on boot
- the `hello-world` container runs without `sudo`

---

# Useful Docker commands

## Docker status

```bash
sudo systemctl status docker
```

## Start Docker

```bash
sudo systemctl start docker
```

## Stop Docker

```bash
sudo systemctl stop docker
```

## Restart Docker

```bash
sudo systemctl restart docker
```

## Check version

```bash
docker --version
docker compose version
```

## List running containers

```bash
docker ps
```

## List all containers

```bash
docker ps -a
```

## List images

```bash
docker images
```

## List networks

```bash
docker network ls
```

## List volumes

```bash
docker volume ls
```

## Check Docker disk usage

```bash
docker system df
```

---

# Docker Compose

In recent Docker versions, Compose is used as a subcommand:

```bash
docker compose
```

For example:

```bash
docker compose up -d
```

Stop the project:

```bash
docker compose down
```

List Compose containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs
```

Follow logs:

```bash
docker compose logs -f
```

Rebuild containers:

```bash
docker compose build
```

Rebuild and start:

```bash
docker compose up -d --build
```

---

# Docker project structure

For a future news aggregator project, the structure might look like this:

```text
news-ai/
├── docker-compose.yml
├── .env
├── .gitignore
├── README.md
│
├── app/
│   ├── src/
│   ├── tests/
│   └── requirements.txt
│
├── collectors/
│   ├── telegram/
│   ├── websites/
│   └── rss/
│
├── ai/
│   └── ...
│
├── database/
│   └── ...
│
└── data/
```

At the first stage, there's no need to create this entire structure. First, make sure Docker itself is working.

---

# Important notes

## Don't install Docker Desktop on the server

Docker Desktop is not needed for this project.

The following are used instead:

```text
Docker Engine
Docker Compose Plugin
Buildx
containerd
```

This is the server-side variant of Docker.

---

## Avoid the convenience script unless necessary

Docker provides an install script:

```bash
curl -fsSL https://get.docker.com | sudo sh
```

But for this project, it's better to use the official APT repository.

Advantages:

- packages are managed via APT
- easier to update
- easier to control the package source
- installation is more transparent

---

# If Docker is already installed incorrectly

First, check:

```bash
docker --version
```

Check packages:

```bash
dpkg -l | grep -E 'docker|containerd'
```

Check the repository:

```bash
cat /etc/apt/sources.list.d/docker.sources
```

Check the package source:

```bash
apt-cache policy docker-ce
```

Do not remove `/var/lib/docker` unless necessary: it may contain containers, images, and volumes.

---

# Official documentation

- Docker Engine on Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Docker Engine: https://docs.docker.com/engine/
- Docker Compose: https://docs.docker.com/compose/
- Docker CLI: https://docs.docker.com/reference/cli/docker/

---

## Guide version

**OS:** Ubuntu 26.04 LTS
**Codename:** Resolute Raccoon (`resolute`)
**Installation method:** official Docker APT repository
**Docker:** Docker Engine
**Compose:** Docker Compose Plugin
**Architecture:** amd64 / x86-64