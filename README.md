# Grafkom-WebGL-Plate 🍽️🍝

### 🧑‍💻 By Furstin Aprilavia Putri 5025221234

Proyek ini dapat diakses secara online melalui GitHub Pages
**https://furstinvia.github.io/Grafkom-WebGL-Plate/**

## Deskripsi 🍽️

Proyek ini dibuat sebagai bagian dari tugas pada kelas Grafika Komputer D. Proyek ini adalah aplikasi 3D Visualizer berbasis WebGL yang menampilkan model piring realistis dengan warna, efek bayangan kaca, dan kontrol interaktif. Visualisasi ini dibuat menggunakan teknologi modern seperti WebGL untuk rendering grafis dan Blender sebagai alat pembuat model 3D.

## Fitur 🚀

1. **Rendering Model 3D**

Model piring divisualisasikan dalam format .obj dan .mtl dengan warna cokelat muda kayu serta efek bayangan transparan seperti kaca.

2. **Custom Shader**

Menggunakan vertex shader dan fragment shader kustom untuk menciptakan:
- Warna solid untuk model.
- Efek bayangan halus berbasis posisi objek.
- Transparansi untuk kesan realistis seperti kaca.

3. **Interaktivitas**

Kontrol interaktif menggunakan mouse:
- Rotasi objek dengan drag mouse.
- Zoom menggunakan scroll mouse.
- Reset tampilan dengan double click.
  
4. **Responsive Canvas**

Tampilan otomatis menyesuaikan ukuran layar menggunakan resize event.**

5. **Struktur File yang Modular**

Kode dibagi menjadi modul terpisah seperti shaders.js, canvas.js, dan main.js untuk mempermudah pengelolaan proyek.

## Teknologi 🛠️

- **WebGL**: Teknologi dasar untuk rendering grafis 3D di Three.js.
- **Blender**: Digunakan untuk membuat dan mengekspor model 3D.
- **HTML5 Canvas**: Media untuk rendering grafis menggunakan konteks WebGL.

## Tampilan 🖥️
### 1. Model di Blender
Gambar hasil modeling piring di Blender:

![image](https://github.com/user-attachments/assets/3c77e22c-2238-4f27-9a5e-04cf55c7be4c)

![image](https://github.com/user-attachments/assets/1de24199-1f7d-4b1b-a014-a27d1b9d4931)

### 2. Model di WebGL
Gambar model piring dan pizza setelah diimpor dan dirender menggunakan WebGL:

![image](https://github.com/user-attachments/assets/5e685cf1-d46f-47a1-8c24-2d39bed7d7d1)

## Cara Menjalankan
1. Clone repository ini:
   
   ```bash
   git clone https://github.com/furstinvia/Grafkom-WebGL-Plate.git
   ```

2. Buka file `index.html` di browser untuk melihat model piring yang dirender.
   
