#!/usr/bin/env node
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const COURSEU_BASE_URL = "https://www.coursesu.com";
const DEFAULT_CATEGORY_URL = `${COURSEU_BASE_URL}/c/viandes-poissons`;

const COUNTRY_HINTS = new Set([
  "allemagne",
  "belgique",
  "espagne",
  "france",
  "irlande",
  "italie",
  "norvege",
  "norvège",
  "pays-bas",
  "portugal",
  "royaume-uni",
  "suisse",
]);

const UNIT_NAME_ALIASES = {
  box: ["boite", "boîte", "box"],
  tray: ["barquette", "plateau"],
  packet: ["paquet", "sachet"],
  piece: ["piece", "pièce", "unite", "unité"],
  gram: ["gramme", "grammes", "g"],
  kilogram: ["kilogramme", "kilogrammes", "kg"],
};

function textDecoder(value) {
  const input = String(value ?? "");
  return input
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&euro;/gi, "€")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function clean(value) {
  return textDecoder(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([,;:.])/g, "$1")
    .trim();
}

function stripTags(value) {
  return clean(String(value ?? "").replace(/<[^>]*>/g, " "));
}

function htmlLines(html) {
  return String(html ?? "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<(h[1-6]|p|li|br|div|section|article|nav|tr|td|th)\b[^>]*>/gi, "\n")
    .replace(/<\/(h[1-6]|p|li|div|section|article|nav|tr|td|th)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .split(/\n+/)
    .map(clean)
    .filter(Boolean);
}

function normalizeKey(value) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function numberFromFrench(value) {
  const match = String(value ?? "").match(/(\d+(?:[\s.,]\d+)?)/);
  if (!match) return 0;
  return Number(match[1].replace(/\s/g, "").replace(",", "."));
}

function absoluteCourseUUrl(raw, baseUrl = DEFAULT_CATEGORY_URL) {
  try {
    return new URL(String(raw || ""), baseUrl).toString();
  } catch {
    return "";
  }
}

function extractCourseUId(url) {
  const match = String(url || "").match(/\/(\d+)\.html(?:[?#].*)?$/);
  return match ? match[1] : "";
}

function cleanProductLinkLabel(labelInput) {
  let label = clean(labelInput)
    .replace(/☆+/g, " ")
    .replace(/\b\d+\s+avis\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (label.length > 12 && label.length % 2 === 0) {
    const half = label.slice(0, label.length / 2).trim();
    if (half && normalizeKey(half) === normalizeKey(label.slice(label.length / 2))) {
      label = half;
    }
  }
  const repeated = label.match(/^(.{12,}?)\s+\1\b/i);
  if (repeated) label = clean(repeated[1]);
  return label;
}

function firstHeading(html, tagName = "h1") {
  const re = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = String(html ?? "").match(re);
  return match ? stripTags(match[1]) : "";
}

function parseNetWeight(text) {
  const input = clean(text);
  const multiPack = input.match(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml)\b/i);
  if (multiPack) {
    const count = Number(multiPack[1]);
    const amount = Number(multiPack[2].replace(",", "."));
    const unit = multiPack[3].toLowerCase();
    if (unit === "kg") return { grams: count * amount * 1000, sourceText: clean(multiPack[0]) };
    if (unit === "g") return { grams: count * amount, sourceText: clean(multiPack[0]) };
    if (unit === "l") return { milliliters: count * amount * 1000, sourceText: clean(multiPack[0]) };
    if (unit === "ml") return { milliliters: count * amount, sourceText: clean(multiPack[0]) };
  }
  const simple = input.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml)\b/i);
  if (!simple) return null;
  const amount = Number(simple[1].replace(",", "."));
  const unit = simple[2].toLowerCase();
  if (unit === "kg") return { grams: amount * 1000, sourceText: clean(simple[0]) };
  if (unit === "g") return { grams: amount, sourceText: clean(simple[0]) };
  if (unit === "l") return { milliliters: amount * 1000, sourceText: clean(simple[0]) };
  if (unit === "ml") return { milliliters: amount, sourceText: clean(simple[0]) };
  return null;
}

function parseTitleParts(title) {
  const parts = String(title || "").split(",").map(clean).filter(Boolean);
  const baseName = parts[0] || clean(title);
  let brand = "";
  let origin = "";
  const packageParts = [];
  for (const part of parts.slice(1)) {
    const key = normalizeKey(part);
    if (!origin && COUNTRY_HINTS.has(key)) {
      origin = part;
      continue;
    }
    if (!brand && !parseNetWeight(part) && !/(box|bo[iî]te|barquette|sachet|paquet|lot|x\s*\d+)/i.test(part)) {
      brand = part;
      continue;
    }
    packageParts.push(part);
  }
  return {
    baseName,
    brand,
    origin,
    packageText: packageParts.join(", "),
  };
}

function lineAfterLabel(lines, labelPattern) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!labelPattern.test(line)) continue;
    const inline = line.split(":").slice(1).join(":").trim();
    if (inline) return clean(inline);
    return clean(lines[index + 1] || "");
  }
  return "";
}

