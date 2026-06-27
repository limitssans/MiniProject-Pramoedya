import { useState, useRef, useEffect } from "react";
import Head from "next/head";

// ─── Parsing helpers ─────────────────────────────────────────────────────────

function parseFASTA(text) {
  const sequences = [];
  const lines = text.trim().split(/\r?\n/);
  let currentId = null, currentDesc = "", currentSeq = "";
  for (const line of lines) {
    if (line.startsWith(">")) {
      if (currentId !== null) sequences.push({ id: currentId, description: currentDesc, sequence: currentSeq });
      const header = line.slice(1).trim();
      const spaceIdx = header.indexOf(" ");
      currentId = spaceIdx === -1 ? header : header.slice(0, spaceIdx);
      currentDesc = spaceIdx === -1 ? "" : header.slice(spaceIdx + 1);
      currentSeq = "";
    } else {
      currentSeq += line.trim().toUpperCase();
    }
  }
  if (currentId !== null) sequences.push({ id: currentId, description: currentDesc, sequence: currentSeq });
  return sequences;
}

function parseFASTQ(text) {
  const sequences = [];
  const lines = text.trim().split(/\r?\n/);
  for (let i = 0; i + 3 < lines.length; i += 4) {
    const header = lines[i].slice(1).trim();
    const spaceIdx = header.indexOf(" ");
    const id = spaceIdx === -1 ? header : header.slice(0, spaceIdx);
    const description = spaceIdx === -1 ? "" : header.slice(spaceIdx + 1);
    const sequence = lines[i + 1].trim().toUpperCase();
    sequences.push({ id, description, sequence, quality: lines[i + 3].trim() });
  }
  return sequences;
}

// ─── Bioinformatics calculations ─────────────────────────────────────────────

function calcNucleotideFreq(seq) {
  const freq = { A: 0, T: 0, G: 0, C: 0, N: 0, other: 0 };
  for (const base of seq) {
    if (base in freq) freq[base]++;
    else freq.other++;
  }
  return freq;
}

function calcGCContent(seq) {
  const gc = (seq.match(/[GC]/g) || []).length;
  return seq.length === 0 ? 0 : (gc / seq.length) * 100;
}

function analyzeSequences(rawList) {
  return rawList
    .filter(s => s.sequence.length > 0)
    .map(s => {
      const freq = calcNucleotideFreq(s.sequence);
      const gc = calcGCContent(s.sequence);
      return { ...s, freq, gc: parseFloat(gc.toFixed(2)), length: s.sequence.length };
    })
    .sort((a, b) => b.gc - a.gc);
}

// ─── CSV export ──────────────────────────────────────────────────────────────

