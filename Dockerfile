FROM node:18-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Omit --production flag for TypeScript devDependencies
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  # Allow install without lockfile, so example works even without Node.js installed locally
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi

COPY src ./src
COPY public ./public
COPY prisma ./prisma
COPY next.config.mjs .
COPY postcss.config.cjs .
COPY prettier.config.mjs .
COPY tailwind.config.ts .
COPY tsconfig.json .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

ARG DOMAIN_NAME
ENV DOMAIN_NAME=${DOMAIN_NAME}

ARG BUCKET_NAME
ENV BUCKET_NAME=${BUCKET_NAME}

ARG REGION
ENV REGION=${REGION}

ARG SECRET_SALT
ENV SECRET_SALT=${SECRET_SALT}

ARG UPSTASH_REDIS_REST_URL
ENV UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}

ARG UPSTASH_REDIS_REST_TOKEN
ENV UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}

ARG AWS_ACCESS_KEY_ID
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}

ARG AWS_SECRET_ACCESS_KEY
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

ARG AWS_SESSION_TOKEN
ENV AWS_SESSION_TOKEN=${AWS_SESSION_TOKEN}

ENV SKIP_ENV_VALIDATION=1

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate

# Build Next.js based on the preferred package manager
RUN \
  if [ -f package-lock.json ]; then npm run build; \
  else yarn build; \
  fi

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Environment variables must be redefined at run time
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

ARG DOMAIN_NAME
ENV DOMAIN_NAME=${DOMAIN_NAME}

ARG BUCKET_NAME
ENV BUCKET_NAME=${BUCKET_NAME}

ARG REGION
ENV REGION=${REGION}

ARG SECRET_SALT
ENV SECRET_SALT=${SECRET_SALT}

ARG UPSTASH_REDIS_REST_URL
ENV UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}

ARG UPSTASH_REDIS_REST_TOKEN
ENV UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}

ARG AWS_ACCESS_KEY_ID
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}

ARG AWS_SECRET_ACCESS_KEY
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

ARG AWS_SESSION_TOKEN
ENV AWS_SESSION_TOKEN=${AWS_SESSION_TOKEN}

ENV SKIP_ENV_VALIDATION=1

# Uncomment the following line to disable telemetry at run time
# ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us

CMD ["node", "server.js"]