function sectionBetween(lines, startPattern, endPatterns = []) {
  const start = lines.findIndex((line) => startPattern.test(line));
  if (start < 0) return "";
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (endPatterns.some((pattern) => pattern.test(lines[index]))) {
      end = index;
      break;
    }
  }
  return clean(lines.slice(start + 1, end).join(" "));
}

function extractNutrition(lines) {
  const joined = lines.join("\n");
  const kcalMatch = joined.match(/(\d+(?:[.,]\d+)?)\s*kcal/i);
  const nutrition = {};
  const labels = [
    ["fat", /mati[eè]res grasses/i],
    ["saturatedFat", /acides gras satur[eé]s/i],
    ["carbohydrates", /glucides/i],
    ["sugars", /sucres/i],
    ["proteins", /prot[eé]ines/i],
    ["salt", /sel/i],
  ];
  for (let index = 0; index < lines.length; index += 1) {
    for (const [key, pattern] of labels) {
      if (!pattern.test(lines[index]) || nutrition[key]) continue;
      const valueLine = lines[index + 1] || "";
      const value = numberFromFrench(valueLine);
      if (value > 0) nutrition[key] = value;
    }
  }
  return {
    kcalPer100g: kcalMatch ? numberFromFrench(kcalMatch[0]) : 0,
    nutrition,
  };
}

function extractVisiblePrice(html) {
  const pageText = stripTags(html);
  if (/besoin de conna[iî]tre votre magasin|afficher les prix|afficher le prix|choisir mon magasin/i.test(pageText)) {
    return null;
  }
  const match = pageText.match(/(?:^|\s)(\d{1,3}(?:[,.]\d{2}))\s*€/);
  if (!match) return null;
  return { amount: Number(match[1].replace(",", ".")), currency: "EUR", source: "visible_courseu_page" };
}

function findCatalogByName(rows, aliases) {
  const wanted = (Array.isArray(aliases) ? aliases : [aliases]).map(normalizeKey).filter(Boolean);
  return (rows || []).find((row) => {
    const name = normalizeKey(row?.name);
    return wanted.some((alias) => name === alias || name.includes(alias));
  }) || null;
}

function groupForProduct(product, catalog) {
  const text = normalizeKey([
    product.name,
    product.categoryPath?.join(" "),
    product.legalName,
    product.description,
  ].join(" "));
  if (/\b(poulet|volaille|dinde|canard|pintade)\b/.test(text)) {
    return findCatalogByName(catalog.groups, ["Volailles"]) || findCatalogByName(catalog.groups, ["Produits non classes"]);
  }
  if (/\b(poisson|saumon|cabillaud|thon|truite|merlan|colin|crevette)\b/.test(text)) {
    return findCatalogByName(catalog.groups, ["Poissons frais"]) || findCatalogByName(catalog.groups, ["Produits non classes"]);
  }
  if (/\b(steak|nugget|pane|burger|jambon|saucisse|cordon|terrine|rillette)\b/.test(text)) {
    return findCatalogByName(catalog.groups, ["Produits carnes transformes"]) || findCatalogByName(catalog.groups, ["Produits non classes"]);
  }
  if (/\b(boeuf|bœuf|porc|veau|agneau|boucherie)\b/.test(text)) {
    return findCatalogByName(catalog.groups, ["Viandes rouges"]) || findCatalogByName(catalog.groups, ["Produits non classes"]);
  }
  return findCatalogByName(catalog.groups, ["Produits non classes"]) || null;
}

function unitId(catalog, aliasKey) {
  const aliases = UNIT_NAME_ALIASES[aliasKey] || [aliasKey];
  return findCatalogByName(catalog.units, aliases)?.id || 0;
}