function downloadCSV(data) {
  const headers = ["Rank", "ID", "Description", "Length", "A", "T", "G", "C", "N", "GC_Content(%)"];
  const rows = data.map((s, i) => [
    i + 1, s.id, `"${s.description}"`, s.length,
    s.freq.A, s.freq.T, s.freq.G, s.freq.C, s.freq.N,
    s.gc
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "gc_analysis_results.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Bar chart (pure SVG) ─────────────────────────────────────────────────────

function GCBarChart({ data }) {
  if (!data.length) return null;
  const W = 680, H = 320, PL = 60, PR = 20, PT = 30, PB = 80;
  const chartW = W - PL - PR, chartH = H - PT - PB;
  const maxGC = Math.max(...data.map(d => d.gc), 10);
  const barW = Math.min(40, (chartW / data.length) - 6);
  const colors = ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d",
    "#4ade80", "#86efac", "#bbf7d0", "#f0fdf4", "#dcfce7"];
  const yTicks = [0, 20, 40, 60, 80, 100].filter(t => t <= Math.ceil(maxGC / 10) * 10 + 10);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* Grid lines */}
      {yTicks.map(t => {
        const y = PT + chartH - (t / 100) * chartH;
        return (
          <g key={t}>
            <line x1={PL} y1={y} x2={PL + chartW} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{t}</text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((s, i) => {
        const barH = (s.gc / 100) * chartH;
        const x = PL + (i / data.length) * chartW + (chartW / data.length - barW) / 2;
        const y = PT + chartH - barH;
        const shortId = s.id.length > 10 ? s.id.slice(0, 9) + "…" : s.id;
        return (
          <g key={s.id}>
            <rect x={x} y={y} width={barW} height={barH}
              fill={colors[i % colors.length]} rx="3"
              style={{ transition: "opacity 0.2s" }}
            >
              <title>{s.id}: {s.gc}%</title>
            </rect>
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="600">
              {s.gc}%
            </text>
            <text x={x + barW / 2} y={PT + chartH + 16} textAnchor="middle" fontSize="9" fill="#475569"
              transform={`rotate(-35 ${x + barW / 2} ${PT + chartH + 16})`}>
              {shortId}
            </text>
          </g>
        );
      })}
      {/* Axes */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + chartH} stroke="#334155" strokeWidth="1.5" />
      <line x1={PL} y1={PT + chartH} x2={PL + chartW} y2={PT + chartH} stroke="#334155" strokeWidth="1.5" />
      {/* Y axis label */}
      <text x={14} y={PT + chartH / 2} textAnchor="middle" fontSize="11" fill="#475569"
        transform={`rotate(-90 14 ${PT + chartH / 2})`}>GC Content (%)</text>
      {/* Title */}
      <text x={W / 2} y={16} textAnchor="middle" fontSize="12" fill="#1e293b" fontWeight="700">
        GC Content per Sequence (sorted)
      </text>
    </svg>
  );
}

// ─── Nucleotide freq chart ────────────────────────────────────────────────────

function NucleotideChart({ seq }) {
  if (!seq) return null;
  const total = seq.length;
  const bases = ["A", "T", "G", "C"];
  const clrs = { A: "#22c55e", T: "#3b82f6", G: "#f59e0b", C: "#ef4444" };
  const freqs = bases.map(b => ({ base: b, count: (seq.match(new RegExp(b, "g")) || []).length }));
  const maxCount = Math.max(...freqs.map(f => f.count), 1);
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-end", height: 100 }}>
      {freqs.map(({ base, count }) => (
        <div key={base} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <span style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{count}</span>
          <div style={{
            background: clrs[base], borderRadius: 4,
            height: Math.max(4, (count / maxCount) * 70),
            width: "100%", transition: "height 0.4s"
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: clrs[base], marginTop: 4 }}>{base}</span>
          <span style={{ fontSize: 9, color: "#64748b" }}>{total > 0 ? ((count / total) * 100).toFixed(1) : 0}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sample FASTA data ────────────────────────────────────────────────────────

const SAMPLE_FASTA = `>seq1_Ecoli_16S_rRNA Gene
AGAGTTTGATCCTGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAACGGTAACAGGAAGAAGCTTGC
TTCTTTGCTGACGAGTGGCGGACGGGTGAGTAATGTCTGGGAAACTGCCTGATGGAGGGGGATAACTACTGGAAACGGTA
GCTAATACCGCATAACGTCGCAAGACCAAAGAGGGGGACCTTCGGGCCTCTTGCCATCAGATGTGCCCAGATGGGATTAG
>seq2_Salmonella_inv gene
ATGACTAACAACATCCCGGCAATGGTTTCGGCGATCTTTATCGCCGTCGCCTGGCTATCGGCCTTAGCGGCATTAGCGGC
TTTAGCGGCATTAGCAGCATTGCGGGCTTTAGCAGCATCAGCGGCATCAGCGGCATCGCTGGCATCGCAGGCTTGGGCGG
CATCGGCGGCATCAGCAACTTCAGCGGCATCAGCGGCTTCAGCAACTTCAGCGGCATCGGCAACATCAGCGGCTTCAGCA
>seq3_Bacillus_spore
ATGAAAAAAATCATATTATTTATCGTATTTATCTTAATCGCCGGCGCAGCAATGGCTTCTAATGCCGCAAATGCAAAAAC
TGCAAATAATGCAGCAAATCAAACAATCAAAACAGCAGCAAATCAAACAATCAAGACGACGGCATTTGCAGCAAATCAAAC
AATCAAACAGCAGCAAATCAAACAATCAAACAGCAGCAAATCAAACAATCAAGACGACGGCATTTGCAGCAAATCAAAC
>seq4_Pseudomonas_GC_rich
GCGGCGGCGGCGGCGGCGGCATCGGCGGCATCGGCGGCGGCGGCGGCATCGGCATCGGCGGCGGCGGCGGCATCGGCGGC
GGCGGCGGCGGCATCGGCGGCGGCGGCGGCGGCATCGGCGGCGGCATCGGCGGCGGCGGCGGCATCGGCGGCGGCGGCGGC
GCGGCGGCGGCGGCGGCGGCATCGGCGGCATCGGCGGCGGCGGCGGCATCGGCATCGGCGGCGGCGGCGGCATCGGCGGC
>seq5_Lactobacillus_AT_rich
ATAAATTTAAATTTAATAAATATAAATTTAATTTTAATAATAAATAATTTAATAATAAAAATAATAAAATAATAATATAAA
ATAATATTTATTTAATAATAATAATAAATATATAATATAAATATAATTATAATTATATAATATATAATATATAATATATAATA
ATAATATTTATAATAATATAATTATATAATATATAATATATATAATATATAATATAATTATATAATATATAATATATAATATA
>seq6_Mycobacterium_GC
GCCCGCCGGCGGCGCGCACGCCGGCGGCGGCGGCGCACGCCGGCGGCGGCGGCGCGCCCGGCGCCGGCGCCCGCGGCGGC
GCGCCCGGCGGCGGCGCCCGCGGCGGCGCGCCCGGCGGCGGCGGCGCGCCCGGCGGCGGCGGCGCGCCCGGCGCCGGCGCC
CGCGGCGGCGCGCCCGGCGGCGGCGGCGCGCCCGGCGGCGGCGGCGCGCCCGGCGCCGGCGCCCGCGGCGGCGCGCCCGG
>seq7_Streptococcus_moderate
ATGAAAGCAATTTTCGTACTGAAAGGTTTTGTTGGTTTTATTGCTGATAAATTCGAAAGCAAATTTGAAAGAGCTGGTTTT
TTAAAAGAAGATGCTTTCAAGCAAGCAGAAGCTAAACTTGAAGCTAAACTTGAAGCTAAACTTGAAGCTAAACTTGAAGCT
AAACTTGAAGCTAAACTTGAAGCTAAACTTGAAGCTAAACTTGAAGCTAAACTTGAAGCTAAACTTGAAGCTAAACTT
>seq8_Thermophile_GC
GCGGCGGCGGCGTCGGCGGCGGCGGCGTCGGCGGCGGCGTCGGCGGCGGCGTCGGCGGCGGCGGCGTCGGCGGCGGCGTC
GGCGGCGGCGTCGGCGGCGGCGGCGTCGGCGGCGGCGTCGGCGGCGGCGTCGGCGGCGGCGGCGTCGGCGGCGGCGTCGG
CGGCGGCGTCGGCGGCGGCGGCGTCGGCGGCGGCGTCGGCGGCGGCGTCGGCGGCGGCGGCGTCGGCGGCGGCGTCGGCGG
>seq9_Clostridium_low_GC
TTTAAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATAA
TTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAAT
TTAAATAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATAATTTAAATTTAAATA
>seq10_Vibrio_cholerae
ATGCGAATTTCTTATGATTTATCCCTTTTCTATGTTGTAATCATCTTCTGTTTCAGCATCAACAAATGTCAGCAAATGCCA
CAGCGAAAGCCGATGTCAGCAAATGCCACAGCAAAAGCCGATGTCAGCAAATGCCACAGCAAAAGCCGATGTCAGCAAATG
CCACAGCAAAAGCCGATGTCAGCAAATGCCACAGCAAAAGCCGATGTCAGCAAATGCCACAGCAAAAGCCGATGTCAGCAAA`;

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const [sequences, setSequences] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showSample, setShowSample] = useState(false);
  const fileRef = useRef();

  const processText = (text, name) => {
    setError(""); setLoading(true); setFileName(name);
    try {
      let parsed = [];
      if (name.endsWith(".fastq") || name.endsWith(".fq")) {
        parsed = parseFASTQ(text);
      } else {
        parsed = parseFASTA(text);
      }
      if (!parsed.length) throw new Error("Tidak ada sekuens valid yang ditemukan.");
      const analyzed = analyzeSequences(parsed);
      setSequences(analyzed);
    } catch (e) {
      setError(e.message);
      setSequences([]);
    }
    setLoading(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processText(ev.target.result, file.name);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processText(ev.target.result, file.name);
    reader.readAsText(file);
  };

  const loadSample = () => {
    setShowSample(false);
    processText(SAMPLE_FASTA, "sample_bacteria.fasta");
  };

  const top3 = sequences.slice(0, 3);
  const hasData = sequences.length > 0;

  return (
    <>
      <Head>
        <title>BioGC Pipeline | BIF1223</title>
        <meta name="description" content="Analisis GC Content pipeline sederhana untuk bioinformatika" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #22c55e; border-radius: 3px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .badge-gc { background: #14532d; color: #4ade80; }
        .badge-rank { background: #1e293b; color: #94a3b8; }
        .badge-top { background: #14532d; color: #22c55e; border: 1px solid #22c55e44; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; }
        .btn-primary { background: #22c55e; color: #052e16; }
        .btn-primary:hover { background: #16a34a; transform: translateY(-1px); }
        .btn-outline { background: transparent; color: #22c55e; border: 1.5px solid #22c55e44; }
        .btn-outline:hover { background: #14532d; }
        .btn-ghost { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
        .btn-ghost:hover { background: #334155; color: #e2e8f0; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; }
        .seq-card { background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 20px; transition: border-color 0.2s; }
        .seq-card:hover { border-color: #22c55e44; }
        .top-card { border-color: #22c55e66; background: #0a1f14; }
        .drop-zone { border: 2px dashed #334155; border-radius: 12px; padding: 48px 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone:hover, .drop-zone.drag { border-color: #22c55e; background: #0a1f14; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { padding: 10px 12px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #334155; }
        td { padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #0f172a; }
        .progress-bar { background: #1e293b; border-radius: 999px; height: 6px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 999px; transition: width 0.6s ease; }
        .stat-box { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; }
        .section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #22c55e; margin-bottom: 12px; }
        @media (max-width: 640px) {
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e293b", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧬</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f8fafc" }}>BioGC Pipeline</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Struktur Data Bioinformatika · BIF1223</div>
          </div>
        </div>
        <span className="mono badge badge-gc">v1.0</span>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>

        {/* Upload section */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-label">📂 Input File</div>
          <div
            className={`drop-zone`}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
            onDragLeave={e => e.currentTarget.classList.remove("drag")}
            onDrop={(e) => { e.currentTarget.classList.remove("drag"); handleDrop(e); }}
            onClick={() => fileRef.current.click()}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗂️</div>
            <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Drop file FASTA/FASTQ ke sini</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>atau klik untuk browse · Format: .fasta .fa .fastq .fq</div>
            <input ref={fileRef} type="file" accept=".fasta,.fa,.fastq,.fq,.txt" style={{ display: "none" }} onChange={handleFile} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn btn-outline" onClick={loadSample}>
              🧪 Load Sample Data (10 bakteri)
            </button>
            {hasData && (
              <button className="btn btn-primary" onClick={() => downloadCSV(sequences)}>
                ⬇️ Download CSV
              </button>
            )}
            {hasData && (
              <button className="btn btn-ghost" onClick={() => { setSequences([]); setFileName(""); setError(""); }}>
                🗑️ Reset
              </button>
            )}
          </div>
          {fileName && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#22c55e" }}>
              ✅ <span className="mono">{fileName}</span> — {sequences.length} sekuens dimuat
            </div>
          )}
          {error && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#f87171", background: "#1e293b", padding: "8px 12px", borderRadius: 6 }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Results */}
        {hasData && (
          <>
            {/* Stats summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }} className="grid-3">
              {[
                { label: "Total Sekuens", value: sequences.length, icon: "🔢" },
                { label: "Rata-rata GC%", value: `${(sequences.reduce((a, s) => a + s.gc, 0) / sequences.length).toFixed(2)}%`, icon: "📊" },
                { label: "GC Tertinggi", value: `${sequences[0]?.gc}%`, icon: "🏆" },
                { label: "GC Terendah", value: `${sequences[sequences.length - 1]?.gc}%`, icon: "📉" },
              ].map(s => (
                <div className="stat-box" key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }} className="mono">{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top 3 */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-label">🏆 3 Sekuens Terbaik (GC Content Tertinggi)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }} className="grid-3">
                {top3.map((s, i) => (
                  <div key={s.id} className={`seq-card top-card`}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span className="badge badge-top">#{i + 1}</span>
                      <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: "#22c55e" }}>{s.gc}%</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#f8fafc", marginBottom: 2 }} className="mono">
                      {s.id.length > 18 ? s.id.slice(0, 17) + "…" : s.id}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>
                      {s.description.slice(0, 40) || "—"}
                    </div>
                    <div className="progress-bar" style={{ marginBottom: 8 }}>
                      <div className="progress-fill" style={{ width: `${s.gc}%` }} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <NucleotideChart seq={s.sequence} />
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 10 }}>
                      <span className="mono">{s.length.toLocaleString()} bp</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GC Chart */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-label">📈 Visualisasi GC Content</div>
              <div style={{ background: "#0f172a", borderRadius: 8, padding: "16px 8px" }}>
                <GCBarChart data={sequences} />
              </div>
            </div>

            {/* Full table */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="section-label" style={{ marginBottom: 0 }}>📋 Semua Sekuens (Sorted by GC%)</div>
                <button className="btn btn-primary" style={{ fontSize: 12, padding: "8px 14px" }} onClick={() => downloadCSV(sequences)}>
                  ⬇️ Download CSV
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>ID</th>
                      <th>Length (bp)</th>
                      <th>A</th><th>T</th><th>G</th><th>C</th>
                      <th>GC%</th>
                      <th>Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sequences.map((s, i) => (
                      <tr key={s.id}>
                        <td>
                          <span className={`badge ${i < 3 ? "badge-top" : "badge-rank"}`}>#{i + 1}</span>
                        </td>
                        <td><span className="mono" style={{ fontSize: 12 }}>{s.id}</span></td>
                        <td className="mono">{s.length.toLocaleString()}</td>
                        <td className="mono" style={{ color: "#22c55e" }}>{s.freq.A}</td>
                        <td className="mono" style={{ color: "#3b82f6" }}>{s.freq.T}</td>
                        <td className="mono" style={{ color: "#f59e0b" }}>{s.freq.G}</td>
                        <td className="mono" style={{ color: "#ef4444" }}>{s.freq.C}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: s.gc > 60 ? "#22c55e" : s.gc > 40 ? "#f59e0b" : "#94a3b8" }} className="mono">
                            {s.gc}%
                          </span>
                        </td>
                        <td style={{ minWidth: 100 }}>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${s.gc}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!hasData && !error && (
          <div style={{ textAlign: "center", padding: "64px 24px", color: "#475569" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧬</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#64748b" }}>Upload file FASTA/FASTQ untuk memulai analisis</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>atau gunakan Sample Data untuk mencoba langsung</div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "16px 24px", textAlign: "center", color: "#475569", fontSize: 12 }}>
        BIF1223 · Struktur Data Bioinformatika · IPB University · Mini Project #15
      </footer>
    </>
  );
}
