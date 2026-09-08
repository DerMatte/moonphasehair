#!/usr/bin/env bash
# Cloud Agent start: idempotent per-boot service reconciliation.
# Brings up the Docker daemon and the local Supabase stack, then returns.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
log() { echo "[start] $*"; }

# Legacy iptables backend is required for Docker bridge networking in the
# nested Cloud Agent VM (container-to-container traffic is dropped otherwise).
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy >/dev/null 2>&1 || true
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy >/dev/null 2>&1 || true

# Ensure the Docker daemon is running (no systemd in the VM).
if ! sudo docker info >/dev/null 2>&1; then
	log "Starting Docker daemon"
	sudo rm -f /var/run/docker.pid /var/run/docker/containerd/containerd.pid 2>/dev/null || true
	sudo bash -c 'nohup dockerd >/var/log/dockerd.log 2>&1 &'
	for _ in $(seq 1 60); do
		sudo docker info >/dev/null 2>&1 && break
		sleep 1
	done
fi
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

# Ensure the local Supabase stack is running. `supabase start` is idempotent:
# it reuses existing images and the migrated database volume when present.
if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^supabase_db_workspace$'; then
	log "Starting local Supabase (first boot may pull images)"
	supabase start
else
	log "Local Supabase already running"
fi

# Apply any migrations added since the volume was created (no-op when current).
supabase migration up >/dev/null 2>&1 || true

log "Ready — Supabase API at http://127.0.0.1:54321"
