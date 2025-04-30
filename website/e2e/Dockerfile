FROM mcr.microsoft.com/playwright:v1.52.0

RUN id -u pwuser 2>/dev/null || adduser --disabled-password --gecos '' --home /e2e pwuser \
 && mkdir -p /e2e/tests/screenshot-test.spec.js-snapshots \
             /e2e/playwright-report \
 && chown -R pwuser:pwuser /e2e \
 && chmod -R u+rwX,go-rwx /e2e

USER pwuser
WORKDIR /e2e

COPY --chown=root:root --chmod=644 package.json package-lock.json playwright.config.js ./

RUN npm ci --ignore-scripts

COPY --chown=root:root --chmod=755 ./tests ./tests

ENTRYPOINT [ "npx", "playwright", "test" ]
