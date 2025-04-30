FROM mcr.microsoft.com/playwright:v1.52.0

RUN id -u pwuser 2>/dev/null || adduser --disabled-password --gecos '' --home /e2e pwuser

USER pwuser

WORKDIR /e2e

COPY package.json package-lock.json playwright.config.js ./
RUN npm ci --ignore-scripts

RUN mkdir -p tests && chmod -R 777 /e2e/tests

COPY ./tests ./tests

ENTRYPOINT [ "npx", "playwright", "test" ]

