"""
Synthetic NetFlow-like dataset generator for GRVTY Fusion Workbench – Phase 1.

Produces configurable flow records across 75 unique IPs, 6 traffic categories,
and a 48-hour time window.  Each category approximates realistic network behaviour
so downstream detectors and graph visualizers receive meaningful signal.
"""
import random
from datetime import datetime, timedelta
from typing import List, Tuple

import numpy as np
import pandas as pd

# Traffic segment ratios must sum to 1.0
_SEGMENTS = [
    ("PortScan",    "reconnaissance",      0.20),
    ("Benign",      "normal",              0.40),
    ("Brute Force", "credential_access",   0.20),
    ("DoS",         "dos",                 0.10),
    ("Web Attack",  "web_exploit",         0.06),
    ("Infiltration","lateral_movement",    0.04),
]

_COMMON_PORTS  = [80, 443, 8080, 22, 25, 53, 3389, 8443, 21, 110, 143, 5432, 6379]
_SCAN_PORTS    = list(range(21, 1025))
_LATERAL_PORTS = [445, 139, 3389, 22, 135, 5985, 5986]
_WEB_PORTS     = [80, 443, 8080, 8443]
_BF_PORTS      = [22, 3389, 445, 5900, 23]
_FLAGS_TCP     = ["PA", "A", "FA", "SA", "S", "RA"]


# ── Public API ────────────────────────────────────────────────────────────────

