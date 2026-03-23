## Hazırlık: Değişiklikleri Gönder (GitHub)

Railway, kodlarını doğrudan GitHub üzerinden okuyup canlıya alır. Yeni Docker yapılandırmasının etkili olması için son değişiklikleri gönderelim:

```bash
git add .
git commit -m "fix: multi-stage build for railway"
git push origin main
```

## 💡 Önemli: Ön Yüz (Frontend) Nasıl Canlıya Alınıyor?

"Ön yüzü ayrıca yüklemem gerekiyor mu?" diye düşünebilirsin. Cevap: **Hayır!**

Uygulamayı senin için "Unified" (Birleşik) hale getirdim. Bu şu demek:
- Sunucun (Backend), aynı zamanda ön yüzdeki tüm dosyaları da kendi içinde taşıyor.
- Railway'e sadece backend'i (tüm klasörü) bağladığında, backend çalışırken otomatik olarak ön yüzü de servis etmeye başlıyor.
- Bu sayede hem API hem de Ekranlar aynı URL üzerinden (`studyb.up.railway.app`) tek bir parça olarak çalışıyor. Bu yöntem hem daha ucuz (tek servis) hem de daha hızlı!

---

## Adım Adım: Railway Canlıya Alma (5 Dakika)

1.  **Giriş Yap**: [Railway.app](https://railway.app/) adresine git ve GitHub hesabınla giriş yap.
2.  **Yeni Proje**: "New Project" -> "Deploy from GitHub repo" seçeneğini tıkla ve `studyb` deposunu seç.
3.  **Veritabanı Ekle**:
    -   Proje ekranında "Add" -> "Database" -> "Add PostgreSQL" seç.
4.  **Uygulamayı Yapılandır (Variables)**:
    -   `studyb` servisine tıkla ve "Variables" sekmesine git.
    -   "New Variable" tıkla ve şu iki değeri ekle:
        -   `PORT`: `8080` (Benim hazırladığım Dockerfile bu portu kullanıyor)
        -   `JWT_SECRET`: Güçlü, rastgele bir şifre (Örn: `benim_cok_gizli_sifrem_123`)
        -   `DATABASE_URL`: `Add Reference` butonuna basıp listeden `Postgres` -> `DATABASE_URL` seç. (Railway bunu otomatik bağlar!)
5.  **Canlıya Al (Deploy)**:
    -   Değişiklikleri kaydettiğinde Railway otomatik olarak `Dockerfile` dosyanı görecek ve uygulamayı derleyip yayına alacaktır.
6.  **URL Al**:
    -   "Settings" sekmesinde "Generate Domain" butonuna basarak `studyb-production.up.railway.app` gibi bir canlı adres alabilirsin!

---

## Neden Bu Yöntem?
-   **Kalıcı Veri**: Bilgisayarını kapatsan da veritabanın ve siten çalışmaya devam eder.
-   **Her Yerden Erişim**: Linki arkadaşlarına gönderebilir, telefondan veya başka PC'den girebilirsin.
-   **Otomatik Güncelleme**: Kodu her `git push` yaptığında siten saniyeler içinde güncellenir.

**Hayırlı olsun! Uygulaman artık dünyaya açılmaya hazır.** 🎓🌍
