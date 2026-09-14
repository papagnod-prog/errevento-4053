#!/usr/bin/env bash
# ============================================================================
#  Errevento — aggiornamento del sito
#  Installato dal setup come:  errevento-deploy
#
#      errevento-deploy              aggiorna all'ultima versione su GitHub
#      errevento-deploy --rollback   torna alla versione precedente
#      FORCE=1 errevento-deploy      ricompila anche se non ci sono novità
#
#  Scarica il codice nuovo da GitHub, ricompila e riavvia.
#  Il database (prodotti, categorie, richieste, utenti, visite) e le immagini
#  caricate dal pannello NON vengono toccati: del database viene salvata una
#  copia di sicurezza prima di ogni aggiornamento.
# ============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-errevento.it}"
BRANCH="${BRANCH:-main}"
SERVICE="errevento"
PORT="${PORT:-4210}"

VHOST="/var/www/vhosts/${DOMAIN}"
APP="${VHOST}/app"
git config --global --add safe.directory "$APP" >/dev/null 2>&1 || true
KEY="${VHOST}/.ssh/github_${SERVICE}"
DB="${VHOST}/data/errevento.db"
BACKUP="${VHOST}/backup"

c_ok()  { printf "\033[32m  OK\033[0m  %s\n" "$*"; }
c_err() { printf "\033[31m  KO\033[0m  %s\n" "$*"; }
step()  { printf "\n\033[1m== %s\033[0m\n" "$*"; }

[[ $EUID -eq 0 ]] || { c_err "Va lanciato come root"; exit 1; }
[[ -d "${APP}/.git" ]] || { c_err "App non trovata in ${APP} — lancia prima setup-server.sh"; exit 1; }

DOM_USER="$(stat -c %U "${VHOST}/httpdocs")"
DOM_GROUP="$(stat -c %G "${VHOST}/httpdocs")"
export GIT_SSH_COMMAND="ssh -i ${KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
run_as_user() {
  runuser -u "$DOM_USER" -- env PATH="/usr/local/bin:/opt/bun/bin:/usr/bin:/bin" \
    HOME="$VHOST" bash -lc "$1"
}

# ---------------------------------------------------------------------------
step "1. Copia di sicurezza del database"
# ---------------------------------------------------------------------------
mkdir -p "$BACKUP"
if [[ -f "$DB" ]]; then
  STAMP="$(date +%Y%m%d-%H%M%S)"
  cp -a "$DB" "${BACKUP}/pre-deploy-${STAMP}.db"
  c_ok "salvato in ${BACKUP}/pre-deploy-${STAMP}.db"
else
  c_ok "nessun database ancora presente (prima installazione)"
fi

PREV="$(git -C "$APP" rev-parse HEAD)"
echo "$PREV" > "${VHOST}/.last-good-commit"

# ---------------------------------------------------------------------------
if [[ "${1:-}" == "--rollback" ]]; then
  step "ROLLBACK alla versione precedente"
  git -C "$APP" reset --hard --quiet "HEAD~1"
  c_ok "tornato a $(git -C "$APP" log --oneline -1)"
else
  step "2. Scarico il codice nuovo da GitHub"
  git -C "$APP" fetch --quiet origin "$BRANCH"
  BEFORE="$(git -C "$APP" rev-parse HEAD)"
  AFTER="$(git -C "$APP" rev-parse "origin/${BRANCH}")"
  if [[ "$BEFORE" == "$AFTER" ]]; then
    c_ok "già aggiornato ($(git -C "$APP" log --oneline -1))"
    if [[ "${FORCE:-0}" != "1" ]]; then
      echo; echo "  Niente da fare. Per ricompilare comunque: FORCE=1 errevento-deploy"; echo
      exit 0
    fi
  fi
  git -C "$APP" reset --hard --quiet "origin/${BRANCH}"
  c_ok "ora su $(git -C "$APP" log --oneline -1)"
fi

chown -R "${DOM_USER}:${DOM_GROUP}" "$APP"
chmod 600 "${APP}/.env" 2>/dev/null || true

