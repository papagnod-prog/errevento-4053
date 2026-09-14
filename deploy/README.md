# Errevento sul server del cliente

Il sito gira sul server Plesk di casa (lo stesso di usdcoratocalcio.it), senza
dipendere da servizi esterni: database in un file, immagini su disco.

| Cosa | Dove |
| --- | --- |
| Codice | `/var/www/vhosts/errevento.it/app` (clone di `papagnod-prog/errevento-4053`) |
| Database | `/var/www/vhosts/errevento.it/data/errevento.db` (SQLite) |
| Immagini caricate dal pannello | `/var/www/vhosts/errevento.it/media` |
| Copie di sicurezza | `/var/www/vhosts/errevento.it/backup` (ogni notte 03:10, 30 giorni) |
| Configurazione | `/var/www/vhosts/errevento.it/app/.env` |
| Servizio | `systemctl status errevento` (porta interna 4210) |
| Dominio di collaudo | https://nuovo.errevento.it |

## Aggiornare il sito

Dopo ogni modifica pubblicata su GitHub, sul server:

    errevento-deploy

Lo script salva una copia del database, aggiorna il codice, ricompila, riavvia e
verifica che il sito risponda e legga il catalogo. Se qualcosa va storto torna
indietro da solo. Per tornare alla versione precedente a mano:

    errevento-deploy --rollback

## Prima installazione (già fatta)

    DOMAIN=nuovo.errevento.it bash deploy/setup-server.sh

Prepara cartelle, servizio systemd, reverse proxy nginx, backup notturno e il
comando `errevento-deploy`. È ripetibile senza danni.

## Bot Telegram (gestione del catalogo)

Il catalogo si modifica scrivendo al bot su Telegram: prezzi, nuovi articoli,
foto, eliminazioni. Il bot chiede sempre conferma prima di salvare.
Sul bot arrivano anche le richieste di informazioni inviate dal sito.

Configurazione nel `.env`:

    TELEGRAM_BOT_TOKEN=            # token dato da @BotFather
    TELEGRAM_ADMIN_CHAT_IDS=       # id delle chat autorizzate, separati da virgola
    TELEGRAM_WEBHOOK_SECRET=       # stringa casuale, protegge /api/telegram

Dopo aver messo le tre voci nel `.env` e riavviato il servizio, si collega il
bot al sito una volta sola:

    cd /var/www/vhosts/errevento.it/app
    bun --env-file=.env deploy/telegram-webhook.ts

    bun --env-file=.env deploy/telegram-webhook.ts --stato     # verifica
    bun --env-file=.env deploy/telegram-webhook.ts --rimuovi   # scollega

Va rifatto solo se cambia il dominio (`WEBSITE_URL`) o il token del bot.
Per sapere l'id di una chat: scrivere `/id` al bot.

I clienti restano su WhatsApp: i pulsanti del sito aprono `wa.me` col numero
impostato nel pannello (Impostazioni), che non ha niente a che vedere col bot.

## Copie di sicurezza

Manuale, in qualsiasi momento:

    errevento-backup

Ripristino: fermare il servizio, sostituire il file del database, riavviare.

    systemctl stop errevento
    cp /var/www/vhosts/errevento.it/backup/errevento-2026-09-14.db \
       /var/www/vhosts/errevento.it/data/errevento.db
    chown errevento.it_5r61mzs7wbp:psacln /var/www/vhosts/errevento.it/data/errevento.db
    systemctl start errevento

## Password del pannello dimenticata

Normalmente la password si cambia dal pannello, in **Utenti**. Se nessuno
riesce più a entrare, dal server:

    cd /var/www/vhosts/errevento.it/app/packages/web
    bun run db:reset-password info@errevento.it

Stampa a schermo una password nuova. Per deciderla invece a mano:

    bun run db:reset-password info@errevento.it 'PasswordNuova'

Le sessioni aperte vengono chiuse: chi era dentro deve rientrare.

## Portare i dati da un altro ambiente

    bun --env-file=.env deploy/db-export.ts /percorso/errevento.db

Copia struttura e contenuto del database remoto in un unico file SQLite.

## Configurazione (`.env`)

Le voci che riguardano il server del cliente:

    DATABASE_URL=file:/var/www/vhosts/errevento.it/data/errevento.db
    DATABASE_AUTH_TOKEN=
    MEDIA_DIR=/var/www/vhosts/errevento.it/media
    PORT=4210
    WEBSITE_URL=https://nuovo.errevento.it
    TELEGRAM_BOT_TOKEN=
    TELEGRAM_ADMIN_CHAT_IDS=
    TELEGRAM_WEBHOOK_SECRET=

`MEDIA_DIR` vuota riporta le immagini sullo storage remoto: serve solo
nell'ambiente di sviluppo.

Quando si passa al dominio definitivo va aggiornato `WEBSITE_URL` (serve agli
accessi del pannello) e va rifatto il reverse proxy per `errevento.it`:

    DOMAIN=errevento.it bash deploy/setup-server.sh
