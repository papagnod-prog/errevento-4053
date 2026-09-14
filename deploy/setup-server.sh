#!/usr/bin/env bash
# ============================================================================
#  Errevento — prima installazione sul server Plesk
#
#      DOMAIN=nuovo.errevento.it bash setup-server.sh
#
#  Cosa fa (idempotente, si può rilanciare):
#   1. verifica Bun
#   2. clona il repository in /var/www/vhosts/errevento.it/app (chiave deploy)
#   3. prepara cartelle dati/immagini/backup
#   4. installa le dipendenze e compila
#   5. crea il servizio systemd sulla porta PORT
#   6. configura nginx come reverse proxy per il dominio indicato
#   7. imposta il backup notturno del database
#   8. installa il comando errevento-deploy
# ============================================================================
set -euo pipefail

VHOST_DOMAIN="errevento.it"          # dominio proprietario della cartella
DOMAIN="${DOMAIN:-errevento.it}"     # dominio/sottodominio da servire
REPO="${REPO:-git@github.com:papagnod-prog/errevento-4053.git}"
BRANCH="${BRANCH:-main}"
SERVICE="errevento"
PORT="${PORT:-4210}"

VHOST="/var/www/vhosts/${VHOST_DOMAIN}"
APP="${VHOST}/app"
DATA="${VHOST}/data"
MEDIA="${VHOST}/media"
BACKUP="${VHOST}/backup"
KEY="${VHOST}/.ssh/github_${SERVICE}"

c_ok()  { printf "\033[32m  OK\033[0m  %s\n" "$*"; }
c_err() { printf "\033[31m  KO\033[0m  %s\n" "$*"; }
step()  { printf "\n\033[1m== %s\033[0m\n" "$*"; }

[[ $EUID -eq 0 ]] || { c_err "Va lanciato come root"; exit 1; }
[[ -d "$VHOST" ]] || { c_err "Non trovo ${VHOST}"; exit 1; }

git config --global --add safe.directory "$APP" >/dev/null 2>&1 || true
DOM_USER="$(stat -c %U "${VHOST}/httpdocs")"
DOM_GROUP="$(stat -c %G "${VHOST}/httpdocs")"
run_as_user() {
  runuser -u "$DOM_USER" -- env PATH="/usr/local/bin:/opt/bun/bin:/usr/bin:/bin" \
    HOME="$VHOST" bash -lc "$1"
}

# ---------------------------------------------------------------------------
step "1. Bun"
# ---------------------------------------------------------------------------
BUN="$(command -v bun || true)"
[[ -n "$BUN" ]] || { c_err "Bun non installato: curl -fsSL https://bun.sh/install | bash"; exit 1; }
c_ok "$BUN $("$BUN" --version)"

# ---------------------------------------------------------------------------
step "2. Chiave di deploy e codice"
# ---------------------------------------------------------------------------
mkdir -p "${VHOST}/.ssh"
if [[ ! -f "$KEY" ]]; then
  ssh-keygen -q -t ed25519 -N "" -f "$KEY" -C "errevento-deploy@$(hostname)"
  chown "${DOM_USER}:${DOM_GROUP}" "$KEY" "${KEY}.pub"
  chmod 600 "$KEY"
  echo
  echo "  Aggiungi questa chiave su GitHub → repository → Settings → Deploy keys"
  echo "  (senza spuntare 'Allow write access'):"
  echo
  cat "${KEY}.pub"
  echo
  echo "  Poi rilancia questo script."
  exit 0
fi
c_ok "chiave presente: $KEY"

export GIT_SSH_COMMAND="ssh -i ${KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
if [[ -d "${APP}/.git" ]]; then
  git -C "$APP" fetch --quiet origin "$BRANCH"
  git -C "$APP" reset --hard --quiet "origin/${BRANCH}"
  c_ok "codice aggiornato: $(git -C "$APP" log --oneline -1)"
else
  git clone --quiet --branch "$BRANCH" "$REPO" "$APP"
  c_ok "codice clonato: $(git -C "$APP" log --oneline -1)"
fi

# ---------------------------------------------------------------------------
step "3. Cartelle dati, immagini e backup"
# ---------------------------------------------------------------------------
mkdir -p "$DATA" "$MEDIA" "$BACKUP"
chown -R "${DOM_USER}:${DOM_GROUP}" "$DATA" "$MEDIA" "$BACKUP" "$APP"
c_ok "database in ${DATA}, immagini in ${MEDIA}, backup in ${BACKUP}"

if [[ ! -f "${APP}/.env" && -f "${VHOST}/errevento.env" ]]; then
  mv "${VHOST}/errevento.env" "${APP}/.env"
  c_ok "configurazione spostata in ${APP}/.env"
fi
if [[ ! -f "${APP}/.env" ]]; then
  c_err "manca ${APP}/.env — caricalo in ${VHOST}/errevento.env oppure in ${APP}/.env"
  exit 1
