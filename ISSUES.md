# StudyB issue backlog

Source: [GitHub issues](https://github.com/denizsensivas/studyb/issues)

Last synchronized: 2026-09-09

## Open issues

- [ ] [#3 — mail doğrulama](https://github.com/denizsensivas/studyb/issues/3)
  - Mail doğrulama ile hesap açma gereksin. Mail doğrulanmadan servislerden cevap dönmesin.
- [ ] [#4 — konu dağılımı grafiği](https://github.com/denizsensivas/studyb/issues/4)
  - Konu dağılımı grafiğine tıklayınca kayma sorunu düzeltilsin.
- [ ] [#5 — throttler](https://github.com/denizsensivas/studyb/issues/5)
  - Sitedeki bütün endpointler için throttler eklensin.
- [ ] [#6 — redis implemente et](https://github.com/denizsensivas/studyb/issues/6)
  - Redis implemente et.
- [ ] [#7 — streak](https://github.com/denizsensivas/studyb/issues/7)
  - Streak sayısı artmıyor, sadece soru sayısı girince artıyor; düzelt.
- [ ] [#8 — uploading documents](https://github.com/denizsensivas/studyb/issues/8)
  - Dosya yükleme işi olsun, yapay zeka ile not özeti vb.

## Completed locally

- [x] [#2 — Soru Sayısı Sıralama](https://github.com/denizsensivas/studyb/issues/2)
  - Sıralamalar sekmesinde soru sayısı kaldırılsın.
  - Removed the question-count sort and table column; daily streak is now the default ranking.
  - Verified in the browser on mobile and desktop layouts.
- [x] [#1 — Scroll sorunu](https://github.com/denizsensivas/studyb/issues/1)
  - Farklı başlıklara geçince ekran en baştan başlasın.
  - Implemented with a centralized route-change scroll reset.
  - Verified in the browser on mobile and desktop layouts, including the real PostgreSQL-backed API.
