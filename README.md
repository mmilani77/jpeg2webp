# JPG → WebP (PWA)

Converte foto JPG in WebP interamente nel browser. Nessun upload; EXIF/GPS/profili scartati
(la rotazione EXIF viene prima applicata ai pixel). Funziona offline dopo la prima apertura.

Funzioni: qualità regolabile, ridimensionamento opzionale del lato lungo, più file insieme,
download singolo o .zip, "Condividi" su mobile (per salvare in galleria), "Apri con…" su desktop
quando installata.

## Pubblicare
Serve HTTPS (o localhost) perché il service worker si registri. Basta servire la cartella così com'è:

- locale: `npx serve .` oppure `python3 -m http.server 8080`
- GitHub Pages / Firebase Hosting / Cloudflare Pages / un bucket GCS dietro HTTPS

Poi apri l'URL e usa "Installa app" (Chrome/Edge) o "Aggiungi a Home" (Safari).
Se modifichi i file, incrementa `CACHE` in `sw.js` per forzare l'aggiornamento.
