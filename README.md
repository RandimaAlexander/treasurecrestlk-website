# Treasure Crest Villa & Cottage — website (Vercel version)

Plain HTML/CSS/JS, no build step.

```
index.html, css/, js/, img/, fonts/   the website
api/availability.js  reads the iCal links and returns booked nights → /api/availability
vercel.json          tells Vercel: no build, cache images
```

## Deploy (GitHub Desktop + existing Vercel project)
1. **Keep the old design:** in GitHub Desktop open `villa_gallee` → Current branch → **New branch** `old-design` (based on `main`) → **Publish branch**.
2. Switch back to **main**. Delete everything in the folder **except the `.git` folder**.
3. Copy in the contents of this folder (`public`, `api`, `vercel.json`, `README.md`).
4. Commit "New Treasure Crest website" → **Push origin**. Vercel deploys automatically in ~1 minute.
5. In Vercel → Project → Settings → **Build & Development**: Framework Preset = **Other**
   (vercel.json already overrides this, but setting it avoids confusion).

The old design stays safe on the `old-design` branch. To roll back, merge it back into `main`.

## Domain
Vercel → Project → Settings → Domains → add `treasurecrestlk.com` and `www.treasurecrestlk.com`,
then set the DNS records Vercel shows at the domain registrar.

## Live calendar (iCal sync)
Vercel → Project → Settings → **Environment Variables**:
- `VILLA_ICAL` = the villa's iCal links (Booking.com, Airbnb, Agoda, Google "Villa – Direct"), comma separated
- `COTTAGE_ICAL` = the same for the cottage
Then **Deployments → Redeploy**. Booked nights then show crossed out in the calendar.

## Booking requests
WhatsApp: 070 539 9111 (edit `whatsapp` in `js/main.js`).
Email copy: treasurecrestgalle@gmail.com via FormSubmit — **the first request sends an activation email; click "Activate"**.

## Prices
Edit `rate` values in `js/main.js` (CONFIG → stays) and the prices in `index.html`.

## Note on Vercel's free plan
Vercel's free "Hobby" plan is meant for non-commercial use. A booking site for a business should
be on Vercel Pro, or use Cloudflare Pages (free for commercial use). The site works the same on both.
