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

## Redis

Redis; API ve kimlik doğrulama hız sınırlarını tüm uygulama örnekleri arasında
paylaştırmak, pahalı analiz sorgularını kısa süreli önbelleğe almak ve liderlik
tablosu sorgularını önbelleğe almak için kullanılır. Yazma işlemleri ilgili
önbellekleri geçersiz kılar. Redis üretimde zorunludur; bağlantı kurulamazsa
uygulama trafiğe açılmaz ve `/ready` 503 döndürür.

Yerel geliştirme için `docker compose up -d` komutu PostgreSQL ile kalıcı AOF
depolamalı Redis'i başlatır. Ardından `server/.env.example` dosyasını temel alarak
`server/.env` oluşturun. Üretimde yönetilen Redis'in TLS bağlantı adresini
(`rediss://...`) `REDIS_URL` olarak verin ve Redis portunu internete açmayın.

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