function purchaseUnitId(product, catalog) {
  const text = normalizeKey(`${product.packageText || ""} ${product.name || ""}`);
  if (/\b(box|boite)\b/.test(text)) return unitId(catalog, "box") || unitId(catalog, "piece");
  if (/\bbarquette\b/.test(text)) return unitId(catalog, "tray") || unitId(catalog, "piece");
  if (/\b(paquet|sachet)\b/.test(text)) return unitId(catalog, "packet") || unitId(catalog, "piece");
  return unitId(catalog, "piece");
}

function stockUnitId(product, catalog) {
  if (product.netWeight?.grams > 0) return unitId(catalog, "gram") || unitId(catalog, "piece");
  if (product.netWeight?.milliliters > 0) return findCatalogByName(catalog.units, ["Millilitre", "Litre"])?.id || unitId(catalog, "piece");
  return unitId(catalog, "piece");
}

function locationForProduct(product, catalog) {
  const text = normalizeKey(`${product.name || ""} ${product.description || ""} ${product.conservation || ""}`);
  if (/\b(surgele|congele|congelateur)\b/.test(text)) {
    return findCatalogByName(catalog.locations, ["Congelateur", "Congelateur coffre"]);
  }
  if (/\b(0 c|4 c|frais|frigo|refrigerateur|viande|poisson|poulet|volaille)\b/.test(text)) {
    return findCatalogByName(catalog.locations, ["Frigo"]);
  }
  return findCatalogByName(catalog.locations, ["Placart", "Etagere", "Epicerie"]) || null;
}

function formatQuantity(product) {
  if (product.netWeight?.grams > 0) {
    return `${Number(product.netWeight.grams).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}g`;
  }
  if (product.netWeight?.milliliters > 0) {
    return `${Number(product.netWeight.milliliters).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}ml`;
  }
  return "";
}

function productDisplayName(product) {
  const parts = parseTitleParts(product.name);
  const brand = product.brand || parts.brand;
  const quantity = formatQuantity(product);
  return [parts.baseName, brand, quantity].map(clean).filter(Boolean).join(" - ");
}

function buildDescription(product) {
  const lines = [];
  if (product.description) {
    lines.push("Description");
    lines.push(product.description);
  }
  if (product.legalName) {
    lines.push("");
    lines.push(`Denomination legale : ${product.legalName}`);
  }
  if (product.ingredients) {
    lines.push("");
    lines.push(`Ingredients : ${product.ingredients}`);
  }
  if (product.nutriscore) lines.push(`Nutri-score : ${product.nutriscore}`);
  if (product.kcalPer100g > 0) lines.push(`Calories : ${product.kcalPer100g} kcal / 100 g`);
  if (product.conservation) {
    lines.push("");
    lines.push(`Conservation : ${product.conservation}`);
  }
  lines.push("");
  lines.push(`Source : Course U ${product.url}`);
  if (product.visiblePrice) {
    lines.push(`Prix visible : ${product.visiblePrice.amount.toFixed(2)} ${product.visiblePrice.currency}`);
  }
  return lines.map(clean).filter(Boolean).join("\n").replace(/^Source: Course U/m, "Source : Course U");
}

export function extractCourseUCategory(html, categoryUrl = DEFAULT_CATEGORY_URL) {
  const title = firstHeading(html) || "Course U";
  const subcategories = [];
  const products = [];
  const seenSub = new Set();
  const seenProducts = new Set();
  const linkRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRe.exec(String(html || "")))) {
    const url = absoluteCourseUUrl(match[1], categoryUrl);
    const label = cleanProductLinkLabel(stripTags(match[2]));
    if (!url || !label) continue;
    if (/\/p\//.test(url) && /\.html(?:[?#].*)?$/.test(url)) {
      const courseUId = extractCourseUId(url);
      if (!courseUId || seenProducts.has(courseUId)) continue;
      seenProducts.add(courseUId);
      products.push({ label, url, courseUId });
      continue;
    }
    if (/\/c\/viandes-poissons(?:\/|$)/.test(url) && url.replace(/\/$/, "") !== categoryUrl.replace(/\/$/, "")) {
      const key = normalizeKey(`${url} ${label}`);
      if (seenSub.has(key)) continue;
      seenSub.add(key);
      subcategories.push({ label, url });
    }
  }
  return { title, url: categoryUrl, subcategories, products };
}

