# AeroPINN Aircraft: Temel Çalışma Prensipleri

Bu dokuman, AeroPINN Aircraft projesinin kodunun nasıl çalıştığını ve temel mekanizmalarını açıklar.

---

## 1. FastAPI Ana Uygulaması (app.py)

### Amaç
Aerdinamik analiz için REST API sağlayan backend sunucusu.

### Temel Çalışma Mekanizması

#### CORS Yapılandırması
- Tüm kaynaklardan gelen istekleri kabul eder
- Frontend-Backend iletişimini sağlar

#### Veri Modelleri

**AnalysisParameters (Giriş Parametreleri)**
- angle_of_attack: Hücum açısı (derece)
- reynolds_number: Reynolds sayısı
- mach_number: Mach sayısı
- chord_length: Kanat kirişi (metre)
- air_density: Hava yoğunluğu (kg/m³)
- air_viscosity: Hava viskozitesi (Pa*s)
- wing_area: Kanat alanı (m²)

**AnalysisResult (Çıktı Sonuçları)**
- lift_coefficient: Kaldırma katsayısı (CL)
- drag_coefficient: Sürükleme katsayısı (CD)
- moment_coefficient: Moment katsayısı (CM)
- pressure_coefficients: Basınç dağılımı
- flow_velocity: Akış hızı

#### Basitleştirilmiş Aerodinamik Hesaplamalar

**Dinamik Basınç Hesaplaması**
```
flow_velocity = sqrt(2 * rho) / viscosity * mach * 340
dynamic_pressure = 0.5 * rho * velocity^2
```

**Kaldırma Katsayısı (İnce Kanat Teorisi)**
```
CL = CL_0 + CL_alpha * angle_of_attack_radians
CL_alpha = 2 * π ≈ 6.283
```

**Sürükleme Katsayısı (Parazitik + İndüklenmişçekiş)**
```
CD = CD_0 + (CL^2) / (π * aspect_ratio * 0.95)
CD_0 = 0.008 (parazitik çekiş)
aspect_ratio = 7.5 (tipik uçak kanatı)
```

**Moment Katsayısı (Pitch Moment)**
```
CM = -0.025 + 0.1 * CL
```

#### API Endpoints

