# QWC2 minimal

## Overview

The regular [QWC2 Demo App](https://github.com/qgis/qwc2-demo-app) is a good point to start and
have a quick application running. But when it comes to deployment and to maintain code over
time in different projects it lacks a bit of organization. This is mainly introduced by two things:

1. [QWC2 is a sub repository in this project](https://github.com/qgis/qwc2)
1. There is no packaging/release mechanism

Both facts seem to stand in the way of rapid development. Despite they aren't. It is true that
building packages and managing dependencies is a pain. But not solving this inside the
project with all the knowledge of the developers who produce the code shifts the pain to
integrators or users. They do not have a clue about the software and therefore come up with silly
ideas how to solve things upstream. Creating high gain of noise and blocking DEVs from their real
work. So in the end the time meant to be saved is blocked just in another way.

## This repository

This approach tries to solve some of this pain. Even if it is not a final solution since it
only handles upstream. It does not manipulate it.

It implements the following ideas:

- inspired by the [QWC2 Demo App](https://github.com/qgis/qwc2-demo-app) this reflects an instance
  of a WebGIS which might be adapted to further needs or can be served as is
- Everything is encapsulated in Docker
- Running any command should not leave any touched files but necessary ones on the host
- A DEV server to conveniently develop code locally
- Updating the basic lib [QWC2](https://github.com/qgis/qwc2) shouldn't pollute the implementation project
- the basic lib [QWC2](https://github.com/qgis/qwc2) is handled as a singleton
- Node modules are not polluting the host system

It is meant to be used as is for really simple cases where we only want to offer a basic WebGIS
with some themes, layers, print templates, etc. It can be slightly adapted to the clients needs
as of the symbols and the cartographic content.

As soon as there should be any custom functionality this repository should be used as a pattern
for a custom implementation. It's not worth to customize it directly. However, some parts may be
reused. Especially the Docker images described in the next section.

## The Docker structure

There are 4 Docker images/targets:

1. qwc2_base
1. dev
1. builder
1. prod

They depend on each other in the order stated above.

### qwc2_base

It includes the QWC2 code in a defined version (HASH) in the root folder `/qwc2` and all
the Node modules it depends on which are stored in the root folder `node_modules`.

The main interesting point here is the [.yarnrc file](../../app/.yarnrc) which tells
Node to store the packages in a defined path. This file is copied to the image at build
time.

It does not contain an instance of QWC2 which can be started. 

### dev

It includes nothing but the things of the stage `qwc2_base`. It sets the working directory
to `app`.

It is meant to be used as the development environment. The content of the `app` folder of
this repository should be mounted along with Docker run command:

```shell
docker run --rm -p 8080:8080 -v $(pwd)/app:/app qwc2_minimal:latest-dev
```

That runs the stack in dev mode to develop things. It is useful to integrate with the newest
version of QWC2 since this often comes with changes in configuration and code. Using this
repository is a safe and local way to achieve this without manipulating clients infrastructure.

### builder

This stage is mainly used to prepare the static assets of the QWC2 app in a way that they can
be served by a simple webserver in the end. The result is used in the next stage.

But it includes also the toolset of QWC2 which is for building fonts, icon sets
(not the clients custom icons), translations and the most important => the themes.json

So we can use this Docker image directly to produce a `themes.json` out of a `themesConfig.json`.
Most use cases show needs that this `themesConfig.json` is handled by the client and heavily depends
on services running in the client's infrastructure. As a QGIS-Server accessing local databases etc.

In this infrastructure we can use the `builder` to generate the artifact needed by QWC2 => `themes.json`:

```shell
docker run --rm \
  -v $(pwd)/example_config/themes.json:/app/static/themes.json \
  -v $(pwd)/example_config/themesConfig.json:/app/themesConfig.json \
  -v $(pwd)/example_config/map_thumbs:/app/static/assets/img/genmapthumbs \
  -u $(id -u):$(id -g) \
  qwc2_minimal:latest-builder make generate-themes
```

Since QWC2 can also create preview thumbs for the theme selection tool we also mount that dir
to obtain generated thumbs.

### prod

> **NOTE**: You may want to delete or disable the cache of you browser to force load the correct files
> instead of using the browsers cache.

It contains a simple nginx serving the static assets and so a fully working instance of QWC2 but without
any cartographic data.

```shell
docker run --rm -p 80:80 qwc2_minimal:latest
```

However, this can be easily adapted to a clients setup where the client has an own `config.json`
to enable/disable things in the WebGIS (buttons, toolbars, etc.) and an own `themesConfig.json`
which was already *built* to a `themes.json`.

To show how it might work this repository ships with an example set of such data in the folder
`example_config`.

You might try to use that with the following Docker command:

```shell
docker run --rm \
  -p 80:80 \
  -v $(pwd)/example_config/themes.json:/usr/share/nginx/html/themes.json \
  -v $(pwd)/example_config/config.json:/usr/share/nginx/html/config.json \
  -v $(pwd)/example_config/app_logos/logo.svg:/usr/share/nginx/html/assets/img/logo.svg \
  -v $(pwd)/example_config/app_logos/favicon.ico:/usr/share/nginx/html/assets/img/favicon.ico \
  qwc2_minimal:latest
```

TODO: add better map theme setup to describe how it works.

Loading `http://localhost:80` in your browser will show an empty WebGIS (no cartographic data). This is not
different to the command above. But the WebGIS does have a top toolbar. This is because one was configured
in the `config.json`. You may also recognize the different logo in the header and for the favicon.
