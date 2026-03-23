# Agent Skills

Bu klasöre agent skill tanımlarınızı ekleyebilirsiniz.

## Yapı

Her skill kendi klasöründe bulunmalı ve bir `SKILL.md` dosyası içermelidir:

```
skills/
├── skill-adi/
│   ├── SKILL.md          # Ana talimat dosyası (zorunlu)
│   ├── scripts/          # Yardımcı scriptler (opsiyonel)
│   ├── examples/         # Örnek implementasyonlar (opsiyonel)
│   └── resources/        # Ek kaynaklar (opsiyonel)
```

## SKILL.md Formatı

```markdown
---
name: "Skill Adı"
description: "Skill'in kısa açıklaması"
---

Detaylı talimatlar buraya yazılır...
```
