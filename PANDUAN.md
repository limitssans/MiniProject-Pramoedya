# 🧬 BioGC Pipeline — Panduan Lengkap
**Mini Project BIF1223 · Struktur Data Bioinformatika · IPB University**

---

## 📋 Daftar Isi
1. [Deskripsi Proyek](#deskripsi)
2. [Struktur Data yang Digunakan](#struktur-data)
3. [Cara Deploy ke Vercel via GitHub](#deploy)
4. [Cara Menjalankan Lokal](#lokal)
5. [Cara Menggunakan Web App](#penggunaan)
6. [Script Python (Alternatif CLI)](#python)

---

## 1. Deskripsi Proyek <a name="deskripsi"></a>

Pipeline analisis sekuens DNA sederhana berbasis web yang:
- ✅ Membaca file FASTA / FASTQ
- ✅ Menyimpan data dalam **List**
- ✅ Menghitung frekuensi nukleotida dengan **Dictionary**
- ✅ Mengurutkan sekuens berdasarkan **GC Content**
- ✅ Menampilkan **3 sekuens terbaik**
- ✅ Visualisasi **grafik bar** GC Content
- ✅ Download hasil ke **file CSV**

---

## 2. Struktur Data yang Digunakan <a name="struktur-data"></a>

### List
```python
sequences = []   # Menyimpan semua record sekuens
sequences.append({ "id": "seq1", "sequence": "ATGC..." })
```

### Dictionary
```python
freq = { "A": 0, "T": 0, "G": 0, "C": 0, "N": 0 }
for base in sequence:
    freq[base] += 1   # O(1) akses per karakter
```

### Sorting (berdasarkan GC Content)
```python
sequences.sort(key=lambda x: x["gc"], reverse=True)
```

---

## 3. Deploy ke Vercel via GitHub <a name="deploy"></a>

### Langkah A — Siapkan Repository GitHub

```bash
# 1. Buat folder project (atau gunakan folder yang sudah ada)
mkdir bioinformatics-pipeline
cd bioinformatics-pipeline

# 2. Copy semua file dari project ini ke folder tersebut

# 3. Inisialisasi git
git init
git add .
git commit -m "Initial commit: BIF1223 GC Pipeline"

# 4. Buat repository baru di github.com
#    (klik New Repository, beri nama mis. "bif1223-gc-pipeline")

# 5. Push ke GitHub
git remote add origin https://github.com/USERNAME/bif1223-gc-pipeline.git
git branch -M main
git push -u origin main
```

### Langkah B — Deploy ke Vercel

1. Buka **https://vercel.com** → Login dengan akun GitHub
2. Klik **"Add New Project"**
3. Pilih repository `bif1223-gc-pipeline` → klik **Import**
4. Framework akan terdeteksi otomatis sebagai **Next.js**
5. Klik **Deploy** — tunggu sekitar 1-2 menit
6. ✅ Web langsung live di URL seperti: `https://bif1223-gc-pipeline.vercel.app`

> Setiap kali kamu `git push`, Vercel otomatis rebuild & deploy ulang.

---

## 4. Menjalankan Lokal <a name="lokal"></a>

### Kebutuhan
- Node.js versi 18+ (download di nodejs.org)
- npm (sudah termasuk dalam Node.js)

### Langkah

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Buka browser ke http://localhost:3000
```

---

## 5. Cara Menggunakan Web App <a name="penggunaan"></a>

1. **Upload file** — Drag & drop file `.fasta`, `.fa`, `.fastq`, atau `.fq`  
   _atau_ klik tombol **"Load Sample Data"** untuk mencoba langsung dengan 10 sekuens bakteri

2. **Lihat hasil analisis**:
   - Statistik ringkas (total sekuens, rata-rata GC%, tertinggi/terendah)
   - **Top 3 sekuens** GC content tertinggi + mini bar chart nukleotida
   - **Grafik batang** semua sekuens (sorted by GC%)
   - **Tabel lengkap** frekuensi A, T, G, C per sekuens

3. **Download CSV** — Klik tombol "⬇️ Download CSV" untuk menyimpan hasil

### Format CSV yang dihasilkan:
```
rank,id,description,length,A,T,G,C,N,gc_content
1,seq4_Pseudomonas,...,240,24,0,136,80,0,90.00
2,seq6_Mycobacterium,...,238,0,0,134,104,0,99.16
...
```

---

## 6. Script Python CLI (Alternatif) <a name="python"></a>

File `analysis.py` adalah versi command-line yang bisa dijalankan di terminal.

```bash
# Jalankan dengan file FASTA
python analysis.py sequences.fasta

# Jalankan dengan sample data bawaan
python analysis.py
```

Output:
- Tabel top 3 di terminal
- Visualisasi ASCII bar chart
- File `gc_analysis_results.csv` otomatis tersimpan

---

## Struktur File Project

```
bioinformatics-pipeline/
├── pages/
│   ├── _app.js          # Entry point Next.js
│   └── index.js         # Halaman utama (semua logika & UI)
├── analysis.py          # Script Python CLI
├── package.json         # Konfigurasi npm
├── next.config.js       # Konfigurasi Next.js
├── .gitignore
└── PANDUAN.md           # File ini
```

---

## Referensi & Sumber Data FASTA

Untuk mendapatkan file FASTA dari organisme nyata:
- **NCBI GenBank**: https://www.ncbi.nlm.nih.gov/nuccore/
  - Cari nama organisme (mis. *Escherichia coli*)
  - Klik "Send to" → "File" → Format: **FASTA**
- **Ensembl**: https://www.ensembl.org
- **UniProt** (protein): https://www.uniprot.org

---

*BIF1223 · Pertemuan #15 · Toto Haryanto · IPB University*