export function parseCourseUProductPage(html, url) {
  const lines = htmlLines(html);
  const title = firstHeading(html) || clean((String(html || "").match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  if (/sorry\s*-\s*you have been blocked|you have been blocked/i.test(`${title}\n${lines.slice(0, 8).join("\n")}`)) {
    return {
      source: "courseu",
      url,
      courseUId: extractCourseUId(url),
      name: title || "Course U product page blocked",
      blocked: true,
      error: "Course U product page blocked during dry-run.",
      visiblePrice: null,
    };
  }
  const titleParts = parseTitleParts(title);
  const weightFromLabel = parseNetWeight(lineAfterLabel(lines, /poids net/i));
  const netWeight = weightFromLabel || parseNetWeight(title) || null;
  const nutrition = extractNutrition(lines);
  const categoryPath = lines.filter((line) => /^(Accueil|Viandes|Boucherie|Volaille|Poisson|Traiteur|Surgel)/i.test(line));
  const nutriMatch = String(html || "").match(/nutri[-\s]?score\s*([A-E])/i);
  return {
    source: "courseu",
    url,
    courseUId: extractCourseUId(url),
    name: title,
    brand: titleParts.brand,
    subBrand: "",
    origin: titleParts.origin,
    packageText: titleParts.packageText || (netWeight?.sourceText || ""),
    categoryPath,
    description: sectionBetween(lines, /^description$/i, [/^informations compl/i, /^ingredients$/i, /^ingr[eé]dients$/i, /^valeurs nutritionnelles$/i]),
    legalName: lineAfterLabel(lines, /d[eé]nomination l[eé]gale/i),
    netWeight,
    ingredients: sectionBetween(lines, /^ingr[eé]dients$/i, [/^valeurs nutritionnelles$/i, /^conseils$/i, /^instruction de conservation$/i]),
    nutriscore: nutriMatch ? nutriMatch[1].toUpperCase() : "",
    kcalPer100g: nutrition.kcalPer100g,
    nutrition: nutrition.nutrition,
    conservation: sectionBetween(lines, /instruction de conservation/i, [/^contacts?$/i, /^source$/i]),
    visiblePrice: extractVisiblePrice(html),
    imageUrl: (String(html || "").match(/<img\b[^>]*(?:src|data-src)=["']([^"']+)["'][^>]*>/i) || [])[1] || "",
  };
}

export function detectCourseUDuplicate(product, catalog = {}) {
  const courseUId = clean(product.courseUId);
  const productUrl = clean(product.url);
  if (courseUId || productUrl) {
    const byCourseUUrl = (catalog.products || []).find((row) => {
      const description = String(row?.description || "");
      return (courseUId && new RegExp(`/${courseUId}\\.html\\b`).test(description))
        || (productUrl && description.includes(productUrl));
    });
    if (byCourseUUrl) return { kind: "courseu_url", productId: Number(byCourseUUrl.id || 0), productName: byCourseUUrl.name || "" };
  }

  const wantedName = normalizeKey(productDisplayName(product));
  const byName = (catalog.products || []).find((row) => normalizeKey(row?.name) === wantedName);
  if (byName) return { kind: "normalized_name", productId: Number(byName.id || 0), productName: byName.name || "" };

  const barcode = clean(product.barcode || product.gtin || "");
  if (barcode) {
    const byBarcode = (catalog.barcodes || []).find((row) => clean(row?.barcode) === barcode);
    if (byBarcode) return { kind: "barcode", productId: Number(byBarcode.product_id || byBarcode.productId || 0), productName: "" };
  }
  return null;
}

export function buildGrocyProductProposal(product, catalog = {}) {
  if (product?.blocked) {
    return {
      id: product.courseUId || normalizeKey(product.url || product.name),
      source: "courseu",
      sourceUrl: product.url,
      courseUId: product.courseUId,
      status: "error",
      duplicate: null,
      confidence: 0,
      productId: 0,
      reasons: ["courseu_page_blocked"],
      productPayload: {
        name: product.name || "Course U product page blocked",
        description: `Source : Course U ${product.url || ""}\nErreur : ${product.error || "page blocked"}`.trim(),
        product_group_id: 0,
        qu_id_stock: 0,
        qu_id_purchase: 0,
        location_id: 0,
        shopping_location_id: 0,
        calories: 0,
        active: 1,
      },
      userfields: {
        Marque: "",
        Sous_marque: "",
        origine: "",
        parent: "0",
      },
      conversions: [],
      sourceProduct: product,
      error: product.error || "Course U product page blocked during dry-run.",
    };
  }
  const duplicate = detectCourseUDuplicate(product, catalog);
  const group = groupForProduct(product, catalog);
  const stockQuId = stockUnitId(product, catalog);
  const purchaseQuId = purchaseUnitId(product, catalog);
  const location = locationForProduct(product, catalog);
  const shoppingLocation = findCatalogByName(catalog.shoppingLocations || catalog.shopping_locations, ["Super U - Magasin", "Super U"]);
  const grams = Number(product.netWeight?.grams || 0);
  const conversions = [];
  if (grams > 0 && stockQuId > 0 && purchaseQuId > 0 && purchaseQuId !== stockQuId) {
    conversions.push({ from_qu_id: purchaseQuId, to_qu_id: stockQuId, factor: grams });
    conversions.push({ from_qu_id: stockQuId, to_qu_id: purchaseQuId, factor: 1 / grams });
  }
  const confidence = [
    product.name ? 0.2 : 0,
    product.brand ? 0.15 : 0,
    product.netWeight ? 0.15 : 0,
    group ? 0.15 : 0,
    stockQuId ? 0.1 : 0,
    purchaseQuId ? 0.1 : 0,
    product.legalName || product.ingredients ? 0.1 : 0,
    product.url ? 0.1 : 0,
  ].reduce((sum, value) => sum + value, 0);
  return {
    id: product.courseUId || normalizeKey(product.url || product.name),
    source: "courseu",
    sourceUrl: product.url,
    courseUId: product.courseUId,
    status: duplicate ? "duplicate" : "review",
    duplicate,
    confidence: Math.min(0.99, Number(confidence.toFixed(2))),
    productId: duplicate?.productId || 0,
    reasons: [
      product.name ? "nom_courseu" : "",
      product.brand ? "marque_courseu" : "",
      product.netWeight ? "quantite_courseu" : "",
      group ? "groupe_grocy" : "",
      duplicate ? `doublon_${duplicate.kind}` : "",
    ].filter(Boolean),
    productPayload: {
      name: productDisplayName(product),
      description: buildDescription(product),
      product_group_id: Number(group?.id || 0),
      qu_id_stock: Number(stockQuId || 0),
      qu_id_purchase: Number(purchaseQuId || 0),
      location_id: Number(location?.id || 0),
      shopping_location_id: Number(shoppingLocation?.id || 0),
      calories: product.kcalPer100g > 0 && grams > 0 ? Number((product.kcalPer100g / 100).toFixed(4)) : 0,
      active: 1,
    },
    userfields: {
      Marque: product.brand || "",
      Sous_marque: product.subBrand || "",
      origine: product.origin || "",
      parent: "0",
    },
    conversions,
    sourceProduct: product,
  };
}

export function buildCourseUImportState({ categoryUrl = DEFAULT_CATEGORY_URL, products = [], catalog = {}, mode = "dry-run" } = {}) {
  const generatedAt = new Date().toISOString();
  const items = products.map((product) => {
    const proposal = buildGrocyProductProposal(product, catalog);
    return {
      ...proposal,
      status: ["duplicate", "error", "skipped", "created"].includes(proposal.status) ? proposal.status : "review",
      productId: proposal.duplicate?.productId || 0,
      createdAt: "",
      updatedAt: generatedAt,
    };
  });
  const summary = {
    total: items.length,
    created: items.filter((item) => item.status === "created").length,
    duplicate: items.filter((item) => item.status === "duplicate").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    review: items.filter((item) => item.status === "review").length,
    errors: items.filter((item) => item.status === "error").length,
  };
  return {
    schemaVersion: 1,
    mode: mode === "apply" ? "apply" : "dry-run",
    categoryUrl,
    generatedAt,
    source: "Course U",
    secretPolicy: "Only product candidates and public source URLs are stored in this ledger.",
    summary,
    items,
  };
}

async function fetchText(url, { storageStatePath = "" } = {}) {
  const cookieHeader = await cookieHeaderForUrl(url, storageStatePath);
  const response = await fetch(url, {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "fr-FR,fr;q=0.9,en;q=0.6",
      "user-agent": "ProductHelper CourseU dry-run importer",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status} for ${url}`);
  return response.text();
}

async function loadPlaywright(playwrightRoot = "") {
  const require = createRequire(import.meta.url);
  const paths = [process.cwd()];
  if (playwrightRoot) paths.unshift(path.resolve(playwrightRoot));
  const resolved = require.resolve("playwright", { paths });
  return import(pathToFileURL(resolved).href);
}

async function createPlaywrightFetcher({ storageStatePath = "", playwrightRoot = "" } = {}) {
  const playwright = await loadPlaywright(playwrightRoot);
  const chromium = playwright.chromium || playwright.default?.chromium;
  if (!chromium) throw new Error("Playwright chromium is not available");
  const browser = await chromium.launch({ headless: true });
  const contextOptions = {
    locale: "fr-FR",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  };
  if (storageStatePath && existsSync(storageStatePath)) {
    contextOptions.storageState = storageStatePath;
  }
  const context = await browser.newContext(contextOptions);
  return {
    async fetch(url) {
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(800);
        return await page.content();
      } finally {
        await page.close().catch(() => {});
      }
    },
    async close() {
      await browser.close().catch(() => {});
    },
  };
}

async function cookieHeaderForUrl(url, storageStatePath) {
  if (!storageStatePath || !existsSync(storageStatePath)) return "";
  const raw = await fs.readFile(storageStatePath, "utf8");
  const parsed = JSON.parse(raw);
  const target = new URL(url);
  const cookies = Array.isArray(parsed.cookies) ? parsed.cookies : [];
  return cookies
    .filter((cookie) => {
      const domain = String(cookie.domain || "").replace(/^\./, "");
      return domain && target.hostname.endsWith(domain);
    })
    .map((cookie) => `${encodeURIComponent(cookie.name)}=${encodeURIComponent(cookie.value)}`)
    .join("; ");
}

async function readCatalog(catalogPath) {
  if (!catalogPath) return {};
  const raw = await fs.readFile(catalogPath, "utf8");
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, ""));
  return parsed && typeof parsed === "object" ? parsed : {};
}

async function crawlCategoryDryRun({ categoryUrl, storageStatePath, limit, outPath, catalogPath, playwrightRoot }) {
  const catalog = await readCatalog(catalogPath);
  let browserFetcher = null;
  const loadHtml = async (url) => {
    try {
      return await fetchText(url, { storageStatePath });
    } catch (error) {
      if (!browserFetcher) {
        browserFetcher = await createPlaywrightFetcher({ storageStatePath, playwrightRoot });
      }
      return browserFetcher.fetch(url);
    }
  };
  const categoryHtml = await loadHtml(categoryUrl);
  const category = extractCourseUCategory(categoryHtml, categoryUrl);
  const productLinks = category.products.slice(0, Math.max(1, limit || 10));
  const products = [];
  try {
    for (const link of productLinks) {
      const html = await loadHtml(link.url);
      const product = parseCourseUProductPage(html, link.url);
      if (product.blocked && link.label) {
        product.name = link.label;
      }
      products.push(product);
    }
  } finally {
    if (browserFetcher) await browserFetcher.close();
  }
  const state = buildCourseUImportState({
    categoryUrl,
    products,
    catalog,
    mode: "dry-run",
  });
  const payload = JSON.stringify({
    ...state,
    category,
    note: "Dry-run generated without writing to Grocy.",
  }, null, 2);
  if (outPath) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, payload, "utf8");
  }
  return state;
}

function parseArgs(argv) {
  const args = { command: "", categoryUrl: DEFAULT_CATEGORY_URL, storageStatePath: "", outPath: "", catalogPath: "", playwrightRoot: "", limit: 10 };
  const rest = [...argv];
  args.command = rest.shift() || "dry-run";
  while (rest.length) {
    const key = rest.shift();
    const value = rest.shift();
    if (key === "--category-url") args.categoryUrl = value || args.categoryUrl;
    else if (key === "--storage-state") args.storageStatePath = value || "";
    else if (key === "--out") args.outPath = value || "";
    else if (key === "--catalog") args.catalogPath = value || "";
    else if (key === "--playwright-root") args.playwrightRoot = value || "";
    else if (key === "--limit") args.limit = Number(value || 10);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command !== "dry-run") {
    throw new Error("Only dry-run is supported by this CLI. Apply is performed from the ProductHelper UI after review.");
  }
  const state = await crawlCategoryDryRun(args);
  console.log(JSON.stringify({
    ok: true,
    mode: state.mode,
    categoryUrl: state.categoryUrl,
    summary: state.summary,
    out: args.outPath || "",
  }, null, 2));
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.basename(process.argv[1]) === path.basename(thisFile)) {
  main().catch((error) => {
    console.error(error?.message || error);
    process.exit(1);
  });
}
