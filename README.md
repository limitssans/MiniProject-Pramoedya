# 🧬 BioGC Pipeline (Core CLI System)

> Pipeline analisis sekuens DNA berbasis Terminal (Python CLI) sebagai sistem pemrosesan utama, dilengkapi dengan web app interaktif sebagai fitur pelengkap visualisasi.
> 
> **Mini Project BIF1223 Struktur Data Bioinformatika, IPB University**.

[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python&logoColor=white)](https://python.org)
[![Course](https://img.shields.io/badge/Course-BIF1223-blue)](https://ipb.ac.id) 
[![Deadline](https://img.shields.io/badge/Deadline-27_Juni_2026-red)](https://class.ipb.ac.id) 

---

## ✨ Fitur Utama (Sistem CLI)

Skrip Python mandiri ini merupakan arsitektur utama pengolahan data pipeline yang memenuhi seluruh parameter penugasan akademik:

* **Ekstraksi File Otomatis**: Membaca format standar file FASTA (`.fasta`) secara dinamis menggunakan *file stream reader*.
* **Kalkulasi Frekuensi Presisi**: Menghitung jumlah individual dari masing-masing basa nitrogen Adenina (A), Timina (T), Guanina (G), dan Sitosina (C) menggunakan struktur data objek *Dictionary*.
* **Analisis Rasio GC**: Mengalkulasi persentase kandungan GC Content individu menggunakan formula biologi komputasi formal.
* **Algoritma Sorting**: Mengurutkan sekuens hasil secara otomatis berdasarkan persentase konten GC tertinggi (*Descending*).
* **Filtrasi Kandidat Terbaik**: Mengisolasi dan mengekstrak data 3 sekuens teratas (*Top 3*) untuk ditampilkan pada ringkasan Terminal.
* **Data Exporting**: Menuliskan seluruh tabel hasil analisis komparatif secara permanen ke dalam dokumen `.csv`.
* **Visualisasi Grafis**: Menghasilkan visualisasi *Bar Chart* interaktif menggunakan pustaka desktop *Matplotlib*.
