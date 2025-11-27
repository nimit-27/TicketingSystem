FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps
# RUN npm ci --legacy-peer-deps


COPY . .
# RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build
# ENV NODE_OPTIONS=--max-old-space-size=6144
# RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html/helpdesk
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# ARG NGINX_CONF=nginx/default.conf
# COPY ${NGINX_CONF} /etc/nginx/conf.d/default.con

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
