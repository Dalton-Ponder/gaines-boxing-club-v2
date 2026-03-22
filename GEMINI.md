# Gaines Boxing Club V2 -- AI Agent Instructions

## Living Documentation: Payload CMS Integration Guide

The file `docs/payload-cms-integration-guide.md` is a **living document** that must be kept accurate and current as work continues on the Payload CMS integration.

### Rules

1. **Update on every relevant change.** Any time you make a modification that relates to Payload CMS, the PostgreSQL database, Docker configuration, environment variables, or schema isolation, you must update the guide to reflect the change.

2. **What counts as a relevant change:**
   - Adding, removing, or modifying Payload collections, globals, or plugins in `payload.config.ts`
   - Changing `postgresAdapter` options (connection, schema, push/migration settings)
   - Updating `next.config.ts` in ways that affect Payload (e.g., `withPayload` options)
   - Modifying Docker Compose files, Dockerfile build stages, or container commands
   - Adding or changing environment variables consumed by Payload
   - Encountering and resolving new errors (add to the Troubleshooting section)
   - Changing the migration strategy (push vs. migration files)
   - Onboarding a new project to the shared database (add its schema to the convention table)
   - Implementing a new collection or global that could be reusable across projects

3. **How to update:**
   - Add new sections or subsections as needed. Do not remove existing content unless it is factually incorrect.
   - Append a row to the **Change Log** table at the bottom of the guide with the date and a brief description of what changed.
   - If a troubleshooting issue is resolved by a code change, document both the problem and the fix.

4. **Schema naming convention.** All Payload CMS projects sharing a database use the pattern `[tenantId]__cms` for their `schemaName`. Do not deviate from this convention without explicit user approval.

5. **Accuracy over brevity.** The guide is a reference for onboarding future projects. Include exact commands, SQL statements, and config snippets. Do not use vague placeholders when concrete values are known.

6. **Track reusable collections.** When implementing a new Payload collection, global, or plugin, classify it using the rules in the **Reusable vs. Project-Specific Collections** section of the guide:
   - If it is domain-agnostic (e.g., `hero`, `blog`, `navigation`, `seo`), add it to the Reusable Collections Registry.
   - If it is unique to the current project's domain (e.g., `trainers`, `classes`, `programs` for a boxing gym), add it to the Project-Specific Collections Registry.
   - Never omit this step. The registry is the mechanism for propagating common content models to new projects.

---

## Payload CMS REST API Access

The local Payload CMS instance at `http://localhost:3000` exposes a full REST API. The API key is stored in the project's `.env` file (gitignored) under the `PAYLOAD_MCP_API_KEY` variable. See `website/.env.example` for reference.

### Rules

1. **Use the environment variable for all local API calls.** Every request to `http://localhost:3000/api/...` must include the header:

   ```
   Authorization: Bearer $PAYLOAD_MCP_API_KEY
   ```

2. **Prefer the REST API over browser automation** when creating, updating, or seeding content. Use `Invoke-RestMethod` in PowerShell or `curl` commands.

3. **Common endpoints:**
   - `GET    /api/<collection>` -- list documents
   - `POST   /api/<collection>` -- create a document
   - `PATCH  /api/<collection>/<id>` -- update a document
   - `DELETE /api/<collection>/<id>` -- delete a document
   - `POST   /api/media` -- upload a file (multipart/form-data)

4. **Base URL is always `http://localhost:3000`** for the local development environment. Do not hardcode a production URL.
