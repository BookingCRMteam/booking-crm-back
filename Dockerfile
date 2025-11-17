# ============================
#       BUILDER STAGE
# ============================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Fix pnpm NO_TTY error
ENV CI=true

# Enable pnpm via corepack
RUN corepack enable

# Install dependencies using caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy all files
COPY . .

# Build NestJS app
RUN pnpm build


# ============================
#       PRODUCTION STAGE
# ============================
FROM node:22-alpine AS production 

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV CI=true

# Enable pnpm
RUN corepack enable

# Copy only dist and node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package.json .

# Expose app port
EXPOSE 3000

# Run compiled NestJS app
CMD ["node", "dist/src/main.js"]
