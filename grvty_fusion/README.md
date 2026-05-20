# GRVTY Fusion Workbench — Phase 1

**Ingestion · Schema Normalization · Validation · Export**

A lightweight Streamlit app that ingests public NetFlow-like datasets or
synthetic flow data, maps them to a common normalized schema, validates
record quality, and produces clean output ready for downstream detectors,
graph visualizers, and DNS-fusion layers.

---

## What Phase 1 Does

| Step | Description |
|---|---|
| **Ingest** | CSV / TSV, JSONL, or built-in synthetic data |
| **Map** | Auto-detect field names across 13+ dataset conventions |
| **Override** | UI selectboxes for any field mapping correction |
| **Validate** | Skip bad IPs, coerce numerics, parse timestamps |
| **Report** | Fill rates, skip reasons, top talkers, label distribution |
| **Export** | Download normalized CSV for any downstream tool |

---

## Supported Input Datasets

| Dataset | Format | Notes |
|---|---|---|
| CICIDS2017 / CICFlowMeter | CSV | Headers like `Source IP`, `Destination Port`, `Flow Duration` |
| CSE-CIC-IDS2018 | CSV | Similar to CICIDS2017 with slight column name differences |
| NF-UNSW-NB15 / V2 | NetFlow CSV | Headers like `IPV4_SRC_ADDR`, `IN_BYTES`, `IN_PKTS` |
| Zeek conn.log | TSV | Headers like `id.orig_h`, `id.resp_h`, `orig_bytes`, `proto` |
| GRVTY / Eric JSONL | JSONL | Fields like `src_ip`, `dst_ip`, `timestamp`, `label` |
| Generic NetFlow | CSV/JSONL | Any file with recognizable IP / port / byte fields |

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/zj808/dashboard-cara.git
cd dashboard-cara/grvty_fusion

# 2. Create a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Launch
streamlit run app.py
```

The app opens at `http://localhost:8501`.

---

## Replit Setup

1. Open your Replit project and import or clone this repository.

2. In the **Shell**, run:
   ```bash
   pip install -r grvty_fusion/requirements.txt
   ```

3. Create a `.replit` file in the root (or update the existing one):
   ```toml
   run = "streamlit run grvty_fusion/app.py --server.port 8501 --server.address 0.0.0.0"
   ```

4. Click **Run** — the Webview tab will show the app.

> **Tip:** Replit may need `--server.headless true` added to the run command
> if the browser tab does not open automatically.

---

## Using Synthetic Demo Data

1. In the sidebar, choose **Synthetic Demo**.
2. Adjust **Records** (100–2000) and **Random seed**.
3. Click **Generate Dataset**.

The generator produces **500 records** across **75 unique IPs** and
**6 traffic categories** spanning a **48-hour window**:

| Label | Category | Behaviour |
|---|---|---|
| PortScan | reconnaissance | 3 scanner IPs probe ~1000 ports |
| Benign | normal | High-volume, mixed protocols, random IPs |
| Brute Force | credential_access | 1 external IP → 1 target, repeated auth attempts |
| DoS | dos | 1 external IP, massive packet bursts to web targets |
| Web Attack | web_exploit | External IPs probing HTTP/HTTPS targets |
| Infiltration | lateral_movement | Internal IPs moving to SMB / RDP / WinRM |

Synthetic data is already in the normalized schema so all fields map
automatically — useful for testing downstream detectors without needing
real datasets.

---

## Uploading Public Datasets

### CICIDS2017 / CICFlowMeter

Download from the [Canadian Institute for Cybersecurity](https://www.unb.ca/cic/datasets/ids-2017.html).

- Format: CSV, comma-delimited
- Upload in **CSV / TSV** mode with delimiter `,`
- Key auto-detected columns: `Source IP`, `Destination IP`,
  `Source Port`, `Destination Port`, `Protocol`, `Label`, `Flow Duration`

### CSE-CIC-IDS2018

Download from the [CIC IDS 2018 page](https://www.unb.ca/cic/datasets/ids-2018.html).

- Format: CSV, comma-delimited
- Same CICFlowMeter-style headers as CICIDS2017
- `label` column contains attack category strings

### NF-UNSW-NB15 / NF-UNSW-NB15-V2

Available from the [UNSW research portal](https://research.unsw.edu.au/projects/unsw-nb15-dataset).

- Format: CSV, comma-delimited
- NetFlow-style headers: `IPV4_SRC_ADDR`, `IPV4_DST_ADDR`,
  `L4_SRC_PORT`, `L4_DST_PORT`, `IN_BYTES`, `IN_PKTS`, `PROTOCOL`
- `attack_cat` maps to `label`

### Zeek conn.log

Export from Zeek / Bro IDS or download sample datasets.

- Format: TSV (`\t` delimiter), or convert to CSV
- Upload with delimiter `\t`
- Auto-detects: `id.orig_h` → `src_ip`, `id.resp_h` → `dst_ip`,
  `id.orig_p` → `src_port`, `id.resp_p` → `dst_port`,
  `proto` → `protocol`, `orig_bytes` → `bytes`, `ts` → `timestamp`

### GRVTY JSONL NetFlow Records

Produced by Eric's GRVTY NetFlow tools.

- Format: JSONL (one JSON object per line)
- Upload in **JSONL** mode
- Fields like `src_ip`, `dst_ip`, `timestamp`, `label` map directly
  with no overrides needed

---

## Normalized Schema

Every record that passes validation has these columns:

| Column | Type | Description |
|---|---|---|
| `timestamp` | datetime | Flow start time |
| `src_ip` | str | Source IP address (required) |
| `dst_ip` | str | Destination IP address (required) |
| `src_port` | int | Source port |
| `dst_port` | int | Destination port |
| `protocol` | str | Transport protocol (TCP / UDP / ICMP …) |
| `bytes` | float | Total bytes transferred |
| `packets` | float | Total packets |
| `duration` | float | Flow duration in seconds |
| `tcp_flags` | str | TCP flag string |
| `label` | str | Traffic label / attack type |
| `category` | str | Traffic category |
| `sensor` | str | Data source / sensor name |
| `meta_*` | any | All unmapped source columns, preserved |

Records are skipped (and counted in the report) if:
- `src_ip` or `dst_ip` is missing or blank
- `src_ip` or `dst_ip` is not a valid IP address

---

## Phase 1 Output → Later Phases

```
Phase 1 (this app)
└── normalized CSV / DataFrame
    ├── Phase 2 – ML detectors
    │   └── Clean, typed input: IP strings, numeric bytes/packets,
    │       parsed timestamps, protocol enum, labels for training
    │
    ├── Phase 3 – DNS Fusion
    │   └── src_ip / dst_ip matched against DNS lookup tables
    │       to enrich flows with resolved hostnames and domain reputation
    │
    ├── Phase 4 – Graph Visualization
    │   └── src_ip → dst_ip edges with weight = bytes / packets;
    │       label / category as node/edge attributes
    │
    └── Phase 5 – LLM Synthesis
        └── Structured summary rows (top talkers, label distribution,
            time range, anomalous flows) fed as context to Claude API
            for natural-language incident narratives
```

The normalized schema is the contract between phases.  Adding new
detectors or visualizers only requires reading the Phase 1 CSV export —
no dataset-specific parsing in downstream tools.

---

## Project Structure

```
grvty_fusion/
├── app.py              ← Streamlit UI
├── schema_mapper.py    ← Field detection, mapping, validation
├── synthetic_data.py   ← Synthetic flow generator
├── requirements.txt
├── README.md
└── .streamlit/
    └── config.toml     ← Dark theme + server settings
```

---

## License

MIT — see root repository for details.