# ---------------------------------------------------------------------------
#  Auto-aggiornamento: `errevento-deploy` è una copia di questo file in
#  /usr/local/bin, che il git pull non tocca. Se nel repo c'è una versione
#  diversa la installo e riparto, altrimenti resterebbe in uso quella vecchia.
# ---------------------------------------------------------------------------
SELF="$(readlink -f "$0")"
REPO_SCRIPT="${APP}/deploy/update.sh"
if [[ "${SELF_UPDATED:-0}" != "1" && -f "$REPO_SCRIPT" && "$SELF" != "$REPO_SCRIPT" ]] \
  && ! cmp -s "$REPO_SCRIPT" "$SELF"; then
  install -m 755 "$REPO_SCRIPT" "$SELF"
  c_ok "errevento-deploy aggiornato: riparto con la versione nuova"
  SELF_UPDATED=1 FORCE=1 exec "$SELF" "$@"
fi

# ---------------------------------------------------------------------------
step "3. Dipendenze"
# ---------------------------------------------------------------------------
run_as_user "cd '${APP}' && bun install --frozen-lockfile" && c_ok "ok"

# ---------------------------------------------------------------------------
step "4. Struttura del database (non cancella i dati)"
# ---------------------------------------------------------------------------
if run_as_user "cd '${APP}/packages/web' && bun run db:push --force"; then
  c_ok "ok"
else
  # Un push fallito lascia il sito senza le tabelle nuove: funziona a metà
  # senza dirlo a nessuno. Meglio fermarsi qui, col sito ancora in piedi
  # sulla versione precedente.
  c_err "la struttura del database non è stata aggiornata: mi fermo"
  c_err "il sito resta sulla versione precedente ($(git -C "$APP" log --oneline -1 "$PREV"))"
  git -C "$APP" reset --hard --quiet "$PREV"
  exit 1
fi

# ---------------------------------------------------------------------------
step "5. Compilazione"
# ---------------------------------------------------------------------------
stamp_build() {
  local sha; sha="$(git -C "$APP" rev-parse HEAD)"
  cat > "${APP}/.build-info.json" <<JSON
{"commit":"${sha}","branch":"${BRANCH}","date":"$(date -Is)"}
JSON
  chown "${DOM_USER}:${DOM_GROUP}" "${APP}/.build-info.json"
}

if ! run_as_user "cd '${APP}' && bun run build"; then
  c_err "build fallita: torno alla versione precedente e NON riavvio"
  git -C "$APP" reset --hard --quiet "$PREV"
  run_as_user "cd '${APP}' && bun install --frozen-lockfile && bun run build" || true
  stamp_build
  systemctl restart "$SERVICE"
  exit 1
fi
stamp_build
c_ok "ok"

# ---------------------------------------------------------------------------
step "6. Riavvio del sito"
# ---------------------------------------------------------------------------
systemctl restart "$SERVICE"
sleep 4
if ! systemctl is-active --quiet "$SERVICE"; then
  c_err "il servizio non riparte — log:"
  journalctl -u "$SERVICE" -n 30 --no-pager
  exit 1
fi
CODE="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/" || true)"
if [[ "$CODE" == "200" ]]; then
  c_ok "sito online (HTTP 200)"
else
  c_err "il sito risponde HTTP ${CODE}"
  journalctl -u "$SERVICE" -n 20 --no-pager
  exit 1
fi

# HTTP 200 non basta: la home si apre anche con il database irraggiungibile.
# Questa chiamata legge davvero i dati, così un deploy rotto non passa per buono.
API="$(curl -s -m 20 -X POST "http://127.0.0.1:${PORT}/api/rpc/catalog/categories" \
  -H 'content-type: application/json' -d '{"json":{}}' || true)"
if grep -q 'INTERNAL_SERVER_ERROR' <<<"$API" || [[ -z "$API" ]]; then
  c_err "il sito non riesce a leggere il database"
  c_err "in .env DATABASE_URL deve essere un percorso ASSOLUTO: file:${DB}"
  journalctl -u "$SERVICE" -n 20 --no-pager
  exit 1
fi
c_ok "il sito legge il catalogo dal database"

find "$BACKUP" -name 'pre-deploy-*.db' -mtime +30 -delete 2>/dev/null || true

printf "\n\033[1;32mAggiornamento completato.\033[0m  https://%s\n\n" "$DOMAIN"
