FROM mcr.microsoft.com/playwright:v1.52.0

# Install wait-for-it script
RUN apt-get update && apt-get install -y wget && \
    wget -q -O /wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /wait-for-it.sh

WORKDIR /e2e

# Copy files
COPY package*.json playwright.config.js ./
COPY tests ./tests/

# Install dependencies
RUN npm ci --ignore-scripts && \
    npm install -g playwright@1.52.0

# Create directories with proper permissions
RUN mkdir -p /e2e/tests/screenshot-test.spec.js-snapshots \
             /e2e/playwright-report \
             /e2e/test-results && \
    chmod -R 777 /e2e

# Create entrypoint script
COPY <<EOF /entrypoint.sh
#!/bin/bash
/wait-for-it.sh apostrophe:3000 -t 60 -- npx playwright test "\$@"
EOF

RUN chmod +x /entrypoint.sh

# Default command
ENTRYPOINT ["/entrypoint.sh"]
