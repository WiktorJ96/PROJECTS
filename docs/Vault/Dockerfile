# Pobranie obrazu Node.js
FROM node:18

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package.json package-lock.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie całej zawartości projektu do kontenera
COPY . .

# Wystawienie portu 3000
EXPOSE 3000

# Uruchomienie serwera
CMD ["node", "server.js"]
