ARG NODE_VERSION="16-slim"
FROM registry.puzzle.ch/docker.io/node:${NODE_VERSION} as dev

STOPSIGNAL SIGINT
RUN apt update && apt install -y \
        make \
        bash \
        git
WORKDIR /app

CMD ["/usr/bin/make", "clean", "serve-dev"]

#==============
# Stage builder
#==============

FROM dev as builder

COPY app/ /app

WORKDIR /app

RUN /usr/bin/make clean build

#==============
# Stage prod
#==============

FROM registry.puzzle.ch/docker.io/nginx:stable as prod

COPY --from=builder /app/prod /usr/share/nginx/html

