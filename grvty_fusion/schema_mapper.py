"""
Schema mapper for GRVTY Fusion Workbench – Phase 1.

Handles diverse NetFlow field naming conventions across:
  - CICIDS2017 / CICFlowMeter CSV
  - CSE-CIC-IDS2018 CSV
  - NF-UNSW-NB15 / NF-UNSW-NB15-V2 NetFlow CSV
  - Zeek conn.log TSV
  - GRVTY / Eric JSONL NetFlow records
"""
import ipaddress
import re
from collections import Counter
from typing import Dict, List, Optional, Tuple

import pandas as pd

# ── Canonical schema ──────────────────────────────────────────────────────────
#
# Each key is the normalized output column name.
# Values are known source-field aliases, matched case-insensitively after
# collapsing whitespace, underscores, hyphens, and dots to a single space.

FIELD_VARIANTS: Dict[str, List[str]] = {
    "src_ip": [
        # Generic
        "src_ip", "src_ip_addr", "source_ip", "source ip", "srcip", "sip",
        "sa", "src_addr", "ip_src", "flow_src_ip", "orig_ip",
        # IPFIX / NetFlow
        "ipv4_src_addr", "ipv6_src_addr",
        # Zeek
        "id.orig_h",
        # GRVTY
        "src ip addr",
    ],
    "dst_ip": [
        "dst_ip", "dst_ip_addr", "destination_ip", "destination ip", "dstip",
        "dip", "da", "dst_addr", "ip_dst", "flow_dst_ip", "resp_ip",
        "ipv4_dst_addr", "ipv6_dst_addr",
        "id.resp_h",
        "dst ip addr",
    ],
    "src_port": [
        "src_port", "source_port", "source port", "srcport", "sport",
        "src_prt", "l4_src_port", "l4 src port",
        "id.orig_p",
    ],
    "dst_port": [
        "dst_port", "destination_port", "destination port", "dstport", "dport",
        "dst_prt", "l4_dst_port", "l4 dst port",
        "id.resp_p",
    ],
    "protocol": [
        "protocol", "proto", "prot", "ip_protocol", "ip_proto",
        "transport_protocol",
        # Zeek
        "id.proto",
    ],
    "bytes": [
        # Generic
        "bytes", "byte_count", "total_bytes", "flow_bytes", "num_octets",
        # NetFlow / IPFIX
        "in_bytes", "out_bytes", "orig_bytes", "resp_bytes",
        # CICFlowMeter
        "totlen fwd pkts", "total_length_of_fwd_packets",
        "total fwd bytes", "fwd_header_length", "flow bytes/s",
        # UNSW-NB15
        "sbytes", "dbytes",
    ],
    "packets": [
        "packets", "pkt_count", "num_pkts", "flow_pkts",
        "in_pkts", "out_pkts", "orig_pkts", "resp_pkts",
        "total fwd packets", "total_fwd_packets", "tot_fwd_pkts",
        # UNSW-NB15
        "spkts", "dpkts",
    ],
    "duration": [
        "duration", "dur", "elapsed", "conn_duration", "flow_duration",
        # CICFlowMeter
        "flow duration",
    ],
    "timestamp": [
        "timestamp", "ts", "time", "datetime", "date_time",
        "start", "start_time", "start_ts", "flow_start",
        "flow_timestamp", "first_seen",
        # GRVTY
        "event_time",
    ],
    "tcp_flags": [
        "tcp_flags", "tcp flags", "flags", "tcp_flag", "flag",
        # CICFlowMeter
        "fwd psh flags", "bwd psh flags",
    ],
    "label": [
        "label", "class", "classification", "attack", "attack_type",
        "flow_label", "traffic_type", "type",
        # CICIDS / UNSW-NB15
        "attack_cat",
        # CIC-IDS
        " label",  # leading-space variant seen in the wild
    ],
    "category": [
        "category", "traffic_category", "flow_category",
        # GRVTY enrichment
        "src_ip_categories", "dst_ip_categories",
    ],
    "sensor": [
        "sensor", "source", "dataset", "probe", "collector",
        "monitor", "agent", "device", "interface",
    ],
}

# Protocol number → name (IANA assignments)
_PROTO_MAP: Dict[str, str] = {
    "1":  "ICMP",   "6":  "TCP",    "17": "UDP",
    "41": "IPv6",   "47": "GRE",    "50": "ESP",
    "51": "AH",     "58": "ICMPv6", "89": "OSPF",
    "icmp": "ICMP", "tcp": "TCP",   "udp": "UDP",
    "ipv6": "IPv6", "gre": "GRE",   "esp": "ESP",
    "icmpv6": "ICMPv6",
}


# ── Normalisation helper ──────────────────────────────────────────────────────

def _norm(text: str) -> str:
    """Collapse whitespace/underscores/hyphens/dots → single space, lowercase."""
    return re.sub(r"[\s_\-\.]+", " ", text.strip().lower())


# ── Public API ────────────────────────────────────────────────────────────────

def detect_mapping(columns: List[str]) -> Dict[str, Optional[str]]:
    """
    Auto-detect canonical → source_column mapping from a list of column names.

    Returns a dict keyed by every canonical field; unmapped fields have value None.
    The first match wins (variant list order is priority order).
    """
    # Build lookup: normalized_variant → canonical field name
    lookup: Dict[str, str] = {}
    for canonical, variants in FIELD_VARIANTS.items():
        for v in variants:
            n = _norm(v)
            if n not in lookup:
                lookup[n] = canonical

    mapping: Dict[str, Optional[str]] = {k: None for k in FIELD_VARIANTS}
    for col in columns:
        canonical = lookup.get(_norm(col))
        if canonical and mapping[canonical] is None:
            mapping[canonical] = col

    return mapping


