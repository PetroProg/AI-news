import os
import sys

# Try passlib or bcrypt or hashlib
try:
    import bcrypt
    pw_hash = ""
except Exception:
    # Standard bcrypt string
    pw_hash = ""

config = f"""bind_host: 0.0.0.0
bind_port: 3000
users:
  - name: admin
    password: {pw_hash}
auth_attempts: 5
block_auth_min: 15
http_proxy: ""
language: ru
theme: dark
debug_pprof: false
web_session_ttl_hours: 720
dns:
  bind_hosts:
    - 0.0.0.0
  port: 53
  statistics_interval: 1
  querylog_enabled: true
  querylog_file_enabled: true
  querylog_interval: 24h
  querylog_size_memory: 1000
  anonymize_client_ip: false
  protection_enabled: true
  blocking_mode: default
  blocking_ipv4: ""
  blocking_ipv6: ""
  blocked_response_ttl: 10
  parental_block_host: family-block.adguard.org
  safebrowsing_block_host: standard-block.adguard.org
  parental_enabled: false
  safebrowsing_enabled: true
  ratelimit: 0
  ratelimit_whitelist: []
  refuse_any: true
  upstream_dns:
    - https://cloudflare-dns.com/dns-query
    - https://dns.quad9.net/dns-query
    - 1.1.1.1
    - 9.9.9.9
  upstream_dns_file: ""
  bootstrap_dns:
    - 1.1.1.1
    - 9.9.9.9
  all_servers: false
  fastest_addr: true
  fastest_timeout: 1s
  allowed_clients: []
  disallowed_clients: []
  blocked_hosts: []
  trusted_proxies:
    - 127.0.0.0/8
    - 172.16.0.0/12
    - 192.168.0.0/16
    - 10.0.0.0/8
  cache_size: 4194304
  cache_ttl_min: 0
  cache_ttl_max: 0
  cache_optimistic: false
  bogus_nxdomain: []
  aaaa_disabled: true
  enable_dnssec: false
  edns_client_subnet:
    custom_ip: ""
    enabled: false
    use_custom: false
  max_goroutines: 300
  handle_ddr: true
  serve_http3: false
  use_private_ptr_resolvers: true
  fallback_dns:
    - 1.1.1.1
    - 8.8.8.8
tls:
  enabled: false
filters:
  - enabled: true
    url: https://adguardteam.github.io/HostlistsRegistry/assets/filter_1.txt
    name: AdGuard DNS filter
    id: 1
  - enabled: true
    url: https://adguardteam.github.io/HostlistsRegistry/assets/filter_2.txt
    name: AdAway Default Blocklist
    id: 2
whitelist_filters: []
user_rules:
  - "@@||spotify.com^"
  - "@@||scdn.co^"
  - "@@||spotifycdn.com^"
  - "@@||gvt2.com^"
  - "@@||gvt3.com^"
  - "@@||widevine.com^"
dhcp:
  enabled: false
clients:
  runtime_sources:
    whois: true
    arp: true
    rdns: true
    dhcp: true
    hosts: true
  persistent: []
log:
  file: ""
  max_backups: 0
  max_size: 100
  max_age: 3
  compress: false
  local_time: false
  verbose: false
schema_version: 29
"""

conf_dir = os.path.join(os.getcwd(), "adguard", "conf")
os.makedirs(conf_dir, exist_ok=True)
work_dir = os.path.join(os.getcwd(), "adguard", "work")
os.makedirs(work_dir, exist_ok=True)

target_file = os.path.join(conf_dir, "AdGuardHome.yaml")
with open(target_file, "w", encoding="utf-8") as f:
    f.write(config)

print(f"Created {target_file} successfully")
