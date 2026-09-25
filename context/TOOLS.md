# TOOLS.md

The ledger of Trust Boundary crossings. One row per external service this repository depends on. Read by the agent on every task, so this stays short: a service not in use does not belong here.

Never a credential in this file. A key, token, or password anywhere in the repository is graded as a security failure regardless of the rest.

| Service | Trusted with | Credentials live | Crossing statement | Switching cost |
|---|---|---|---|---|
| Cloudflare Workers + D1 | Every piece of evidence a student types, plus the path and skill it's attached to; request metadata (IP, timestamp) that Cloudflare logs by default, whether I asked for it or not | Cloudflare dashboard login; wrangler's login token, stored inside the Codespace, not in the repository | I send student-entered evidence text and the career path/skill it belongs to off my machine to D1 under Cloudflare's free-tier terms, in a region I did not pick. I am the one accountable for it, since no one else administers this database for me. | Medium: `wrangler d1 export` gets the data out, but I'd have to rewrite worker.js's queries for whatever host I moved to next. |
| GitHub + Codespaces | Source code, commit history, the devcontainer config, and the wrangler login token while a Codespace is running | GitHub account (SSO) | My repository, including this file and every ADR, lives on GitHub's servers. I trust GitHub with everything I commit, and I'm accountable for making sure nothing secret ends up in a commit in the first place. | Low: clone the repo elsewhere, no code changes needed. |
| GitHub Copilot | Everything open in the repository, used as context for its suggestions, including my STANDARDS.md and CLAUDE.md rules | GitHub account | Copilot reads my code and my context files to generate suggestions; I'm the one who decides whether to accept what it offers, which is why STANDARDS.md forbids things like string-concatenated SQL regardless of what Copilot proposes first. | Low: stop using the extension, nothing about the codebase depends on it running. |
| wrangler (npm) | The project's deploy commands and, through my login, the ability to create and modify my Cloudflare resources | The wrangler login token it generates, stored in the Codespace, never in this repository | I run wrangler's code on my machine every time I deploy or touch D1; I'm trusting its maintainers the same way any npm install trusts a package's maintainers, and I haven't personally audited it. | Medium: another CLI or the Cloudflare dashboard could replace it, but I'd have to relearn the deploy workflow. |

## Revisit triggers

- A new service is added to the repository.
- A vendor changes pricing, terms, or region.
- A credential moves.