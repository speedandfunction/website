FROM mcr.microsoft.com/playwright:v1.52.0

# Install wait-for-it as root, with safe apt flags
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && wget -q -O /wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /wait-for-it.sh \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /e2e

# Copy files as root
COPY package*.json playwright.config.js ./
COPY tests ./tests/
COPY entrypoint.sh /entrypoint.sh

# Install dependencies and create directories with safe permissions
RUN npm ci --ignore-scripts \
    && mkdir -p /e2e/tests/screenshot-test.spec.js-snapshots \
             /e2e/playwright-report \
             /e2e/test-results \
    && chown -R pwuser:pwuser /e2e \
    && chmod -R 775 /e2e \
    && chmod +x /entrypoint.sh \
    && chown pwuser:pwuser /entrypoint.sh

# Drop privileges
USER pwuser

ENTRYPOINT ["/entrypoint.sh"]
