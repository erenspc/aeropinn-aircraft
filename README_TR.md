# AeroPINN-Uçak: Tam Sistem Yeniden Kurulumu

## Özet

FastAPI + Next.js + PyTorch kullanılarak Uçak Kanat Aerodinamik Analizi için Fizik-Bilgili Sinir Ağları (PINNs)

Bu, aşağıdakileri birleştiren **kapsamlı, üretime hazır** bir sistemdir:

- ✅ **Fizik-Bilgili Sinir Ağları (PINNs)** - Gerçek aerodinamik diferansiyel denklemler ile
- ✅ **CFD Entegrasyonu** - OpenFOAM ile entegre olmaya hazır
- ✅ **3D Görselleştirme** - React Three Fiber ile interaktif 3D kanat modelleri
- ✅ **Reynolds/Mach/Hücum Açısı** - Gerçek dünya aerodinamik koşulları
- ✅ **Hibrit Kayıp Eğitimi** - Denetlenen + fizik-bilgili
- ✅ **Tam Deployment** - Railway/Vercel için hazır

## Hızlı Başlangıç

### Backend Kurulumu

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows için: venv\\Scripts\\activate
pip install -r requirements.txt
python app.py
```

Backend şu adreste çalışır: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

Frontend şu adreste çalışır: `http://localhost:3000`

## Proje Yapısı

```
aeropi nn-aircraft/
├── backend/
│   ├── app.py                 # FastAPI ana uygulaması
│   ├── models/
│   │   ├── pinn_model.py      # Fizik-Bilgili Sinir Ağı
│   │   ├── aerodynamic_pde.py # Yönetim denklemleri
│   │   └── physics_loss.py    # Fizik kalıntı hesaplaması
│   ├── services/
│   │   ├── training.py        # PINN eğitim boru hattı
│   │   ├── preprocessing.py   # Veri doğrulama
│   │   └── aerodynamics.py    # Reynolds, Mach hesaplaması
│   ├── routes/
│   │   ├── analyze.py         # POST /analyze uç noktası
│   │   └── results.py         # Sonuç uç noktaları
│   ├── datasets/
│   │   ├── naca_2412.csv
│   │   ├── naca_4412.csv
│   │   └── high_lift.csv
│   ├── requirements.txt
│   └── Procfile               # Railway deployment
├── frontend/
│   ├── pages/
│   │   ├── index.js           # Yükleme ve parametre giriş
│   │   ├── results.js         # Sonuçlar ve 3D görüntüleyici
│   │   └── api/
│   ├── components/
│   │   ├── FileUpload.js      # CSV yükleme
│   │   ├── ParameterForm.js   # Kanat parametreleri
│   │   ├── WingViewer3D.js    # 3D görüntüleyici
│   │   └── Charts.js          # CL/CD grafiği
│   ├── package.json
│   └── next.config.js
└── README.md
```

## Uygulamayı Kullanma

### Adım 1: CSV Veri Yükleme

1. `http://localhost:3000` adresine gidin
2. **CSV Yükle** düğmesine tıklayın
3. CSV dosyasını seçin (örnek: `AoA_deg, CL, CD, Cm`)
4. Örnek dosyalar: `backend/datasets/` klasöründe mevcuttur

### Adım 2: Kanat Parametrelerini Girin

- **Kord (m):** Kanat kord uzunluğu (örn: 0.5 m)
- **Açıklık (m):** Kanat açıklığı (örn: 2.0 m)
- **Hız (m/s):** Serbest akış hızı (örn: 30 m/s)
- **Hava Yoğunluğu (kg/m³):** Deniz seviyesi (1.225)

### Adım 3: Analiz Çalıştırın

**Analiz Çalıştır** düğmesine tıklayın. Sistem şunları yapacak:

1. ✅ CSV'nizi doğrula
2. ✅ Reynolds Sayısını hesapla: `Re = ρ * V * c / μ`
3. ✅ Mach Sayısını hesapla: `M = V / a`
4. ✅ PINN'i eğit (denetlenen + fizik kayıpları)
5. ✅ Aerodinamik polar eğrileri (CL/CD) tahmin et
6. ✅ Basınç dağılımı oluştur
7. ✅ 3D kanat geometrisi dışa aktar

### Adım 4: Sonuçları Görüntüle

**Sonuçlar** sayfasında şunları göreceksiniz:

