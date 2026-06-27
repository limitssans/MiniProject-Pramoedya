# 🧬 BioGC Pipeline

> Pipeline analisis sekuens DNA sederhana berbasis web — Mini Project BIF1223 Struktur Data Bioinformatika, IPB University

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Course](https://img.shields.io/badge/Course-BIF1223-blue)](https://ipb.ac.id)

---

## 📋 Daftar Isi

- [Demo](#-demo)
- [Fitur](#-fitur)
- [Cara Kerja Pipeline](#-cara-kerja-pipeline)
- [Konsep Struktur Data](#-konsep-struktur-data)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Instalasi & Menjalankan Lokal](#-instalasi--menjalankan-lokal)
- [Struktur Project](#-struktur-project)
- [Format Input yang Didukung](#-format-input-yang-didukung)
- [Output](#-output)
- [Referensi & Sumber Data](#-referensi--sumber-data)

---

## 🌐 Demo

**Live App:** [https://bif1223-gc-pipeline.vercel.app](https://bif1223-gc-pipeline.vercel.app)

---

## ✨ Fitur

### Input & Parsing
| Fitur | Deskripsi |
|-------|-----------|
| 📂 Upload file FASTA | Mendukung format `.fasta` dan `.fa` |
| 📂 Upload file FASTQ | Mendukung format `.fastq` dan `.fq` |
| 🖱️ Drag & Drop | Upload file dengan cara drag langsung ke area upload |
| 🧪 Sample Data | 10 data sekuens bakteri bawaan untuk mencoba langsung tanpa file |

### Analisis Bioinformatika
| Fitur | Deskripsi |
|-------|-----------|
| 🔢 Frekuensi Nukleotida | Menghitung jumlah basa A, T, G, C, dan N per sekuens |
| 📊 GC Content | Menghitung persentase GC Content `(G+C) / total × 100%` |
| 🔃 Sorting Otomatis | Mengurutkan semua sekuens dari GC Content tertinggi ke terendah |
| 🏆 Top 3 Sekuens | Menampilkan 3 sekuens terbaik dalam kartu terpisah |

### Visualisasi
| Fitur | Deskripsi |
|-------|-----------|
| 📈 Grafik Batang GC | Bar chart SVG interaktif GC Content semua sekuens |
| 🧮 Mini Chart Nukleotida | Visualisasi proporsi A/T/G/C tiap sekuens di kartu Top 3 |
| 📉 Progress Bar | Indikator visual GC% di tabel untuk perbandingan cepat |
| 🎨 Color Coding | Warna berbeda untuk GC tinggi (hijau), sedang (kuning), rendah (abu) |

### Export & Statistik
| Fitur | Deskripsi |
|-------|-----------|
| ⬇️ Download CSV | Export seluruh hasil analisis ke file `.csv` |
| 📊 Summary Stats | Tampilan ringkas: total sekuens, rata-rata GC%, nilai tertinggi & terendah |
| 📋 Tabel Lengkap | Tabel semua sekuens dengan kolom Rank, ID, Length, A, T, G, C, GC% |

---

## ⚙️ Cara Kerja Pipeline

Pipeline analisis berjalan dalam 5 tahap berurutan:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. INPUT   │───▶│  2. PARSE   │───▶│  3. HITUNG  │───▶│  4. SORT    │───▶│  5. OUTPUT  │
│ FASTA/FASTQ │    │  Ekstrak ID │    │  Freq & GC% │    │  by GC desc │    │  Tampil+CSV │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Tahap 1 — Baca File

File FASTA atau FASTQ dibaca sebagai teks mentah. Sistem mendeteksi format secara otomatis berdasarkan ekstensi file (`.fastq`/`.fq` → FASTQ, lainnya → FASTA).

```
Format FASTA:               Format FASTQ:
>seq_id description         @seq_id description
ATGCGATCGATCG...            ATGCGATCGATCG...
                            +
                            IIIIIIIIIIIII...  (quality score)
```

### Tahap 2 — Parsing ke Struktur Data

Setiap record sekuens diekstrak menjadi objek JavaScript dan disimpan ke dalam **List (Array)**:

```javascript
// Hasil parsing disimpan dalam List
const sequences = [
  { id: "seq1", description: "Ecoli 16S rRNA", sequence: "ATGCGCTA..." },
  { id: "seq2", description: "Salmonella inv",  sequence: "GCGCATCG..." },
  // ...
];
```

### Tahap 3 — Kalkulasi Frekuensi & GC Content

Untuk setiap sekuens, sistem menghitung frekuensi nukleotida menggunakan **Dictionary** dan menghitung persentase GC:

```javascript
// Dictionary untuk frekuensi nukleotida
const freq = { A: 0, T: 0, G: 0, C: 0, N: 0 };

for (const base of sequence) {
  freq[base]++;  // O(1) lookup dan update
}

// Rumus GC Content
const gc = (freq["G"] + freq["C"]) / sequence.length * 100;
```

**Rumus GC Content:**

```
          jumlah G + jumlah C
GC% =  ─────────────────────── × 100
           total panjang sekuens
```

### Tahap 4 — Pengurutan (Sorting)

Semua sekuens diurutkan secara **descending** berdasarkan nilai GC Content menggunakan algoritma sort JavaScript (TimSort, O(n log n)):

```javascript
sequences.sort((a, b) => b.gc - a.gc);
// Sekuens dengan GC% tertinggi ada di index [0], [1], [2] (Top 3)
```

### Tahap 5 — Output & Visualisasi

Hasil ditampilkan dalam tiga format sekaligus:
- **UI Web**: kartu Top 3, grafik batang SVG, tabel lengkap
- **File CSV**: bisa diunduh langsung dari browser

---

## 🧠 Konsep Struktur Data

### 1. List (Array)

**Digunakan untuk:** menyimpan seluruh koleksi sekuens hasil parsing.

List dipilih karena:
- Menjaga **urutan** sekuens saat dibaca dari file
- Mendukung operasi **iterasi** untuk kalkulasi massal
- Mudah di-**sort** dan di-**slice** untuk Top 3

```javascript
// Deklarasi List kosong
const sequences = [];

// Push setiap record ke List saat parsing
sequences.push({
  id: "seq1",
  description: "Escherichia coli",
  sequence: "ATGCGATCG...",
  length: 240
});

// Akses Top 3 dengan slice
const top3 = sequences.slice(0, 3);
```

### 2. Dictionary (Object/Map)

**Digunakan untuk:** menyimpan frekuensi setiap karakter nukleotida.

Dictionary dipilih karena:
- Akses nilai dengan **key** bersifat O(1) — sangat efisien untuk sekuens panjang
- Struktur **key-value** sangat cocok untuk pemetaan `basa → jumlah`

```javascript
// Inisialisasi Dictionary dengan nilai awal
const freq = { "A": 0, "T": 0, "G": 0, "C": 0, "N": 0 };

// Update O(1) per karakter
for (const base of "ATGCATGCATGC") {
  freq[base]++;
}

// Hasil: { A: 3, T: 3, G: 3, C: 3, N: 0 }
```

### 3. Sorting Algorithm

**Digunakan untuk:** mengurutkan sekuens berdasarkan GC Content.

JavaScript menggunakan **TimSort** (hybrid Merge Sort + Insertion Sort):
- Kompleksitas waktu: **O(n log n)** rata-rata dan kasus terburuk
- Kompleksitas ruang: **O(n)**
- Stabil: urutan relatif elemen sama tetap terjaga

```javascript
// Sort descending by GC Content
results.sort((a, b) => b.gc - a.gc);

// Setelah sort:
// results[0] → GC Content tertinggi (Top 1)
// results[1] → Top 2
// results[2] → Top 3
```

### Ringkasan Kompleksitas

| Operasi | Struktur Data | Kompleksitas Waktu | Kompleksitas Ruang |
|---------|--------------|-------------------|-------------------|
| Baca & parse file | List (push) | O(n) | O(n) |
| Hitung frekuensi per sekuens | Dictionary | O(L) per sekuens* | O(1) |
| Hitung semua sekuens | List + Dictionary | O(n × L) | O(n) |
| Sorting | TimSort | O(n log n) | O(n) |
| Ambil Top 3 | List (slice) | O(1) | O(1) |

*L = panjang sekuens

---

## 🛠️ Teknologi yang Digunakan

### Frontend Framework

**[Next.js 14](https://nextjs.org)**
- Framework React untuk aplikasi web production-ready
- Digunakan karena: Server-Side Rendering, file-based routing, dan kompatibel penuh dengan Vercel
- Versi: `^14.0.0`

**[React 18](https://react.dev)**
- Library UI untuk membangun antarmuka berbasis komponen
- Hook yang dipakai: `useState` (state manajemen), `useRef` (referensi DOM file input)
- Versi: `^18.2.0`

### Deployment

**[Vercel](https://vercel.com)**
- Platform hosting untuk aplikasi Next.js
- Fitur yang dimanfaatkan: auto-deploy dari GitHub push, edge CDN global, HTTPS otomatis, preview URL per branch

### Visualisasi

**SVG (Scalable Vector Graphics)**
- Bar chart GC Content dibuat murni dengan SVG tanpa library tambahan
- Keuntungan: ringan, scalable, bisa dikustomisasi penuh, tidak butuh download library eksternal

### Pemrosesan Data

**Web File API (Browser built-in)**
- `FileReader.readAsText()` — membaca file FASTA/FASTQ yang diupload
- `Blob` + `URL.createObjectURL()` — membuat file CSV yang bisa didownload
- Tidak ada server yang terlibat: semua pemrosesan terjadi di browser (client-side)

### Format Data

| Format | Standar | Keterangan |
|--------|---------|------------|
| FASTA | NCBI standard | Format sekuens DNA/protein paling umum |
| FASTQ | Illumina standard | FASTA + quality score untuk data NGS |
| CSV | RFC 4180 | Format output untuk analisis lanjutan |

### Bahasa Pemrograman

| Bahasa | Digunakan untuk |
|--------|----------------|
| JavaScript (ES2020+) | Logika parsing, kalkulasi, UI web |
| Python 3 | Script CLI alternatif (`analysis.py`) |
| SVG/HTML/CSS | Visualisasi dan antarmuka |

---

## 🚀 Instalasi & Menjalankan Lokal

### Prasyarat

- Node.js versi 18 atau lebih baru ([download](https://nodejs.org))
- npm (sudah termasuk dalam Node.js)
- Git

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/USERNAME/bif1223-gc-pipeline.git

# 2. Masuk ke folder project
cd bif1223-gc-pipeline

# 3. Install dependencies
npm install

# 4. Jalankan development server
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

### Perintah Lainnya

```bash
npm run build    # Build untuk production
npm run start    # Jalankan versi production lokal
```

### Menjalankan Script Python (CLI)

```bash
# Dengan file FASTA dari NCBI
python analysis.py sequences.fasta

# Dengan file FASTQ
python analysis.py reads.fastq

# Tanpa argumen — gunakan sample data bawaan
python analysis.py
```

Output Python: terminal table + ASCII bar chart + file `gc_analysis_results.csv`

---

## 📁 Struktur Project

```
bif1223-gc-pipeline/
│
├── pages/
│   ├── _app.js          # Entry point aplikasi Next.js
│   └── index.js         # Halaman utama — semua logika & komponen UI
│
├── analysis.py          # Script Python CLI (alternatif command-line)
├── package.json         # Konfigurasi npm & daftar dependencies
├── next.config.js       # Konfigurasi Next.js
├── .gitignore           # File yang dikecualikan dari git
└── README.md            # Dokumentasi ini
```

### Arsitektur Aplikasi Web

```
pages/index.js
├── Parsing Layer
│   ├── parseFASTA()         — parser format FASTA
│   └── parseFASTQ()         — parser format FASTQ
│
├── Analysis Layer
│   ├── calcNucleotideFreq() — Dictionary frekuensi A/T/G/C
│   ├── calcGCContent()      — rumus GC%
│   └── analyzeSequences()   — integrasi: parse → hitung → sort
│
├── Export Layer
│   └── downloadCSV()        — generate & download file CSV
│
└── UI Layer (React Components)
    ├── <GCBarChart>          — bar chart SVG GC Content
    ├── <NucleotideChart>     — mini chart A/T/G/C per sekuens
    └── <Home>                — halaman utama & state management
```

---

## 📄 Format Input yang Didukung

### FASTA

```fasta
>seq_id deskripsi opsional
ATGCGATCGATCGATCGATCG
ATCGATCGATCGATCGATCGA
>seq_id_2 deskripsi opsional
GCGCGCGCGCATCGATCGATC
```

### FASTQ

```fastq
@seq_id deskripsi opsional
ATGCGATCGATCGATCGATCG
+
IIIIIIIIIIIIIIIIIIIII
```

Sumber file FASTA/FASTQ untuk organisnme nyata:
- **NCBI GenBank**: https://www.ncbi.nlm.nih.gov/nuccore/
- **Ensembl**: https://www.ensembl.org
- **SRA (Sequence Read Archive)**: https://www.ncbi.nlm.nih.gov/sra

---

## 📊 Output

### Tampilan Web

- **Statistik Ringkas**: total sekuens, rata-rata GC%, nilai tertinggi & terendah
- **Kartu Top 3**: sekuens terbaik dengan mini chart nukleotida dan progress bar
- **Grafik Batang**: visualisasi GC% semua sekuens (sorted)
- **Tabel Lengkap**: semua kolom data termasuk rank, panjang, frekuensi, dan GC%

### File CSV

```csv
rank,id,description,length,A,T,G,C,N,gc_content
1,seq4_Pseudomonas,GC rich strain,240,24,0,136,80,0,90.00
2,seq6_Mycobacterium,tuberculosis complex,238,0,0,134,104,0,99.16
3,seq8_Thermophile,high temp organism,244,4,0,140,100,0,98.36
...
```

---

## 📚 Referensi & Sumber Data

- Cock, P.J.A. et al. (2010). *The Sanger FASTQ file format for sequences with quality scores, and the Solexa/Illumina FASTQ variants*. Nucleic Acids Research.
- NCBI GenBank: https://www.ncbi.nlm.nih.gov/genbank/
- Next.js Documentation: https://nextjs.org/docs
- Vercel Documentation: https://vercel.com/docs

---

## 📝 Informasi Akademik

| Item | Detail |
|------|--------|
| Mata Kuliah | Struktur Data Bioinformatika (BIF1223) |
| Pertemuan | #15 — Integrasi Struktur Data untuk Pipeline Analisis Sederhana |
| Institusi | IPB University, Bogor, Indonesia |
| Dosen | Toto Haryanto |
| Deadline | 27 Juni 2026 |

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).