fi
chmod 600 "${APP}/.env"
chown "${DOM_USER}:${DOM_GROUP}" "${APP}/.env"
grep -q "^DATABASE_URL=file:${DATA}/errevento.db$" "${APP}/.env" \
  || c_err "attenzione: in .env DATABASE_URL dovrebbe essere file:${DATA}/errevento.db"

# ---------------------------------------------------------------------------
step "4. Dipendenze, database e compilazione"
# ---------------------------------------------------------------------------
run_as_user "cd '${APP}' && bun install --frozen-lockfile" && c_ok "dipendenze ok"
run_as_user "cd '${APP}/packages/web' && bun run db:push" && c_ok "struttura database ok"
run_as_user "cd '${APP}' && bun run build" && c_ok "compilazione ok"
git -C "$APP" rev-parse HEAD | awk -v b="$BRANCH" -v d="$(date -Is)" \
  '{printf "{\"commit\":\"%s\",\"branch\":\"%s\",\"date\":\"%s\"}\n", $1, b, d}' \
  > "${APP}/.build-info.json"
chown "${DOM_USER}:${DOM_GROUP}" "${APP}/.build-info.json"

# ---------------------------------------------------------------------------
step "5. Servizio systemd"
# ---------------------------------------------------------------------------
cat > "/etc/systemd/system/${SERVICE}.service" <<UNIT
[Unit]
Description=Errevento — catalogo articoli per cerimonie
After=network.target

[Service]
Type=simple
User=${DOM_USER}
Group=${DOM_GROUP}
WorkingDirectory=${APP}
Environment=PATH=/usr/local/bin:/opt/bun/bin:/usr/bin:/bin
Environment=HOME=${VHOST}
Environment=PORT=${PORT}
EnvironmentFile=${APP}/.env
ExecStart=${BUN} --env-file=${APP}/.env ${APP}/packages/web/src/__server.ts
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --quiet "$SERVICE"
systemctl restart "$SERVICE"
sleep 4
systemctl is-active --quiet "$SERVICE" \
  && c_ok "servizio attivo sulla porta ${PORT}" \
  || { c_err "servizio non partito:"; journalctl -u "$SERVICE" -n 30 --no-pager; exit 1; }

# ---------------------------------------------------------------------------
step "6. nginx (reverse proxy per ${DOMAIN})"
# ---------------------------------------------------------------------------
NGINX_DIR="/var/www/vhosts/system/${DOMAIN}/conf"
mkdir -p "$NGINX_DIR"
cat > "${NGINX_DIR}/vhost_nginx.conf" <<NGINX
location ~ ^/(.*)\$ {
	proxy_pass http://127.0.0.1:${PORT};
	proxy_http_version 1.1;
	proxy_set_header Upgrade \$http_upgrade;
	proxy_set_header Connection 'upgrade';
	proxy_set_header Host \$host;
	proxy_cache_bypass \$http_upgrade;
	proxy_set_header X-Real-IP \$remote_addr;
	proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto \$scheme;
	client_max_body_size 20m;
}
NGINX
if plesk sbin httpdmng --reconfigure-domain "$DOMAIN"; then
  c_ok "nginx configurato per ${DOMAIN}"
else
  c_err "riconfigurazione nginx non riuscita — controlla il nome del dominio"
fi

# ---------------------------------------------------------------------------
step "7. Backup notturno del database (03:10, conserva 30 giorni)"
# ---------------------------------------------------------------------------
cat > "/usr/local/bin/${SERVICE}-backup" <<BK
#!/usr/bin/env bash
set -euo pipefail
OUT="${BACKUP}/errevento-\$(date +%F).db"
rm -f "\$OUT"
${BUN} ${APP}/deploy/backup.ts ${DATA}/errevento.db "\$OUT" >/dev/null
find ${BACKUP} -name 'errevento-*.db' -mtime +30 -delete
BK
chmod 755 "/usr/local/bin/${SERVICE}-backup"

cat > "/etc/cron.d/${SERVICE}-backup" <<CRON
# copia di sicurezza del database ogni notte alle 03:10, conserva 30 giorni
10 3 * * * root /usr/local/bin/${SERVICE}-backup >/dev/null 2>&1
CRON
chmod 644 "/etc/cron.d/${SERVICE}-backup"
c_ok "backup impostato"

# ---------------------------------------------------------------------------
step "8. Comando errevento-deploy"
# ---------------------------------------------------------------------------
install -m 755 "${APP}/deploy/update.sh" "/usr/local/bin/${SERVICE}-deploy"
cat > "/etc/sudoers.d/${SERVICE}" <<SUDO
${DOM_USER} ALL=(root) NOPASSWD: /usr/local/bin/${SERVICE}-deploy
SUDO
chmod 440 "/etc/sudoers.d/${SERVICE}"
visudo -cf "/etc/sudoers.d/${SERVICE}" >/dev/null && c_ok "errevento-deploy installato"

CODE="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/" || true)"
printf "\n\033[1;32mInstallazione completata.\033[0m  locale HTTP %s → https://%s\n\n" "$CODE" "$DOMAIN"
