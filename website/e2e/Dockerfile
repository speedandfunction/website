FROM mcr.microsoft.com/playwright:v1.52.0

WORKDIR /e2e

COPY package.json package-lock.json playwright.config.js ./
RUN npm ci --ignore-scripts

COPY ./tests ./tests

CMD ["tail", "-f", "/dev/null"]

