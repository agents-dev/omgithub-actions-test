# OmGithub publishing

The Vue/Node application lives in `site/`. It mirrors GitHub routes at
`/<owner>/<repo>/issues/<number>` and `/<owner>/<repo>/pull/<number>`, polls
issue comments for OpenCode/trycloudflare/screenshot progress, and stores
published project ownership in Firebase.

The OpenCode workflow uploads `project/dist` to `POST
https://omgithub.com/api/publish` after creating the PR. Authentication uses the
`OMGHITHUB_PUBLISH_TOKEN` Actions secret. The service reuses a slug when the
same issue/PR is republished; a collision from another project gets `-2`, `-3`,
and so on. Published games use `https://<slug>.omgithub.com/`, with the install
page at `/install`.

Production runs as the `omgithub` Docker Compose service on A1. Deploy with:

```sh
bash scripts/deploy-omgithub-a1.sh
```

The A1 Caddyfile must route both `omgithub.com` and `*.omgithub.com` to
`127.0.0.1:8794`. Keep the wildcard DNS record proxied to A1.