**GET /** 
- Kök endpoint, mevcut API hakkında bilgi döner

**GET /health**
- Sistem sağlık kontrolü
- Yanıt: {"status": "healthy", "model": "ready"}

**POST /analyze**
- Tekil analiz için
- Parametreleri alır ve aerodinamik katsayılarını hesaplar

**POST /analyze-batch**
- CSV dosyası yükle ve batch analiz yap
- Birden çok vaka aynı anda işlenir

**GET /info**
- Fizik denklemleri ve model hakkında bilgi

---

## 2. Fizik-Bilimsel Kayıp Modülü (physics_loss.py)

### Amaç
Navier-Stokes denklemlerini fizik kısıtlaması olarak uygulayan kayıp fonksiyonu.

### Temel Çalışma Mekanizması

#### PhysicsLoss Sınıfı

**Başlangıç Parametreleri**
- rho: Hava yoğunluğu (1.225 kg/m³)
- nu: Kinematik viskozite (1.81e-5 m²/s)

#### Fizik Kısıtlamaları

**1. Süreklilik Denklemi (Continuity)**
```
∂ρ/∂t + ∇·(ρu) = 0
Simplified: ∂u/∂x + ∂v/∂y = 0

continuity_loss = mean((∂u/∂x + ∂v/∂y)^2)
```

Fiziksel Anlamı: Kütlenin korunumu - akış sıkıştırılamaz.

**2. Momentum X Denklemi**
```
ρ(∂u/∂t + u·∇u) = -∇p + μ∇²u

momentum_x = u·∂u/∂x + v·∂u/∂y - (1/ρ)·∂p/∂x - ν·(∂²u/∂x² + ∂²u/∂y²)
mom_x_loss = mean(momentum_x^2)
```

Fiziksel Anlamı: Newton'un ikinci kanunu - kuvvet = kütle × ivme.

**3. Momentum Y Denklemi**
```
Benzer şekilde Y yönü için momentum denklemi uygulanır.
mom_y_loss = mean(momentum_y^2)
```

#### Toplam Fiziksel Kayıp
```
total_physics_loss = continuity_loss + momentum_x_loss + momentum_y_loss
```

#### Otomatik Diferensiyasyon
- PyTorch autograd kullanılır
- Gradyenler sembolik olarak hesaplanır
- Null değer kontrolü yapılır (eğer türev tanımlanmıyorsa zero tensor döner)

---

## 3. PINN Eğitimi (training.py)

### Amaç
Hibrit kayıp fonksiyonu ile Physics-Informed Neural Network'ü eğitmek.

### Temel Çalışma Mekanizması

#### PINNTrainer Sınıfı

**Hibrit Kayıp Fonksiyonu**
```
L_total = L_data + λ * L_physics

L_data: Eğitim verisine uyum (Supervised Learning)
L_physics: Fizik denklemlerine uyum (Physics-Informed)
λ (lambda): Fizik ağırlığı (varsayılan: 1.0)
```

**Veri Kaybı**
```
L_data = MSE(u_pred, u_target) + MSE(v_pred, v_target) + MSE(p_pred, p_target)

u, v: Hız bileşenleri
p: Basınç
```

#### Eğitim Döngüsü (train_epoch)

1. **Veri Hazırlığı**
   - x, y koordinatlarını requires_grad=True ile ayarla
   - Hedef değerler (u_t, v_t, p_t) cihaza taşı

2. **Forward Pass**
   - Model(x, y, AoA, Reynolds, Mach) → tahmin edilen u, v, p

3. **Kayıp Hesabı**
   - data_loss = veri farkı
   - physics_loss = fizik denklemi farkı
   - total_loss = data_loss + physics_weight * physics_loss

4. **Backward Pass**
   - loss.backward() - gradyenleri hesapla
   - torch.nn.utils.clip_grad_norm_ - gradient clipping
   - optimizer.step() - ağırlıkları güncelle

#### Optimizasyon Ayarları

**Adam Optimizer**
- Learning Rate: 1e-3 (0.001)
- Default betas: (0.9, 0.999)

**Learning Rate Scheduler**
- Step LR: Her 50 epoch'ta 0.9 ile çarp
- Eğitim sırasında öğrenme hızını azalt

#### Eğitim Metrikleri
```
history = {
    'epoch': Epoch numaraları,
    'data_loss': Veri kaybı,
    'physics_loss': Fizik kaybı,
    'total_loss': Toplam kayıp
}
```

#### Model Kaydetme
- Her 10 epoch'ta kontrol noktası kaydedilir
- Dosya: checkpoint_dir/epoch_{epoch+1}.pt

#### Veri Yükleme

**create_dataloader Fonksiyonu**
```
Giriş: DataFrame (x, y, u, v, p, AoA sütunları)
Çıktı: Train ve validation DataLoader'lar

Test/Train Split: %80 eğitim, %20 validasyon
```

---

## 4. Sistem Akışı

### Genel İş Akışı

1. **Kullanıcı CSV Yükleme**
   - Frontend'den CSV dosyası gönderilir
   - API /analyze-batch endpoint'ine gönderilir

2. **CSV Ayrıştırma**
   - parse_csv_file() CSV'yi AnalysisParameters'a dönüştürür
   - Hata yoksa devam et

3. **Aerodinamik Hesaplamalar**
   - Her örnek için calculate_aerodynamic_coefficients() çalıştır
   - Reynolds, Mach sayıları hesaplanır
   - CL, CD, CM, Cp dağılımı bulunur

4. **PINN Eğitimi (İsteğe Bağlı)**
   - PINNTrainer başlatılır
   - Hybrid loss ile eğitim yapılır
   - Fiziksel kısıtlamalar uygulanır

5. **Sonuç Dönüşü**
   - JSON formatında sonuçlar döner
   - Frontend 3D görselleştirme yapar

---

## 5. Önemli Fizik Kavramları

### Reynolds Sayısı
```
Re = (ρ * V * c) / μ

ρ: Hava yoğunluğu
V: Serbest akış hızı
c: Kanat kirişi
μ: Dinamik viskozite

Açılama: Atalet kuvvetlerinin viskoz kuvvetlere oranı
```

### Mach Sayısı
```
M = V / a

V: Hava hızı
a: Ses hızı (T'ye bağlı)

Kategoriler:
M < 0.3: Subsonic incompressible
M = 0.3-0.8: Transonic
M > 0.8: Supersonic
```

### Navier-Stokes Denklemleri
- Akışkanlar mekaniğinin temel denklemleri
- Momentum, enerji ve süreklilik denklemlerini içerir
- PINN'de fizik kısıtlaması olarak uygulanır

---

## 6. Teknik Not

- **Autograd**: PyTorch automatic differentiation
- **Hybrid Learning**: Veri ve fizik bilgisini birleştirerek daha güvenilir modeller oluşturur
- **Pressure Coefficients**: Basınç alanının mesh üzerinde görselleştirilmesi
- **Batch Processing**: Çoklu analiz durumlarını paralel işle

---

**Belge Tarihi**: Aralık 2025
**Versiyon**: 1.0
