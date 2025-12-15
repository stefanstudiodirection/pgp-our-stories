# Webflow Stories Integration Guide

Ovo uputstvo pokazuje kako da integriš dinamički stories sa Webflow API-jem koristeći **hybrid pristup**:
- **Next.js** (Webflow Cloud) = API Proxy
- **Webflow stranica** = UI + Custom JavaScript

## Arhitektura

```
Webflow Stranica (/rs-en/stories)
    ↓ (JavaScript fetch)
Next.js API Route (/api/stories)
    ↓ (Server-side with API token)
Webflow CMS API
```

---

## Korak 1: Deploy Next.js na Webflow Cloud

✅ **Već urađeno!** Next.js app je deployovan na:
- **URL**: `https://petite-geneve.webflow.io/rs-en/stories`
- **API endpoint**: `https://petite-geneve.webflow.io/rs-en/stories/api/stories`

### Provera da li API radi:

Otvori u browseru:
```
https://petite-geneve.webflow.io/rs-en/stories/api/stories?all=true&limit=5
```

Trebao bi da dobiješ JSON sa stories.

---

## Korak 2: Kreiraj stranicu u Webflow Designer-u

1. **Otvori Webflow Designer** za petite-geneve.webflow.io
2. **Kreiraj novu stranicu**:
   - Ime: "Stories" ili "Our Stories"
   - Slug: `/rs-en/stories`
   - **VAŽNO**: Ova stranica će ZAMENITI Next.js app na istom path-u

3. **Dizajniraj stranicu**:
   - Dodaj header/navigation (automatski se dodaje)
   - Dodaj hero sekciju ili naslov
   - **Dodaj prazan div** za stories:
     ```html
     <div id="stories-container" class="stories__list"></div>
     ```
   - **Dodaj Load More button**:
     ```html
     <button id="load-more-btn" class="button">Load More Stories</button>
     ```
   - Dodaj footer (automatski se dodaje)

---

## Korak 3: Dodaj Custom Code

### 3a. Kopiraj CSS stilove

U **Page Settings > Custom Code > Head Code**, dodaj:

```html
<style>
/* Copy entire content from app/webflow-styles.css */
.stories__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.s__list-item {
  /* Add your story card styles */
}

/* ... rest of your styles ... */
</style>
```

### 3b. Dodaj JavaScript

U **Page Settings > Custom Code > Before </body>**, dodaj:

```html
<script>
// Copy entire content from webflow-custom-code.js file
</script>
```

**ILI** još bolje - hostuj JavaScript fajl:

```html
<script src="https://petite-geneve.webflow.io/rs-en/stories/webflow-custom-code.js"></script>
```

---

## Korak 4: Testiranje

1. **Publish** Webflow stranicu
2. **Otvori** `https://petite-geneve.webflow.io/rs-en/stories`
3. **Proveri**:
   - ✅ Navigation i footer se učitavaju (automatski iz Webflow-a)
   - ✅ Stories se prikazuju dinamički
   - ✅ Load More dugme radi
   - ✅ data-i18n translations rade
   - ✅ Analytics trackuju (automatski)

---

## API Endpoints

### Fetch sve stories (iz svih kolekcija)

```javascript
fetch('https://petite-geneve.webflow.io/rs-en/stories/api/stories?all=true&offset=0&limit=12')
```

**Response:**
```json
{
  "items": [...],
  "total": 45,
  "offset": 0,
  "limit": 12
}
```

### Fetch iz pojedinačne kolekcije

```javascript
fetch('https://petite-geneve.webflow.io/rs-en/stories/api/stories?collection=messika&limit=10')
```

**Dostupne kolekcije:**
- `our-stories`
- `messika`
- `roberto-coin`
- `timepieces`
- `rolex`

---

## Prednosti ovog pristupa

✅ **Navigation/Footer** - Automatski iz Webflow-a
✅ **Global Scripts** - Analytics, tracking, sve automatski
✅ **data-i18n** - Radi bez problema
✅ **Performance** - API rute cachuju podatke (5min cache)
✅ **Sigurnost** - API token je server-side
✅ **Designer friendly** - Designer može da menja stranicu u Webflow-u
✅ **Developer friendly** - JavaScript kontroliše logiku

---

## Troubleshooting

### Stories se ne učitavaju

1. Proveri browser console za greške
2. Proveri da li API endpoint radi (otvori URL direktno)
3. Proveri da li `stories-container` div postoji

### Load More ne radi

1. Proveri da li button ima ID `load-more-btn`
2. Proveri console za JavaScript greške

### Stilovi nisu dobri

1. Proveri da li si kopirao sve CSS iz `app/webflow-styles.css`
2. Proveri da li Webflow class names odgovaraju

---

## Održavanje

### Dodavanje novih kolekcija

U `app/api/stories/route.ts`, dodaj novi collection ID:

```typescript
const COLLECTIONS = {
  'our-stories': '674e5da2ab9e88cfe8f7e5e1',
  'new-collection': 'NOVI_COLLECTION_ID_OVDE',
};
```

Commit i push promene.

### Promena cache vremena

U `app/api/stories/route.ts`, promeni:

```typescript
next: { revalidate: 300 }, // 300 seconds = 5 minutes
```

---

## Sledeći koraci

Kada budeš spreman da ukloniš Next.js app potpuno (ako želiš):

1. Obriši `/rs-en/stories` mount path iz Webflow Cloud environment-a
2. API će i dalje raditi na drugom path-u
3. Update API_BASE_URL u JavaScript kodu

Za sada, možeš imati OBA pristupa live - Next.js app radi kao fallback.