def apply_mapping(
    raw_df: pd.DataFrame,
    mapping: Dict[str, Optional[str]],
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Rename / select source columns into the canonical schema.

    Unmapped source columns are preserved with a ``meta_`` prefix so no
    information is silently discarded.

    Returns
    -------
    norm_df : pd.DataFrame
        Canonical columns (always present, may be all-None if unmapped) plus
        ``meta_*`` columns for every unmapped source field.
    unmapped_cols : list[str]
        Names of source columns not assigned to any canonical field.
    """
    mapped_sources = {v for v in mapping.values() if v}
    unmapped_cols = [c for c in raw_df.columns if c not in mapped_sources]

    norm = pd.DataFrame(index=raw_df.index)

    for canonical in FIELD_VARIANTS:
        src = mapping.get(canonical)
        if src and src in raw_df.columns:
            norm[canonical] = raw_df[src].values
        else:
            norm[canonical] = None

    for col in unmapped_cols:
        norm[f"meta_{col}"] = raw_df[col].values

    return norm, unmapped_cols


def validate_and_coerce(
    norm_df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.DataFrame, dict]:
    """
    Validate a normalized DataFrame and coerce field types.

    Validation rules
    ----------------
    * Records missing **src_ip** or **dst_ip** are skipped unconditionally.
    * Records where src_ip / dst_ip cannot be parsed as a valid IP are skipped.
    * All other canonical fields are optional; missing values become NaN.
    * Numeric fields (ports, bytes, packets, duration) are coerced with
      ``pd.to_numeric(errors='coerce')``.
    * Timestamps are parsed with ``pd.to_datetime(errors='coerce')``.
    * Protocol numbers are converted to IANA names where known.

    Returns
    -------
    valid_df : pd.DataFrame
    skipped_df : pd.DataFrame   — includes ``_skip_reason`` column
    report : dict               — ingestion statistics
    """
    coercion_notes: List[str] = []
    n_total = len(norm_df)

    skip_mask = pd.Series(False, index=norm_df.index)
    skip_reasons = pd.Series("", index=norm_df.index, dtype=str)

    # ── Require src_ip and dst_ip ─────────────────────────────────────────────
    for field in ("src_ip", "dst_ip"):
        if field not in norm_df.columns or norm_df[field].isna().all():
            skip_mask[:] = True
            skip_reasons[:] = f"no_column_{field}"
            break

        empty = norm_df[field].isna() | (norm_df[field].astype(str).str.strip() == "")
        new   = empty & ~skip_mask
        skip_reasons[new] = f"missing_{field}"
        skip_mask |= empty

    # ── Validate IP address format ────────────────────────────────────────────
    def _valid_ip(val) -> bool:
        try:
            ipaddress.ip_address(str(val).strip())
            return True
        except ValueError:
            return False

    for field in ("src_ip", "dst_ip"):
        if field in norm_df.columns and (~skip_mask).any():
            bad = ~norm_df.loc[~skip_mask, field].apply(_valid_ip)
            bad_idx = bad[bad].index
            skip_reasons[bad_idx] = f"invalid_ip_{field}"
            skip_mask[bad_idx] = True

    # ── Split valid / skipped ─────────────────────────────────────────────────
    valid_df   = norm_df[~skip_mask].copy()
    skipped_df = norm_df[skip_mask].copy()
    if not skipped_df.empty:
        skipped_df["_skip_reason"] = skip_reasons[skip_mask]

    # ── Coerce numeric fields ─────────────────────────────────────────────────
    for field in ("src_port", "dst_port", "bytes", "packets", "duration"):
        if field in valid_df.columns:
            before_na = int(valid_df[field].isna().sum())
            valid_df[field] = pd.to_numeric(valid_df[field], errors="coerce")
            newly_na = int(valid_df[field].isna().sum()) - before_na
            if newly_na > 0:
                coercion_notes.append(
                    f"{field}: {newly_na} value(s) could not be coerced to numeric"
                )

    # ── Parse timestamps ──────────────────────────────────────────────────────
    if "timestamp" in valid_df.columns:
        before_na = int(valid_df["timestamp"].isna().sum())
        valid_df["timestamp"] = pd.to_datetime(valid_df["timestamp"], errors="coerce")
        newly_na = int(valid_df["timestamp"].isna().sum()) - before_na
        if newly_na > 0:
            coercion_notes.append(
                f"timestamp: {newly_na} value(s) could not be parsed as datetime"
            )

    # ── Normalise protocol ────────────────────────────────────────────────────
    if "protocol" in valid_df.columns:
        def _norm_proto(val):
            if pd.isna(val):
                return val
            s = str(val).strip()
            try:
                return _PROTO_MAP.get(str(int(float(s))), s)
            except (ValueError, TypeError):
                return _PROTO_MAP.get(s.lower(), s.upper())
        valid_df["protocol"] = valid_df["protocol"].apply(_norm_proto)

    # ── Field fill rates (canonical fields, valid records only) ───────────────
    n_valid = len(valid_df)
    fill_rates: Dict[str, dict] = {}
    for col in FIELD_VARIANTS:
        if col in valid_df.columns:
            filled = int(valid_df[col].notna().sum())
            fill_rates[col] = {
                "filled": filled,
                "total":  n_valid,
                "pct":    int(100 * filled / n_valid) if n_valid else 0,
            }

    # ── Skip reason summary ───────────────────────────────────────────────────
    reason_counts = dict(Counter(r for r in skip_reasons[skip_mask] if r))

    report = {
        "total_input":      n_total,
        "valid":            n_valid,
        "skipped":          int(skip_mask.sum()),
        "skip_reasons":     reason_counts,
        "field_fill_rates": fill_rates,
        "coercion_notes":   coercion_notes,
    }

    return valid_df, skipped_df, report
