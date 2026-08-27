# OmGithub site

Vue creator/store frontend plus a Node service that mirrors GitHub issue and
pull-request routes, tracks OpenCode workflow progress, stores project metadata
in Firebase, and hosts published game ZIPs on wildcard subdomains.

## Local development

```sh
cp .env.example .env
npm install
npm run dev
```

The production server serves `dist/`, so run `npm run build && npm start` for a
production-mode local check.

## Required production configuration

- `GITHUB_TOKEN`: creates anonymous `/goal` issues and raises GitHub API limits.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: optional GitHub login.
- `FIREBASE_SERVICE_ACCOUNT_BASE64`: Firebase service-account JSON, base64 encoded.
- `PUBLISH_TOKEN`: bearer token shared with the Actions secret
  `OMGHITHUB_PUBLISH_TOKEN`.
- `PUBLIC_ORIGIN=https://omgithub.com`.

Deploy the Docker service to A1 with `../scripts/deploy-omgithub-a1.sh`. The
container publishes only to `127.0.0.1:8794`; host Caddy terminates TLS for
`omgithub.com` and `*.omgithub.com`.
