Entwicklung => opengis
  Coding => Trennung von Upstream und Integration!
    ||
    \/
  Paketierung

----

Integration => opengis/Kunde
  Deployment
    ||
    \/
  Setup

---

Administration => Kunde/opengis
  Rechte
  Daten
  Konfiguration


Build the docker container
```shell
docker build -t qwc2_minimal:latest --target prod .
docker build -t qwc2_minimal:latest-builder --target builder .
```

Creating the themes files
```shell
docker run --rm -v $(pwd)/example_config/themes.json:/app/static/themes.json -v $(pwd)/example_config/themesConfig.json:/app/themesConfig.json -u $(id -u):$(id -g) qwc2_minimal:latest-builder npm run themesconfig
```

Running the server
```shell
docker run --rm -p 80:80 qwc2_minimal:latest
```
