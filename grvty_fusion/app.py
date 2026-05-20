"""
GRVTY Fusion Workbench – Phase 1
Ingestion · Schema Normalization · Validation · Export

Supported input formats:
  - CSV / TSV (CICIDS2017, CSE-CIC-IDS2018, NF-UNSW-NB15, Zeek conn.log, …)
  - JSONL / NDJSON (GRVTY NetFlow records, any flat JSON lines)
  - Built-in synthetic demo data

Run:
  streamlit run app.py
"""
import io
import json

import pandas as pd
import streamlit as st

from schema_mapper import (
    FIELD_VARIANTS,
    apply_mapping,
    detect_mapping,
    validate_and_coerce,
)
from synthetic_data import generate_synthetic_flows

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="GRVTY Fusion Workbench – Phase 1",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ── Helper: reset per-field widget state on new dataset ──────────────────────
def _reset_mapping_state() -> None:
    """Remove selectbox session-state keys so fresh auto-detect values apply."""
    to_delete = [k for k in st.session_state if k.startswith("map_")]
    for k in to_delete:
        del st.session_state[k]


# ── Header ────────────────────────────────────────────────────────────────────
st.title("⚡ GRVTY Fusion Workbench — Phase 1")
st.caption(
    "Ingestion · Schema Normalization · Validation · Export  "
    "| Supports CICIDS2017 · CSE-CIC-IDS2018 · NF-UNSW-NB15 · Zeek conn.log · GRVTY JSONL"
)

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.header("📂 Data Source")
    source = st.radio("Input type", ["Synthetic Demo", "CSV / TSV", "JSONL"])

    if source == "Synthetic Demo":
        n_records = st.slider(
            "Records", min_value=100, max_value=2000, value=500, step=50
        )
        seed = int(st.number_input("Random seed", value=42, step=1))
        if st.button("Generate Dataset", type="primary", use_container_width=True):
            with st.spinner("Generating synthetic flows…"):
                df = generate_synthetic_flows(n=n_records, seed=seed)
            st.session_state["raw_df"]      = df
            st.session_state["source_name"] = (
                f"Synthetic demo — {n_records} records, seed={seed}"
            )
            _reset_mapping_state()
            st.success(f"✅ {len(df):,} records generated")

    elif source == "CSV / TSV":
        uploaded = st.file_uploader(
            "Upload CSV / TSV / log file",
            type=["csv", "tsv", "txt", "log"],
        )
        sep = st.selectbox("Delimiter", [",", "\t", "|", ";"], index=0)
        if uploaded is not None:
            try:
                with st.spinner("Parsing CSV…"):
                    df = pd.read_csv(uploaded, sep=sep, low_memory=False)
                st.session_state["raw_df"]      = df
                st.session_state["source_name"] = uploaded.name
                _reset_mapping_state()
                st.success(
                    f"✅ {len(df):,} rows · {len(df.columns)} columns"
                )
            except Exception as exc:
                st.error(f"Parse error: {exc}")

    elif source == "JSONL":
        uploaded = st.file_uploader(
            "Upload JSONL / NDJSON",
            type=["jsonl", "ndjson", "json"],
        )
        if uploaded is not None:
            try:
                with st.spinner("Parsing JSONL…"):
                    text    = uploaded.read().decode("utf-8")
                    records = [
                        json.loads(ln) for ln in text.splitlines() if ln.strip()
                    ]
                    df = pd.DataFrame(records)
                st.session_state["raw_df"]      = df
                st.session_state["source_name"] = uploaded.name
                _reset_mapping_state()
                st.success(f"✅ {len(df):,} records")
            except Exception as exc:
                st.error(f"Parse error: {exc}")

    st.divider()
    st.caption(
        "**Phase 1 only** — ingestion, normalization, validation.\n\n"
        "Graph visualization, DNS fusion, and LLM synthesis arrive in later phases."
    )

# ── Guard: require data ───────────────────────────────────────────────────────
if "raw_df" not in st.session_state:
    st.info("👈 Choose a data source in the sidebar to begin.")
    st.stop()

raw_df: pd.DataFrame = st.session_state["raw_df"]
source_name: str     = st.session_state.get("source_name", "unknown")

if raw_df.empty:
    st.warning("Loaded dataset is empty. Please check the file.")
    st.stop()

# ── Auto-detect field mapping ─────────────────────────────────────────────────
auto_mapping = detect_mapping(list(raw_df.columns))

# ── Tabs ──────────────────────────────────────────────────────────────────────
tab_raw, tab_map, tab_norm, tab_report = st.tabs(
    ["📂 Raw Data", "🗺️ Schema Mapping", "✅ Normalized Data", "📊 Ingestion Report"]
)

# ── TAB 1: Raw Data Preview ───────────────────────────────────────────────────
with tab_raw:
    st.subheader(f"Raw Data — {source_name}")

    c1, c2, c3 = st.columns(3)
    c1.metric("Rows",    f"{len(raw_df):,}")
    c2.metric("Columns", len(raw_df.columns))
    c3.metric(
        "Memory",
        f"{raw_df.memory_usage(deep=True).sum() / 1_048_576:.2f} MB",
    )

    with st.expander("Column names detected", expanded=True):
        st.code(", ".join(raw_df.columns.tolist()))

    n_prev = st.slider("Rows to preview", 5, 200, 20, key="raw_n")
    st.dataframe(raw_df.head(n_prev), use_container_width=True)


