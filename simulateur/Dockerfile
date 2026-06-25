# =============================================================================
#  Simulateur — La Forteresse de l'Envie
#  Image Node minimale (Alpine). Aucune dépendance npm : on copie juste le code.
# =============================================================================
FROM node:20-alpine

WORKDIR /app

# Pas de dépendances runtime — package.json sert surtout aux scripts (start/test).
COPY package.json ./
COPY . .

EXPOSE 8123
ENV PORT=8123

# Par défaut : sert le simulateur. `docker compose run test` lance les tests.
CMD ["npm", "start"]
