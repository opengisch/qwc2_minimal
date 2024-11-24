ARG NODE_VERSION="18.10"
FROM node:${NODE_VERSION} as base

# 2024 LTS
ARG QWC2_VERSION_HASH="4c434f77660db1060d10ccd96c0f44e0c5482b43"
ARG QWC2_DOWNLOAD_PATH="https://github.com/qgis/qwc2/archive/$QWC2_VERSION_HASH.zip"
ARG QWC2_REPO_VERSION_URL="https://github.com/qgis/qwc2/tree/$QWC2_VERSION_HASH"
RUN apt-get update && apt-get install -y \
      bash \
      curl && \
    curl -L -O $QWC2_DOWNLOAD_PATH && \
    unzip $QWC2_VERSION_HASH.zip && \
    rm $QWC2_VERSION_HASH.zip && \
    mv qwc2-$QWC2_VERSION_HASH /qwc2 && \
    echo "$QWC2_VERSION_HASH" > /qwc2/.qwc2.version.txt && \
    echo "$QWC2_DOWNLOAD_PATH" > /qwc2/.qwc2.download_source.txt && \
    echo "$QWC2_REPO_VERSION_URL" > /qwc2/.qwc2.repo_source.txt

COPY ./app/.yarnrc /qwc2

WORKDIR /qwc2

RUN yarn install

FROM base as dev

ENV DEV_SERVER_PORT=8080

WORKDIR /app

STOPSIGNAL SIGINT
RUN apt-get update && apt-get install -y \
  make

CMD ["/usr/bin/make", "clean", "serve-dev"]

#==============
# Stage builder
#==============

FROM dev as builder

COPY ./app /app

WORKDIR /app

RUN /usr/bin/make clean build

#==============
# Stage prod
#==============

FROM nginx:1.23.2 as prod

COPY --from=builder /app/prod /usr/share/nginx/html
COPY ./example_config/config.json ./example_config/themes.json /usr/share/nginx/html/