# ── TAB 2: Schema Mapping ─────────────────────────────────────────────────────
with tab_map:
    st.subheader("Schema Mapping")

    detected_n = sum(1 for v in auto_mapping.values() if v)
    st.caption(
        f"Auto-detected **{detected_n} / {len(FIELD_VARIANTS)}** fields from column names.  "
        "Use the dropdowns to correct or add mappings.  "
        "Unmapped source columns are preserved as `meta_*` columns."
    )

    col_opts = ["(none)"] + sorted(raw_df.columns.tolist())

    current_mapping: dict = {}
    canonical_items = list(FIELD_VARIANTS.items())

    for row_start in range(0, len(canonical_items), 3):
        row_items = canonical_items[row_start : row_start + 3]
        cols      = st.columns(len(row_items))
        for ui_col, (canonical, variants) in zip(cols, row_items):
            with ui_col:
                auto_val = auto_mapping.get(canonical)
                default_idx = (
                    col_opts.index(auto_val)
                    if auto_val and auto_val in col_opts
                    else 0
                )
                chosen = st.selectbox(
                    label=f"**{canonical}**",
                    options=col_opts,
                    index=default_idx,
                    key=f"map_{canonical}",
                    help=(
                        "Known variants: "
                        + ", ".join(variants[:5])
                        + ("…" if len(variants) > 5 else "")
                    ),
                )
                current_mapping[canonical] = chosen if chosen != "(none)" else None

    # Save for downstream tabs
    st.session_state["current_mapping"] = current_mapping

    # Mapping summary table
    st.divider()
    st.subheader("Mapping Summary")
    summary = []
    for canonical, src_col in current_mapping.items():
        auto    = auto_mapping.get(canonical)
        status  = "✅ Mapped" if src_col else "⚪ Unmapped"
        origin  = "Auto" if src_col == auto else ("Manual" if src_col else "—")
        summary.append({
            "Canonical Field": canonical,
            "Source Column":   src_col or "—",
            "Auto-detected":   auto   or "—",
            "Origin":          origin,
            "Status":          status,
        })
    st.dataframe(
        pd.DataFrame(summary), use_container_width=True, hide_index=True
    )

    mapped_n   = sum(1 for v in current_mapping.values() if v)
    unmapped_n = len(current_mapping) - mapped_n
    st.caption(
        f"**{mapped_n}** fields mapped · **{unmapped_n}** unmapped "
        f"· {len(raw_df.columns)} total source columns"
    )

    if st.button("🔄 Reset to auto-detect"):
        _reset_mapping_state()
        st.rerun()


# ── Compute normalisation (runs every cycle, fast enough for Phase 1) ─────────
current_mapping = st.session_state.get("current_mapping", auto_mapping)
norm_df, unmapped_cols = apply_mapping(raw_df, current_mapping)
valid_df, skipped_df, val_report = validate_and_coerce(norm_df)


# ── TAB 3: Normalized Data ────────────────────────────────────────────────────
with tab_norm:
    st.subheader("Normalized Data")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Input Records",  f"{val_report['total_input']:,}")
    c2.metric("Valid Records",  f"{val_report['valid']:,}")
    c3.metric(
        "Skipped",
        f"{val_report['skipped']:,}",
        delta=f"-{val_report['skipped']}" if val_report["skipped"] else None,
        delta_color="inverse",
    )
    pass_pct = (
        int(100 * val_report["valid"] / val_report["total_input"])
        if val_report["total_input"]
        else 0
    )
    c4.metric("Pass Rate", f"{pass_pct}%")

    if val_report["skipped"] > 0:
        with st.expander(f"⚠️ Skipped records ({val_report['skipped']:,})"):
            st.dataframe(skipped_df.head(100), use_container_width=True)

    if unmapped_cols:
        with st.expander(
            f"ℹ️ {len(unmapped_cols)} unmapped source column(s) preserved as meta_*"
        ):
            st.code(", ".join(unmapped_cols))

    st.divider()

    # Display canonical columns first, then meta_*
    canonical_present = [c for c in FIELD_VARIANTS if c in valid_df.columns]
    meta_present      = [c for c in valid_df.columns if c.startswith("meta_")]
    display_cols      = canonical_present + meta_present
    display_df        = valid_df[display_cols] if display_cols else valid_df

    n_prev = st.slider("Rows to preview", 5, 200, 20, key="norm_n")
    st.dataframe(display_df.head(n_prev), use_container_width=True)

    st.divider()

    # ── Export ────────────────────────────────────────────────────────────────
    if not valid_df.empty:
        buf = io.BytesIO()
        display_df.to_csv(buf, index=False)
        st.download_button(
            label="⬇️  Export Normalized CSV",
            data=buf.getvalue(),
            file_name=f"grvty_normalized_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv",
            type="primary",
            use_container_width=True,
        )
    else:
        st.warning("No valid records to export after validation.")


