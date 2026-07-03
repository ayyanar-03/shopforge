#!/bin/sh
set -e
envsubst '${VITE_API_BASE_URL} ${VITE_CURRENCY_RATE}' \
  < /usr/share/nginx/html/env-config.js \
  > /usr/share/nginx/html/env-config.js.tmp
mv /usr/share/nginx/html/env-config.js.tmp /usr/share/nginx/html/env-config.js
exec "$@"
