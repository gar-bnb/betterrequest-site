var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-pZPqdv/functionsWorker-0.8700288043600295.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var json = /* @__PURE__ */ __name2((data, init = {}) => new Response(JSON.stringify(data), {
  status: 200,
  headers: { "Content-Type": "application/json" },
  ...init
}), "json");
var bad = /* @__PURE__ */ __name2((msg, status = 400) => json({ error: msg }, { status }), "bad");
function requireAdmin(req, env) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== env.ADMIN_TOKEN) throw new Error("Unauthorized");
}
__name(requireAdmin, "requireAdmin");
__name2(requireAdmin, "requireAdmin");
var onRequestPost = /* @__PURE__ */ __name2(async ({ request, env }) => {
  try {
    const body = await request.json();
    const useAi = (env.USE_AI || "false").toLowerCase() === "true";
    if (!useAi || !env.OPENAI_API_KEY) {
      const clues2 = body.locations.map((loc, i) => ({
        location: loc,
        text: `Riddle ${i + 1}: Seek the place called "${loc}" \u2014 look low, then high, and you will spy the hint you need.`
      }));
      return json({ clues: clues2, model: "template-fallback" });
    }
    const prompt = `Create short, family-friendly treasure-hunt clues for these locations: ${body.locations.join(
      ", "
    )}. Tone: ${body.style || "playful premium"}. Keep each 1-2 sentences.`;
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4.1-mini", input: prompt })
    });
    if (!res.ok) {
      const fallback = body.locations.map((loc, i) => ({ location: loc, text: `Clue ${i + 1} at ${loc}.` }));
      return json({ clues: fallback, model: "fallback-error" });
    }
    const data = await res.json();
    const text = data.output_text || "";
    const lines = text.split(/\n+/).map((s) => s.replace(/^[-•\d\.\s]+/, "").trim()).filter(Boolean);
    const clues = body.locations.map((loc, i) => ({
      location: loc,
      text: lines[i] || `Clue ${i + 1} at ${loc}.`
    }));
    return json({ clues, model: "gpt-4.1-mini" });
  } catch (e) {
    return bad(e?.message || "Bad request", 400);
  }
}, "onRequestPost");
var onRequestGet = /* @__PURE__ */ __name2(async ({ request, env }) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== env.ADMIN_TOKEN) return bad("Unauthorized", 401);
  const rows = ["id,ts,name,email,notes"];
  let cursor = void 0;
  do {
    const list = await env.BQ_HUNTS.list({ prefix: "lead:", cursor });
    for (const k of list.keys) {
      const v = await env.BQ_HUNTS.get(k.name, "json");
      if (v) rows.push(`${v.id},${v.ts},${csv(v.name)},${csv(v.email)},${csv(v.notes || "")}`);
    }
    cursor = list.list_complete ? void 0 : list.cursor;
  } while (cursor);
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=leads.csv"
    }
  });
}, "onRequestGet");
function csv(s) {
  if (s == null) return "";
  const needs = /[",\n]/.test(s);
  return needs ? `"${String(s).replace(/"/g, '""')}"` : String(s);
}
__name(csv, "csv");
__name2(csv, "csv");
var onRequestGet2 = /* @__PURE__ */ __name2(async ({ request, env }) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== env.ADMIN_TOKEN) return bad("Unauthorized", 401);
  const rows = ["ts,event,label,path,ua,ip,ref"];
  let cursor;
  do {
    const list = await env.BQ_HUNTS.list({ prefix: "metric:", cursor });
    for (const k of list.keys) {
      const v = await env.BQ_HUNTS.get(k.name, "json");
      if (v) {
        const csv2 = /* @__PURE__ */ __name2((s) => {
          if (s == null) return "";
          const str = String(s);
          return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        }, "csv");
        rows.push([v.ts, v.event, v.label, v.path, v.ua, v.ip, v.ref].map(csv2).join(","));
      }
    }
    cursor = list.list_complete ? void 0 : list.cursor;
  } while (cursor);
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=metrics.csv"
    }
  });
}, "onRequestGet");
var onRequestGet3 = /* @__PURE__ */ __name2(async ({ params, env }) => {
  const id = params?.id;
  const raw = await env.BQ_HUNTS.get(`hunt:${id}`);
  if (!raw) return bad("Not found", 404);
  return json(JSON.parse(raw));
}, "onRequestGet");
var onRequestGet4 = /* @__PURE__ */ __name2(async ({ request, params, env }) => {
  try {
    const tagId = params?.tagId || "qr";
    const url = new URL(request.url);
    const groupId = url.searchParams.get("g");
    const huntId = url.searchParams.get("h");
    if (!groupId || !huntId) return bad("Missing g (group) or h (hunt)", 400);
    const huntRaw = await env.BQ_HUNTS.get(`hunt:${huntId}`);
    if (!huntRaw) return bad("Hunt not found", 404);
    const hunt = JSON.parse(huntRaw);
    const stateKey = `state:${huntId}:${groupId}`;
    const now = Date.now();
    const stateRaw = await env.BQ_STATES.get(stateKey);
    let state = stateRaw ? JSON.parse(stateRaw) : void 0;
    if (!state) {
      state = {
        groupId,
        huntId,
        progressIndex: 0,
        startedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const cooldownMs = (hunt.cooldownSeconds ?? 60) * 1e3;
    if (state.lastScanAt && now - Date.parse(state.lastScanAt) < cooldownMs) {
      const waitMs = cooldownMs - (now - Date.parse(state.lastScanAt));
      return json({
        status: "cooldown",
        waitMs,
        message: "Please wait before the next scan.",
        nextAllowedAt: new Date(Date.now() + waitMs).toISOString()
      });
    }
    const expectedClue = hunt.route[state.progressIndex];
    if (!expectedClue) {
      if (!state.completedAt) {
        state.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        await env.BQ_STATES.put(stateKey, JSON.stringify(state));
      }
      return json({
        status: "complete",
        message: "All clues have been completed.",
        index: state.progressIndex - 1,
        completedAt: state.completedAt
      });
    }
    const relaxedQRMode = tagId === "qr";
    const expectedTag = expectedClue.tagId ?? null;
    const tagMatches = relaxedQRMode || expectedTag === null || expectedTag === "" ? true : expectedTag === tagId;
    if (!tagMatches) {
      return json({
        status: "mismatch",
        expectedIndex: state.progressIndex,
        message: "Not the correct location yet."
      });
    }
    const revealed = expectedClue;
    state.progressIndex += 1;
    state.lastScanAt = (/* @__PURE__ */ new Date()).toISOString();
    const justCompleted = state.progressIndex >= hunt.route.length;
    if (justCompleted && !state.completedAt) {
      state.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      await env.BQ_STATES.put(`finish:${huntId}:${state.groupId}`, state.completedAt);
    }
    await env.BQ_STATES.put(stateKey, JSON.stringify(state));
    return json({
      status: justCompleted ? "complete" : "ok",
      index: revealed.order,
      clue: { text: revealed.text, location: revealed.location },
      nextIndex: state.progressIndex,
      remaining: Math.max(0, hunt.route.length - state.progressIndex),
      completedAt: state.completedAt
    });
  } catch (e) {
    return bad(e?.message || "Scan failed", 500);
  }
}, "onRequestGet");
var onRequestPost2 = /* @__PURE__ */ __name2(async ({ request, env }) => {
  try {
    const payload = await request.json();
    if (typeof payload?.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      return bad("Invalid email", 400);
    }
    if (typeof payload?.type !== "string") {
      return bad("Missing type", 400);
    }
    const id = crypto.randomUUID();
    const record = {
      id,
      ...payload,
      ts: (/* @__PURE__ */ new Date()).toISOString()
    };
    await env.BQ_HUNTS.put(`lead:${id}`, JSON.stringify(record));
    if (env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `\u{1F4E9} New lead: ${record.email} (${record.type})`
          })
        });
      } catch (err) {
        console.error("Slack webhook failed", err);
      }
    }
    return json({ ok: true, id });
  } catch (e) {
    return bad(e?.message || "Invalid payload", 400);
  }
}, "onRequestPost");
var onRequestPost3 = /* @__PURE__ */ __name2(async ({ request, env }) => {
  try {
    const body = await request.json();
    const event = String(body?.event || "").trim();
    if (!event) return bad("Missing event", 400);
    const rec = {
      id: crypto.randomUUID(),
      ts: (/* @__PURE__ */ new Date()).toISOString(),
      event,
      label: typeof body?.label === "string" ? body.label.slice(0, 128) : void 0,
      path: typeof body?.path === "string" ? body.path : new URL(request.url).searchParams.get("p") || void 0,
      ua: request.headers.get("user-agent") || "",
      ip: request.headers.get("cf-connecting-ip") || "",
      ref: request.headers.get("referer") || ""
    };
    await env.BQ_HUNTS.put(`metric:${rec.ts}:${rec.id}`, JSON.stringify(rec), { expirationTtl: 60 * 60 * 24 * 30 });
    return json({ ok: true });
  } catch (e) {
    return bad(e?.message || "Bad request", 400);
  }
}, "onRequestPost");
async function listKeys(kv, prefix) {
  const out = [];
  let cursor = void 0;
  do {
    const r = await kv.list({ prefix, cursor });
    for (const k of r.keys) out.push(k.name.replace(prefix, ""));
    cursor = r.list_complete ? void 0 : r.cursor;
  } while (cursor);
  return out;
}
__name(listKeys, "listKeys");
__name2(listKeys, "listKeys");
var onRequest = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env } = ctx;
  if (request.method === "POST") return createHunt(ctx);
  if (request.method === "GET") {
    try {
      requireAdmin(request, env);
      const list = await listKeys(env.BQ_HUNTS, "hunt:");
      return json({ hunts: list });
    } catch {
      return bad("Unauthorized", 401);
    }
  }
  return bad("Method not allowed", 405);
}, "onRequest");
async function createHunt({ request, env }) {
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.route) || body.route.length === 0 || !body.route.every(
      (c) => typeof c?.location === "string" && c.location.trim().length > 0
    )) {
      return bad(
        "Route must be a non-empty array of clues with 'location' strings.",
        400
      );
    }
    const id = crypto.randomUUID().slice(0, 10);
    const config = {
      id,
      name: typeof body.name === "string" && body.name.trim().length > 0 ? body.name.trim() : "Untitled Hunt",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      template: body.template || null,
      route: body.route.map((c, i) => ({
        id: c.id || crypto.randomUUID().slice(0, 8),
        location: c.location.trim(),
        text: typeof c.text === "string" && c.text.trim().length > 0 ? c.text.trim() : `Clue ${i + 1}`,
        tagId: c.tagId || null,
        order: i
      })),
      cooldownSeconds: typeof body.cooldownSeconds === "number" && body.cooldownSeconds >= 0 && body.cooldownSeconds <= 3600 ? body.cooldownSeconds : 60,
      public: !!body.public
    };
    await env.BQ_HUNTS.put(`hunt:${id}`, JSON.stringify(config));
    return json({ ok: true, id });
  } catch (e) {
    return bad(e?.message || "Invalid payload", 400);
  }
}
__name(createHunt, "createHunt");
__name2(createHunt, "createHunt");
var onRequestGet5 = /* @__PURE__ */ __name2(async () => new Response("hello from pages functions", {
  headers: { "content-type": "text/plain" }
}), "onRequestGet");
var routes = [
  {
    routePath: "/api/ai/generate",
    mountPath: "/api/ai",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/export/leads",
    mountPath: "/api/export",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/export/metrics",
    mountPath: "/api/export",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/hunts/:id",
    mountPath: "/api/hunts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/scan/:tagId",
    mountPath: "/api/scan",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/lead",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/metrics",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/hunts",
    mountPath: "/api/hunts",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/hello",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../.nvm/versions/node/v22.18.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../.nvm/versions/node/v22.18.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-TGkRLJ/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../.nvm/versions/node/v22.18.0/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-TGkRLJ/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.8700288043600295.js.map
