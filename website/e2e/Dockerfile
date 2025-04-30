FROM mcr.microsoft.com/playwright:v1.52.0

RUN id -u pwuser 2>/dev/null || adduser --disabled-password --gecos '' --home /e2e pwuser

RUN mkdir -p /e2e/tests/screenshot-test.spec.js-snapshots \
    /e2e/playwright-report \
 && chmod -R 777 /e2e/tests \
 && chmod -R 777 /e2e/playwright-report

USER pwuser

WORKDIR /e2e

COPY --chown=pwuser:pwuser package.json package-lock.json playwright.config.js ./
RUN npm ci --ignore-scripts

COPY --chown=pwuser:pwuser ./tests ./tests

ENTRYPOINT [ "npx", "playwright", "test" ]

