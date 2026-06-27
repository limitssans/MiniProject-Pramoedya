import os
import csv
import matplotlib.pyplot as plt

# 1. Membaca file FASTA dan menyimpannya dalam List
def parse_fasta(file_path):
    if not os.path.exists(file_path):
        print(f" Error: File '{file_path}' tidak ditemukan.")
        return []
    
    sequences = []
    current_id = None
    current_seq = []
    
    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip()
            if not line:
                continue
            if line.startswith(">"):
                if current_id:
                    sequences.append({"id": current_id, "seq": "".join(current_seq)})
                current_id = line[1:]
                current_seq = []
            else:
                current_seq.append(line.upper())
                
        if current_id:
            sequences.append({"id": current_id, "seq": "".join(current_seq)})
            
    return sequences

# 2. Menghitung Frekuensi & GC Content menggunakan Dictionary
def analyze_sequences(raw_sequences):
    processed = []
    for item in raw_sequences:
        seq = item["seq"]
        length = len(seq) if len(seq) > 0 else 1
        
        # Menggunakan Dictionary untuk menghitung frekuensi nukleotida
        counts = {"A": 0, "C": 0, "G": 0, "T": 0}
        for char in seq:
            if char in counts:
                counts[char] += 1
                
        # Menghitung GC Content
        gc_content = ((counts["G"] + counts["C"]) / length) * 100
        
        processed.append({
            "id": item["id"],
            "length": length,
            "counts": counts,
            "gc_content": round(gc_content, 2)
        })
        
    # 3. Mengurutkan sekuens berdasarkan GC Content (Descending)
    processed.sort(key=lambda x: x["gc_content"], reverse=True)
    return processed

# 4. Menuliskan hasil ke file CSV
def save_to_csv(data, output_filename="hasil_analisis.csv"):
    with open(output_filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Sequence ID', 'GC Content (%)', 'Length (bp)', 'A', 'C', 'G', 'T'])
        for item in data:
            writer.writerow([
                item['id'].split()[0], item['gc_content'], item['length'],
                item['counts']['A'], item['counts']['C'], item['counts']['G'], item['counts']['T']
            ])
    print(f"💾 Hasil analisis sukses disimpan ke file: '{output_filename}'")

# 5. Melakukan visualisasi dalam grafik hasil GC Content
def generate_chart(data):
    ids = [item["id"].split()[0] for item in data]
    gc_values = [item["gc_content"] for item in data]
    
    plt.figure(figsize=(10, 5))
    bars = plt.bar(ids, gc_values, color='skyblue', edgecolor='black')
    
    plt.title("Perbandingan Nilai GC Content (%)", fontsize=14, fontweight='bold')
    plt.xlabel("Sequence ID", fontsize=12)
    plt.ylabel("GC Percentage", fontsize=12)
    plt.xticks(rotation=15, ha='right')
    plt.ylim(0, max(gc_values) + 10)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # Beri label nilai di atas grafik batang
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2.0, yval + 1, f"{yval}%", ha='center', va='bottom', fontsize=9)
        
    plt.tight_layout()
    print("📊 Menampilkan grafik visualisasi... (Tutup jendela grafik untuk menyelesaikan program)")
    plt.show()

# --- Main Execution Flow ---
if __name__ == "__main__":
    file_input = "bakterikopi.fasta"
    
    print("="*60)
    print("🧬 RUNNING BIOINFORMATICS PIPELINE VIA TERMINAL")
    print("="*60)
    
    # Langkah 1 & 2: Membaca dan Menganalisis
    raw_data = parse_fasta(file_input)
    
    if raw_data:
        results = analyze_sequences(raw_data)
        
        # Langkah 4: Menampilkan 3 sekuens terbaik di terminal
        print("\n🏆 TOP 3 SEQUENCES BASED ON GC CONTENT:")
        print("-" * 60)
        for i, item in enumerate(results[:3], 1):
            print(f"{i}. ID         : {item['id']}")
            print(f"   GC Content : {item['gc_content']}%")
            print(f"   Panjang    : {item['length']} bp")
            print(f"   Komposisi  : {item['counts']}\n")
        print("-" * 60)
        
        # Langkah 5: Simpan ke CSV
        save_to_csv(results)
        
        # Langkah 6: Visualisasi Grafik
        generate_chart(results)
        
        print("\n Pipeline Selesai Terbaca Sempurna!")
    else:
        print(" Gagal memproses pipeline karena data kosong atau file bermasalah.")
