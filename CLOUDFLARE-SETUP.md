# Cloudflare Worker Setup - Webflow Stories

Kompletno uputstvo za postavljanje Cloudflare Worker-a kao API proxy za Webflow stories.

---

## Korak 1: Kreiraj Cloudflare Worker

1. **Idi na** https://dash.cloudflare.com
2. **Klikni na** "Workers & Pages" u levom meniju
3. **Klikni** "Create" → "Create Worker"
4. **Ime Worker-a**: `webflow-stories-api` (ili bilo koje ime)
5. **Klikni** "Deploy" (da ga prvi put kreira)

---

## Korak 2: Dodaj kod

1. **U Worker Editor-u**, klikni "Edit Code"
2. **Obriši** sve što već postoji
3. **Kopiraj** ceo sadržaj iz fajla `cloudflare-worker.js`
4. **Pronađi liniju**:
   ```javascript
   const WEBFLOW_API_TOKEN = 'YOUR_WEBFLOW_API_TOKEN';
   ```
5. **Zameni** `YOUR_WEBFLOW_API_TOKEN` sa tvojim **pravim Webflow API tokenom**

### Kako da dobiješ Webflow API token:

1. Idi na https://webflow.com/dashboard/account/apps
2. Klikni "Generate API Token"
3. Kopiraj token (čuvaćeš ga samo ovde u Worker-u, bezbedno je)

6. **Klikni** "Save and Deploy"

---

## Korak 3: Kopiraj Worker URL

Nakon deploy-a, Cloudflare će ti dati URL:

```
https://webflow-stories-api.TVOJ-SUBDOMAIN.workers.dev
```

**Kopiraj ovaj URL** - trebaće ti za Webflow custom kod!

---

## Korak 4: Testiraj Worker

Otvori u browseru:

```
https://webflow-stories-api.TVOJ-SUBDOMAIN.workers.dev?limit=3
```

Trebao bi da vidiš JSON sa stories:

```json
{
  "items": [
    {
      "id": "...",
      "fieldData": {
        "name": "Story name",
        "image": {...}
      }
    }
  ],
  "total": 45,
  "offset": 0,
  "limit": 3
}
```

Ako vidiš ovo - **RADI!** 🎉

Ako dobijaš grešku, proveri:
- Da li si zamenio API token?
- Da li je token validan?
- Proveri Console logs u Cloudflare Worker dashboardu

---

## Korak 5: Kreiraj stranicu u Webflow-u

1. **Otvori Webflow Designer** za petite-geneve.webflow.io
2. **Kreiraj novu stranicu**:
   - Page name: "Stories" ili "Our Stories"
   - Slug: `/rs-en/stories`

3. **Dizajniraj stranicu**:

   **a) Dodaj Container/Section za stories:**
   ```html
   <div id="stories-container" class="stories__list"></div>
   ```

   **VAŽNO**: Div MORA imati `id="stories-container"`

   **b) Dodaj Load More button:**
   ```html
   <button id="load-more-btn" class="button">Load More Stories</button>
   ```

   **VAŽNO**: Button MORA imati `id="load-more-btn"`

---

## Korak 6: Dodaj Custom CSS

U **Page Settings > Custom Code > Head Code**, dodaj stilove iz `app/webflow-styles.css`.

Ili koristi minimalni CSS:

```html
<style>
.stories__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.s__list-item {
  position: relative;
}

.stories__link {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
}

.stories__link:hover {
  transform: translateY(-5px);
}

.stories__imagewrap {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  margin-bottom: 1rem;
}

.stories__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stories-loading,
.stories-empty-state {
  text-align: center;
  padding: 3rem;
}

#load-more-btn.is-loading {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

---

## Korak 7: Dodaj Custom JavaScript

1. **Otvori** fajl `webflow-custom-code.js`
2. **Pronađi liniju**:
   ```javascript
   const API_BASE_URL = 'https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev';
   ```
3. **Zameni** sa tvojim pravim Worker URL-om iz Koraka 3
4. **Kopiraj CEO kod**
5. **U Webflow-u**: Page Settings > Custom Code > **Before </body>**
6. **Paste** kod

---

## Korak 8: Publish i testiranje

1. **Publish** stranicu u Webflow-u
2. **Otvori** https://petite-geneve.webflow.io/rs-en/stories
3. **Proveri**:
   - ✅ Stories se učitavaju automatski
   - ✅ Load More dugme radi
   - ✅ Navigation i footer su prisutni (automatski iz Webflow-a)
   - ✅ data-i18n prevodi rade
   - ✅ Analytics trackuje (automatski)

---

## Troubleshooting

### Stories se ne učitavaju

1. Otvori **Browser Console** (F12)
2. Proveri greške
3. Testiraj Worker URL direktno u browseru
4. Proveri da li div ima tačan ID: `stories-container`

### CORS greška

Worker već ima CORS headers. Ako i dalje dobijaš grešku:
- Proveri da li pozivas pravi Worker URL
- Proveri da li Worker kod ima `Access-Control-Allow-Origin: '*'`

### API token ne radi

1. Idi na Webflow Dashboard → Account Settings → Apps
2. Proveri da li token ima pristup tvojim kolekcijama
3. Generiši novi token ako treba

---

## Performance optimizacija

Worker automatski cachuje responses na 5 minuta. Ako želiš duže caching:

U `cloudflare-worker.js`, promeni:

```javascript
'Cache-Control': 'public, max-age=600, s-maxage=600', // 10 minutes
```

---

## Šta smo postigli?

✅ **Webflow stranica** - dizajn, navigation, footer, analytics
✅ **Brze performanse** - API caching, optimizovano
✅ **Sigurnost** - API token je server-side
✅ **Besplatno** - Cloudflare Worker free tier (100k req/dan)
✅ **Jednostavno održavanje** - Designer može menjati UI
✅ **Fleksibilnost** - JavaScript kontroliše logiku

---

## Gotovo!

Imaš sve što ti treba:
- ✅ Cloudflare Worker API proxy
- ✅ Webflow stranica sa custom JavaScript
- ✅ Load more, sorting, filtering mogućnosti
- ✅ Potpuna integracija sa Webflow design sistemom

Uživaj! 🎉
