"""
BIF1223 Mini Project - Analisis Pipeline Sederhana
Integrasi Struktur Data: List, Dictionary, Sorting, Visualization, CSV Export

Jalankan: python analysis.py <file.fasta>
Atau tanpa argumen untuk menggunakan sample data bawaan.
"""

import sys
import csv
import os
from collections import defaultdict

# ─── 1. Baca file FASTA / FASTQ ──────────────────────────────────────────────

def parse_fasta(filepath):
    """Membaca file FASTA dan mengembalikan list of dict."""
    sequences = []  # Menyimpan data dalam List
    with open(filepath, "r") as f:
        current_id = None
        current_desc = ""
        current_seq = []
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith(">"):
                if current_id is not None:
                    sequences.append({
                        "id": current_id,
                        "description": current_desc,
                        "sequence": "".join(current_seq).upper()
                    })
                parts = line[1:].split(" ", 1)
                current_id = parts[0]
                current_desc = parts[1] if len(parts) > 1 else ""
                current_seq = []
            else:
                current_seq.append(line)
        if current_id is not None:
            sequences.append({
                "id": current_id,
                "description": current_desc,
                "sequence": "".join(current_seq).upper()
            })
    return sequences


def parse_fastq(filepath):
    """Membaca file FASTQ dan mengembalikan list of dict."""
    sequences = []
    with open(filepath, "r") as f:
        lines = [l.strip() for l in f if l.strip()]
    for i in range(0, len(lines) - 3, 4):
        parts = lines[i][1:].split(" ", 1)
        sequences.append({
            "id": parts[0],
            "description": parts[1] if len(parts) > 1 else "",
            "sequence": lines[i + 1].upper(),
            "quality": lines[i + 3]
        })
    return sequences


# ─── 2. Hitung frekuensi nukleotida (Dictionary) ─────────────────────────────

def nucleotide_frequency(sequence):
    """Menghitung frekuensi nukleotida menggunakan Dictionary."""
    freq = {"A": 0, "T": 0, "G": 0, "C": 0, "N": 0, "other": 0}
    for base in sequence:
        if base in freq:
            freq[base] += 1
        else:
            freq["other"] += 1
    return freq


def gc_content(sequence):
    """Menghitung persentase GC Content."""
    if not sequence:
        return 0.0
    gc = sum(1 for b in sequence if b in "GC")
    return round((gc / len(sequence)) * 100, 2)


# ─── 3. Analisis lengkap ──────────────────────────────────────────────────────

def analyze(sequences):
    """Menambahkan frekuensi dan GC content ke setiap record."""
    results = []
    for s in sequences:
        freq = nucleotide_frequency(s["sequence"])
        gc = gc_content(s["sequence"])
        results.append({**s, "freq": freq, "gc": gc, "length": len(s["sequence"])})
    # Mengurutkan sekuens berdasarkan GC Content (descending)
    results.sort(key=lambda x: x["gc"], reverse=True)
    return results


# ─── 4. Visualisasi ASCII bar chart ──────────────────────────────────────────

def visualize_gc(results, bar_width=40):
    """Menampilkan visualisasi GC Content dalam grafik ASCII."""
    print("\n" + "=" * 60)
    print("  VISUALISASI GC CONTENT (Sorted Descending)")
    print("=" * 60)
    for i, s in enumerate(results):
        filled = int((s["gc"] / 100) * bar_width)
        bar = "█" * filled + "░" * (bar_width - filled)
        rank = f"#{i+1:02d}"
        label = s["id"][:18].ljust(18)
        print(f" {rank} {label} [{bar}] {s['gc']:6.2f}%")
    print("=" * 60)


def display_top3(results):
    """Menampilkan 3 sekuens terbaik."""
    print("\n🏆 TOP 3 SEKUENS (GC Content Tertinggi):")
    print("-" * 55)
    for i, s in enumerate(results[:3]):
        print(f"\n  #{i+1}  ID       : {s['id']}")
        print(f"       Deskripsi: {s['description'][:50] or '-'}")
        print(f"       Panjang  : {s['length']:,} bp")
        print(f"       GC%      : {s['gc']}%")
        print(f"       A={s['freq']['A']}  T={s['freq']['T']}  G={s['freq']['G']}  C={s['freq']['C']}")
    print("-" * 55)


# ─── 5. Export ke CSV ─────────────────────────────────────────────────────────

def export_csv(results, output_path="gc_analysis_results.csv"):
    """Menuliskan hasil ke file CSV."""
    fieldnames = ["rank", "id", "description", "length", "A", "T", "G", "C", "N", "gc_content"]
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i, s in enumerate(results):
            writer.writerow({
                "rank": i + 1,
                "id": s["id"],
                "description": s["description"],
                "length": s["length"],
                "A": s["freq"]["A"],
                "T": s["freq"]["T"],
                "G": s["freq"]["G"],
                "C": s["freq"]["C"],
                "N": s["freq"]["N"],
                "gc_content": s["gc"]
            })
    print(f"\n✅ Hasil disimpan ke: {output_path}")


# ─── 6. Sample FASTA (fallback) ──────────────────────────────────────────────

SAMPLE_FASTA = """>seq1_Ecoli
AGAGTTTGATCCTGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAACGGTAACAGGAAGAAGCTTGC
>seq2_Salmonella
ATGACTAACAACATCCCGGCAATGGTTTCGGCGATCTTTATCGCCGTCGCCTGGCTATCGGCCTTAGCGGCATTAGCGGC
>seq3_Bacillus
ATGAAAAAAATCATATTATTTATCGTATTTATCTTAATCGCCGGCGCAGCAATGGCTTCTAATGCCGCAAATGCAAAAAC
>seq4_Pseudomonas
GCGGCGGCGGCGGCGGCGGCATCGGCGGCATCGGCGGCGGCGGCGGCATCGGCATCGGCGGCGGCGGCGGCATCGGCGGC
>seq5_Mycobacterium
GCCCGCCGGCGGCGCGCACGCCGGCGGCGGCGGCGCACGCCGGCGGCGGCGGCGCGCCCGGCGCCGGCGCCCGCGGCGGC
"""

SAMPLE_FILE = "_sample_sequences.fasta"


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("\n🧬 BIF1223 Mini Project - GC Content Pipeline")
    print("   Struktur Data Bioinformatika | IPB University\n")

    # Tentukan file input
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        if not os.path.exists(filepath):
            print(f"❌ File tidak ditemukan: {filepath}")
            sys.exit(1)
        ext = os.path.splitext(filepath)[1].lower()
        if ext in [".fastq", ".fq"]:
            print(f"📂 Membaca FASTQ: {filepath}")
            sequences = parse_fastq(filepath)
        else:
            print(f"📂 Membaca FASTA: {filepath}")
            sequences = parse_fasta(filepath)
    else:
        print("ℹ️  Tidak ada argumen file, menggunakan sample data bawaan...")
        with open(SAMPLE_FILE, "w") as f:
            f.write(SAMPLE_FASTA)
        sequences = parse_fasta(SAMPLE_FILE)
        os.remove(SAMPLE_FILE)

    if not sequences:
        print("❌ Tidak ada sekuens valid yang ditemukan.")
        sys.exit(1)

    print(f"✅ {len(sequences)} sekuens berhasil dimuat.\n")

    # Analisis
    results = analyze(sequences)

    # Tampilkan top 3
    display_top3(results)

    # Visualisasi
    visualize_gc(results)

    # Export CSV
    export_csv(results)

    print("\n✅ Pipeline selesai!\n")


if __name__ == "__main__":
    main()
