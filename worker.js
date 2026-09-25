// worker.js
// The whole server. Read it before you deploy it.
//
// One function. Cloudflare calls it with every request that reaches the
// deployed workers.dev URL and sends back whatever Response is returned.
//
// Four things to recognize here, because they show up again in code I did
// not write later in the course:
// env.DB          the D1 binding from wrangler.toml (no connection string, nothing to leak)
// bind(?)         the user's value goes in as a parameter, never pasted into the SQL
// status 400      the EARS "unwanted behavior" row, executable
// CORS headers    tell the browser the page is allowed to call this Worker
// Session B leaves this at "*" so everyone's page works on the first try.
// Craft credit for HW4 is replacing "*" with the page's real origin once deployed.

const CORS = {
  "access-control-allow-origin": "https://super-pancake-jrq4j6xq5ggvc5qpp-5501.app.github.dev",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export default {
  async fetch(request, env) {
    // Anything that throws below becomes a readable 500 instead of a bare
    // "Error 1101: Worker threw exception." The message names the cause,
    // which is what the verification table needs.
    try {
      return await handle(request, env);
    } catch (err) {
      return new Response("server error: " + err.message, { status: 500, headers: CORS });
    }
  },
};

async function handle(request, env) {
  const url = new URL(request.url);

  // Browsers send an OPTIONS "preflight" before a JSON POST from another
  // origin. Answer it with the CORS headers and nothing else.
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // The most common Session B failure: the D1 binding did not attach
  // because wrangler.toml still says PASTE_ID_HERE or the id was pasted badly.
  if (!env.DB) {
    return new Response(
      "server error: no D1 binding. Check database_id in wrangler.toml and redeploy.",
      { status: 500, headers: CORS });
  }

  if (request.method === "GET" && url.pathname === "/entries") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM evidence ORDER BY id").all();
    return Response.json(results, { headers: CORS });
  }

  if (request.method === "POST" && url.pathname === "/entries") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("body must be JSON", { status: 400, headers: CORS });
    }

    const pathId = typeof body.pathId === "string" ? body.pathId.trim() : "";
    const skillName = typeof body.skillName === "string" ? body.skillName.trim() : "";
    const evidenceText = typeof body.evidenceText === "string" ? body.evidenceText.trim() : "";

    if (!pathId || !skillName) {
      return new Response("pathId and skillName are required", { status: 400, headers: CORS });
    }

    // HW4 Part 3 validation rule. This traces to AC-8 in FEATURES.md:
    // "IF the evidence text is missing or longer than 200 characters,
    // THEN THE SYSTEM SHALL reject the request with a 400 status and a
    // message naming the problem." The client already checks this before
    // sending; the server checks it again because a request can reach this
    // Worker without going through the page at all.
    const characterCount = Array.from(evidenceText).length;
    if (characterCount < 1 || characterCount > 200) {
      return new Response("evidence text must be 1 to 200 characters", { status: 400, headers: CORS });
    }

    await env.DB.prepare(
      "INSERT INTO evidence (path_id, skill_name, evidence_text) VALUES (?, ?, ?)"
    ).bind(pathId, skillName, evidenceText).run();

    return new Response(null, { status: 201, headers: CORS });
  }

  return new Response("not found", { status: 404, headers: CORS });
}