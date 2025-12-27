# ===== Builder Stage =====
FROM node:22-alpine AS builder
# FROM node:20-bullseye AS builder


# Встановлюємо pnpm
RUN npm install -g pnpm@latest

WORKDIR /usr/src/app

# Копіюємо лише package.json та lock-файли
COPY package*.json pnpm-lock.yaml* ./

# Встановлюємо всі залежності (dev + prod)
RUN pnpm install

# Копіюємо код
COPY . .
# Перевірка ESLint
RUN pnpm run lint

# Перевірка TypeScript
RUN pnpm exec tsc --noEmit

# Збираємо проєкт
RUN pnpm run build

# Видаляємо dev-залежності для продакшн
RUN pnpm config set ignore-scripts true && pnpm prune --prod


# ===== Runner Stage (Prod) =====
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Встановлюємо pnpm
RUN npm install -g pnpm@latest

# Копіюємо необхідне з builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 3000

# Запуск prod
CMD ["node", "dist/src/main.js"]
