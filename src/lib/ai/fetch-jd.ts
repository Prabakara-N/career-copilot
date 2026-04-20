import * as cheerio from "cheerio";

export type FetchedJd = {
  url: string;
  source: "greenhouse" | "lever" | "ashby" | "html";
  title?: string;
  company?: string;
  location?: string;
  jdText: string;
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; CareerOpsBot/0.1; +https://career-ops.local)";

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/json" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status} ${res.statusText}`);
  return res.text();
}

function htmlToText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, header, footer, nav, svg").remove();
  return $("body").text().replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchGreenhouse(url: string): Promise<FetchedJd | null> {
  const m = url.match(/(?:boards|job-boards)\.greenhouse\.io\/([^/]+)\/jobs\/(\d+)/i);
  if (!m) return null;
  const [, board, jobId] = m;
  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}`;
  const json = JSON.parse(await fetchText(apiUrl));
  const html = json.content as string;
  return {
    url,
    source: "greenhouse",
    title: json.title,
    company: json.company_name ?? board,
    location: json.location?.name,
    jdText: htmlToText(`<body>${html}</body>`),
  };
}

async function fetchLever(url: string): Promise<FetchedJd | null> {
  const m = url.match(/jobs\.lever\.co\/([^/]+)\/([0-9a-f-]+)/i);
  if (!m) return null;
  const [, company, jobId] = m;
  const apiUrl = `https://api.lever.co/v0/postings/${company}/${jobId}`;
  const json = JSON.parse(await fetchText(apiUrl));
  const desc = json.descriptionPlain ?? json.description ?? "";
  const lists = (json.lists ?? [])
    .map((l: { text?: string; content: string }) => `${l.text ?? ""}\n${l.content}`)
    .join("\n\n");
  return {
    url,
    source: "lever",
    title: json.text,
    company,
    location: json.categories?.location,
    jdText: htmlToText(`<body>${desc}\n\n${lists}\n\n${json.additional ?? ""}</body>`),
  };
}

async function fetchAshby(url: string): Promise<FetchedJd | null> {
  const m = url.match(/jobs\.ashbyhq\.com\/([^/]+)\/([0-9a-f-]+)/i);
  if (!m) return null;
  const [, org] = m;
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const title = $('h1, [class*="title"]').first().text().trim();
  return {
    url,
    source: "ashby",
    title,
    company: org,
    jdText: htmlToText(html),
  };
}

async function fetchGenericHtml(url: string): Promise<FetchedJd> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const title = $('meta[property="og:title"]').attr("content") ?? $("title").text();
  const company = $('meta[property="og:site_name"]').attr("content");
  return { url, source: "html", title, company, jdText: htmlToText(html) };
}

export async function fetchJobDescription(url: string): Promise<FetchedJd> {
  return (
    (await fetchGreenhouse(url).catch(() => null)) ??
    (await fetchLever(url).catch(() => null)) ??
    (await fetchAshby(url).catch(() => null)) ??
    (await fetchGenericHtml(url))
  );
}