- 📊 **CL/CD Polar Eğrileri** - Stall tahmini ile
- 📈 **Verimlilik (L/D) Grafiği**
- 🎯 **Önerilen Hücum Açısı**
- 🌐 **İnteraktif 3D Kanat Görüntüleyici**
  - Renk kodlu basınç dağılımı (mavi = düşük, kırmızı = yüksek)
  - Döndürme, yakınlaştırma, kaydırma
  - Hava akışı animasyonu
- ⬇️ **İndirme Seçenekleri:**
  - Sonuçlar (JSON)
  - 3D Geometri (.glb, .json)
  - Performans Raporu (PDF)

## API Uç Noktaları

### POST `/api/analyze`

Verilen parametreleri kullanarak aerodinamik analizi yap.

**İstek:**
```json
{
  "csv_data": "[base64-encoded CSV]",
  "chord": 0.5,
  "span": 2.0,
  "velocity": 30.0,
  "air_density": 1.225,
  "temperature": 288.15
}
```

**Yanıt:**
```json
{
  "status": "success",
  "Reynolds": 1000000,
  "Mach": 0.088,
  "CL": [0.2, 0.71, 1.03, 0.87],
  "CD": [0.014, 0.025, 0.028, 0.070],
  "efficiency": 50.2,
  "stall_angle": 15.5,
  "geometry": {...},
  "training_metrics": {...}
}
```

### GET `/api/health`

Sağlık kontrolü.

**Yanıt:**
```json
{"status": "ok"}
```

## Ana Özellikler

### 1. Fizik-Bilgili Sinir Ağı

- **Mimari:** 6 katmanlı Tanh ağı
- **Giriş:** [Hücum Açısı, Reynolds, Mach, Kord, Yoğunluk, Viskozite]
- **Kayıp Fonksiyonu:** Hibrit
  - Denetlenen: Dataset noktaları üzerinde MSE
  - Fizik-Bilgili: PDE kalıntıları
    - Süreklilik: `∂ρ/∂t + ∇·(ρu) = 0`
    - Navier-Stokes: `ρ(∂u/∂t + u·∇u) = -∇p + μ∇²u`
    - Kutta TE Koşulu

### 2. Aerodinamik Hesaplamalar

- **Reynolds Sayısı:** `Re = ρ * V * c / μ`
- **Mach Sayısı:** `M = V / a`
- **Polar Eğrileri:** PINN tahminlerinden interpolasyon
- **Stall Tahmini:** CLmax belirleme
- **Verimlilik:** L/D = CL / CD

### 3. 3D Görselleştirme

- **Kanat Ağı:** Airfoil koordinatlarından oluştur
- **Basınç Alanı:** Cp haritası (mavi→kırmızı skala)
- **İnteraktif Kontroller:** Döndürme, yakınlaştırma, kaydırma

### 4. CFD Entegrasyonu

- OpenFOAM boru hattı entegrasyonuna hazır
- Multi-fidelity yaklaşım
- Otomatik ağ ve çözücü kurulumu

## Deployment

### Railway (Backend)

1. GitHub repo'sunu Railway'e bağlayın
2. `PYTHON_VERSION=3.10` ortam değişkeni ekleyin
3. `backend` dizininden deploy edin
4. Railway otomatik olarak `Procfile`'ı tanır

### Vercel (Frontend)

1. GitHub repo'sunu Vercel'e bağlayın
2. Kök dizini `frontend` olarak ayarlayın
3. Push'ta otomatik deploy olur

Detaylı adımlar için: `docs/DEPLOYMENT_GUIDE.md`

## Teknolojiler

**Backend:**
- FastAPI - Modern Python web framework
- PyTorch - Sinir ağları
- NumPy/SciPy - Bilimsel hesaplama
- Uvicorn - ASGI sunucusu

**Frontend:**
- Next.js 14 - React framework
- React Three Fiber - 3D grafik
- TailwindCSS - Stil
- Recharts - Grafikler

## Lisans

MIT Lisansı - LICENSE dosyasına bakın

## İletişim ve Destek

- **Kullanıcı Rehberi:** `docs/USER_GUIDE.md`
- **API Referansı:** `docs/API_DOCUMENTATION.md`
- **Akademik Detaylar:** `docs/ACADEMIC_NOVELTY.md`
- **Deployment Rehberi:** `docs/DEPLOYMENT_GUIDE.md`
- **GitHub Issues:** Hataları bildir veya özellik öner

**Durum:** Üretime Hazır | Son Güncelleme: Kasım 2025

---

**Türkçe Doküman** | [English Version](README.md)
