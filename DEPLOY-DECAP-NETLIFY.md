# Beslenme Docenti Netlify + Decap CMS Kurulumu

Bu proje statik HTML/CSS/JS sitedir. `beslenmedocenti.com.tr` domaini icin ekstra web hosting paketi satin almaya gerek yoktur. Site Netlify'da barinir, domain DNS ayarlari Netlify'a yonlendirilir.

## Yapilan hazirlik

- `admin/index.html`: Decap CMS admin paneli.
- `admin/config.yml`: Admin panelden duzenlenecek alanlar.
- `data/settings.json`: Takvim, linkler ve "Yakinda" kutularinin canli verisi.
- `netlify.toml`: Netlify yayin ayari.

Admin panel adresi yayindan sonra:

```text
https://beslenmedocenti.com.tr/admin/
```

## 1. Projeyi GitHub'a yukle

Netlify + Decap CMS'in calismasi icin dosyalarin GitHub reposunda olmasi gerekir. Cunku admin panelden yapilan degisiklikler `data/settings.json` dosyasina commit olarak islenir ve Netlify siteyi yeniden yayinlar.

Yuklenecek klasor:

```text
C:\Users\Admin\OneDrive\Belgeler\New project\bd
```

Repo onerisi:

```text
beslenmedocenti-site
```

## 2. Netlify'a bagla

Netlify panelinde:

1. `Add new project` / `Add new site` sec.
2. `Import an existing project` sec.
3. GitHub reposunu bagla.
4. Build command bos kalsin.
5. Publish directory:

```text
.
```

Deploy bittikten sonra Netlify gecici bir adres verir:

```text
ornek-site-adi.netlify.app
```

## 3. Admin paneli aktif et

Netlify site panelinde:

1. `Identity` ozelligini etkinlestir.
2. Registration ayarini `Invite only` yap.
3. `Services` > `Git Gateway` bolumunu etkinlestir.
4. Site sahibinin e-posta adresini Identity kullanicisi olarak davet et.

Bu islemden sonra site sahibi su adrese girerek kod bilmeden duzenleme yapabilir:

```text
https://beslenmedocenti.com.tr/admin/
```

Admin panelden duzenlenebilenler:

- Takvim ayi, gunleri ve notlari
- Instagram, Spotify, atelye, kitap ve gonderi linkleri
- "Yakinda" bolumundeki kutu basliklari ve aciklamalari
- Iletisim e-postasi

## 4. Domaini Netlify'a bagla

Netlify site panelinde:

1. `Domain management` bolumune git.
2. `Add a domain you already own` sec.
3. Domaini ekle:

```text
beslenmedocenti.com.tr
```

Sonra Turkticaret DNS panelinde Netlify'in gosterdigi kayitlari gir.

Genel external DNS mantigi:

```text
@ / root / beslenmedocenti.com.tr  ALIAS/ANAME/CNAME flattening  apex-loadbalancer.netlify.com
www                               CNAME                          Netlify'in verdigi site-adresi.netlify.app
```

Turkticaret root domain icin ALIAS/ANAME veya CNAME flattening desteklemiyorsa root domain icin A kaydi kullan:

```text
@ / root / beslenmedocenti.com.tr  A  75.2.60.5
```

Netlify panelinde farkli bir deger yazarsa Netlify panelindeki degeri esas al.

## 5. SSL / HTTPS

DNS yayildiktan sonra Netlify otomatik SSL sertifikasi kurar. Bu islem bazen hemen, bazen de DNS yayilimina bagli olarak birkac saat icinde tamamlanir.

Kontrol edilecek adresler:

```text
https://beslenmedocenti.com.tr
https://www.beslenmedocenti.com.tr
https://beslenmedocenti.com.tr/admin/
```

## Not

Turkticaret'ten web hosting paketi alinmayacak. Sadece domain alinmis olmasi yeterli. Hosting gorevini Netlify yapacak.
