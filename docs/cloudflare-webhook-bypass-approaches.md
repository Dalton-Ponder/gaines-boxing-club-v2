# Cloudflare Webhook Bypass: Path-Level Scoping Alternatives

> Companion to [cloudflare-one-github-webhook-bypass.md](./cloudflare-one-github-webhook-bypass.md).
> Use this guide when your existing Cloudflare Access application does not support path-level Bypass policies.

---

## The Problem

Cloudflare Access applications are scoped by **hostname** (e.g., `app.yourdomain.com`), not by URL path. When you add a Bypass policy, it applies to the *entire* hostname. That means a Bypass would expose every route on your application -- not just `/webhook` -- defeating the purpose.

You need to allow unauthenticated POST requests to reach exactly one path (`/webhook`) while keeping Access enforcement active on all other paths.

There are three approaches, listed from simplest to most powerful:

| # | Approach | Complexity | Best For |
|---|----------|------------|----------|
| A | Dedicated webhook subdomain + Access Application | Low | Cleanest separation; no code to deploy |
| B | WAF Custom Rules | Medium | Filtering by method/path without deploying any code |
| C | Cloudflare Worker as webhook gateway | High | Full request validation at the edge before traffic ever hits your tunnel |

---

## Approach A: Dedicated Webhook Subdomain

The simplest option. Create a separate subdomain (e.g., `webhook.yourdomain.com`) pointed at the same tunnel, then protect it with its own Access application that has a Bypass policy for `Everyone`. Your main application's Access app remains locked down.

### Step 1: Add a Public Hostname to Your Tunnel

In the **Cloudflare Zero Trust dashboard**:

1. Go to **Networks** > **Tunnels** > select your tunnel > **Public Hostname** tab.
2. Click **Add a public hostname**.
3. Configure:

   | Field       | Value                                  |
   |-------------|----------------------------------------|
   | Subdomain   | `webhook`                              |
   | Domain      | `yourdomain.com`                       |
   | Type        | `HTTP`                                 |
   | URL         | `localhost:3000` (or your app's port)  |

4. Save. Cloudflare will create the DNS CNAME automatically.

If you are using a local `config.yml` instead of a remotely-managed tunnel, add the ingress rule:

```yaml
ingress:
  - hostname: webhook.yourdomain.com
    service: http://localhost:3000
  - hostname: app.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

Then restart `cloudflared`:

```bash
sudo systemctl restart cloudflared
```

### Step 2: Create a Dedicated Access Application

1. Go to **Access** > **Applications** > **Add an application** > **Self-hosted**.
2. Configure:

   | Field            | Value                           |
   |------------------|---------------------------------|
   | Application name | `GitHub Webhook`                |
   | Session duration | `24 hours` (irrelevant for Bypass, but required) |
   | Application domain | `webhook.yourdomain.com`      |

3. On the **Policies** step, add a single policy:

   | Field       | Value                        |
   |-------------|------------------------------|
   | Policy name | `Bypass All`                 |
   | Action      | **Bypass**                   |
   | Include     | **Everyone**                 |

4. Save the application.

Traffic to `webhook.yourdomain.com` now reaches your app without any Access login gate. Traffic to `app.yourdomain.com` remains fully protected by your existing Access application.

### Step 3: Point Your GitHub Webhook to the New Subdomain

Update the Payload URL in **GitHub** > **Settings** > **Webhooks** to:

```
https://webhook.yourdomain.com/webhook
```

Security still comes from your HMAC webhook secret validated at the application layer (see the main guide, Step 4).

### Trade-offs

- **Pro:** Zero code changes; pure infrastructure configuration.
- **Pro:** Clear separation of concerns between webhook traffic and authenticated application traffic.
- **Con:** Requires a dedicated subdomain. If you are limited on subdomains or find this cluttered, consider Approach B or C.
- **Con:** The *entire* subdomain is bypassed, not just `/webhook`. An attacker who discovers the subdomain can hit any path. Your application should only expose the webhook route on this hostname, or validate paths server-side.

---

## Approach B: WAF Custom Rules

Use Cloudflare's **Web Application Firewall (WAF)** custom rules to selectively block or allow traffic before it reaches Access or your origin. This works at the zone level and can filter by path, method, and headers.

The strategy: block all non-webhook traffic to the hostname at the WAF layer, then apply a Bypass Access policy on the entire hostname (safe because WAF already limits what can get through).

### Step 1: Create WAF Custom Rules

Go to **your zone** > **Security** > **WAF** > **Custom rules** > **Create rule**.

**Rule 1: Allow webhook POSTs through**

```
Rule name: Allow GitHub Webhook POST
When incoming requests match...
  Field: Hostname     Operator: equals    Value: webhook.yourdomain.com
  AND
  Field: URI Path     Operator: equals    Value: /webhook
  AND
  Field: Request Method  Operator: equals  Value: POST

Then... Skip (remaining WAF rules)
```

This rule ensures POST requests to `/webhook` are never blocked by subsequent WAF rules.

**Rule 2: Block everything else on the webhook hostname**

```
Rule name: Block all other webhook traffic
When incoming requests match...
  Field: Hostname     Operator: equals    Value: webhook.yourdomain.com

Then... Block
```

Because Rule 1 is evaluated first (higher priority), legitimate webhook POSTs skip this rule. Everything else is blocked.

### Step 2: Verify Rule Order

Custom rules are evaluated **in order**. Make sure the Allow rule is positioned **above** the Block rule:

| Priority | Rule Name                      | Action |
|----------|--------------------------------|--------|
| 1        | Allow GitHub Webhook POST      | Skip   |
| 2        | Block all other webhook traffic| Block  |

### Step 3: Apply the Bypass Access Policy

Now that WAF restricts traffic to only POST `/webhook`, you can safely apply a Bypass Access policy to the hostname (the same process as in Approach A, Step 2).

### Optional: Filter by GitHub IP Ranges

GitHub publishes [their webhook source IP ranges](https://api.github.com/meta). You can add an extra condition to Rule 1 using the `IP Source Address` field with GitHub's hook IP ranges for defense in depth. Note these ranges change periodically, so this requires maintenance.

### Trade-offs

- **Pro:** No code deployment; operates purely at the Cloudflare edge.
- **Pro:** Path-level and method-level precision without a separate subdomain.
- **Con:** WAF custom rules have plan-based limits (Free: 5 rules, Pro: 20, Business: 100, Enterprise: 1000). This approach uses at least 2 rules.
- **Con:** WAF rules operate on the zone, not on Access. You are layering two separate systems, which can create confusion if someone edits the Access policy without understanding the WAF dependency.

---

## Approach C: Cloudflare Worker as Webhook Gateway

The most powerful option. A Cloudflare Worker sits at the edge, intercepts all requests to your webhook hostname, validates the GitHub HMAC signature at the edge (before the request ever reaches your tunnel), and forwards only verified payloads to your origin.

This eliminates the need for a Bypass policy entirely -- the Worker handles authentication and proxying in one place.

### Architecture

```
GitHub Actions
     |
     | POST /webhook (X-Hub-Signature-256)
     v
Cloudflare Worker (webhook-gateway.yourdomain.com)
     |
     | 1. Verify path is /webhook
     | 2. Verify method is POST
     | 3. Verify HMAC signature
     | 4. Forward to origin via tunnel
     v
cloudflared tunnel --> Your VPS application
```

### Step 1: Create the Worker

Use `wrangler` (Cloudflare's CLI) or the Cloudflare dashboard's Worker editor.

**`src/index.ts`**:

```typescript
export interface Env {
  GITHUB_WEBHOOK_SECRET: string;
  ORIGIN_URL: string; // e.g., https://internal-webhook.yourdomain.com/webhook
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Only allow POST to /webhook
    if (url.pathname !== '/webhook' || request.method !== 'POST') {
      return new Response('Not Found', { status: 404 });
    }

    // Read raw body for HMAC verification
    const body = await request.text();
    const signature = request.headers.get('X-Hub-Signature-256');

    if (!signature) {
      return new Response('Missing signature', { status: 403 });
    }

    // Verify HMAC-SHA256 signature
    const isValid = await verifyGitHubSignature(body, signature, env.GITHUB_WEBHOOK_SECRET);
    if (!isValid) {
      return new Response('Invalid signature', { status: 403 });
    }

    // Forward the verified request to the origin (through the tunnel)
    const originResponse = await fetch(env.ORIGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'X-GitHub-Event': request.headers.get('X-GitHub-Event') || '',
        'X-GitHub-Delivery': request.headers.get('X-GitHub-Delivery') || '',
        'X-Hub-Signature-256': signature,
        'X-Forwarded-By': 'cloudflare-webhook-gateway',
      },
      body,
    });

    return new Response(await originResponse.text(), {
      status: originResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  },
} satisfies ExportedHandler<Env>;

async function verifyGitHubSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  // Parse "sha256=<hex>" format
  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;
  const receivedHex = parts[1];

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload),
  );

  const expectedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Timing-safe comparison
  if (receivedHex.length !== expectedHex.length) return false;
  const a = encoder.encode(receivedHex);
  const b = encoder.encode(expectedHex);
  return crypto.subtle.timingSafeEqual(a, b);
}
```

**`wrangler.toml`**:

```toml
name = "webhook-gateway"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ORIGIN_URL = "https://internal-app.yourdomain.com/webhook"

# GITHUB_WEBHOOK_SECRET should be set via:
#   npx wrangler secret put GITHUB_WEBHOOK_SECRET
```

### Step 2: Set the Webhook Secret

```bash
npx wrangler secret put GITHUB_WEBHOOK_SECRET
# Paste your secret when prompted
```

### Step 3: Deploy the Worker

```bash
npx wrangler deploy
```

### Step 4: Add a Custom Domain to the Worker

1. Go to **Workers & Pages** > your worker > **Settings** > **Triggers** > **Custom Domains**.
2. Add `webhook.yourdomain.com`.
3. Cloudflare will create the DNS record automatically.

Now GitHub sends webhooks to `webhook.yourdomain.com/webhook`, the Worker validates the signature, and only verified payloads are forwarded to your origin through the tunnel.

### Step 5: Configure the Internal Origin

The Worker's `ORIGIN_URL` should point to a hostname that routes through your tunnel to your VPS. This is a separate, internal hostname (e.g., `internal-app.yourdomain.com`) that:

1. Is configured as a public hostname in your tunnel (pointed at your app's port).
2. Has an Access application with a **Service Auth** policy (so only the Worker can reach it), or is an internal-only hostname not publicly discoverable.

Alternatively, if your origin already has a public Access-protected hostname, you can issue a Service Token for the Worker and include `CF-Access-Client-Id` / `CF-Access-Client-Secret` headers in the forwarded request.

### Trade-offs

- **Pro:** HMAC validation at the edge -- bad requests never touch your tunnel or VPS.
- **Pro:** No Bypass policy needed; Access stays fully enforced on your main application.
- **Pro:** Full flexibility: rate limiting, logging, payload transformation, and multi-webhook routing all in one place.
- **Con:** Requires deploying and maintaining a Worker (code, secrets, `wrangler.toml`).
- **Con:** Worker invocations count against your plan's request limit (Free: 100K/day, Paid: unlimited).

---

## Recommendation

| Scenario | Recommended Approach |
|----------|---------------------|
| Quickly unblock GitHub webhooks with minimal config | **A** (Dedicated subdomain) |
| Need path-level precision, no code deployment | **B** (WAF custom rules) |
| Want edge-side validation, maximum security | **C** (Cloudflare Worker gateway) |
| You control the GitHub Actions workflow (not just webhooks) | **Service Token** (see main guide) |

For most VPS deployments behind Cloudflare Tunnel, **Approach A** (dedicated subdomain) is the fastest path to a working setup. Upgrading to **Approach C** (Worker gateway) is recommended if you want the strongest security posture, since bad requests are rejected at the Cloudflare edge before consuming any tunnel or VPS resources.

---

## References

- [Cloudflare Access - Bypass action](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/#bypass)
- [Cloudflare Tunnel - Public hostnames](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/#connect-an-application)
- [Cloudflare WAF Custom Rules](https://developers.cloudflare.com/waf/custom-rules/)
- [Cloudflare Workers - Signing requests (HMAC)](https://developers.cloudflare.com/workers/examples/signing-requests/)
- [Cloudflare Workers - Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [GitHub - Webhook IP ranges](https://api.github.com/meta)
- [GitHub - Validating webhook deliveries](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)