def generate_synthetic_flows(n: int = 500, seed: int = 42) -> pd.DataFrame:
    """
    Generate a synthetic NetFlow-like DataFrame.

    Parameters
    ----------
    n : int
        Total number of flow records (default 500).
    seed : int
        Random seed for reproducibility.

    Returns
    -------
    pd.DataFrame
        Columns match the GRVTY normalized schema:
        timestamp, src_ip, dst_ip, src_port, dst_port, protocol,
        bytes, packets, duration, tcp_flags, label, category, sensor.
    """
    rng = random.Random(seed)
    np.random.seed(seed)

    internal_ips, external_ips = _make_ip_pools(rng)
    all_ips = internal_ips + external_ips  # exactly 75

    t0 = datetime.utcnow() - timedelta(hours=48)

    def ts(start_h: float, end_h: float) -> datetime:
        return t0 + timedelta(seconds=rng.uniform(start_h * 3600, end_h * 3600))

    # Fixed role IPs to make patterns detectable
    scanners   = internal_ips[:3]
    dos_src    = external_ips[5]
    bf_src     = external_ips[0]
    bf_tgt     = internal_ips[10]
    web_tgts   = internal_ips[:2]
    dos_tgts   = internal_ips[:4]

    sizes = _split(n, [r for _, _, r in _SEGMENTS])
    n_scan, n_benign, n_bf, n_dos, n_web, n_inf = sizes

    records: list = []

    # ── Port scan ─────────────────────────────────────────────────────────────
    for _ in range(n_scan):
        records.append({
            "timestamp": ts(0, 10),
            "src_ip":    rng.choice(scanners),
            "dst_ip":    rng.choice([ip for ip in all_ips if ip not in scanners]),
            "src_port":  rng.randint(30000, 65535),
            "dst_port":  rng.choice(_SCAN_PORTS),
            "protocol":  "TCP",
            "bytes":     rng.randint(40, 120),
            "packets":   rng.randint(1, 3),
            "duration":  round(rng.uniform(0.0, 0.3), 4),
            "tcp_flags": "S",
            "label":     "PortScan",
            "category":  "reconnaissance",
            "sensor":    "synthetic",
        })

    # ── Benign high-volume ────────────────────────────────────────────────────
    for _ in range(n_benign):
        proto = rng.choice(["TCP", "TCP", "UDP"])
        records.append({
            "timestamp": ts(0, 48),
            "src_ip":    rng.choice(internal_ips),
            "dst_ip":    rng.choice(all_ips),
            "src_port":  rng.randint(1024, 65535),
            "dst_port":  rng.choice(_COMMON_PORTS),
            "protocol":  proto,
            "bytes":     rng.randint(512, 5_000_000),
            "packets":   rng.randint(5, 10_000),
            "duration":  round(rng.uniform(0.1, 600), 3),
            "tcp_flags": rng.choice(_FLAGS_TCP) if proto == "TCP" else "",
            "label":     "Benign",
            "category":  "normal",
            "sensor":    "synthetic",
        })

    # ── Brute force (suspicious repeated flows) ───────────────────────────────
    for _ in range(n_bf):
        records.append({
            "timestamp": ts(12, 36),
            "src_ip":    bf_src,
            "dst_ip":    bf_tgt,
            "src_port":  rng.randint(10000, 65535),
            "dst_port":  rng.choice(_BF_PORTS),
            "protocol":  "TCP",
            "bytes":     rng.randint(60, 400),
            "packets":   rng.randint(2, 8),
            "duration":  round(rng.uniform(0.01, 1.5), 4),
            "tcp_flags": rng.choice(["SA", "RA", "S", "RA"]),
            "label":     "Brute Force",
            "category":  "credential_access",
            "sensor":    "synthetic",
        })

    # ── DoS (high packet rate) ────────────────────────────────────────────────
    for _ in range(n_dos):
        proto = rng.choice(["UDP", "UDP", "TCP"])
        records.append({
            "timestamp": ts(20, 28),
            "src_ip":    dos_src,
            "dst_ip":    rng.choice(dos_tgts),
            "src_port":  rng.randint(1024, 65535),
            "dst_port":  rng.choice([80, 443, 53]),
            "protocol":  proto,
            "bytes":     rng.randint(1500, 65000),
            "packets":   rng.randint(500, 50000),
            "duration":  round(rng.uniform(0.001, 0.1), 6),
            "tcp_flags": "",
            "label":     "DoS",
            "category":  "dos",
            "sensor":    "synthetic",
        })

    # ── Web attacks ───────────────────────────────────────────────────────────
    for _ in range(n_web):
        records.append({
            "timestamp": ts(24, 48),
            "src_ip":    rng.choice(external_ips[1:12]),
            "dst_ip":    rng.choice(web_tgts),
            "src_port":  rng.randint(1024, 65535),
            "dst_port":  rng.choice(_WEB_PORTS),
            "protocol":  "TCP",
            "bytes":     rng.randint(500, 80000),
            "packets":   rng.randint(5, 200),
            "duration":  round(rng.uniform(0.2, 45), 3),
            "tcp_flags": "PA",
            "label":     "Web Attack",
            "category":  "web_exploit",
            "sensor":    "synthetic",
        })

    # ── Lateral movement / infiltration ───────────────────────────────────────
    for _ in range(n_inf):
        src = rng.choice(internal_ips[:10])
        dst = rng.choice([ip for ip in internal_ips if ip != src])
        records.append({
            "timestamp": ts(30, 48),
            "src_ip":    src,
            "dst_ip":    dst,
            "src_port":  rng.randint(1024, 65535),
            "dst_port":  rng.choice(_LATERAL_PORTS),
            "protocol":  "TCP",
            "bytes":     rng.randint(2000, 200_000),
            "packets":   rng.randint(50, 1000),
            "duration":  round(rng.uniform(5, 900), 2),
            "tcp_flags": "PA",
            "label":     "Infiltration",
            "category":  "lateral_movement",
            "sensor":    "synthetic",
        })

    df = pd.DataFrame(records)
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)
    return df


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_ip_pools(rng: random.Random) -> Tuple[List[str], List[str]]:
    """Return (50 internal, 25 external) unique IP strings."""
    seen: set = set()

    internal: List[str] = []
    while len(internal) < 50:
        ip = f"10.{rng.randint(0,5)}.{rng.randint(0,9)}.{rng.randint(1,254)}"
        if ip not in seen:
            seen.add(ip)
            internal.append(ip)

    external: List[str] = []
    while len(external) < 25:
        a = rng.randint(1, 223)
        while a in (10, 127, 172, 192, 198, 203):
            a = rng.randint(1, 223)
        ip = f"{a}.{rng.randint(0,255)}.{rng.randint(0,255)}.{rng.randint(1,254)}"
        if ip not in seen:
            seen.add(ip)
            external.append(ip)

    return internal, external


def _split(total: int, ratios: List[float]) -> List[int]:
    """Distribute `total` records across buckets by ratio with no rounding error."""
    sizes = [int(total * r) for r in ratios]
    remainder = total - sum(sizes)
    for i in range(remainder):
        sizes[i % len(sizes)] += 1
    return sizes
