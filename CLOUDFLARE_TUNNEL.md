# Cloudflare Tunnel deployment

This deployment publishes FYURI through an outbound Cloudflare Tunnel. It does
not require router port forwarding, and MySQL and the ASP.NET API have no host
ports in this mode.

## Immediate review URL

Quick Tunnels are useful for a temporary public review. They use a random
`trycloudflare.com` hostname and have no uptime guarantee. This Compose profile
publishes the storefront and same-origin API without an additional review
password. Application-level authentication still protects administrator routes.

```powershell
docker compose `
  -p fyuri-review `
  -f docker-compose.yml `
  -f compose.cloudflare.yml `
  -f compose.cloudflare.quick.yml `
  up -d --build

docker compose `
  -p fyuri-review `
  -f docker-compose.yml `
  -f compose.cloudflare.yml `
  -f compose.cloudflare.quick.yml `
  logs cloudflared-quick
```

The local production build remains available only on
`http://127.0.0.1:4180`. MySQL and the backend are reachable only by services
inside the Compose network. Anyone with the generated Quick Tunnel URL can
open the current review.

## Stable review hostname

For a durable endpoint:

1. Add the domain to the same Cloudflare account that owns the tunnel.
2. In Cloudflare Zero Trust, create a remotely-managed tunnel.
3. Add a published application route such as `review.munkys.dev` with service
   URL `http://frontend:80`.
4. Protect an owner-only review hostname with Cloudflare Access.
5. Create `.cloudflare/tunnel-token` and paste only the tunnel token into it.
   The entire `.cloudflare` directory is ignored by Git.
6. Start the named connector:

```powershell
docker compose `
  -p fyuri-review `
  -f docker-compose.yml `
  -f compose.cloudflare.yml `
  -f compose.cloudflare.named.yml `
  up -d --build
```

Do not pass the token directly on the command line. Anyone with the token can
run a connector for that tunnel.

## Operational notes

- The computer, Docker Desktop, application, and internet connection must stay
  running. Cloudflare Tunnel routes the service; it does not host it.
- Keep router ports closed. `cloudflared` initiates outbound connections.
- Configure real SMTP before accepting customer submissions. Without SMTP,
  orders and contact messages remain in the database, but no email is sent.
- After initial administrator provisioning, clear `ADMIN_EMAIL` and
  `ADMIN_PASSWORD` and recreate the backend container as described in the main
  README.
- Use `docker compose ps`, container logs, and a public HTTPS request to verify
  application health; a healthy tunnel alone does not prove the origin works.
