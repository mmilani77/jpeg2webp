# img2webp

Converte immagini JPG e PNG in WebP interamente nel browser. Nessun upload; EXIF/GPS/profili scartati
(la rotazione EXIF viene prima applicata ai pixel). Le PNG mantengono la trasparenza. Funziona offline dopo la prima apertura.

Codifica con libwebp in WebAssembly (`vendor/webp`, Apache-2.0) in un worker, metodo 6:
file più leggeri a parità di qualità, conversione più lenta. Ogni file viene poi ricostruito
tenendo solo i dati immagine (via ICC, EXIF, XMP, C2PA e qualsiasi altro chunk). Se il worker
non parte si usa l'encoder del browser, con la stessa ripulitura.

Funzioni: qualità regolabile, modalità lossless opzionale per grafiche e screenshot, ridimensionamento opzionale del lato lungo, più file insieme,
download singolo o .zip, "Condividi" su mobile (per salvare in galleria), "Apri con…" su desktop
quando installata.

## Pubblicare
Serve HTTPS (o localhost) perché il service worker si registri. Basta servire la cartella così com'è:

- locale: `npx serve .` oppure `python3 -m http.server 8080`
- GitHub Pages / Firebase Hosting / Cloudflare Pages / un bucket GCS dietro HTTPS

Poi apri l'URL e usa "Installa app" (Chrome/Edge) o "Aggiungi a Home" (Safari).
Se modifichi i file, incrementa `CACHE` in `sw.js` per forzare l'aggiornamento.
