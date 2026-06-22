FROM linxpa-peprdharbor00.garmin.com/library/ubuntu:20.04 AS certificates

# Download latest certificates from pki.garmin.com
WORKDIR /certificates

ADD https://pki.garmin.com/Garmin%20Issuing%20CA%203.cer garmin_issuing_ca_3.cer
ADD https://pki.garmin.com/Garmin%20Issuing%20CA%204.cer garmin_issuing_ca_4.cer
ADD https://pki.garmin.com/Garmin%20Issuing%20CA%206.cer garmin_issuing_ca_6.cer
ADD https://pki.garmin.com/Garmin%20Root%20CA%20-%202018.cer garmin_root_ca_202018.cer

RUN apt update \
    && apt install -y openssl \
    && apt clean all \
    && rm -rf /var/lib/apt/lists/* \
    && for cer_cert in *.cer; do openssl x509 -inform DER -in "$cer_cert" -outform PEM -out "${cer_cert%.cer}.crt"; done

# Node.js stage for building frontend
FROM linxpa-peprdharbor00.garmin.com/library/node:22-slim AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Python stage
FROM linxpa-peprdharbor00.garmin.com/library/python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive
COPY --from=certificates /certificates/*.crt /usr/local/share/ca-certificates

RUN apt update \
    && apt install ca-certificates -y \
    && apt clean all \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates --fresh

# Setup `requests` default CA bundle
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        libgl1 \
        libglib2.0-dev \
        poppler-utils \
        gettext \
        libdbus-1-3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libxkbcommon0 \
        libatspi2.0-0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libpango-1.0-0 \
        libasound2 \
        libgdk-pixbuf-2.0-0 \
        libjpeg62-turbo \
        libvpx-dev \
        libicu-dev \
        fonts-unifont \
        build-essential \
        python3-dev \
        libldap2-dev \
        libsasl2-dev \
        libssl-dev \
        libgtk-3-0 \
        libpangocairo-1.0-0 \
        libcairo-gobject2

WORKDIR /app

ENV PIP_INDEX_URL=http://linxpa-dl02:5999/simple \
    PIP_TRUSTED_HOST=linxpa-dl02

# Setup timezone
ENV TZ=Asia/Taipei
RUN apt update \
    && DEBIAN_FRONTEND=noninteractive apt install -y --no-install-recommends tzdata \
    && apt clean all \
    && rm -rf /var/lib/apt/lists/* \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

# Install Python dependencies
ENV SETUPTOOLS_SCM_PRETEND_VERSION=${PROJECT_VERSION}
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    pip install -e .[api,test]

# Copy backend code
COPY . .

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist