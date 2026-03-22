# GitHub Actions Webhooks Through Cloudflare One (VPS Bypass Guide)

## Overview

This guide explains how to allow GitHub Actions webhook traffic to reach a private VPS that sits behind **Cloudflare One (Zero Trust)** via a **Cloudflare Tunnel**. Because GitHub Actions runners are ephemeral external machines, they cannot authenticate through a browser or a WARP client. The solution uses two complementary mechanisms:

1. **Cloudflare Access Bypass action** - removes Zero Trust enforcement from a specific webhook path on your public hostname.
2. **Webhook HMAC secret** - moves security enforcement into your application layer, where your server validates the `X-Hub-Signature-256` header GitHub sends with every request.

This approach keeps your VPS private from the open internet (no exposed ports) while allowing GitHub's infrastructure to reach it through the tunnel.

---

## Architecture

```
GitHub Actions
     |
     | POST /webhook  (with X-Hub-Signature-256 header)
     v
Cloudflare Network (public hostname: webhook.yourdomain.com)
     |
     | Access Policy: BYPASS for /webhook path
     v
cloudflared daemon (running on VPS)
     |
     v
Your application (validates HMAC secret, processes payload)
```

---

## Prerequisites

- A running **Cloudflare Tunnel** (`cloudflared`) on your VPS with a public hostname configured (e.g., `webhook.yourdomain.com`).
- Your zone is **proxied through Cloudflare** (orange cloud DNS record).
- A **GitHub Webhook Secret** you generate and store securely (used for HMAC validation).
- Access to the **Cloudflare Zero Trust dashboard** (`one.dash.cloudflare.com`).

---

## Step 1: Generate a Webhook Secret

Generate a cryptographically random secret. Store this value in two places:

- Your **GitHub repository** (as a repository secret or in webhook settings).
- Your **VPS application** (as an environment variable, e.g., `GITHUB_WEBHOOK_SECRET`).

```bash
# Generate a 32-byte hex secret
openssl rand -hex 32
```

---

## Step 2: Configure the GitHub Webhook

1. Go to your GitHub repository > **Settings** > **Webhooks** > **Add webhook**.
2. Set **Payload URL** to your tunnel hostname: `https://webhook.yourdomain.com/webhook`
3. Set **Content type** to `application/json`.
4. Set **Secret** to the value you generated in Step 1.
5. Choose the events you want to trigger the webhook (e.g., `push`, `workflow_run`).
6. Click **Add webhook**.

GitHub will now include an `X-Hub-Signature-256` HMAC header with every delivery, computed using your secret.

---

## Step 3: Add a Bypass Policy in Cloudflare Access

By default, if you have a Cloudflare Access application protecting your hostname, all traffic requires authentication. You need to add a **Bypass** rule specifically for the webhook path.

> **Important:** The Bypass action completely removes Access enforcement for matching traffic. This is intentional here because GitHub's machines cannot perform identity-based auth. Your HMAC secret handles security instead.

### Via the Cloudflare Dashboard

1. Go to **Cloudflare Zero Trust** > **Access** > **Applications**.
2. Find the application protecting `webhook.yourdomain.com` (or create one for this hostname if it does not already exist).
3. Click **Edit** > navigate to the **Policies** tab.
4. Click **Add a policy** and configure it as follows:

   | Field       | Value                        |
   |-------------|------------------------------|
   | Policy name | `GitHub Webhook Bypass`      |
   | Action      | **Bypass**                   |

5. Under **Rules**, add an **Include** rule:
   - **Selector:** `Everyone`

6. **Critically**, scroll to **Path** (under the policy or application settings) and set it to `/webhook`. This scopes the Bypass to only that path.

   > If your Access application does not support path-level scoping directly, see the companion guide [cloudflare-webhook-bypass-approaches.md](./cloudflare-webhook-bypass-approaches.md), which covers three alternatives in detail: a dedicated webhook subdomain, WAF custom rules, and a Cloudflare Worker gateway.

7. Save the policy. Ensure the Bypass policy has **lower precedence** than any Allow policies (higher precedence number = lower priority = evaluated last; Bypass should take precedence for matching paths).

### Policy Order

Policies are evaluated top to bottom. Place your Bypass policy **above** any Deny or default-deny policies for your webhook path.

| Precedence | Policy Name            | Action  | Selector      |
|------------|------------------------|---------|---------------|
| 1          | GitHub Webhook Bypass  | Bypass  | Everyone      |
| 2          | Team Access            | Allow   | Email domain  |

---

## Step 4: Validate the Webhook Secret in Your Application

Your application **must** validate the HMAC signature on every incoming webhook request. Do not trust the request payload without this check.

### Node.js / Express Example

```javascript
const crypto = require('crypto');

function verifyGitHubSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;

  const [algorithm, receivedHmac] = signatureHeader.split('=');
  if (algorithm !== 'sha256') return false;

  const expectedHmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(receivedHmac, 'hex'),
    Buffer.from(expectedHmac, 'hex')
  );
}

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!verifyGitHubSignature(req.body, signature, secret)) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  // Process the verified payload
  const payload = JSON.parse(req.body.toString());
  console.log('Received event:', req.headers['x-github-event']);
  res.status(200).json({ received: true });
});
```

> **Critical:** Use `express.raw()` (not `express.json()`) to capture the raw body. The HMAC is computed over the raw bytes exactly as GitHub sent them. Parsing to JSON first will break the signature check.

### Python / Flask Example

```python
import hmac
import hashlib
import os
from flask import Flask, request, abort

app = Flask(__name__)
WEBHOOK_SECRET = os.environ.get('GITHUB_WEBHOOK_SECRET', '').encode()

def verify_signature(payload_body: bytes, signature_header: str) -> bool:
    if not signature_header:
        return False
    algorithm, received_digest = signature_header.split('=', 1)
    if algorithm != 'sha256':
        return False
    expected_digest = hmac.new(WEBHOOK_SECRET, payload_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(received_digest, expected_digest)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Hub-Signature-256', '')
    if not verify_signature(request.get_data(), signature):
        abort(403)
    # Process verified payload
    event = request.headers.get('X-GitHub-Event')
    payload = request.get_json()
    return {'received': True}, 200
```

---

## Step 5: Verify the Tunnel Ingress Configuration

Ensure your `cloudflared` tunnel config routes requests for `webhook.yourdomain.com` to your local application. Your tunnel configuration (either managed in the Cloudflare dashboard or via a local `config.yml`) should look similar to:

```yaml
# /etc/cloudflared/config.yml  (locally-managed tunnel)
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /root/.cloudflared/<YOUR_TUNNEL_ID>.json

ingress:
  - hostname: webhook.yourdomain.com
    service: http://localhost:3000   # or whichever port your app listens on
  - service: http_status:404
```

After updating, restart `cloudflared`:

```bash
sudo systemctl restart cloudflared
```

---

## Step 6: Test the Webhook

1. In GitHub, go to **Settings** > **Webhooks** and click your webhook.
2. Under **Recent Deliveries**, click **Redeliver** on any existing delivery (or push a commit to trigger one).
3. Inspect the delivery response - you should receive a `200` status with `{"received": true}`.
4. Check your VPS application logs to confirm the payload was received and the HMAC signature was verified.

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Anyone can POST to `/webhook` since Access is bypassed | HMAC secret validation rejects all unsigned or incorrectly-signed requests with a `403` |
| Secret exposure in environment | Store as a Docker/Compose secret or an OS-level environment variable; never commit to source control |
| Timing attacks on HMAC comparison | Use `crypto.timingSafeEqual` (Node) or `hmac.compare_digest` (Python) exclusively |
| Replay attacks | Optionally validate the `X-GitHub-Delivery` UUID for idempotency; GitHub also sends timestamps in some event types |
| Wildcard bypass | Scope the Bypass policy to the minimum path (`/webhook`) rather than the entire hostname |

---

## Optional: GitHub Actions Service Token Alternative

If you control the GitHub Actions workflow itself (rather than using GitHub's built-in webhook delivery), an alternative is to issue a **Cloudflare Access Service Token** and include `CF-Access-Client-Id` / `CF-Access-Client-Secret` headers in your workflow's `curl` or `fetch` calls. This allows the workflow to authenticate to Access directly without needing a Bypass rule.

```yaml
# .github/workflows/deploy.yml
- name: Notify VPS
  run: |
    curl -X POST https://webhook.yourdomain.com/deploy \
      -H "CF-Access-Client-Id: ${{ secrets.CF_ACCESS_CLIENT_ID }}" \
      -H "CF-Access-Client-Secret: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}" \
      -H "Content-Type: application/json" \
      -d '{"ref": "${{ github.ref }}"}'
```

To create a service token:

1. **Zero Trust** > **Access** > **Service Auth** > **Service Tokens** > **Create Service Token**.
2. Copy the `Client ID` and `Client Secret` - the secret is only shown once.
3. Add both as **GitHub repository or organization secrets**.
4. Update your Access application policy to include a `non_identity` rule matching the service token.

This approach keeps Access enforcement active (no Bypass) and is preferred when you own the upstream caller.

---

## References

- [Cloudflare Access Policies - Bypass action](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/#bypass)
- [Cloudflare Tunnel documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Cloudflare Access Service Tokens](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/)
- [GitHub - Validating webhook deliveries](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)
- [GitHub - Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