# ── TAB 4: Ingestion Report ───────────────────────────────────────────────────
with tab_report:
    st.subheader("Ingestion Report")

    # ── Summary metrics ───────────────────────────────────────────────────────
    st.markdown("### Summary")
    c1, c2, c3 = st.columns(3)
    c1.metric("Total Input",   f"{val_report['total_input']:,}")
    c2.metric("Valid Records", f"{val_report['valid']:,}")
    c3.metric("Skipped",       f"{val_report['skipped']:,}")

    # ── Skip reasons ──────────────────────────────────────────────────────────
    if val_report["skip_reasons"]:
        st.markdown("### Skip Reasons")
        skip_rows = sorted(
            val_report["skip_reasons"].items(), key=lambda x: -x[1]
        )
        st.dataframe(
            pd.DataFrame(skip_rows, columns=["Reason", "Count"]),
            use_container_width=True,
            hide_index=True,
        )

    # ── Coercion notes ────────────────────────────────────────────────────────
    if val_report["coercion_notes"]:
        st.markdown("### Type Coercion Notes")
        for note in val_report["coercion_notes"]:
            st.warning(note)

    # ── Field coverage ────────────────────────────────────────────────────────
    st.markdown("### Field Coverage (valid records)")
    fill_rows = [
        {
            "Field":    field,
            "Filled":   stats["filled"],
            "Total":    stats["total"],
            "Coverage": f"{stats['pct']}%",
        }
        for field, stats in val_report["field_fill_rates"].items()
    ]
    if fill_rows:
        fill_df = pd.DataFrame(fill_rows)
        st.dataframe(fill_df, use_container_width=True, hide_index=True)

        # Coverage bar (horizontal)
        chart_df = (
            fill_df[["Field", "Coverage"]]
            .copy()
            .assign(Coverage=lambda d: d["Coverage"].str.rstrip("%").astype(int))
            .set_index("Field")
        )
        st.bar_chart(chart_df, y="Coverage")

    if valid_df.empty:
        st.info("No valid records — adjust the schema mapping or check the source data.")
        st.stop()

    # ── Time range ────────────────────────────────────────────────────────────
    if "timestamp" in valid_df.columns:
        ts_col = valid_df["timestamp"].dropna()
        if not ts_col.empty:
            st.markdown("### Time Range")
            c1, c2 = st.columns(2)
            c1.metric("Earliest", str(ts_col.min()))
            c2.metric("Latest",   str(ts_col.max()))

    # ── Traffic distribution ──────────────────────────────────────────────────
    st.markdown("### Traffic Distribution")
    dist_cols = st.columns(2)

    if "label" in valid_df.columns:
        with dist_cols[0]:
            st.markdown("**Label distribution**")
            lbl = (
                valid_df["label"]
                .fillna("(unlabeled)")
                .value_counts()
                .reset_index()
            )
            lbl.columns = ["Label", "Count"]
            st.dataframe(lbl, use_container_width=True, hide_index=True)
            st.bar_chart(lbl.set_index("Label")["Count"])

    if "protocol" in valid_df.columns:
        with dist_cols[1]:
            st.markdown("**Protocol distribution**")
            proto = (
                valid_df["protocol"]
                .fillna("Unknown")
                .value_counts()
                .reset_index()
            )
            proto.columns = ["Protocol", "Count"]
            st.dataframe(proto, use_container_width=True, hide_index=True)
            st.bar_chart(proto.set_index("Protocol")["Count"])

    # ── Top talkers ──────────────────────────────────────────────────────────
    st.markdown("### Top Talkers")
    talk_cols = st.columns(2)

    if "src_ip" in valid_df.columns:
        with talk_cols[0]:
            st.markdown("**Top source IPs**")
            top_src = valid_df["src_ip"].value_counts().head(10).reset_index()
            top_src.columns = ["src_ip", "flows"]
            st.dataframe(top_src, use_container_width=True, hide_index=True)

    if "dst_ip" in valid_df.columns:
        with talk_cols[1]:
            st.markdown("**Top destination IPs**")
            top_dst = valid_df["dst_ip"].value_counts().head(10).reset_index()
            top_dst.columns = ["dst_ip", "flows"]
            st.dataframe(top_dst, use_container_width=True, hide_index=True)

    # ── Top destination ports ─────────────────────────────────────────────────
    if "dst_port" in valid_df.columns:
        st.markdown("### Top Destination Ports")
        top_ports = (
            valid_df["dst_port"]
            .dropna()
            .astype(int)
            .value_counts()
            .head(15)
            .reset_index()
        )
        top_ports.columns = ["dst_port", "flows"]
        st.dataframe(top_ports, use_container_width=True, hide_index=True)

    # ── Schema mapping used ───────────────────────────────────────────────────
    with st.expander("Schema mapping used for this run"):
        mapping_rows = [
            {"Canonical Field": k, "Source Column": v or "—"}
            for k, v in current_mapping.items()
        ]
        st.dataframe(
            pd.DataFrame(mapping_rows), use_container_width=True, hide_index=True
        )
