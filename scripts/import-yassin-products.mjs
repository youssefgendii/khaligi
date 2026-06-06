/**
 * import-yassin-products.mjs
 *
 * Reads yassin/products.csv, groups the 50 images by product_code,
 * uploads ONE primary image per product to Supabase Storage,
 * then upserts ONE product row per unique product.
 *
 * Usage: yarn import:yassin
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const CSV_PATH = path.join(ROOT, "yassin", "products.csv");
const SOURCE_DIR = path.join(ROOT, "yassin");
const BUCKET = "products";
const DEFAULT_PRICE = 850;
const CATEGORY_NAME = "Women Fashion";
const CATEGORY_SLUG = "women-fashion";

// ── env ──────────────────────────────────────────────────────────────────────

function parseEnvFile(content) {
  const entries = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      if (i === -1) return null;
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
    .filter(Boolean);
  return Object.fromEntries(entries);
}

async function loadEnv() {
  const content = await fs.readFile(ENV_PATH, "utf8");
  const env = parseEnvFile(content);
  for (const [k, v] of Object.entries(env)) {
    if (!process.env[k]) process.env[k] = v;
  }
}

// ── slug ─────────────────────────────────────────────────────────────────────

function createSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── csv parsing ───────────────────────────────────────────────────────────────

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    // Simple CSV parse (no quoted commas in our file)
    const cols = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (cols[i] ?? "").trim();
    });
    return row;
  });
}

// ── timestamp extraction from filename ───────────────────────────────────────

function extractTimestamp(filename) {
  // "WhatsApp Image 2026-05-08 at 9.12.23 PM (1).jpeg" → "9.12.23_PM"
  const m = filename.match(/at\s+(\d+\.\d+\.\d+)\s+(AM|PM)/i);
  return m ? `${m[1]}_${m[2].toUpperCase()}` : null;
}

// An "original" shot has no parenthetical number, e.g. "9.12.07 PM.jpeg"
function isOriginal(filename) {
  return !/\(\d+\)/.test(filename);
}

// From a list of filenames, pick the best primary image.
// Prefer the original (no number suffix); fall back to the first in order.
function pickPrimary(filenames) {
  return filenames.find(isOriginal) ?? filenames[0];
}

// ── CSV → product groups ──────────────────────────────────────────────────────

function buildGroups(rows) {
  // Map: groupKey → { product_code, brand, images: string[] }
  const codeGroups = new Map();       // keyed by product_code
  const timestampGroups = new Map();  // keyed by timestamp (no-code rows)
  // Quick lookup: timestamp → product_code (for merging no-code rows)
  const timestampToCode = new Map();

  for (const row of rows) {
    const code = row.product_code;
    const file = row.image_file;
    const brand = row.brand || "";
    const ts = extractTimestamp(file);

    if (code) {
      if (!codeGroups.has(code)) {
        codeGroups.set(code, { product_code: code, brand, images: [] });
        if (ts) timestampToCode.set(ts, code);
      }
      codeGroups.get(code).images.push(file);
    } else if (ts) {
      // Check if a coded product already owns this timestamp
      if (timestampToCode.has(ts)) {
        // Add as secondary image to that coded product (primary won't change unless it's better)
        const existing = codeGroups.get(timestampToCode.get(ts));
        existing.images.push(file);
      } else {
        // New unnamed product group
        if (!timestampGroups.has(ts)) {
          timestampGroups.set(ts, { product_code: null, brand: "", images: [] });
        }
        timestampGroups.get(ts).images.push(file);
      }
    }
  }

  // Assign generated codes to unnamed groups
  let noCodeCounter = 1;
  const allGroups = [];

  for (const [, group] of codeGroups) {
    allGroups.push(group);
  }

  for (const [ts, group] of timestampGroups) {
    const safeTs = ts.replace(/[._]/g, "-");
    group.product_code = `NOCODE-${String(noCodeCounter).padStart(2, "0")}`;
    group.brand = "Fashion Collection";
    noCodeCounter++;
    allGroups.push(group);
  }

  return allGroups;
}

// ── supabase helpers ──────────────────────────────────────────────────────────

async function ensureBucket(admin) {
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) throw new Error(`List buckets failed: ${error.message}`);
  if (buckets.some((b) => b.name === BUCKET)) return;
  const { error: createErr } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (createErr) throw new Error(`Create bucket failed: ${createErr.message}`);
  console.log(`  ✓ Created storage bucket "${BUCKET}"`);
}

async function ensureCategory(admin) {
  const { data: existing } = await admin
    .from("categories")
    .select("id")
    .eq("slug", CATEGORY_SLUG)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data, error } = await admin
    .from("categories")
    .insert({ name: CATEGORY_NAME, slug: CATEGORY_SLUG, is_active: true, sort_order: 1 })
    .select("id")
    .single();
  if (error) throw new Error(`Create category failed: ${error.message}`);
  console.log(`  ✓ Created category "${CATEGORY_NAME}"`);
  return data.id;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  await loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE env vars in .env.local");

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Read CSV
  const csvText = await fs.readFile(CSV_PATH, "utf8");
  const rows = parseCsv(csvText);
  console.log(`Read ${rows.length} image rows from products.csv`);

  // Group into products
  const groups = buildGroups(rows);
  console.log(`Found ${groups.length} distinct products:`);
  for (const g of groups) {
    const primary = pickPrimary(g.images);
    console.log(`  ${g.product_code} (${g.brand}) — ${g.images.length} images, primary: ${primary}`);
  }

  await ensureBucket(admin);

  // Check if categories table exists (old schema has it; new schema does not)
  let categoryId = null;
  const { error: catCheckErr } = await admin.from("categories").select("id").limit(1);
  if (!catCheckErr) {
    categoryId = await ensureCategory(admin);
  }

  console.log("\nUploading and creating products...\n");

  let uploadedCount = 0;
  let createdCount = 0;
  const errors = [];

  for (const group of groups) {
    const primaryFile = pickPrimary(group.images);
    const filePath = path.join(SOURCE_DIR, primaryFile);

    // Check the file exists on disk
    try {
      await fs.access(filePath);
    } catch {
      console.warn(`  SKIP ${group.product_code}: file not found on disk — ${primaryFile}`);
      errors.push({ code: group.product_code, reason: "file not found: " + primaryFile });
      continue;
    }

    const buffer = await fs.readFile(filePath);
    const ext = path.extname(primaryFile).toLowerCase() || ".jpeg";
    const storageKey = `yassin/${createSlug(group.product_code)}${ext}`;

    // Upload image
    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(storageKey, buffer, { contentType: "image/jpeg", upsert: true });

    if (uploadErr) {
      console.warn(`  FAIL ${group.product_code}: upload error — ${uploadErr.message}`);
      errors.push({ code: group.product_code, reason: uploadErr.message });
      continue;
    }

    uploadedCount++;
    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(storageKey);
    const imageUrl = urlData.publicUrl;

    // Build product name: "Brand Code" e.g. "Azora 7005"
    const brand = group.brand || "Fashion";
    const productName = brand === "Fashion Collection"
      ? `Fashion Item ${group.product_code.replace("NOCODE-", "")}`
      : `${brand} ${group.product_code}`;

    const slug = createSlug(productName);

    const productPayload = {
      product_code: group.product_code,
      name: productName,
      slug,
      image_url: imageUrl,
      price: DEFAULT_PRICE,
      sale_price: null,
      stock_quantity: 10,
      available_sizes: ["S", "M", "L", "XL"],
      available_colors: [],
      is_active: true,
      is_featured: false,
      is_new_arrival: true,
    };

    // Include extra columns only if the old schema exists
    if (categoryId) {
      productPayload.category_id = categoryId;
      productPayload.brand = brand;
      productPayload.short_description = `${productName} — update in admin`;
    } else {
      productPayload.category = CATEGORY_NAME;
    }

    const { error: productErr } = await admin
      .from("products")
      .upsert(productPayload, { onConflict: "product_code" });

    if (productErr) {
      console.warn(`  FAIL ${group.product_code}: db error — ${productErr.message}`);
      errors.push({ code: group.product_code, reason: productErr.message });
      continue;
    }

    createdCount++;
    console.log(`  ✓ ${group.product_code} → "${productName}" (${group.images.length} images total)`);
  }

  console.log("\n────────────────────────────────────");
  console.log(`Uploaded:  ${uploadedCount} images`);
  console.log(`Products:  ${createdCount} created/updated`);
  if (errors.length > 0) {
    console.log(`Errors:    ${errors.length}`);
    errors.forEach((e) => console.log(`  - ${e.code}: ${e.reason}`));
  }
  console.log("\nNext steps:");
  console.log("  → Open your Supabase dashboard to edit names, prices, and descriptions");
  console.log("  → Visit /products on the storefront to see your products");
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  process.exit(1);
});
