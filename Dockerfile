FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json bun.lock* ./
RUN npm install

# Copiar código fuente
COPY . .

# Compilar proyecto
RUN npm run build || true

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
