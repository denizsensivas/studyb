# StudyB

Proje açıklaması buraya gelecek.

## Başlangıç

```bash
# Projeyi klonlayın
git clone https://github.com/alp-orta/studyb.git
cd studyb
```

## Belge Depolama

Notlar ve belgeler sunucunun yerel diskine yazılmaz. Özel bir Cloudflare R2
bucket'ında saklanır ve yalnızca oturum açmış dosya sahibi tarafından uygulama
üzerinden okunabilir veya silinebilir.

1. Cloudflare R2'de Standard sınıfında özel bir bucket oluşturun.
2. Bucket için Object Read & Write yetkili bir R2 API token oluşturun.
3. `server/.env.example` dosyasındaki `R2_*` değişkenlerini `server/.env`
   dosyanıza ekleyin.

Dosya başına sınır 10 MB'dir. Uygulama üzerinden yüklenen tüm kullanıcı
dosyaları için toplam 9 GB sınır uygulanır; böylece R2'nin 10 GB-ay ücretsiz
depolama kotasının altında 1 GB güvenlik payı bırakılır. Bu sayaç veritabanındaki
belge kayıtlarını temel alır; bucket yalnızca uygulama tarafından kullanıldığı
için R2 obje listesi her istekte tekrar taranmaz. PDF, JPG, PNG, WebP, TXT, DOC,
DOCX, EPUB, PPT ve PPTX desteklenir.

## Proje Yapısı

```
studyb/
├── .agents/
│   ├── prompts/       # Agent promptları
│   ├── skills/        # Agent skill tanımları
│   └── workflows/     # Workflow tanımları
├── src/               # Kaynak kodları
├── .gitignore
└── README.md
```
