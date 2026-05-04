import { useState, useEffect, useCallback, useRef, useMemo, Fragment } from "react";

// ═══════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════
const API_URL = "https://versa-inventory-api.onrender.com";
const ORDERS_API_URL = "https://open-orders-api.onrender.com";
const S3_LOGO_BASE = "https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/";
const DEFAULT_LOGO = "https://versamens.com/wp-content/uploads/2025/02/ac65455c-6152-4e4a-91f8-534f08254f81.png";

const CUSTOMER_CODES = {"AF":"AAFES","BK":"BELK","BJ":"BJS","BL":"BLOOMINGDALE","BO":"BOSCOV","BU":"BURLINGTON","CC":"COSTCO CANADA","CU":"COSTCO USA","CM":"COSTCO MEXICO","CT":"COSTCO TAIWAN","FM":"FORMAN MILLS","HA":"HAMRICKS","JC":"JC PENNY","MB":"MACYS BACKSTAGE","MC":"MACYS.COM","MA":"MACYS","MW":"MENS WEARHOUSE","NO":"NORDSTROM","RO":"ROSS","SK":"SAKS","TJ":"TJX","VE":"VETERANS","WN":"WINNERS","KH":"KOHLS","WA":"WALMART (PEERLESS)","NC":"NAUTICA.COM","CY":"CENTURY 21","TK":"TKX","TG":"TARGET","WM":"WALMART","AM":"AMAZON","SE":"SEARS & KMART","PH":"PETER HARRIS","TM":"TJX (with size UPC)","VG":"VERSA GROUP","PS":"PRICE SMART","BF":"Beall's Florida","BI":"Beall's Inc (Outlet)","PB":"Porta Bella","DD":"DD'S Discount","HP":"HALF PRICE","TT":"TIKTOK","VW":"Big Lots/Variety","VP":"Versa Group (Purchase)","PR":"PRATO","MS":"ME SALVE","BR":"BRANDS for LESS","PM":"PROMODA","CI":"CITI TRENDS","CB":"Centric Brands","RM":"ROSS (with size UPC)","JT":"JC PENNY (SHIRT-TIE set)"};

const BRAND_IMAGE_PREFIX = {NAUTICA:"NA",DKNY:"DK",EB:"EB",REEBOK:"RB",VINCE:"VC",BEN:"BE",USPA:"US",CHAPS:"CH",LUCKY:"LB",JNY:"JN",BEENE:"GB",NICOLE:"NM",SHAQ:"SH",TAYION:"TA",STRAHAN:"MS",VD:"VD",VERSA:"VR",CHEROKEE:"CK",AMERICA:"AC",BLO:"BL",BLACK:"BL",DN:"D9",KL:"KL",RG:"RG",NE:"NE"};

const BRAND_MAPPING = {
  NAUTICA:{full_name:"Nautica",logo:"https://versamens.com/wp-content/uploads/2025/07/nautica-logo-1-1-1024x576.png"},
  DKNY:{full_name:"DKNY",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T210144.119-1024x576.png"},
  EB:{full_name:"Eddie Bauer",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T141044.111-1-1024x576.png"},
  REEBOK:{full_name:"Reebok",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-100-1-1024x576.png"},
  VINCE:{full_name:"Vince Camuto",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T140302.980-1-1024x576.png"},
  BEN:{full_name:"Ben Sherman",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T140546.875-1-1024x576.png"},
  USPA:{full_name:"U.S. Polo Assn.",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T141256.597-2-1024x576.png"},
  CHAPS:{full_name:"Chaps",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T203105.646-1024x576.png"},
  LUCKY:{full_name:"Lucky Brand",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T142102.500-2-1024x576.png"},
  JNY:{full_name:"Jones New York",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T200647.521-1024x576.png"},
  BEENE:{full_name:"Geoffrey Beene",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T203625.911-1024x576.png"},
  NICOLE:{full_name:"Nicole Miller",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T203949.948-1024x576.png"},
  SHAQ:{full_name:"Shaquille O'Neal",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T204655.610-1024x576.png"},
  TAYION:{full_name:"Tayion",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T202043.389-1024x576.png"},
  STRAHAN:{full_name:"Michael Strahan",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T205523.268-1-1024x576.png"},
  VD:{full_name:"Von Dutch",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T205306.479-1024x576.png"},
  VERSA:{full_name:"Versa",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/VERSA-logo-1280x720.png"},
  CHEROKEE:{full_name:"Cherokee",logo:"https://versamens.com/wp-content/uploads/2025/02/Untitled-design-2025-02-03T141858.534-2-1024x576.png"},
  AMERICA:{full_name:"American Crew",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/AmericanCrew-logo-1280x720.png"},
  BLO:{full_name:"Bloomingdales",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/Bloomingdales-logo-1280x720.png"},
  BLACK:{full_name:"Black Label",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/black-label-logo.png"},
  DN:{full_name:"Divine 9",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/Divine9-logo-spaced-1280x720.png"},
  KL:{full_name:"Karl Lagerfeld Paris",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/klp-wht-blue-back-1-1024x576.png"},
  RG:{full_name:"Robert Graham",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/robert-graham-logo-dark.png"},
  NE:{full_name:"Neiman Marcus",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/Neiman_Marcus-Logo.wine-copy-1024x576.png"},
};

const BRAND_ORDER = ["NAUTICA","DKNY","EB","VINCE","KL","CHAPS","USPA","LUCKY","BEN","BEENE","NE","JNY","NICOLE","VD","REEBOK","SHAQ","TAYION","STRAHAN","VERSA","AMERICA","BLO","BLACK","RG","DN"];

const SKU_BRAND_CODE_MAP = {};
Object.entries(BRAND_IMAGE_PREFIX).forEach(([brand, prefix]) => { SKU_BRAND_CODE_MAP[prefix] = brand; });

// Cache-bust version — updated whenever style overrides reload from S3
let _imageCacheVersion = Date.now();

// ═══════════════════════════════════════════
// SAVED TRANSFERS (view-only, from web app's localStorage)
// ═══════════════════════════════════════════
// Reads the same `versa_saved_transfers` key that the web app writes to.
// Purely informational — the mobile app never creates, edits, or deletes
// transfers. It just surfaces "heads-up, a transfer is pending on this SKU"
// on the style tile. Same 96h auto-expire window as the web app so stale
// transfers don't linger.
const TRANSFER_STORAGE_KEY = "versa_saved_transfers";
const TRANSFER_EXPIRY_MS   = 96 * 60 * 60 * 1000; // 96 hours

function loadSavedTransfers() {
  try {
    const raw = localStorage.getItem(TRANSFER_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    const cutoff = Date.now() - TRANSFER_EXPIRY_MS;
    // Drop anything older than 96h from view. We don't rewrite localStorage
    // here — the web app owns the data; we just filter what we render.
    return arr.filter(t => {
      const ts = new Date(t.savedAt).getTime();
      return !isNaN(ts) && ts > cutoff;
    });
  } catch (_) { return []; }
}

// Build a quick-lookup index: { SKU_UPPER -> [{qty, warehouseCode, savedAt, refNumber}, ...] }
// Cheaper than scanning the full list per-card in a long scrolling grid.
function buildTransferIndex(savedTransfers) {
  const idx = {};
  (savedTransfers || []).forEach(t => {
    (t.lineItems || []).forEach(li => {
      const sku = (li.sku || "").toUpperCase();
      const qty = parseInt(li.qty) || 0;
      if (!sku || qty <= 0) return;
      if (!idx[sku]) idx[sku] = [];
      idx[sku].push({
        qty,
        warehouseCode: (t.shipTo && t.shipTo.warehouseCode) || "—",
        savedAt: t.savedAt,
        refNumber: t.refNumber
      });
    });
  });
  // Newest first within each SKU
  Object.keys(idx).forEach(k => idx[k].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
  return idx;
}

function getTransfersForSku(sku, transferIndex) {
  if (!sku || !transferIndex) return [];
  return transferIndex[sku.toUpperCase()] || [];
}

const FABRIC_RULES = {AW:"4 Way Stretch",CA:"Cataonic 95% Polyester / 5% Spandex",TD:"CVC Dobby 60% Polyester / 40% Cotton",CH:"Chambray TC Stretch",CS:"Cooling Stretch",CV:"Cotton / Poly CVC",DS:"4 Way Stretch Dobby 95% Polyester / 5% Spandex",OX:"Pinpoint Oxford 65%/35% Poly/Cotton",PP:"100% Polyester 150D",SA:"150D Sateen 100% Polyester",LN:"100% Slab Linen",ST:"97% Cotton 3% Spandex",SW:"97% Cotton 3% Stretch Twill",SU:"Stretch Supershirt (95% Polyester, 5% Spandex)",TR:"Traveler Stretch",TW:"4 Way Stretch Twill",TS:"TC Stretch (77% Polyester / 20% Cotton / 3% Spandex)",WS:"4 Way Stretch (95%,5%) Sateen",PC:"TC Poplin 65%/35% Poly/Cotton",PT:"97% Poly 3% Stretch 150D",VS:"Viscose (31%) Stretch",VP:"50% Viscose 50% Polyester",LP:"Linen Polyester/Spandex",MR:"50% Microfiber 50% Rayon",CT:"100% Cotton",CP:"98% Cotton / 2% Spandex",BP:"50% Bamboo / 50% Polyester",TC:"TC Stretch (52P, 45C, 3S %)",SC:"60% Cotton, 38% Poly, 2% Spandex",BM:"30% Rayon Bamboo / 30% Microfiber / 36% Poly / 4% Spandex Twill",VM:"62% Poly 35% Viscose Bamboo 3% Spandex",SP:"52% Poly 45% Cotton 3% Spandex CVC Yarn Dye",TP:"Solid Twill 21% Rayon / 75.5% Poly / 3.5% Spandex",LC:"Linen 51% Cotton / 49% Poly",CX:"97% Cotton / 3% Polyester",WF:"96% Poly 4% Spandex Waffle",FT:"97% Poly / 3% Spandex Flax Texture",CE:"88% Polyester / 7% Cellulose / 5% Spandex Tech",PK:"100% Polyester Knit",PD:"60% Cotton / 40% Polyester Dobby",PY:"50% Cotton / 47% Polyester / 3% Spandex CVC Oxford",UP:"95% Poly / 5% Spandex Perforated",NY:"78% Nylon / 22% Spandex",CL:"35% Lyocell / 35% Cotton / 27% Nylon / 3% Spandex",PM:"50% Polyester / 50% Microfiber",PX:"95% Polyester / 5% Spandex Core",CN:"71% Cotton / 27% Nylon / 2% Spandex",MP:"74% Modal / 26% Polyester",LE:"100% Linen",PE:"96% Polyester / 4% Spandex End on End",OC:"100% Cotton Oxford",CD:"100% Cotton Dobby",CY:"100% Cotton Yarn Dye",CW:"100% Cotton Twill",CJ:"100% Cotton Jacquard",LT:"45% Cotton / 55% Linen",DP:"95% Polyester / 5% Spandex Knit Performance",PR:"87% Polyamide / 13% Elastic",PS:"94% Polyester / 6% Spandex Knit",CG:"100% Cotton Poplin 105gsm",PA:"88% Polyester / 12% Spandex Seamless Lux Knit",PN:"88% Polyester / 12% Spandex Non-Seamless",CF:"100% Cotton 50s 2 Ply",CB:"100% Cotton 80s 2 Ply (Bloomingdale)",KN:"Knits",WT:"Woven Tops",SD:"Sweaters",SF:"Flannel (Over-Shirt)",SB:"Trucker (Over-Shirt)",CO:"Corduroy (Over-Shirt)",SL:"Twill Over-Shirt",YD:"65% Polyester / 35% Cotton Yarn Dye",KS:"Knit Sport Coat",LA:"8% Lyocell / 88% Polyester / 4% Spandex 120GSM",NP:"78% Nylon / 22% Spandex 180GSM Premium Nylon",PB:"100% Polyester Imitation Cotton 130GSM",PF:"92% Polyester / 8% Spandex 150GSM Jacquard Stripe",PG:"73% Polyester / 5% Spandex / 22% Recycled Fiber 130GSM",PH:"100% Polyester Polo Mesh Sweater",PO:"100% Polyester Polo",PJ:"100% Polyester Polo Jersey",PL:"100% Polyester Polo Sweater Knit",PU:"92% Polyester / 8% Spandex 150GSM Lux Twisted Dobby",PV:"94% Polyester / 6% Spandex 210GSM",PW:"100% Polyester Polo Waffle",PZ:"94% Polyester / 6% Spandex 210GSM",SE:"88% Polyester / 12% Spandex 180GSM",TB:"Tencel Rayon Blend",WB:"Wool Tencel Rayon Blend",TH:"T-Shirt",HE:"Henley",BC:"Carpenters (Bottoms)",BR:"Ripstops (Bottoms)",BH:"Heavy Weight (Bottoms)",BA:"Pinstripe (Bottoms)"};

// ── Shirt fit codes (mirrors desktop SHIRT_FIT_CODES) ──
const SHIRT_FIT_CODES = {
  "SL":"Slim Fit Long Sleeve",
  "RF":"Regular Fit Long Sleeve",
  "BT":"Big & Tall Long Sleeve",
  "WB":"Big & Tall (Von Dutch)",
  "BB":"Big Long Sleeve",
  "TT":"Tall Long Sleeve",
  "TF":"Tailored Fit Long Sleeve",
  "MF":"Modern Fit Long Sleeve",
  "SS":"Slim Fit Short Sleeve",
  "SR":"Regular Fit Short Sleeve",
  "SB":"Short Sleeve Big",
  "ST":"Short Sleeve Tall",
  "BR":"Single Breaster Blazer",
  "DB":"Double Breaster Blazer"
};

// ── Pants fit codes (mirrors desktop PANTS_FIT_CODES) ──
// IMPORTANT: codes like SR/SE/SH/CR/CE/CH overlap with shirt codes but mean
// completely different things on pants. The merged FIT_CODES below lets shirt
// meanings win for collisions (matching desktop legacy behavior); display-time
// resolvers like getFitFromSKU pick the pants meaning when isPants(sku).
const PANTS_FIT_CODES = {
  "SE":"Slim Fit / Extended Button",
  "SH":"Slim Fit / Hook & Eye Closure",
  "SR":"Slim Fit / Reg Button",
  "CE":"Classic Fit / Extended Button",
  "CH":"Classic Fit / Hook & Eye Closure",
  "CR":"Classic Fit / Reg Button",
  "SF":"Straight Fit / Reg Button",
  "SC":"Straight Fit / Hook & Eye Closure",
  "RR":"Relaxed Fit / Reg Button"
};

// Mobile-only legacy aliases preserved for backward compatibility with old
// SKUs that may use these as raw codes. Not present in desktop because desktop
// resolves these contextually, but mobile's older code paths reference them.
const _LEGACY_FIT_CODES = { "CF":"Classic Fit", "AF":"Athletic Fit" };

// Union — shirt meanings win for colliding keys (matches desktop legacy).
// Used for code-recognition / validation; display-time use the dedicated
// SHIRT_FIT_CODES or PANTS_FIT_CODES tables via getFitFromSKU.
const FIT_CODES = Object.assign({}, _LEGACY_FIT_CODES, PANTS_FIT_CODES, SHIRT_FIT_CODES);

const BANNER_RULES_SEED = [
  { id:'seed-ss', text:'SHORT SLEEVE', bgColor:'rgba(14,165,233,0.9)', textColor:'#fff', position:'bottom-left', visibility:'both', category:'short_sleeve', fits:[], customers:[], brands:[], skus:[] },
  { id:'seed-bt', text:'BIG & TALL', bgColor:'rgba(124,58,237,0.9)', textColor:'#fff', position:'bottom-left', visibility:'both', category:'big_tall', fits:[], customers:[], brands:[], skus:[] },
  { id:'seed-pants', text:'PANTS', bgColor:'rgba(107,114,128,0.9)', textColor:'#fff', position:'bottom-right', visibility:'both', category:'pants', fits:[], customers:[], brands:[], skus:[] },
  { id:'seed-sport', text:'SPORTSWEAR', bgColor:'rgba(234,88,12,0.9)', textColor:'#fff', position:'bottom-right', visibility:'both', category:'sportswear', fits:[], customers:[], brands:[], skus:[] },
  { id:'seed-acc-chaps', text:'TIE & HANKY', bgColor:'rgba(168,85,247,0.9)', textColor:'#fff', position:'bottom-right', visibility:'both', category:'accessories', fits:[], customers:[], brands:['CHAPS'], skus:[] },
  { id:'seed-acc-shaq', text:'TIE', bgColor:'rgba(168,85,247,0.9)', textColor:'#fff', position:'bottom-right', visibility:'both', category:'accessories', fits:[], customers:[], brands:['SHAQ'], skus:[] },
];

// ═══════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════

// Style override lookup — matches desktop logic including prefix wildcard keys (keys ending with '-')
function getStyleOverride(sku, overrides) {
  if (!sku || !overrides) return null;
  const skuUpper = sku.toUpperCase().split("-")[0]; // base style
  // 1. Exact match
  if (overrides[skuUpper]) return overrides[skuUpper];
  // 2. Full SKU with size match
  const fullUpper = sku.toUpperCase();
  if (overrides[fullUpper]) return overrides[fullUpper];
  // 3. Prefix match — keys ending with '-' match any SKU starting with that prefix
  for (const key of Object.keys(overrides)) {
    if (key.endsWith('-')) {
      const prefix = key.slice(0, -1);
      if (skuUpper.startsWith(prefix) || fullUpper.startsWith(prefix)) return overrides[key];
    }
  }
  return null;
}

// Folder name mapping for brands whose S3 folder doesn't match brand_abbr
function getImageUrl(item, styleOverrides) {
  // Check for base64 image override first (matches desktop priority)
  if (styleOverrides) {
    const ov = getStyleOverride(item.sku, styleOverrides);
    if (ov && ov.image) {
      // Add cache-buster to S3/HTTP URLs so updated images aren't served stale from browser cache
      if (ov.image.startsWith('http')) {
        const sep = ov.image.includes('?') ? '&' : '?';
        return `${ov.image}${sep}v=${_imageCacheVersion}`;
      }
      return ov.image; // base64 data URLs pass through unchanged
    }
  }
  const baseStyle = (item.sku || "").split("-")[0].toUpperCase();
  const brand = item.brand_abbr || item.brand || "";
  return `${API_URL}/image/${baseStyle}?brand=${brand}&v=${_imageCacheVersion}`;
}

function getFabricFromSKU(sku, styleOverrides) {
  if (!sku || sku.length < 6) return { code: "—", description: "Unknown" };
  // Check style override for fabrication (matches desktop)
  if (styleOverrides) {
    const ov = getStyleOverride(sku, styleOverrides);
    if (ov && ov.fabrication) {
      return { code: ov.fabricCode || sku.substring(4, 6).toUpperCase(), description: ov.fabrication };
    }
  }
  // SKU structure: [0-1] customer + [2-3] brand + [4-5] fabric + [6-9] style# + [9-10] fit + [11] collar
  const brand = sku.substring(2, 4).toUpperCase();
  const code = sku.substring(4, 6).toUpperCase();
  let desc = FABRIC_RULES[code] || code;
  // Special brand overrides
  if (brand === "CH" && code === "YD") desc = "50% Microfiber / 50% Polyester Yarn Dye";
  if (brand === "CH" && code === "PT") desc = "97% Polyester / 3% Spandex (150D STRETCH)";
  if (brand === "BE" && code === "YD") desc = "77% Poly / 20% Cotton / 3% Spandex";
  // USPA: CD fabric is different from generic Cotton Dobby
  if (brand === "US" && code === "CD") desc = "65% Polyester / 35% Cotton";
  // PP on pants → different description than PP on shirts
  const base = sku.split("-")[0].toUpperCase();
  if (code === "PP" && base.length >= 9 && base[6] === "P" && /\d/.test(base[7])) desc = "100% Polyester Woven Pant";
  return { code, description: desc };
}

// Mirrors desktop fitCodeToLabel(code, sku).
// When isPants(sku), looks up PANTS_FIT_CODES first — so codes like SR/SE/SH
// resolve to "Slim Fit / Reg Button" / "Slim Fit / Extended Button" /
// "Slim Fit / Hook & Eye Closure" instead of the shirt-biased meanings
// ("Regular Fit Short Sleeve" / "Slim Fit Extended Button" / etc.).
function getFitFromSKU(sku, styleOverrides) {
  if (!sku || sku.length < 3) return "Unknown";
  // Style-override fit label wins over everything (matches desktop)
  if (styleOverrides) {
    const ov = getStyleOverride(sku, styleOverrides);
    if (ov && ov.fit) return ov.fit;
  }
  const code = extractFitCode(sku);
  // Pants context first — uses PANTS_FIT_CODES so collision codes resolve correctly
  if (typeof isPants === 'function' && isPants(sku) && PANTS_FIT_CODES[code]) {
    return PANTS_FIT_CODES[code];
  }
  // Shirt / legacy / default
  return FIT_CODES[code] || code || "Unknown";
}

const SIZE_PACKS = {
  "Slim Fit": { master_qty:36, inner_qty:9, sizes:[["14-14.5 / 32-33",4],["15-15.5 / 32-33",8],["15-15.5 / 34-35",4],["16-16.5 / 32-33",4],["16-16.5 / 34-35",8],["17-17.5 / 34-35",8]] },
  "Regular Fit": { master_qty:36, inner_qty:9, sizes:[["15-15.5 / 32-33",8],["15-15.5 / 34-35",8],["16-16.5 / 32-33",4],["16-16.5 / 34-35",4],["17-17.5 / 34-35",4],["17-17.5 / 36-37",4],["18-18.5 / 36-37",4]] },
  "Von Dutch": { master_qty:36, inner_qty:9, sizes:[["S (14-14.5)",6],["M (15-15.5)",8],["L (16-16.5)",8],["XL (17-17.5)",8],["XXL (18-18.5)",6]] }
};

function getSizePack(sku, brandAbbr, prepackDefaults, styleOverrides) {
  // Check style override sizePack first (matches desktop)
  if (styleOverrides) {
    const ov = getStyleOverride(sku, styleOverrides);
    if (ov && ov.sizePack) return ov.sizePack;
  }
  // Try S3-backed prepack defaults first (scoring system matches desktop)
  if (prepackDefaults && prepackDefaults.length > 0) {
    const matched = matchPrepackDefault(sku, brandAbbr, prepackDefaults);
    if (matched) return matched;
  }
  // Fallback to hardcoded
  if (brandAbbr === "VD") return SIZE_PACKS["Von Dutch"];
  const fit = getFitFromSKU(sku, styleOverrides);
  return SIZE_PACKS[fit] || SIZE_PACKS["Regular Fit"];
}

function matchPrepackDefault(sku, brandAbbr, prepackDefaults) {
  if (!prepackDefaults || prepackDefaults.length === 0) return null;
  const skuUpper = sku.toUpperCase().trim();
  const base = skuUpper.split('-')[0];
  const brandUp = (brandAbbr || '').toUpperCase().trim();
  const fit = extractFitCode(sku);
  const fab = base.length >= 6 ? base.substring(4, 6).toUpperCase() : '';

  // SKU-specific assignment first
  const skuMatch = prepackDefaults.find(d =>
    (d.skus || []).some(s => {
      const su = s.toUpperCase().trim();
      return su && (su === skuUpper || su === base || skuUpper.startsWith(su));
    })
  );
  if (skuMatch) return skuMatch;

  // Score-based dimension matching with Specific/Umbrella tiers.
  // TIER A (Specific) = rule has BOTH category AND fabrics set — always beats Umbrella.
  // TIER B (Umbrella) = everything else. Tiebreaker: weighted dimension count.
  //   brand = 2, customer = 2 (harder constraints — "who the item is FOR")
  //   category = 1, fit = 1, fabric = 1 (softer constraints — "what the item IS")
  let bestRule = null, bestFabSpec = -1, bestScore = -1;
  for (const d of prepackDefaults) {
    // Rules that explicitly list SKUs should ONLY match via the SKU-specific path above —
    // never act as a catch-all through dimension scoring. Otherwise a rule with a SKU list
    // and category='any' silently matches every item via score=0 and beats targeted rules.
    // Mirrors desktop matchPrepackDefault and backend _add_size_charts.
    const dSkus = (d.skus || []).filter(s => s && s.trim());
    if (dSkus.length > 0) continue;

    const rCat = d.category || 'any';
    // Inclusive category match — a BC Carpenter matches 'pants', 'sportswear', AND 'young_men' rules
    if (rCat !== 'any' && !matchesCategory(sku, brandAbbr, rCat)) continue;
    const rFits = _ruleFits(d);
    if (rFits.length > 0 && !rFits.includes(fit)) continue;
    const rCusts = _ruleCustomers(d);
    if (rCusts.length > 0) continue; // mobile has no customer context
    const rBrands = _ruleBrands(d);
    if (rBrands.length > 0 && (!brandUp || !rBrands.map(b => b.toUpperCase()).includes(brandUp))) continue;
    const rFabs = _ruleFabrics(d);
    if (rFabs.length > 0 && (!fab || !rFabs.map(f => f.toUpperCase()).includes(fab))) continue;

    const isSpecific = (rCat !== 'any' && rFabs.length > 0) ? 1 : 0;
    let score = 0;
    if (rCat !== 'any')       score += 1;
    if (rFits.length > 0)     score += 1;
    if (rBrands.length > 0)   score += 2;
    if (rFabs.length > 0)     score += 1;

    if (isSpecific > bestFabSpec ||
        (isSpecific === bestFabSpec && score > bestScore)) {
      bestFabSpec = isSpecific;
      bestScore = score;
      bestRule = d;
    }
  }
  return bestRule;
}

function sortBrands(entries) {
  return entries.sort((a, b) => {
    const ia = BRAND_ORDER.indexOf(a[0]);
    const ib = BRAND_ORDER.indexOf(b[0]);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return (a[1].full_name || a[0]).localeCompare(b[1].full_name || b[0]);
  });
}

function rebuildBrands(inventory, filterMode = "all", prodData = [], suppressionOverrides = new Set(), deductionAssignments = {}, styleOverrides = {}, warehouseFilter = "all", allocationData = []) {
  const brands = {};
  let source = [...inventory];

  // Apply virtual warehouse allocations to item.allocated (matches desktop applyManualAllocationsToInventory)
  if (allocationData.length > 0) {
    const allocTotals = {};
    allocationData.forEach(a => {
      const sku = (a.sku || "").toUpperCase();
      if (sku) allocTotals[sku] = (allocTotals[sku] || 0) + (parseInt(a.qty) || 0);
    });
    source = source.map(item => {
      const allocQty = allocTotals[(item.sku || "").toUpperCase()] || 0;
      if (allocQty > 0) {
        return { ...item, allocated: (item.allocated || 0) - allocQty };
      }
      return item;
    });
  }

  if (filterMode === "incoming") {
    source = source.filter(i => (i.incoming || 0) > 0).map(item => {
      const incoming = item.incoming || 0;
      const wh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
      // Arrival suppression
      const suppressedQty = _getSuppressedIncoming(item.sku, prodData, wh, suppressionOverrides);
      const adjustedIncoming = Math.max(0, incoming - suppressedQty);
      if (adjustedIncoming <= 0) return null;
      const ded = Math.abs(item.committed||0)+Math.abs(item.allocated||0);
      let osDed = 0;
      if (ded > 0) {
        const assign = deductionAssignments[item.sku] || null;
        if (assign === 'overseas') {
          osDed = ded;
        } else if (assign === 'warehouse') {
          osDed = 0;
        } else {
          // FIFO default: warehouse absorbs first, remainder spills to overseas
          const whAbsorbed = Math.min(ded, wh);
          osDed = Math.max(0, ded - whAbsorbed);
        }
      }
      return { ...item, incoming: adjustedIncoming, _suppressed_incoming: suppressedQty, total_ats: adjustedIncoming - osDed, total_warehouse: 0, jtw:0,tr:0,dcw:0,qa:0, _overseas_deducted: osDed, _display_mode:"overseas" };
    }).filter(Boolean);
  } else if (filterMode === "ats") {
    source = source.map(item => {
      const fullWh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
      // Warehouse sub-filter: show only selected warehouse's qty
      const wh = warehouseFilter === "all" ? fullWh
        : warehouseFilter === "jtw" ? (item.jtw||0)
        : warehouseFilter === "tr" ? (item.tr||0)
        : warehouseFilter === "dcw" ? (item.dcw||0)
        : warehouseFilter === "qa" ? (item.qa||0) : fullWh;
      if (wh <= 0) return null;
      const ded = Math.abs(item.committed||0)+Math.abs(item.allocated||0);
      const incoming = item.incoming || 0;
      let apply = ded;
      const assign = deductionAssignments[item.sku] || null;
      if (assign === 'overseas') {
        apply = 0;
      } else if (assign === 'warehouse') {
        apply = ded;
      } else if (incoming > 0) {
        // FIFO: warehouse absorbs what it can, remainder spills to overseas
        // Use fullWh for FIFO calc so deduction routing is accurate regardless of sub-filter
        apply = Math.min(ded, fullWh);
      } else {
        // No incoming — full hit to warehouse (can go negative)
        apply = ded;
      }
      // When sub-filtered, scale the deduction proportionally to this warehouse's share
      let whApply = apply;
      if (warehouseFilter !== "all" && fullWh > 0) {
        whApply = Math.round(apply * (wh / fullWh));
      }
      const sell = wh - whApply;
      // Override individual warehouse fields based on sub-filter
      const displayItem = warehouseFilter === "all" ? item : {
        ...item,
        jtw: warehouseFilter === "jtw" ? (item.jtw||0) : 0,
        tr: warehouseFilter === "tr" ? (item.tr||0) : 0,
        dcw: warehouseFilter === "dcw" ? (item.dcw||0) : 0,
        qa: warehouseFilter === "qa" ? (item.qa||0) : 0,
      };
      return { ...displayItem, total_ats: sell, total_warehouse: wh, incoming: 0, _display_mode:"ats" };
    }).filter(Boolean);
  } else {
    // "all" mode: recalculate total_ats client-side (matches main catalog formula)
    // warehouse + incoming - committed - allocated (allows negative for over-allocated)
    source = source.map(item => {
      const wh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
      const incoming = item.incoming || 0;
      const committed = Math.abs(item.committed||0);
      const allocated = Math.abs(item.allocated||0);
      const suppressedQty = _getSuppressedIncoming(item.sku, prodData, wh, suppressionOverrides);
      const adjustedIncoming = Math.max(0, incoming - suppressedQty);
      const total_ats = wh + adjustedIncoming - committed - allocated;
      return { ...item, incoming: adjustedIncoming, _suppressed_incoming: suppressedQty, total_ats, total_warehouse: wh };
    });
  }

  source.forEach(item => {
    if (!item.sku) return;
    let brand = item.brand || "UNKNOWN";
    // Resolve ATS tab-name aliases (e.g. "NM" tab → "NICOLE" platform key)
    const BRAND_ALIASES = { NM: "NICOLE" };
    if (BRAND_ALIASES[brand]) brand = BRAND_ALIASES[brand];
    const skuUp = item.sku.toUpperCase();
    // VP prefix = Versa Group Purchase — always VERSA (matches main catalog)
    if (skuUp.startsWith("VP")) brand = "VERSA";
    else if (skuUp.startsWith("LUCK")) brand = "LUCKY";
    else if (item.sku.length >= 4) {
      const code = item.sku.substring(2,4).toUpperCase();
      if (SKU_BRAND_CODE_MAP[code] && !BRAND_MAPPING[brand]) brand = SKU_BRAND_CODE_MAP[code];
    }
    item.brand = brand;
    item.brand_abbr = brand;
    item.brand_full = (BRAND_MAPPING[brand]||{}).full_name || brand;
    // Apply brand override from style overrides (takes priority over everything — matches desktop)
    const ov = getStyleOverride(item.sku, styleOverrides);
    if (ov && ov.brand && ov.brand !== brand) {
      brand = ov.brand;
      item.brand = brand;
      item.brand_abbr = brand;
      item.brand_full = (BRAND_MAPPING[brand]||{}).full_name || brand;
    }
    if (!brands[brand]) brands[brand] = { full_name: item.brand_full, logo: (BRAND_MAPPING[brand]||{}).logo || DEFAULT_LOGO, items: [], sku_count: 0, total_ats: 0, total_warehouse: 0 };
    brands[brand].items.push(item);
    brands[brand].sku_count++;
    brands[brand].total_ats += (item.total_ats || 0);
    brands[brand].total_warehouse += (item.total_warehouse || 0);
  });
  return brands;
}

// ─── Product Category Helpers (mirrors main catalog) ─────────
const SPORTSWEAR_COLLARS = new Set(["Z","U","M","N","O","R"]);
const SPORTSWEAR_FABRICS = new Set(["PH","PJ","PL","PO","PW","TH","HE"]);
// "(Bottoms)" fabric codes from Style Rules — these are sportswear bottoms (count as pants too)
const SPORTSWEAR_BOTTOM_CODES = new Set(["BC","BR","BH","BA"]);
const SHORT_SLEEVE_FIT_CODES = new Set(["SS","SR","SB","ST"]);
// Long-sleeve fit codes (used by isLongSleeveShirt for inclusive sleeve matching).
// Mirrors desktop LONG_SLEEVE_FIT_CODES — anything not in this set or SHORT_SLEEVE_FIT_CODES
// isn't a sleeved-shirt fit code at all. BR/DB (blazers) included so blazer SKUs can match
// a 'long_sleeve' prepack rule.
const LONG_SLEEVE_FIT_CODES = new Set(["SL","RF","TF","MF","BT","BB","TT","WB","BR","DB"]);
const BT_FIT_CODES = new Set(["BT","BB","TT","SB","ST"]);
// Young Men fabric codes — positions 4-5 of base SKU (mirrors main catalog)
const YOUNG_MEN_FABRIC_CODES = new Set(["KN","WT","SD","SF","SB","SL","BC","BR","BH","BA","CO","TH","PO","PW","PJ","PH","PL","HE"]);

function isBigAndTall(sku) {
  if (!sku) return false;
  const base = sku.split("-")[0].toUpperCase();
  // Von Dutch special B&T prefixes: WBJ, BTC, BTS, WBK (after customer+brand code)
  if (base.length >= 7 && base.substring(2, 4) === "VD") {
    const vdSuffix = base.substring(4);
    if (vdSuffix.startsWith("WBJ") || vdSuffix.startsWith("BTC") || vdSuffix.startsWith("BTS") || vdSuffix.startsWith("WBK")) return true;
  }
  return BT_FIT_CODES.has(extractFitCode(sku));
}

function isYoungMen(sku) {
  if (!sku) return false;
  const base = sku.split("-")[0].toUpperCase();
  if (base.length < 6) return false;
  return YOUNG_MEN_FABRIC_CODES.has(base.substring(4, 6));
}

// Inclusive: an item can be BOTH sportswear and young_men (polo fabrics, bottoms, etc.)
function isSportswear(sku, brandAbbr) {
  if (!sku) return false;
  if (getItemCategory(sku, brandAbbr) === "sportswear") return true;
  return isYoungMen(sku);
}

// Inclusive: BC/BR/BH/BA (sportswear bottoms) are pants too, not just P##X items
function isPants(sku, brandAbbr) {
  if (!sku) return false;
  if (getItemCategory(sku, brandAbbr) === "pants") return true;
  const base = sku.split("-")[0].toUpperCase();
  if (base.length >= 6 && SPORTSWEAR_BOTTOM_CODES.has(base.substring(4, 6))) return true;
  return false;
}

// Inclusive category match: a single SKU can appear in MULTIPLE filters
// (e.g. a BC Carpenter matches 'pants', 'sportswear', AND 'young_men';
// a VD shacket with fit SS matches 'young_men', 'sportswear', AND 'short_sleeve').
// For non-overlapping categories (big_tall, accessories) falls through to the
// primary-category check via getDetailedCategory.
function matchesCategory(sku, brandAbbr, category) {
  if (!category || category === "all" || category === "any") return true;
  if (category === "sportswear")   return isSportswear(sku, brandAbbr);
  if (category === "pants")        return isPants(sku, brandAbbr);
  if (category === "young_men")    return isYoungMen(sku);
  if (category === "short_sleeve") return isShortSleeve(sku);
  if (category === "long_sleeve")  return isLongSleeveShirt(sku);
  return getDetailedCategory(sku, brandAbbr) === category;
}

// Does this SKU use SHIRT image conventions (brand-folder URL, shirts Dropbox pattern)?
// False for pants, sportswear, accessories, AND YM items (BC/BR/BH/BA/KN/etc.).
// Prevents YM/Sportswear bottoms from being routed to shirt brand-folder images.
function isShirtForImaging(sku, brandAbbr) {
  return getItemCategory(sku, brandAbbr) === "shirts" && !isYoungMen(sku);
}

function isShortSleeve(sku, styleOverrides) {
  if (!sku) return false;
  // Bottoms can never be short sleeve — includes P##X dress pants AND sportswear bottoms.
  // Fit code "SR" means "Slim Fit/Reg Button" on a sportswear bottom, not "Short Sleeve Regular".
  if (isPants(sku)) return false;
  // Check override fit label first (matches desktop)
  if (styleOverrides) {
    const ov = getStyleOverride(sku, styleOverrides);
    if (ov && ov.fit) return /short\s*sleeve/i.test(ov.fit);
  }
  return SHORT_SLEEVE_FIT_CODES.has(extractFitCode(sku));
}

// Inclusive long-sleeve check — true for any non-bottom garment whose fit code is in
// LONG_SLEEVE_FIT_CODES. Mirrors desktop isLongSleeveShirt(). Lets a VD shacket / YM-fabric
// long-sleeve shirt match a 'long_sleeve' prepack rule even though getDetailedCategory()
// would classify it as 'young_men' — sleeve membership is structural, not exclusive.
function isLongSleeveShirt(sku, styleOverrides) {
  if (!sku) return false;
  if (isPants(sku)) return false;
  // Override label wins
  if (styleOverrides) {
    const ov = getStyleOverride(sku, styleOverrides);
    if (ov && ov.fit) {
      if (/short\s*sleeve/i.test(ov.fit)) return false;
      if (/long\s*sleeve/i.test(ov.fit))  return true;
    }
  }
  // Short sleeve always wins over long sleeve when both could apply
  if (isShortSleeve(sku, styleOverrides)) return false;
  return LONG_SLEEVE_FIT_CODES.has(extractFitCode(sku));
}

function getItemCategory(sku, brandAbbr) {
  if (!sku) return "shirts";
  const base = sku.split("-")[0].toUpperCase();
  // Brand code lives at positions 2-3 of the base SKU.
  const skuBrand = base.length >= 4 ? base.substring(2, 4) : "";
  // Pants: US POLO ONLY — uses P##X serial pattern (e.g. "CUUSPPP01SLS").
  // Per business rule: other brands don't use P## convention; their pants are
  // identified by fabric code ("(Bottoms)" codes from Style Rules — BC/BR/BH/BA),
  // handled by isPants() via SPORTSWEAR_BOTTOM_CODES.
  if (skuBrand === "US"
      && base.length >= 10 && base[6] === "P"
      && /\d/.test(base[7]) && /\d/.test(base[8]) && /[A-Z]/.test(base[9])) return "pants";
  if (base.length >= 11 && SPORTSWEAR_COLLARS.has(base.slice(-1))) return "sportswear";
  // Sportswear by fabric code: polo/tee/henley fabrics are sportswear regardless of collar code
  if (base.length >= 6 && SPORTSWEAR_FABRICS.has(base.substring(4, 6))) return "sportswear";
  const brand = (brandAbbr || "").toUpperCase();
  if (brand === "CHAPS" && base.startsWith("CTH")) return "accessories";
  if (brand === "SHAQ" && base.length >= 3 && /T/.test(base.slice(0, 3))) return "accessories";
  return "shirts";
}

function getDetailedCategory(sku, brandAbbr, styleOverrides) {
  const base = getItemCategory(sku, brandAbbr);
  if (base === "pants") return "pants";
  if (base === "sportswear") return "sportswear";
  if (base === "accessories") return "accessories";
  if (isYoungMen(sku)) return "young_men";
  if (isBigAndTall(sku)) return "big_tall";
  return isShortSleeve(sku, styleOverrides) ? "short_sleeve" : "long_sleeve";
}

// ─── Color Classification (mirrors main catalog) ──────────────
function classifyColor(colorDisplay, brandAbbr) {
  if (!colorDisplay) return "fancies";
  const c = colorDisplay.trim().toLowerCase();
  // Disqualifiers: presence of any of these forces fancies regardless of solid/sld
  const _hasPrint = /\bprint\b|\bprnt\b|\bgrnd\b|\bstripe\b|\bstripes\b|\bgeo\b|\bcheck\b/.test(c);
  // DOBBY rule (all brands): treat "dobby" like a solid; bucket by color word if present
  if (!_hasPrint && /\bdobby\b/.test(c)) {
    if (/\bwhite\b|\bivory\b|\bcream\b/.test(c)) return "white";
    if (/\bblack\b/.test(c)) return "black";
    if (/\bnavy\b/.test(c)) return "navy";
    return "other_solids";
  }
  // Navy: "navy solid" or "navy sld" as adjacent words anywhere
  if (!_hasPrint && /\bnavy\s+s(?:olid|ld)\b/.test(c)) return "navy";
  // White/Black exact: "[color] solid" or "[color] sld" — nothing before or after
  const exactMatch = c.match(/^(\S+)\s+s(?:olid|ld)$/);
  if (exactMatch && !_hasPrint) {
    const base = exactMatch[1];
    if (base === "white") return "white";
    if (base === "black") return "black";
    return "other_solids";
  }
  // USPA: "[color] solid/sld" at the start counts even with trailing text
  if ((brandAbbr || "").toUpperCase() === "USPA" && !_hasPrint) {
    const uspaMatch = c.match(/^(\S+)\s+s(?:olid|ld)/);
    if (uspaMatch) {
      const base = uspaMatch[1];
      if (base === "white" || base === "ivory" || base === "cream") return "white";
      if (base === "black") return "black";
      return "other_solids";
    }
  }
  // Other Solids: contains "solid" or "sld" anywhere, no disqualifiers
  if (!_hasPrint && /\bs(?:olid|ld)\b/.test(c)) return "other_solids";
  return "fancies";
}

// ─── Color Summary Panel ──────────────────────────────────────
function ColorSummaryPanel({ items, colorMap, brandAbbr, filterMode, activeColorFilter, onColorFilter, styleOverrides, warehouseFilter }) {
  const [metric, setMetric] = useState("ats"); // "ats" | "wh" | "incoming" | "total"

  // Compute per-category quantities for ALL metrics at once
  const cats = ["white","black","navy","other_solids","fancies"];
  const data = {}; cats.forEach(c => { data[c] = {wh:0,inc:0,ats:0,total:0}; });
  const skuSets = {}; cats.forEach(c => { skuSets[c] = new Set(); });
  items.forEach(item => {
    const wh = item.total_warehouse || 0;
    const inc = item.incoming || 0;
    const ats = item.total_ats || 0;
    if (wh + inc <= 0 && ats <= 0) return;
    const ci = getStyleColorInfo(item.sku, brandAbbr, colorMap, styleOverrides);
    const cat = classifyColor(ci ? ci.display : "", brandAbbr);
    if (data[cat]) {
      data[cat].wh += wh; data[cat].inc += inc; data[cat].ats += ats; data[cat].total += wh + inc;
      skuSets[cat].add(item.sku.toUpperCase());
    }
  });

  const getVal = (cat) => metric === "ats" ? data[cat].ats : metric === "wh" ? data[cat].wh : metric === "incoming" ? data[cat].inc : data[cat].total;
  const cWhite = getVal("white"), cBlack = getVal("black"), cNavy = getVal("navy"), cOther = getVal("other_solids"), cFancy = getVal("fancies");
  const total = cWhite + cBlack + cNavy + cOther + cFancy;
  const pct = v => total ? Math.round(v / total * 100) : 0;
  const bW = pct(cWhite), bB = pct(cBlack), bN = pct(cNavy), bO = pct(cOther), bF = pct(cFancy);

  const LABEL_MAP = { white:"White Solid", black:"Black Solid", navy:"Navy Solid", other_solids:"Other Solids", fancies:"Fancies" };
  const whLabel = warehouseFilter && warehouseFilter !== "all" ? `\u{1F3ED} ${warehouseFilter.toUpperCase()}` : "\u{1F3ED} WH Stock";
  const METRIC_LABELS = { ats:"\u{1F4E6} ATS", wh:whLabel, incoming:"\u{1F6A2} Incoming", total:"\u{1F4CA} Total" };
  const METRIC_COLORS = { ats:["#16a34a","#f0fdf4","#bbf7d0"], wh:["#6d28d9","#f5f3ff","#ddd6fe"], incoming:["#d97706","#fffbeb","#fde68a"], total:["#0369a1","#e0f2fe","#bae6fd"] };

  const handleClick = (cat) => {
    if (!skuSets[cat] || skuSets[cat].size === 0) return;
    if (activeColorFilter && activeColorFilter.cat === cat) onColorFilter(null);
    else onColorFilter({ cat, label: LABEL_MAP[cat], skus: skuSets[cat] });
  };

  const rowStyle = (cat, span2) => ({
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"7px 10px", borderRadius:6, cursor:"pointer", transition:"background 0.15s",
    border: `1px solid ${activeColorFilter?.cat === cat ? "#93c5fd" : "#e2e8f0"}`,
    background: activeColorFilter?.cat === cat ? "#dbeafe" : "#f8fafc",
    ...(span2 ? { gridColumn:"span 2" } : {})
  });

  const barSegStyle = (bg, w, cat) => ({
    width:`${w}%`, background:bg, cursor:"pointer",
    outline: activeColorFilter?.cat === cat ? "2px solid #6366f1" : "none"
  });

  const mc = METRIC_COLORS[metric];
  const toggleStyle = (m) => ({
    padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all .15s",
    background: metric === m ? mc[1] : "transparent", color: metric === m ? mc[0] : "#94a3b8",
    border: `1px solid ${metric === m ? mc[2] : "transparent"}`
  });

  return (
    <div style={{ background:"white",borderRadius:12,padding:"20px",marginBottom:16,border:"1px solid #e2e8f0",boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>{"\u{1F4CA}"} Color Summary</span>
          {activeColorFilter && (
            <span style={{ background:"#dbeafe",color:"#1d4ed8",border:"1px solid #93c5fd",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}>
              Filtering: {activeColorFilter.label}
              <span onClick={() => onColorFilter(null)} style={{ cursor:"pointer",color:"#6b7280",marginLeft:2 }}>{"\u2715"}</span>
            </span>
          )}
        </div>
        <span style={{ fontSize:12,color:mc[0],background:mc[1],padding:"3px 10px",borderRadius:99,fontWeight:700,border:`1px solid ${mc[2]}` }}>
          {total.toLocaleString()} {METRIC_LABELS[metric]}
        </span>
      </div>

      {/* Metric toggle */}
      <div style={{ display:"flex",gap:4,marginBottom:12,background:"#f8fafc",borderRadius:10,padding:3,border:"1px solid #e2e8f0" }}>
        {(["ats","wh","incoming","total"]).map(m => (
          <button key={m} onClick={() => setMetric(m)} style={toggleStyle(m)}>{METRIC_LABELS[m]}</button>
        ))}
      </div>

      {/* Stacked bar */}
      <div style={{ display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:14,background:"#f1f5f9" }}>
        {bW > 0 && <div style={barSegStyle("#e2e8f0", bW, "white")} onClick={() => handleClick("white")} title={`White Solid ${bW}%`} />}
        {bB > 0 && <div style={barSegStyle("#1e293b", bB, "black")} onClick={() => handleClick("black")} title={`Black Solid ${bB}%`} />}
        {bN > 0 && <div style={barSegStyle("#1e3a5f", bN, "navy")} onClick={() => handleClick("navy")} title={`Navy Solid ${bN}%`} />}
        {bO > 0 && <div style={barSegStyle("linear-gradient(90deg,#3b82f6,#8b5cf6)", bO, "other_solids")} onClick={() => handleClick("other_solids")} title={`Other Solids ${bO}%`} />}
        {bF > 0 && <div style={barSegStyle("linear-gradient(90deg,#f59e0b,#ec4899)", bF, "fancies")} onClick={() => handleClick("fancies")} title={`Fancies ${bF}%`} />}
      </div>

      {/* Clickable grid */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:13 }}>
        {[["white","\u2B1C White Solid",cWhite],["black","\u2B1B Black Solid",cBlack],["navy","\u{1F7E6} Navy Solid",cNavy],["other_solids","\u{1F3A8} Other Solids",cOther]].map(([cat, label, val]) => (
          <div key={cat} onClick={() => handleClick(cat)} style={rowStyle(cat)}>
            <span style={{ color:"#64748b" }}>{label}</span>
            <span style={{ fontWeight:700,color:"#1e293b" }}>{val.toLocaleString()}</span>
          </div>
        ))}
        <div onClick={() => handleClick("fancies")} style={rowStyle("fancies", true)}>
          <span style={{ color:"#64748b" }}>{"\u2728"} Fancies</span>
          <span style={{ fontWeight:700,color:"#1e293b" }}>{cFancy.toLocaleString()}</span>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",padding:"7px 10px",background:mc[1],borderRadius:6,border:`1px solid ${mc[2]}`,gridColumn:"span 2" }}>
          <span style={{ color:mc[0],fontWeight:600 }}>{METRIC_LABELS[metric]}</span>
          <span style={{ fontWeight:800,color:mc[0] }}>{total.toLocaleString()}</span>
        </div>
      </div>
      <p style={{ fontSize:11,color:"#94a3b8",margin:"8px 0 0",textAlign:"center" }}>Click any row to filter {"\u00B7"} Click again to clear</p>
    </div>
  );
}

// ─── Fabric Summary Panel ─────────────────────────────────────
function FabricSummaryPanel({ items, filterMode, activeFabricFilter, onFabricFilter, styleOverrides, warehouseFilter }) {
  const [metric, setMetric] = useState("ats");

  const fabricMap = {};
  items.forEach(item => {
    const wh = item.total_warehouse || 0;
    const inc = item.incoming || 0;
    const ats = item.total_ats || 0;
    const f = getFabricFromSKU(item.sku, styleOverrides);
    const key = f.code.toUpperCase();
    if (!fabricMap[key]) fabricMap[key] = { code: f.code, description: f.description, wh:0, inc:0, ats:0, total:0, skus: new Set(), allSkus: new Set() };
    fabricMap[key].wh += wh; fabricMap[key].inc += inc; fabricMap[key].ats += ats; fabricMap[key].total += wh + inc;
    fabricMap[key].skus.add(item.sku.split("-")[0].toUpperCase());
    fabricMap[key].allSkus.add(item.sku.toUpperCase());
  });

  const getUnits = (r) => metric === "ats" ? r.ats : metric === "wh" ? r.wh : metric === "incoming" ? r.inc : r.total;
  const rows = Object.values(fabricMap).sort((a, b) => getUnits(b) - getUnits(a));
  const totalUnits = rows.reduce((s, r) => s + getUnits(r), 0);

  const whLabel = warehouseFilter && warehouseFilter !== "all" ? `\u{1F3ED} ${warehouseFilter.toUpperCase()}` : "\u{1F3ED} WH Stock";
  const METRIC_LABELS = { ats:"\u{1F4E6} ATS", wh:whLabel, incoming:"\u{1F6A2} Incoming", total:"\u{1F4CA} Total" };
  const METRIC_COLORS = { ats:["#16a34a","#f0fdf4","#bbf7d0"], wh:["#6d28d9","#f5f3ff","#ddd6fe"], incoming:["#d97706","#fffbeb","#fde68a"], total:["#0369a1","#e0f2fe","#bae6fd"] };
  const mc = METRIC_COLORS[metric];

  const handleClick = (code) => {
    const row = fabricMap[code];
    if (!row) return;
    if (activeFabricFilter && activeFabricFilter.code === code) onFabricFilter(null);
    else onFabricFilter({ code, label: code, skus: row.allSkus });
  };

  const toggleStyle = (m) => ({
    padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all .15s",
    background: metric === m ? mc[1] : "transparent", color: metric === m ? mc[0] : "#94a3b8",
    border: `1px solid ${metric === m ? mc[2] : "transparent"}`
  });

  return (
    <div style={{ background:"white",borderRadius:12,padding:"20px",marginBottom:16,border:"1px solid #e2e8f0",boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>{"\u{1F9F5}"} Fabric Summary</span>
          {activeFabricFilter && (
            <span style={{ background:"#dcfce7",color:"#15803d",border:"1px solid #86efac",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}>
              Filtering: {activeFabricFilter.label}
              <span onClick={() => onFabricFilter(null)} style={{ cursor:"pointer",color:"#6b7280",marginLeft:2 }}>{"\u2715"}</span>
            </span>
          )}
        </div>
        <span style={{ fontSize:12,color:mc[0],background:mc[1],padding:"3px 10px",borderRadius:99,fontWeight:700,border:`1px solid ${mc[2]}` }}>
          {totalUnits.toLocaleString()} {METRIC_LABELS[metric]}
        </span>
      </div>

      {/* Metric toggle */}
      <div style={{ display:"flex",gap:4,marginBottom:12,background:"#f8fafc",borderRadius:10,padding:3,border:"1px solid #e2e8f0" }}>
        {(["ats","wh","incoming","total"]).map(m => (
          <button key={m} onClick={() => setMetric(m)} style={toggleStyle(m)}>{METRIC_LABELS[m]}</button>
        ))}
      </div>

      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13,borderRadius:8,overflow:"hidden" }}>
          <thead>
            <tr style={{ background:"#1e293b",color:"white" }}>
              {["Code","Fabrication","Styles","Units","%"].map((h, i) => (
                <th key={h} style={{ padding:"9px 14px",textAlign: i >= 2 ? "right" : "left",fontSize:11,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",
                  ...(i===1?{textAlign:"left"}:{}), ...(i===2?{textAlign:"center"}:{}) }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const units = getUnits(r);
              const isActive = activeFabricFilter?.code === r.code.toUpperCase();
              const pct = totalUnits ? Math.round(units / totalUnits * 100) : 0;
              return (
                <tr key={r.code} onClick={() => handleClick(r.code.toUpperCase())}
                  style={{ borderBottom:"1px solid #f1f5f9",cursor:"pointer",background: isActive ? "#f0fdf4" : "white",transition:"background .15s" }}
                  onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseOut={e => e.currentTarget.style.background = isActive ? "#f0fdf4" : "white"}>
                  <td style={{ padding:"8px 14px",whiteSpace:"nowrap" }}>
                    <span style={{ display:"inline-block",background: isActive ? "#dcfce7" : "#f1f5f9",color: isActive ? "#15803d" : "#374151",border:`1px solid ${isActive ? "#86efac" : "#e2e8f0"}`,borderRadius:5,padding:"2px 8px",fontFamily:"monospace",fontSize:12,fontWeight:800 }}>{r.code}</span>
                  </td>
                  <td style={{ padding:"8px 14px",color:"#374151" }}>{r.description}</td>
                  <td style={{ padding:"8px 14px",textAlign:"center",color:"#64748b" }}>{r.skus.size}</td>
                  <td style={{ padding:"8px 14px",textAlign:"right",fontWeight:700,color:"#0f172a" }}>{units.toLocaleString()}</td>
                  <td style={{ padding:"8px 14px",textAlign:"right",color:"#94a3b8" }}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background:mc[1],borderTop:"2px solid "+mc[2] }}>
              <td colSpan={3} style={{ padding:"9px 14px",fontSize:13,fontWeight:700,color:mc[0] }}>{METRIC_LABELS[metric]}</td>
              <td style={{ padding:"9px 14px",textAlign:"right",fontSize:13,fontWeight:800,color:mc[0] }}>{totalUnits.toLocaleString()}</td>
              <td style={{ padding:"9px 14px",textAlign:"right",fontSize:13,fontWeight:800,color:mc[0] }}>100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p style={{ fontSize:11,color:"#94a3b8",margin:"10px 0 0",textAlign:"center" }}>Click any row to filter {"\u00B7"} Click again to clear</p>
    </div>
  );
}



function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#10b981";
  return (
    <div style={{ position:"fixed",bottom:20,right:20,padding:"14px 22px",background:bg,color:"#fff",borderRadius:12,boxShadow:"0 4px 16px rgba(0,0,0,.25)",zIndex:9999,fontSize:14,fontWeight:600,animation:"slideInRight .3s ease" }}>
      {message}
    </div>
  );
}

function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div className="spinner" />
      <p style={{ marginTop:16, fontSize:18, fontWeight:600, color:"#4b5563" }}>{text}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// IMAGE CACHE — remembers working URLs so
// fallback chain only runs once per base style
// ═══════════════════════════════════════════
function getBaseStyle(sku) {
  return (sku || "").split("-")[0].toUpperCase();
}

function resolveImageUrl(item, styleOverrides) {
  return getImageUrl(item, styleOverrides);
}

// Preload a batch of images into browser cache
function preloadImages(items) {
  const seen = new Set();
  items.slice(0, 30).forEach(item => {
    const base = getBaseStyle(item.sku);
    if (seen.has(base)) return;
    seen.add(base);
    const img = new Image();
    img.src = resolveImageUrl(item);
  });
}

// Background preloader — warm browser cache via backend proxy
let _bgPreloadStarted = false;
let _bgQueue = [];
let _bgActive = 0;
const BG_MAX = 15;

function backgroundPreloadAll(inventory) {
  if (_bgPreloadStarted) return;
  _bgPreloadStarted = true;
  const seen = new Set();
  _bgQueue = inventory.filter(item => {
    const base = getBaseStyle(item.sku);
    if (!base || seen.has(base)) return false;
    seen.add(base);
    return true;
  });
  setTimeout(_bgPump, 2000);
}

function _bgPump() {
  while (_bgActive < BG_MAX && _bgQueue.length > 0) {
    const item = _bgQueue.shift();
    _bgActive++;
    const img = new Image();
    img.onload = img.onerror = () => { _bgActive--; _bgPump(); };
    img.src = resolveImageUrl(item);
  }
}

function ImageWithFallback({ src, alt, style, className, onClick }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  if (error) return (
    <div style={{ ...style, background:"linear-gradient(135deg,#f1f5f9,#e2e8f0)", display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:13,fontWeight:600 }} className={className}>
      No Image
    </div>
  );
  return (
    <img
      src={src}
      alt={alt}
      style={{ ...style, opacity: loaded ? 1 : 0, transition:"opacity .15s ease" }}
      className={className}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      onClick={onClick}
      loading="lazy"
      decoding="async"
    />
  );
}

// ─── Brand Card ──────────────────────────
function BrandCard({ abbr, data, onClick, filterMode, brandCategoryFilter, styleOverrides, warehouseFilter }) {
  // When a category filter is active, recompute totals from only matching items
  let displayData = data;
  if (brandCategoryFilter && brandCategoryFilter !== "all" && data.items) {
    const filtered = data.items.filter(i => matchesCategory(i.sku, i.brand_abbr || i.brand, brandCategoryFilter));
    displayData = {
      ...data,
      sku_count: filtered.length,
      total_ats: filtered.reduce((s, i) => s + (i.total_ats || 0), 0),
      total_warehouse: filtered.reduce((s, i) => s + (i.total_warehouse || 0), 0),
    };
  }
  return (
    <div onClick={onClick} className="brand-card">
      <div style={{ height:120, display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#f8fafc,#f1f5f9)",borderRadius:"12px 12px 0 0",padding:12,overflow:"hidden" }}>
        <img src={data.logo || DEFAULT_LOGO} alt={data.full_name} style={{ maxHeight:80,maxWidth:"100%",objectFit:"contain" }} onError={e => { e.target.src = DEFAULT_LOGO; }} />
      </div>
      <div style={{ padding:"14px 16px" }}>
        <h3 style={{ fontSize:16,fontWeight:700,color:"#1f2937",marginBottom:2 }}>{data.full_name}</h3>
        <p style={{ fontSize:12,color:"#6b7280",marginBottom:8 }}>{abbr}</p>
        <div style={{ display:"flex",justifyContent:"space-between",gap:8 }}>
          <div style={{ background:"#f0fdf4",padding:"6px 10px",borderRadius:8,flex:1,textAlign:"center" }}>
            <p style={{ fontSize:10,color:"#16a34a",fontWeight:600 }}>SKUs</p>
            <p style={{ fontSize:18,fontWeight:800,color:"#166534" }}>{displayData.sku_count}</p>
          </div>
          <div style={{ background:"#faf5ff",padding:"6px 10px",borderRadius:8,flex:1,textAlign:"center" }}>
            <p style={{ fontSize:10,color:"#7c3aed",fontWeight:600 }}>{warehouseFilter && warehouseFilter !== "all" ? warehouseFilter.toUpperCase() : "WH Stock"}</p>
            <p style={{ fontSize:18,fontWeight:800,color:"#5b21b6" }}>{(displayData.total_warehouse||0).toLocaleString()}</p>
          </div>
          <div style={{ background:"#eef2ff",padding:"6px 10px",borderRadius:8,flex:1,textAlign:"center" }}>
            <p style={{ fontSize:10,color:"#4f46e5",fontWeight:600 }}>ATS</p>
            <p style={{ fontSize:18,fontWeight:800,color:"#3730a3" }}>{(displayData.total_ats||0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────
function ProductCard({ item, onClick, filterMode, prodData, colorMap, bannerRules, suppressionOverrides, styleOverrides, warehouseFilter, deductionAssignments, transferIndex }) {
  const fabric = getFabricFromSKU(item.sku, styleOverrides);
  const fit = getFitFromSKU(item.sku, styleOverrides);
  const ats = item.total_ats || 0;
  const isOverseas = filterMode === "incoming";
  const isFlow = item._flow;
  const atsLabel = isFlow ? "Flow ATS" : isOverseas ? "Overseas ATS" : filterMode === "ats" ? (warehouseFilter && warehouseFilter !== "all" ? `${warehouseFilter.toUpperCase()} ATS` : "WH ATS") : "ATS";
  const atsColor = ats > 0 ? (isOverseas || isFlow ? "#d97706" : "#16a34a") : "#dc2626";
  const colorInfo = getStyleColorInfo(item.sku, item.brand_abbr || item.brand, colorMap, styleOverrides);
  const custCode = (item.sku || "").substring(0, 2).toUpperCase();
  let custName = CUSTOMER_CODES[custCode] || custCode;
  // Chaps accessories: display CT (Costco Taiwan) as Burlington
  if (custCode === "CT" && (item.brand_abbr || item.brand || "").toUpperCase() === "CHAPS" && getItemCategory(item.sku, item.brand_abbr || item.brand) === "accessories") custName = "BURLINGTON";
  const [prodOpen, setProdOpen] = useState(false);

  // Pending transfers for this SKU (view-only heads-up — not a deduction)
  const transferHits = getTransfersForSku(item.sku, transferIndex);
  const transferTotalQty = transferHits.reduce((s, h) => s + h.qty, 0);

  // Production data — suppression-aware (skip for flow items which already have PO info)
  const rawWh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
  const prods = !isFlow ? getEarliestDates(item.sku, prodData, rawWh, suppressionOverrides).productions : [];
  const hasProd = prods.length > 0;
  const totalProdUnits = prods.reduce((s, p) => s + (p.units || 0), 0);
  const nearestArrival = prods.length > 0 ? prods[0].arrival : null;

  return (
    <div onClick={onClick} className="product-card" style={{ background:"#fff",borderRadius:14,overflow:"hidden",border: isFlow ? "2px solid #fbbf24" : isOverseas ? "2px solid #fcd34d" : "2px solid #e5e7eb" }}>
      <div style={{ position:"relative",overflow:"hidden" }}>
        <ImageWithFallback src={resolveImageUrl(item, styleOverrides)} alt={item.sku} style={{ width:"100%",height:220,objectFit:"cover",background:"#f3f4f6" }} />
        {isFlow && <span style={{ position:"absolute",top:8,right:8,background:"rgba(180,83,9,.9)",color:"#fff",padding:"3px 8px",borderRadius:8,fontSize:10,fontWeight:700 }}>📊 Flow</span>}
        {isOverseas && !isFlow && <span style={{ position:"absolute",top:8,right:8,background:"rgba(217,119,6,.9)",color:"#fff",padding:"3px 8px",borderRadius:8,fontSize:10,fontWeight:700 }}>🚢 Overseas</span>}
        {/* Dynamic banners from Banner Rules */}
        <BannerBadges sku={item.sku} brandAbbr={item.brand_abbr || item.brand} bannerRules={bannerRules} />
      </div>
      <div style={{ padding:"12px 14px" }}>
        <h3 style={{ fontSize:15,fontWeight:700,color:"#1f2937",marginBottom:2 }}>{item.sku}</h3>
        <p style={{ fontSize:12,color:"#6b7280",marginBottom:2,display:"flex",alignItems:"center",gap:6 }}>
          {item.brand_full}
          <span style={{ fontSize:10,fontWeight:700,background:"#f0fdf4",color:"#15803d",padding:"1px 6px",borderRadius:4,border:"1px solid #bbf7d0" }}>{custName}</span>
        </p>
        {colorInfo && (
          <p style={{ fontSize:11,marginBottom:4 }}>
            {colorInfo.hasPrint ? (
              <><span style={{ color:"#7c3aed",fontWeight:600 }}>{colorInfo.ground}</span> <span style={{ color:"#6b7280" }}>/ {colorInfo.print}</span></>
            ) : (
              <span style={{ color:"#7c3aed",fontWeight:600 }}>{colorInfo.display}</span>
            )}
          </p>
        )}
        <p style={{ fontSize:11,color:"#9ca3af",marginBottom:8 }}>{fit} · {fabric.description.length > 30 ? fabric.description.substring(0,28)+"..." : fabric.description}</p>

        {/* Flow mode info badge — replaces production badge for flow items */}
        {isFlow && item._flow_production && (
          <div style={{ background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"6px 10px",marginBottom:8,fontSize:11,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ color:"#92400e",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"45%" }} title={item._flow_production}>{item._flow_production}</span>
            <span style={{ color:"#78716c",fontSize:10 }}>
              Produced: <strong style={{ color:"#92400e" }}>{(item._flow_units||0).toLocaleString()}</strong>
              {item._flow_deducted > 0 && <span style={{ color:"#dc2626" }}> (-{item._flow_deducted.toLocaleString()})</span>}
            </span>
          </div>
        )}
        {isFlow && !item._flow_production && (
          <div style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"6px 10px",marginBottom:8,fontSize:11,color:"#991b1b",fontWeight:600 }}>
            No Production Data
          </div>
        )}

        {/* Production badge — normal mode only (not flow) */}
        {!isFlow && hasProd && (() => {
          // Compute FIFO waterfall deduction per PO (mirrors detail modal logic)
          const totalDed = Math.abs(item.committed||0)+Math.abs(item.allocated||0);
          const wh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
          const incoming = item.incoming||0;
          let overseasDed = 0;
          if (totalDed > 0) {
            const assign = (deductionAssignments || {})[item.sku] || null;
            if (assign === 'overseas') overseasDed = totalDed;
            else if (assign === 'warehouse') overseasDed = 0;
            else { const whAbsorbed = Math.min(totalDed, wh); overseasDed = Math.max(0, totalDed - whAbsorbed); }
          }
          let remaining = overseasDed;
          const prodRows = [...prods].sort((a,b)=>(a.arrival||new Date("2099"))-(b.arrival||new Date("2099"))).map(p => {
            const ded = Math.min(remaining, p.units||0);
            const flowAts = (p.units||0) - ded;
            remaining -= ded;
            return { ...p, deducted: ded, flowAts };
          });
          const hasAnyDed = totalDed > 0;
          return (
          <div style={{ marginBottom:8 }} onClick={e => { e.stopPropagation(); setProdOpen(o => !o); }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:prodOpen ? "8px 8px 0 0" : 8,padding:"5px 10px",cursor:"pointer",fontSize:11,color:"#166534",transition:"all .2s" }}>
              <span>🏭</span>
              <span style={{ fontWeight:700 }}>In Production</span>
              <span style={{ color:"#16a34a",fontWeight:600 }}>{nearestArrival ? formatDateShort(nearestArrival) : "—"}</span>
              <span style={{ marginLeft:"auto",fontWeight:700,color:"#15803d" }}>{totalProdUnits.toLocaleString()} units</span>
              <span style={{ fontSize:10,transition:"transform .2s",transform: prodOpen ? "rotate(180deg)" : "none" }}>▼</span>
            </div>
            {prodOpen && (
              <div style={{ background:"#f9fffe",border:"1px solid #bbf7d0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"0",fontSize:11 }}>
                {/* Deduction summary header */}
                {hasAnyDed && (
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"#fef2f2",borderBottom:"1px solid #fecaca",fontSize:10 }}>
                    <span style={{ color:"#991b1b",fontWeight:700 }}>Committed: {Math.abs(item.committed||0).toLocaleString()} · Allocated: {Math.abs(item.allocated||0).toLocaleString()}</span>
                    {overseasDed > 0 && <span style={{ color:"#dc2626",fontWeight:700 }}>OS Ded: {overseasDed.toLocaleString()}</span>}
                  </div>
                )}
                {/* Column headers */}
                <div style={{ display:"grid",gridTemplateColumns: hasAnyDed ? "1fr auto auto auto" : "1fr auto",padding:"4px 10px",background:"#f0fdf4",fontSize:9,fontWeight:700,color:"#166534",gap:6,borderBottom:"1px solid #dcfce7" }}>
                  <span>PO</span>
                  <span style={{ textAlign:"right" }}>Units</span>
                  {hasAnyDed && <span style={{ textAlign:"right" }}>Ded</span>}
                  {hasAnyDed && <span style={{ textAlign:"right" }}>ATS</span>}
                </div>
                {prodRows.map((p, i) => (
                  <div key={i} style={{ borderBottom:"1px solid #dcfce7" }}>
                    <div style={{ display:"grid",gridTemplateColumns: hasAnyDed ? "1fr auto auto auto" : "1fr auto",padding:"5px 10px",fontSize:10,gap:6,alignItems:"center",background:i%2===0?"#fff":"#f9fafb" }}>
                      <span style={{ fontWeight:600,color:"#1f2937",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }} title={p.production || ""}>{p.production || "—"}</span>
                      <span style={{ textAlign:"right",fontFamily:"monospace",fontWeight:700 }}>{(p.units||0).toLocaleString()}</span>
                      {hasAnyDed && <span style={{ textAlign:"right",fontFamily:"monospace",color:p.deducted>0?"#dc2626":"#9ca3af" }}>{p.deducted>0?`-${p.deducted.toLocaleString()}`:"—"}</span>}
                      {hasAnyDed && <span style={{ textAlign:"right",fontFamily:"monospace",fontWeight:800,color:"#166534" }}>{p.flowAts.toLocaleString()}</span>}
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:5,padding:"2px 10px 5px",fontSize:10,color:"#6b7280" }}>
                      <span style={{ background:"#dcfce7",color:"#166534",fontWeight:600,padding:"1px 6px",borderRadius:99 }}>Ex-Fac {formatDateShort(p.etd) || "—"}</span>
                      <span style={{ color:"#9ca3af" }}>→</span>
                      <span style={{ background:"#dcfce7",color:"#166534",fontWeight:600,padding:"1px 6px",borderRadius:99 }}>Arrival {formatDateShort(p.arrival) || "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );
        })()}

        {/* Transfer badge — view only, shows pending transfers for this SKU */}
        {transferHits.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"#ecfdf5",border:"1px solid #6ee7b7",borderRadius: transferHits.length > 1 ? "8px 8px 0 0" : 8,padding:"5px 10px",fontSize:11,color:"#047857" }}>
              <span>🚚</span>
              <span style={{ fontWeight:700 }}>{transferHits.length === 1 ? "Pending Transfer" : `Pending Transfers (${transferHits.length})`}</span>
              <span style={{ fontSize:8,background:"#10b981",color:"#fff",padding:"1px 6px",borderRadius:99,fontWeight:700,letterSpacing:0.4 }}>VIEW ONLY</span>
              {transferHits.length === 1 && (
                <>
                  <span style={{ fontFamily:"monospace",fontWeight:800,color:"#065f46",marginLeft:"auto" }}>{transferHits[0].warehouseCode}</span>
                  <span style={{ color:"#10b981",fontSize:10 }}>{formatDateShort(transferHits[0].savedAt)}</span>
                  <span style={{ fontWeight:700,color:"#047857" }}>{transferHits[0].qty.toLocaleString()}</span>
                </>
              )}
              {transferHits.length > 1 && <span style={{ marginLeft:"auto",fontWeight:700,color:"#047857" }}>{transferTotalQty.toLocaleString()} units</span>}
            </div>
            {transferHits.length > 1 && (
              <div style={{ background:"#f0fdf4",border:"1px solid #6ee7b7",borderTop:"none",borderRadius:"0 0 8px 8px" }}>
                {transferHits.map((h, i) => (
                  <div key={i} style={{ display:"grid",gridTemplateColumns:"auto 1fr auto",padding:"4px 10px",fontSize:10,gap:8,alignItems:"center",borderBottom: i < transferHits.length-1 ? "1px solid #a7f3d0" : "none",background: i%2===0 ? "#fff" : "#f9fffe" }}>
                    <span style={{ fontFamily:"monospace",fontWeight:800,color:"#065f46" }}>{h.warehouseCode}</span>
                    <span style={{ color:"#6b7280" }}>{formatDateShort(h.savedAt)}</span>
                    <span style={{ textAlign:"right",fontFamily:"monospace",fontWeight:700,color:"#047857" }}>{h.qty.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontSize:13,fontWeight:700,color:atsColor }}>
            {ats > 0 ? `${ats.toLocaleString()} ${atsLabel}` : "Out of Stock"}
          </span>
          <div style={{ display:"flex",gap:4 }}>
            {item.jtw > 0 && <span style={{ fontSize:9,background:"#dbeafe",color:"#1d4ed8",padding:"2px 6px",borderRadius:4,fontWeight:700 }}>JTW</span>}
            {item.tr > 0 && <span style={{ fontSize:9,background:"#f3e8ff",color:"#7c3aed",padding:"2px 6px",borderRadius:4,fontWeight:700 }}>TR</span>}
            {item.dcw > 0 && <span style={{ fontSize:9,background:"#ffedd5",color:"#c2410c",padding:"2px 6px",borderRadius:4,fontWeight:700 }}>DCW</span>}
            {(item.qa||0) > 0 && <span style={{ fontSize:9,background:"#ccfbf1",color:"#0f766e",padding:"2px 6px",borderRadius:4,fontWeight:700 }}>QA</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fullscreen Image Viewer ────────────
function FullscreenImage({ src, alt, onClose }) {
  if (!src) return null;
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" || e.key === "Backspace") { e.preventDefault(); onClose(); } };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,.92)",backdropFilter:"blur(8px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100,
      cursor:"zoom-out",padding:16
    }}>
      <button onClick={onClose} style={{
        position:"fixed",top:16,right:16,zIndex:1101,
        background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",
        color:"#fff",fontSize:20,fontWeight:700,width:44,height:44,borderRadius:12,
        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
        backdropFilter:"blur(4px)"
      }}>✕</button>
      <img src={src} alt={alt} style={{
        maxWidth:"95%",maxHeight:"92vh",objectFit:"contain",borderRadius:8,
        boxShadow:"0 20px 60px rgba(0,0,0,.5)"
      }} />
      <p style={{
        position:"fixed",bottom:20,left:0,right:0,textAlign:"center",
        color:"rgba(255,255,255,.6)",fontSize:13,fontWeight:600
      }}>{alt}</p>
    </div>
  );
}

// ─── Export Panel ────────────────
function ExportPanel({ onClose, brands, currentBrand, filterMode, API_URL, filteredItems, productionData, viewMode, suppressionOverrides }) {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenProgress, setRegenProgress] = useState("");

  useEffect(() => {
    fetchManifest();
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const fetchManifest = async () => {
    try {
      const resp = await fetch(`${API_URL}/exports`);
      if (resp.ok) { setManifest(await resp.json()); }
    } catch (e) { console.warn("Export manifest error:", e); }
    setLoading(false);
  };

  // Build export-ready items with production dates attached
  const buildExportItems = (items) => {
    return items.map(item => {
      const out = { ...item };
      // Always attach production dates if available
      if (productionData?.length > 0) {
        const dates = getEarliestDates(item.sku, productionData, (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0), suppressionOverrides);
        if (dates.ex_factory) out.ex_factory = dates.ex_factory instanceof Date ? dates.ex_factory.toISOString().slice(0,10) : String(dates.ex_factory);
        if (dates.arrival) out.arrival = dates.arrival instanceof Date ? dates.arrival.toISOString().slice(0,10) : String(dates.arrival);
      }
      return out;
    });
  };

  const handleExportCurrentView = async () => {
    if (!filteredItems?.length) return;
    const brandName = currentBrand ? (brands[currentBrand]?.full_name || currentBrand) : "Inventory";
    const modeLabel = filterMode === "incoming" ? "Overseas" : filterMode === "ats" ? "Warehouse" : "All";
    const filename = `${brandName}_${modeLabel}`;
    setDownloading("CURRENT");
    try {
      const exportItems = buildExportItems(filteredItems);
      const resp = await fetch(`${API_URL}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: exportItems,
          filename,
          view_mode: filterMode === "incoming" ? "incoming" : filterMode === "ats" ? "ats" : "all"
        })
      });
      if (!resp.ok) throw new Error("Export failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${filename.replace(/\s/g,"_")}_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { alert("Export failed: " + e.message); }
    setDownloading(null);
  };

  const handleExportBrandFiltered = async (abbr) => {
    const brandInfo = brands[abbr];
    if (!brandInfo?.items?.length) return;
    const brandName = brandInfo.full_name || abbr;
    const modeLabel = filterMode === "incoming" ? "Overseas" : filterMode === "ats" ? "Warehouse" : "All";
    setDownloading(abbr);
    try {
      const exportItems = buildExportItems(brandInfo.items);
      const resp = await fetch(`${API_URL}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: exportItems,
          filename: `${brandName}_${modeLabel}`,
          view_mode: filterMode === "incoming" ? "incoming" : filterMode === "ats" ? "ats" : "all"
        })
      });
      if (!resp.ok) throw new Error("Export failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${brandName.replace(/\s/g,"_")}_${modeLabel}_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { alert(`Export failed for ${brandName}: ${e.message}`); }
    setDownloading(null);
  };

  const handleDownloadAll = async () => {
    setDownloading("ALL");
    try {
      const resp = await fetch(`${API_URL}/download/all`);
      if (!resp.ok) throw new Error("Not available");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `All_Brands_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { alert("All-brands export not ready. Try regenerating first."); }
    setDownloading(null);
  };

  const handleRegenerate = async () => {
    setRegenerating(true); setRegenProgress("Starting...");
    try {
      await fetch(`${API_URL}/regenerate`, { method: "POST" });
      setRegenProgress("Generating exports...");
      const poll = setInterval(async () => {
        try {
          const resp = await fetch(`${API_URL}/exports`);
          if (resp.ok) {
            const m = await resp.json();
            if (m.generating) {
              setRegenProgress(m.progress || "Working...");
            } else {
              clearInterval(poll);
              setManifest(m);
              setRegenerating(false);
              setRegenProgress("");
            }
          }
        } catch (_) {}
      }, 3000);
    } catch (e) {
      setRegenerating(false); setRegenProgress("Error: " + e.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatTime = (ts) => {
    if (!ts) return "never";
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric" }) + " " + d.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" });
  };

  const filterLabel = filterMode === "incoming" ? "🚢 Overseas" : filterMode === "ats" ? "🏭 Warehouse" : "📦 All Inventory";
  const filterColor = filterMode === "incoming" ? "#f59e0b" : filterMode === "ats" ? "#3b82f6" : "#10b981";
  const isInBrand = viewMode === "inventory" && currentBrand;
  const currentBrandName = currentBrand ? (brands[currentBrand]?.full_name || currentBrand) : "";

  // Sort brands: current brand first, then alphabetical
  const sortedBrands = sortBrands(Object.entries(brands));

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)",zIndex:1050,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#1e293b",borderRadius:16,border:"1px solid rgba(255,255,255,.1)",maxWidth:520,width:"100%",maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <h2 style={{ color:"#f1f5f9",fontSize:18,fontWeight:800 }}>📊 Excel Exports</h2>
            <p style={{ color:"#64748b",fontSize:12,marginTop:2 }}>
              <span style={{ color:filterColor,fontWeight:600 }}>{filterLabel}</span>
              {isInBrand && <span> · {currentBrandName}</span>}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.08)",border:"none",color:"#94a3b8",fontSize:18,width:36,height:36,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flex:1,overflowY:"auto",padding:"12px 20px" }}>
          {loading ? (
            <div style={{ textAlign:"center",padding:40,color:"#64748b" }}>Loading exports...</div>
          ) : (
            <>
              {/* Current View Export - shown when inside a brand */}
              {isInBrand && filteredItems?.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <p style={{ color:"#94a3b8",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>Current View</p>
                  <button onClick={handleExportCurrentView} disabled={downloading === "CURRENT"} style={{
                    width:"100%",background:`linear-gradient(135deg,${filterColor},${filterColor}cc)`,color:"#fff",border:"none",
                    padding:"14px 16px",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",
                    opacity: downloading === "CURRENT" ? 0.6 : 1, transition:"all .2s"
                  }}>
                    <div style={{ textAlign:"left" }}>
                      <span style={{ fontWeight:800,fontSize:14 }}>📥 Export {currentBrandName}</span>
                      <p style={{ fontSize:11,opacity:0.85,marginTop:2 }}>
                        {filteredItems.length} styles · {filterLabel}
                        {filterMode === "incoming" && " · Includes Ex-Factory & Arrival dates"}
                      </p>
                    </div>
                    <span style={{ fontSize:13,fontWeight:600 }}>{downloading === "CURRENT" ? "⏳" : ".xlsx"}</span>
                  </button>
                </div>
              )}

              {/* All brands by filter */}
              <p style={{ color:"#94a3b8",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8 }}>
                {filterMode === "all" ? "Pre-built Exports" : "Export by Brand"} ({filterLabel})
              </p>

              {/* Download All - only show for "all" filter mode with pre-built exports */}
              {filterMode === "all" && (
                <button onClick={handleDownloadAll} disabled={downloading === "ALL"} style={{
                  width:"100%",background:"linear-gradient(135deg,#818cf8,#6366f1)",color:"#fff",border:"none",
                  padding:"14px 16px",borderRadius:12,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",
                  opacity: downloading === "ALL" ? 0.6 : 1, transition:"all .2s"
                }}>
                  <div style={{ textAlign:"left" }}>
                    <span style={{ fontWeight:800,fontSize:14 }}>📥 Download All Brands</span>
                    <p style={{ fontSize:11,opacity:0.8,marginTop:2 }}>
                      {manifest?.all_brands ? `${manifest.all_brands.items_count} items · ${formatSize(manifest.all_brands.size_bytes)}` : "Complete inventory with images"}
                    </p>
                  </div>
                  <span style={{ fontSize:13,fontWeight:600 }}>{downloading === "ALL" ? "⏳" : ".xlsx"}</span>
                </button>
              )}

              {/* Individual brands */}
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {sortedBrands.map(([abbr, info]) => {
                  const mBrand = manifest?.brands?.[abbr];
                  const isCurrent = currentBrand && abbr === currentBrand;
                  const itemCount = (info.items||[]).length;
                  // Always use POST export so production dates are included
                  const handleClick = () => handleExportBrandFiltered(abbr);
                  return (
                    <button key={abbr} onClick={handleClick} disabled={downloading === abbr || itemCount === 0}
                      style={{
                        display:"flex",alignItems:"center",justifyContent:"space-between",
                        background: isCurrent ? "rgba(129,140,248,.12)" : "rgba(255,255,255,.04)",
                        border: isCurrent ? "1px solid rgba(129,140,248,.3)" : "1px solid rgba(255,255,255,.06)",
                        borderRadius:10,padding:"10px 14px",cursor: itemCount > 0 ? "pointer" : "default",transition:"all .15s",
                        opacity: downloading === abbr ? 0.6 : itemCount === 0 ? 0.4 : 1,
                        color:"#e2e8f0"
                      }}>
                      <div style={{ textAlign:"left" }}>
                        <span style={{ fontWeight:700,fontSize:13 }}>{info.full_name || abbr}</span>
                        {isCurrent && <span style={{ fontSize:9,background:"#818cf8",color:"#fff",padding:"2px 6px",borderRadius:4,marginLeft:8,fontWeight:700 }}>CURRENT</span>}
                        <p style={{ fontSize:11,color:"#64748b",marginTop:1 }}>
                          {itemCount} styles{filterMode === "all" && mBrand ? ` · ${formatSize(mBrand.size_bytes)}` : ""}
                          {filterMode !== "all" && itemCount > 0 ? ` · ${filterLabel}` : ""}
                        </p>
                      </div>
                      <span style={{ fontSize:12,color:"#818cf8",fontWeight:600 }}>{downloading === abbr ? "⏳" : itemCount > 0 ? "📥" : "—"}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"12px 20px",borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <p style={{ color:"#64748b",fontSize:11 }}>
            {regenerating ? regenProgress : filterMode === "incoming" ? "Overseas exports include shipment dates" : "Exports include product images"}
          </p>
          <button onClick={handleRegenerate} disabled={regenerating}
            style={{
              background: regenerating ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.08)",
              color: regenerating ? "#64748b" : "#e2e8f0",
              border:"1px solid rgba(255,255,255,.1)",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600
            }}>
            {regenerating ? "⏳ Generating..." : "🔄 Regenerate All"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Detail Modal ────────────────
function ProductDetailModal({ item, onClose, onAddToCart, filterMode, prodData, colorMap, allocationData, apoData, openOrdersData, suppressionOverrides, styleOverrides, prepackDefaults, deductionAssignments }) {
  if (!item) return null;
  const fabric = getFabricFromSKU(item.sku, styleOverrides);
  const fit = getFitFromSKU(item.sku, styleOverrides);
  const sp = getSizePack(item.sku, item.brand_abbr || item.brand, prepackDefaults, styleOverrides);
  const totalStock = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
  // Use the pre-computed total_ats from rebuildBrands (already includes incoming - committed - allocated)
  // Falls back to manual recomputation for raw items that haven't been processed
  const ats = typeof item.total_ats === "number" ? item.total_ats : (totalStock + (item.incoming||0) - Math.abs(item.committed||0) - Math.abs(item.allocated||0));
  const [showFullImage, setShowFullImage] = useState(false);
  const [showAllocations, setShowAllocations] = useState(false);
  const isOverseas = filterMode === "incoming";
  const dates = getEarliestDates(item.sku, prodData, totalStock, suppressionOverrides);
  const prods = dates.productions;
  const colorInfo = getStyleColorInfo(item.sku, item.brand_abbr || item.brand, colorMap, styleOverrides);

  // Manual holds from /allocations — exact SKU match
  const manualHolds = (allocationData || []).filter(a => a.sku === (item.sku || "").toUpperCase());

  // APO allocations from /apo — base style match, grouped by customer
  const baseStyle = (item.sku || "").toUpperCase().split("-")[0];
  const apoRows = (apoData || []).filter(r => (r.style || "").toUpperCase().split("-")[0] === baseStyle);
  const apoByCustomer = {};
  apoRows.forEach(r => {
    const c = r.customer || "—";
    apoByCustomer[c] = (apoByCustomer[c] || 0) + (parseInt(r.qty) || 0);
  });
  const apoTotal = apoRows.reduce((s, r) => s + (parseInt(r.qty) || 0), 0);

  // Open orders from orders API — base style match
  const openOrders = (openOrdersData || []).filter(o => {
    const oBase = (o.style || o.baseStyle || "").toUpperCase().split("-")[0];
    return oBase === baseStyle;
  });
  const openOrdersTotal = openOrders.reduce((s, o) => s + (parseInt(o.openQty) || 0) + (parseInt(o.pickQty) || 0), 0);

  const committed = Math.abs(item.committed || 0);
  const allocated = Math.abs(item.allocated || 0);
  const hasDeductions = committed > 0 || allocated > 0 || apoTotal > 0 || manualHolds.length > 0;

  return (
    <>
    {showFullImage && (
      <FullscreenImage src={resolveImageUrl(item, styleOverrides)} alt={item.sku} onClose={() => setShowFullImage(false)} />
    )}
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16 }} onClick={onClose}>
      <div style={{ background:"rgba(255,255,255,.97)",borderRadius:14,maxWidth:580,width:"100%",maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,.3)",position:"relative" }} onClick={e => e.stopPropagation()}>
        
        {/* Sticky header with close button */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid #e5e7eb",flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:18,fontWeight:800,color:"#1f2937" }}>{item.sku}</h2>
            <p style={{ fontSize:12,color:"#6b7280",display:"flex",alignItems:"center",gap:6 }}>
              {item.brand_full}
              <span style={{ fontSize:10,fontWeight:700,background:"#f0fdf4",color:"#15803d",padding:"1px 6px",borderRadius:4,border:"1px solid #bbf7d0" }}>
                {(() => { const c = (item.sku||"").substring(0,2).toUpperCase(); const n = CUSTOMER_CODES[c]||c; return (c==="CT" && (item.brand_abbr||item.brand||"").toUpperCase()==="CHAPS" && getItemCategory(item.sku,item.brand_abbr||item.brand)==="accessories") ? "BURLINGTON" : n; })()}
              </span>
            </p>
            {colorInfo && (
              <p style={{ fontSize:12,marginTop:2 }}>
                {colorInfo.hasPrint ? (
                  <><span style={{ color:"#7c3aed",fontWeight:600 }}>{colorInfo.ground}</span> <span style={{ color:"#6b7280" }}>/ {colorInfo.print}</span></>
                ) : (
                  <span style={{ color:"#7c3aed",fontWeight:600 }}>{colorInfo.display}</span>
                )}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ fontSize:24,background:"#f3f4f6",border:"none",color:"#6b7280",cursor:"pointer",lineHeight:1,width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0 }}>✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY:"auto",padding:"16px 20px" }}>
          
          {/* Image + Key Stats Row */}
          <div style={{ display:"flex",gap:16,marginBottom:16 }}>
            <div style={{ position:"relative",flexShrink:0,cursor:"zoom-in" }} onClick={() => setShowFullImage(true)}>
              <ImageWithFallback src={resolveImageUrl(item, styleOverrides)} alt={item.sku} style={{ width:140,height:180,borderRadius:10,objectFit:"cover",border:"2px solid #e5e7eb" }} />
              <div style={{ position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,.5)",color:"#fff",borderRadius:6,padding:"3px 6px",fontSize:10,fontWeight:600,backdropFilter:"blur(4px)" }}>🔍 Tap</div>
            </div>
            <div style={{ flex:1,display:"flex",flexDirection:"column",gap:8 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <div style={{ background: ats < 0 ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#10b981,#059669)",color:"#fff",padding:10,borderRadius:10 }}>
                  <p style={{ fontSize:10,opacity:.85 }}>ATS</p>
                  <p style={{ fontSize:22,fontWeight:800 }}>{ats.toLocaleString()}</p>
                </div>
                <div style={{ background:"linear-gradient(135deg,#3b82f6,#4f46e5)",color:"#fff",padding:10,borderRadius:10 }}>
                  <p style={{ fontSize:10,opacity:.85 }}>WH Stock</p>
                  <p style={{ fontSize:22,fontWeight:800 }}>{totalStock.toLocaleString()}</p>
                </div>
              </div>
              {(item.incoming || 0) > 0 && (
                <div style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",padding:10,borderRadius:10 }}>
                  <p style={{ fontSize:10,opacity:.85 }}>🚢 Incoming (Overseas)</p>
                  <p style={{ fontSize:22,fontWeight:800 }}>{(item.incoming||0).toLocaleString()}</p>
                </div>
              )}
              {(committed > 0 || allocated > 0) && (
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  <div style={{ background:"#fef2f2",padding:8,borderRadius:8,border:"1px solid #fecaca" }}>
                    <p style={{ fontSize:10,color:"#991b1b",fontWeight:600 }}>Committed</p>
                    <p style={{ fontSize:16,fontWeight:800,color:"#dc2626" }}>{committed.toLocaleString()}</p>
                  </div>
                  <div style={{ background:"#fff7ed",padding:8,borderRadius:8,border:"1px solid #fed7aa" }}>
                    <p style={{ fontSize:10,color:"#9a3412",fontWeight:600 }}>Allocated</p>
                    <p style={{ fontSize:16,fontWeight:800,color:"#ea580c" }}>{allocated.toLocaleString()}</p>
                  </div>
                </div>
              )}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <div style={{ background:"#f9fafb",padding:8,borderRadius:8 }}>
                  <p style={{ fontSize:10,color:"#6b7280",fontWeight:600 }}>Fit</p>
                  <p style={{ fontSize:13,fontWeight:700,color:"#7c3aed" }}>{fit}</p>
                </div>
                <div style={{ background:"#f9fafb",padding:8,borderRadius:8 }}>
                  <p style={{ fontSize:10,color:"#6b7280",fontWeight:600 }}>Fabric</p>
                  <p style={{ fontSize:13,fontWeight:700 }}>{fabric.code}: {fabric.description.length > 18 ? fabric.description.substring(0,16)+"…" : fabric.description}</p>
                </div>
              </div>
              {ats > 0 && (
                <button onClick={() => onAddToCart(item)} style={{ background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",border:"none",padding:"9px 0",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",width:"100%" }}>
                  🛒 Add to Cart
                </button>
              )}
            </div>
          </div>

          {/* Warehouse */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12 }}>
            {[["JTW",item.jtw,"#dbeafe","#1d4ed8"],["TR",item.tr,"#f3e8ff","#7c3aed"],["DCW",item.dcw,"#ffedd5","#c2410c"],["QA",item.qa||0,"#ccfbf1","#0f766e"]].map(([label,val,bg,color]) => (
              <div key={label} style={{ background:bg,padding:8,borderRadius:8,textAlign:"center" }}>
                <p style={{ fontSize:10,color,fontWeight:600 }}>{label}</p>
                <p style={{ fontSize:18,fontWeight:800 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Committed & Incoming row */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12 }}>
            <div onClick={() => setShowAllocations(!showAllocations)}
              style={{ background:"#fefce8",padding:8,borderRadius:8,cursor:"pointer",border:showAllocations ? "2px solid #f59e0b" : "2px solid transparent",transition:"border .15s" }}>
              <p style={{ fontSize:10,color:"#a16207",fontWeight:600 }}>
                Deductions & Production <span style={{ fontSize:9,color:"#d97706" }}>{showAllocations ? "▲" : "▼"} details</span>
              </p>
              <p style={{ fontSize:16,fontWeight:800 }}>{(committed + allocated).toLocaleString()}</p>
              {committed > 0 && allocated > 0 && (
                <p style={{ fontSize:9,color:"#92400e",marginTop:2 }}>
                  Committed: {committed.toLocaleString()} · Allocated: {allocated.toLocaleString()}
                </p>
              )}
            </div>
            <div style={{ background:"#ecfeff",padding:8,borderRadius:8 }}>
              <p style={{ fontSize:10,color:"#0e7490",fontWeight:600 }}>Incoming</p>
              <p style={{ fontSize:16,fontWeight:800 }}>{(item.incoming||0).toLocaleString()}</p>
            </div>
          </div>

          {/* ── DEDUCTIONS BREAKDOWN ── expanded view matching main catalog */}
          {showAllocations && (
            <div style={{ marginBottom:12,border:"1px solid #fde68a",borderRadius:10,overflow:"hidden" }}>
              {/* Header */}
              <div style={{ background:"#92400e",color:"#fff",padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontWeight:700,fontSize:12 }}>📋 Deductions Breakdown</span>
                <span style={{ fontSize:11,opacity:.8 }}>Total: {(committed + allocated).toLocaleString()} units</span>
              </div>

              {/* ── COMMITTED: A2000 open orders breakdown ── */}
              <div style={{ background:"#fffbeb",padding:"5px 10px",fontSize:10,fontWeight:700,color:"#92400e",borderBottom:"1px solid #fde68a",display:"flex",justifyContent:"space-between" }}>
                <span>📋 Committed — A2000 Open Orders</span>
                <span style={{ fontFamily:"monospace" }}>{committed.toLocaleString()}</span>
              </div>
              {openOrders.length > 0 ? (
                <>
                  <div style={{ background:"#fefce8",padding:"3px 10px 2px",display:"grid",gridTemplateColumns:"1fr auto auto",fontSize:10,fontWeight:600,color:"#a16207",gap:0 }}>
                    <span>Customer</span><span style={{ textAlign:"right" }}>Order #</span><span style={{ textAlign:"right",paddingLeft:12 }}>Qty</span>
                  </div>
                  {openOrders.map((o, i) => {
                    const rawCust = (o.customer || "").toUpperCase().trim();
                    const custCode = rawCust.length <= 4 ? rawCust : rawCust.substring(0, 2);
                    const custFull = CUSTOMER_CODES[custCode] || o.customerFull || custCode || "—";
                    const rawQty = parseInt(o.openQty) || 0;
                    const pickQty = parseInt(o.pickQty) || 0;
                    const qty = rawQty + pickQty;
                    const isOnPick = pickQty > 0;
                    return (
                      <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr auto auto",padding:"5px 10px",fontSize:11,borderTop:"1px solid #fef3c7",background:i%2===0?"#fff":"#fffbeb",gap:0,alignItems:"center" }}>
                        <span style={{ fontWeight:600,color:"#1f2937",display:"flex",alignItems:"center",gap:4,flexWrap:"wrap" }}>
                          {custFull}
                          {isOnPick && <span style={{ display:"inline-block",background:"#f3e8ff",color:"#7c3aed",fontSize:8,fontWeight:800,padding:"2px 5px",borderRadius:4,border:"1px solid #ddd6fe",whiteSpace:"nowrap" }}>{"\uD83C\uDFAB"} ON PICK</span>}
                        </span>
                        <span style={{ textAlign:"right",color:"#6b7280",fontFamily:"monospace",fontSize:10 }}>{o.orderNo || o.ctrlNo || "—"}</span>
                        <span style={{ textAlign:"right",fontWeight:700,fontFamily:"monospace",paddingLeft:12,color:isOnPick?"#7c3aed":"inherit" }}>{qty.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr auto",padding:"5px 10px",fontSize:11,borderTop:"2px solid #fde68a",background:"#fefce8",fontWeight:700 }}>
                    <span>A2000 Total</span>
                    <span style={{ textAlign:"right",fontFamily:"monospace" }}>{openOrdersTotal.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div style={{ padding:"7px 12px",fontSize:11,color:"#92400e",background:"#fffbeb",borderBottom:"1px solid #fde68a",fontStyle:"italic",opacity:.7 }}>
                  {openOrdersData.length === 0 ? "Loading open orders…" : "No open orders found for this style"}
                </div>
              )}

              {/* ── ALLOCATED: APO virtual warehouse ── */}
              <div style={{ background:"#f5f3ff",padding:"5px 10px",fontSize:10,fontWeight:700,color:"#6d28d9",borderTop:"2px solid #fde68a",borderBottom:"1px solid #ede9fe",display:"flex",justifyContent:"space-between" }}>
                <span>🏭 Allocated — Virtual Warehouse (APO)</span>
                <span style={{ fontFamily:"monospace" }}>{allocated.toLocaleString()}</span>
              </div>
              {apoRows.length > 0 ? (
                <>
                  <div style={{ background:"#f5f3ff",padding:"3px 10px 2px",display:"grid",gridTemplateColumns:"1fr auto",fontSize:10,fontWeight:600,color:"#6d28d9",gap:0 }}>
                    <span>Customer</span><span style={{ textAlign:"right" }}>Qty</span>
                  </div>
                  {Object.entries(apoByCustomer).map(([cust, qty], i) => (
                    <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr auto",padding:"5px 10px",fontSize:11,borderTop:"1px solid #ede9fe",background:i%2===0?"#fff":"#f5f3ff",gap:0 }}>
                      <span style={{ fontWeight:600,color:"#1f2937" }}>{CUSTOMER_CODES[cust] || cust}</span>
                      <span style={{ textAlign:"right",fontWeight:700,fontFamily:"monospace",color:"#7c3aed" }}>-{qty.toLocaleString()}</span>
                    </div>
                  ))}
                  {apoRows.length > 1 && (
                    <div style={{ display:"grid",gridTemplateColumns:"1fr auto",padding:"5px 10px",fontSize:11,borderTop:"2px solid #ede9fe",background:"#f5f3ff",fontWeight:700 }}>
                      <span style={{ color:"#6d28d9" }}>VW Total</span>
                      <span style={{ textAlign:"right",fontFamily:"monospace",color:"#6d28d9" }}>-{apoTotal.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding:"7px 12px",fontSize:11,color:"#6d28d9",background:"#f5f3ff",borderBottom:"1px solid #ede9fe",fontStyle:"italic",opacity:.7 }}>
                  {apoData.length === 0 ? "Loading APO data…" : "No virtual warehouse allocations for this style"}
                </div>
              )}

              {/* Manual holds */}
              {manualHolds.length > 0 && (
                <>
                  <div style={{ background:"#fff7ed",padding:"5px 10px",fontSize:10,fontWeight:700,color:"#92400e",borderTop:"2px solid #fde68a",borderBottom:"1px solid #fed7aa" }}>
                    🔒 Manual Holds
                  </div>
                  {manualHolds.map((a, i) => (
                    <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr auto auto",padding:"5px 10px",fontSize:11,borderTop:"1px solid #fed7aa",background:i%2===0?"#fff":"#fff7ed",gap:0 }}>
                      <span style={{ fontWeight:600,color:"#1f2937" }}>{a.customer || a.customer_code || "—"}</span>
                      <span style={{ textAlign:"right",color:"#6b7280",fontFamily:"monospace",fontSize:10 }}>{a.po || a.po_number || "—"}</span>
                      <span style={{ textAlign:"right",fontWeight:700,fontFamily:"monospace",paddingLeft:12 }}>{(a.qty||0).toLocaleString()}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Production Orders waterfall — shows per-PO deduction same as main catalog */}
              {prods.length > 0 && (() => {
                // Mirror main catalog waterfall logic: deduct from productions FIFO
                const totalDed = Math.abs(item.committed||0)+Math.abs(item.allocated||0);
                const wh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
                const incoming = item.incoming||0;
                let overseasDed = 0;
                if (totalDed > 0) {
                  const _pAssign = (deductionAssignments || {})[item.sku] || null;
                  if (_pAssign === 'overseas') {
                    overseasDed = totalDed;
                  } else if (_pAssign === 'warehouse') {
                    overseasDed = 0;
                  } else {
                    // FIFO default: warehouse absorbs first, remainder to overseas
                    const whAbsorbed = Math.min(totalDed, wh);
                    overseasDed = Math.max(0, totalDed - whAbsorbed);
                  }
                }
                let remaining = overseasDed;
                const prodRows = [...prods].sort((a,b)=>(a.arrival||new Date("2099"))-(b.arrival||new Date("2099"))).map(p => {
                  const ded = Math.min(remaining, p.units||0);
                  const flowAts = (p.units||0) - ded;
                  remaining -= ded;
                  return { ...p, deducted: ded, flowAts };
                });
                const totalProduced = prodRows.reduce((s,p)=>s+(p.units||0),0);
                return (
                  <>
                    <div style={{ background:"#166534",color:"#fff",padding:"5px 10px",fontSize:10,fontWeight:700,borderTop:"1px solid #fde68a",display:"flex",justifyContent:"space-between" }}>
                      <span>🏭 Production Orders ({prods.length} PO{prods.length>1?"s":""}) · {totalProduced.toLocaleString()} total units</span>
                      {overseasDed > 0 && <span style={{ opacity:.8 }}>Overseas deduction: {overseasDed.toLocaleString()}</span>}
                    </div>
                    {/* Table header */}
                    <div style={{ display:"grid",gridTemplateColumns:"1.6fr 1.8fr auto auto auto",padding:"4px 10px",background:"#f0fdf4",fontSize:9,fontWeight:700,color:"#166534",gap:4,borderBottom:"1px solid #dcfce7" }}>
                      <span>Prod #</span><span>PO Name</span><span style={{ textAlign:"right" }}>Units</span><span style={{ textAlign:"right" }}>Ded</span><span style={{ textAlign:"right" }}>ATS</span>
                    </div>
                    {prodRows.map((p, i) => (
                      <div key={i} style={{ background:i%2===0?"#fff":"#f9fafb",borderBottom:"1px solid #dcfce7" }}>
                        <div style={{ display:"grid",gridTemplateColumns:"1.6fr 1.8fr auto auto auto",padding:"5px 10px",fontSize:10,gap:4,alignItems:"center" }}>
                          <span style={{ fontFamily:"monospace",fontWeight:700,color:"#1f2937",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.production||"—"}</span>
                          <span style={{ color:"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }} title={p.poName}>{p.poName||"—"}</span>
                          <span style={{ textAlign:"right",fontFamily:"monospace",fontWeight:700 }}>{(p.units||0).toLocaleString()}</span>
                          <span style={{ textAlign:"right",fontFamily:"monospace",color:p.deducted>0?"#dc2626":"#9ca3af" }}>{p.deducted>0?`-${p.deducted.toLocaleString()}`:"—"}</span>
                          <span style={{ textAlign:"right",fontFamily:"monospace",fontWeight:800,color:"#166534" }}>{p.flowAts.toLocaleString()}</span>
                        </div>
                        {/* Dates sub-row */}
                        <div style={{ display:"flex",gap:8,padding:"2px 10px 5px",fontSize:9,color:"#6b7280" }}>
                          <span>📦 Ex-Fac: <strong style={{ color:"#92400e" }}>{formatDateShort(p.etd)}</strong></span>
                          <span>🚢 Arrival: <strong style={{ color:"#166534" }}>{formatDateShort(p.arrival)}</strong></span>
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          )}

          {/* Shipment Dates (always show if available, highlighted in overseas mode) */}
          {!showAllocations && (dates.ex_factory || dates.arrival) && (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12 }}>
              <div style={{ background: isOverseas ? "#fffbeb" : "#f9fafb",padding:8,borderRadius:8,textAlign:"center",border: isOverseas ? "1px solid #fcd34d" : "none" }}>
                <p style={{ fontSize:10,color:"#92400e",fontWeight:600 }}>🚢 Ex-Factory</p>
                <p style={{ fontSize:14,fontWeight:800,color:"#78350f" }}>{formatDateShort(dates.ex_factory)}</p>
              </div>
              <div style={{ background: isOverseas ? "#ecfeff" : "#f9fafb",padding:8,borderRadius:8,textAlign:"center",border: isOverseas ? "1px solid #a5f3fc" : "none" }}>
                <p style={{ fontSize:10,color:"#0e7490",fontWeight:600 }}>📅 Est. Arrival</p>
                <p style={{ fontSize:14,fontWeight:800,color:"#164e63" }}>{formatDateShort(dates.arrival)}</p>
              </div>
            </div>
          )}

          {/* Size Pack */}
          <div style={{ display:"flex",gap:12,marginBottom:10 }}>
            <div style={{ background:"#faf5ff",padding:8,borderRadius:8,flex:1 }}>
              <p style={{ fontSize:10,color:"#6b7280" }}>Master</p>
              <p style={{ fontSize:16,fontWeight:800,color:"#7c3aed" }}>{sp.master_qty} pcs</p>
            </div>
            <div style={{ background:"#eff6ff",padding:8,borderRadius:8,flex:1 }}>
              <p style={{ fontSize:10,color:"#6b7280" }}>Inner</p>
              <p style={{ fontSize:16,fontWeight:800,color:"#3b82f6" }}>{sp.inner_qty} pcs</p>
            </div>
          </div>
          <div style={{ background:"#e5e7eb",borderRadius:8,overflow:"hidden" }}>
            <div style={{ background:"#667eea",color:"#fff",padding:6,textAlign:"center",fontWeight:700,fontSize:11 }}>Size Breakdown</div>
            {sp.sizes.map(([size, qty], i) => (
              <div key={i} style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:1 }}>
                <div style={{ background:"#fff",padding:5,textAlign:"center",fontWeight:600,fontSize:12 }}>{size}</div>
                <div style={{ background:"#fff",padding:5,textAlign:"center",color:"#7c3aed",fontWeight:700,fontSize:12 }}>{qty} pcs</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// ─── Cart Modal ──────────────────────────
function CartModal({ cart, onClose, onRemove, onClear, onUpdateQty, styleOverrides }) {
  const totalItems = cart.length;
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20 }} onClick={onClose}>
      <div style={{ background:"rgba(255,255,255,.97)",borderRadius:16,maxWidth:700,width:"100%",maxHeight:"90vh",overflowY:"auto",padding:28,boxShadow:"0 25px 60px rgba(0,0,0,.3)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h2 style={{ fontSize:22,fontWeight:800 }}>🛒 Cart</h2>
          <button onClick={onClose} style={{ fontSize:28,background:"none",border:"none",color:"#9ca3af",cursor:"pointer" }}>×</button>
        </div>
        {cart.length === 0 ? (
          <div style={{ textAlign:"center",padding:40,color:"#9ca3af" }}>
            <p style={{ fontSize:48,marginBottom:12 }}>🛒</p>
            <p style={{ fontSize:16 }}>Cart is empty</p>
          </div>
        ) : (
          <>
            {cart.map((c, i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:14,padding:14,border:"1px solid #e5e7eb",borderRadius:12,marginBottom:10 }}>
                <ImageWithFallback src={resolveImageUrl(c, styleOverrides)} alt={c.sku} style={{ width:56,height:56,borderRadius:8,objectFit:"cover" }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700,fontSize:14 }}>{c.sku}</p>
                  <p style={{ fontSize:12,color:"#6b7280" }}>{c.brand_full}</p>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <button onClick={() => onUpdateQty(i, Math.max(1, c.qty-1))} style={{ width:28,height:28,border:"1px solid #d1d5db",borderRadius:6,background:"#fff",cursor:"pointer",fontWeight:700 }}>−</button>
                  <span style={{ width:36,textAlign:"center",fontWeight:700,fontSize:15 }}>{c.qty}</span>
                  <button onClick={() => onUpdateQty(i, c.qty+1)} style={{ width:28,height:28,border:"1px solid #d1d5db",borderRadius:6,background:"#fff",cursor:"pointer",fontWeight:700 }}>+</button>
                </div>
                <button onClick={() => onRemove(i)} style={{ color:"#ef4444",background:"none",border:"none",cursor:"pointer",fontSize:18 }}>×</button>
              </div>
            ))}
            <div style={{ borderTop:"2px solid #e5e7eb",paddingTop:16,marginTop:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700,marginBottom:6 }}>
                <span>Total Items:</span><span>{totalItems}</span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700 }}>
                <span>Total Quantity:</span><span>{totalQty}</span>
              </div>
            </div>
            <div style={{ display:"flex",gap:10,marginTop:20 }}>
              <button onClick={onClear} style={{ background:"#ef4444",color:"#fff",border:"none",padding:"12px 20px",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:14 }}>
                🗑️ Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Universal Search Dropdown ───────────
function UniversalSearch({ items, onSelect, placeholder, styleOverrides }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return items.filter(i => i.sku?.toLowerCase().includes(q) || i.brand_full?.toLowerCase().includes(q)).slice(0, 15);
  }, [query, items]);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative",maxWidth:600,margin:"0 auto 24px" }}>
      <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "🔍 Search any SKU across all brands..."}
        style={{ width:"100%",padding:"14px 20px",border:"2px solid #d1d5db",borderRadius:14,fontSize:15,outline:"none",background:"#fff",transition:"border-color .2s" }}
        onFocus={e => e.target.style.borderColor = "#667eea"}
        onBlur={e => { e.target.style.borderColor = "#d1d5db"; }}
      />
      {open && results.length > 0 && (
        <div style={{ position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"2px solid #e5e7eb",borderTop:"none",borderRadius:"0 0 14px 14px",maxHeight:380,overflowY:"auto",zIndex:100,boxShadow:"0 10px 25px rgba(0,0,0,.12)" }}>
          {results.map((item, i) => (
            <div key={i} onClick={() => { onSelect(item); setOpen(false); setQuery(""); }}
              style={{ display:"flex",alignItems:"center",padding:"10px 16px",cursor:"pointer",borderBottom:"1px solid #f3f4f6",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <ImageWithFallback src={resolveImageUrl(item, styleOverrides)} alt={item.sku} style={{ width:48,height:48,objectFit:"cover",borderRadius:8,marginRight:14 }} />
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700,fontSize:13,color:"#1f2937" }}>{item.sku}</p>
                <p style={{ fontSize:11,color:"#6b7280" }}>{item.brand_full}</p>
              </div>
              <span style={{ fontSize:12,fontWeight:700,color: (item.total_ats||0) > 0 ? "#16a34a" : "#dc2626" }}>
                {(item.total_ats||0).toLocaleString()} ATS
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Color Name Helpers ─────────────────
const COLOR_MAP_URL = "https://nauticaslimfit.s3.us-east-2.amazonaws.com/Inventory+Colors+Data/style_color_map.xlsx?v=" + Math.floor(Date.now() / (1000 * 60 * 60));

function formatColorName(raw) {
  if (!raw) return "";
  let s = raw.trim();
  const replacements = { BLK:"Black", WHT:"White", BLU:"Blue", NVY:"Navy", GRY:"Grey" };
  s = s.replace(/\b([A-Za-z]+)\b/g, word => {
    const match = replacements[word.toUpperCase()];
    if (match) return match;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return s.replace(/\s{2,}/g, " ").trim();
}

function getStyleColorInfo(sku, brandAbbr, colorMap, styleOverrides) {
  if (!colorMap || Object.keys(colorMap).length === 0) return null;
  const fullSku = (sku || "").toUpperCase().trim();
  const baseSku = fullSku.split("-")[0];

  // 0) Style override color — highest priority (matches desktop, including prefix matching)
  if (styleOverrides) {
    const ov = getStyleOverride(sku, styleOverrides);
    if (ov && ov.color) return { display: formatColorName(ov.color), ground: formatColorName(ov.color), hasPrint: false };
  }

  let raw = fullSku.includes("-") ? colorMap[fullSku] : undefined;
  if (!raw) raw = colorMap[baseSku];
  if (!raw) {
    const prefix = BRAND_IMAGE_PREFIX[brandAbbr] || (brandAbbr || "").substring(0, 2);
    const numbers = baseSku.match(/\d+/g);
    if (!numbers || numbers.length === 0) return null;
    const mainNumber = numbers.reduce((a, b) => a.length > b.length ? a : b);
    const key = prefix + "_" + mainNumber.padStart(3, "0");
    raw = colorMap[key];
  }
  if (!raw) return null;
  if (raw.includes("||")) {
    const parts = raw.split("||");
    return { ground: formatColorName(parts[0]), print: formatColorName(parts[1]), display: formatColorName(parts[0]) + " / " + formatColorName(parts[1]), hasPrint: true };
  }
  return { color: formatColorName(raw), display: formatColorName(raw), hasPrint: false };
}

// ─── Production / Shipment Date Helpers ──────
function formatDateShort(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

function getProductionForSku(sku, prodData) {
  if (!sku || !prodData || prodData.length === 0) return [];
  // Strip size suffix (e.g. TMNAPY201SLB-15-15.5/32-33 → TMNAPY201SLB), then uppercase — mirrors main catalog exactly
  const skuUpper = sku.split("-")[0].toUpperCase();
  return prodData.filter(p => (p.style || "").split("-")[0].toUpperCase() === skuUpper);
}

function getEarliestDates(sku, prodData, warehouseQty, suppressionOverrides) {
  const prods = typeof warehouseQty === 'number'
    ? getActiveProductionForSku(sku, prodData, warehouseQty, suppressionOverrides)
    : getProductionForSku(sku, prodData);
  if (prods.length === 0) return { ex_factory: null, arrival: null, productions: [] };
  const sorted = [...prods].sort((a, b) => (a.arrival || new Date("2099")) - (b.arrival || new Date("2099")));
  return {
    ex_factory: sorted[0].etd,
    arrival: sorted[0].arrival,
    productions: sorted
  };
}

// ═══════════════════════════════════════════
// ARRIVAL SUPPRESSION
// ═══════════════════════════════════════════
const _SUPPRESS_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks
const _SUPPRESS_TOLERANCE = 0.10; // 10%

function _isProductionSuppressed(warehouseQty, prod, sku, suppressionOverrides) {
  if (sku && suppressionOverrides && suppressionOverrides.has(sku.toUpperCase())) return false;
  if (!prod.arrival) return false;
  const now = new Date();
  const diffMs = Math.abs(now.getTime() - prod.arrival.getTime());
  if (diffMs > _SUPPRESS_WINDOW_MS) return false;
  if (prod.units <= 0) return false;
  const pct = Math.abs(warehouseQty - prod.units) / prod.units;
  return pct <= _SUPPRESS_TOLERANCE;
}

function getActiveProductionForSku(sku, prodData, warehouseQty, suppressionOverrides) {
  const all = getProductionForSku(sku, prodData);
  if (typeof warehouseQty !== 'number') return all;
  return all.filter(p => !_isProductionSuppressed(warehouseQty, p, sku, suppressionOverrides));
}

function _getSuppressedIncoming(sku, prodData, warehouseQty, suppressionOverrides) {
  const all = getProductionForSku(sku, prodData);
  let suppressed = 0;
  all.forEach(p => {
    if (_isProductionSuppressed(warehouseQty, p, sku, suppressionOverrides)) suppressed += p.units;
  });
  return suppressed;
}

// ═══════════════════════════════════════════
// BANNER RULES HELPERS
// ═══════════════════════════════════════════
function _ruleFits(rule) {
  if (Array.isArray(rule.fits)) return rule.fits.filter(f => f && f !== 'any');
  if (rule.fit && rule.fit !== 'any') return [rule.fit];
  return [];
}
function _ruleCustomers(rule) {
  if (Array.isArray(rule.customers)) return rule.customers.filter(c => c && c.trim());
  if (rule.customer && rule.customer.trim()) return [rule.customer.trim()];
  return [];
}
function _ruleBrands(rule) {
  if (Array.isArray(rule.brands)) return rule.brands.filter(b => b && b.trim());
  return [];
}
function _ruleFabrics(rule) {
  if (Array.isArray(rule.fabrics)) return rule.fabrics.filter(f => f && f.trim());
  return [];
}

// Mirrors desktop extractFitCode 1:1.
//   1. Von Dutch B&T (WB/BT at positions 4-5) — checked FIRST so longer VD
//      bases still resolve correctly (otherwise slice(-3,-1) might land on
//      something else).
//   2. Try base.slice(-3, -1) and validate against FIT_CODES.
//   3. Fall back to dash suffix (e.g. NONAU175-SL).
//   4. Final fallback: whatever slice(-3, -1) returned, even if not in FIT_CODES.
function extractFitCode(sku) {
  if (!sku || sku.length < 3) return '';
  const parts = sku.toUpperCase().split('-');
  const baseStyle = parts[0];
  if (baseStyle.length >= 6 && baseStyle.substring(2, 4) === 'VD') {
    const vdFit = baseStyle.substring(4, 6);
    if (vdFit === 'WB' || vdFit === 'BT') return vdFit;
  }
  if (baseStyle.length >= 3) {
    const fitFromBase = baseStyle.slice(-3, -1);
    if (FIT_CODES[fitFromBase]) return fitFromBase;
  }
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    if (FIT_CODES[part]) return part;
  }
  return baseStyle.length >= 3 ? baseStyle.slice(-3, -1) : '';
}

function getMatchingBanners(sku, brandAbbr, bannerRules) {
  if (!bannerRules || bannerRules.length === 0) return [];
  const skuUpper = sku.toUpperCase().trim();
  const base = skuUpper.split('-')[0];
  const brandUp = (brandAbbr || '').toUpperCase().trim();
  const fit = extractFitCode(sku);
  const fab = base.length >= 6 ? base.substring(4, 6) : '';

  return bannerRules.filter(r => {
    // Visibility: mobile app is admin only
    const vis = r.visibility || 'both';
    if (vis === 'catalog') return false;

    // SKU-specific match (ONLY these SKUs — bypasses everything below)
    const rSkus = r.skus || [];
    if (rSkus.length > 0) {
      return rSkus.some(s => {
        const su = s.toUpperCase().trim();
        return su && (su === skuUpper || su === base || skuUpper.startsWith(su));
      });
    }

    // "Also Apply To" SKUs — additive: matches these IN ADDITION to dimensions
    const rAlsoSkus = r.alsoSkus || [];
    if (rAlsoSkus.length > 0) {
      const alsoMatch = rAlsoSkus.some(s => {
        const su = s.toUpperCase().trim();
        return su && (su === skuUpper || su === base || skuUpper.startsWith(su));
      });
      if (alsoMatch) return true;
    }

    // Dimension matching (all specified dimensions must match)
    const rCat = r.category || 'any';
    // Inclusive category match — a BC Carpenter matches 'pants', 'sportswear', AND 'young_men' rules
    if (rCat !== 'any' && !matchesCategory(sku, brandAbbr, rCat)) return false;
    const rFits = _ruleFits(r);
    if (rFits.length > 0 && !rFits.includes(fit)) return false;
    const rCusts = _ruleCustomers(r);
    if (rCusts.length > 0) return false; // mobile has no customer context
    const rBrands = _ruleBrands(r);
    if (rBrands.length > 0 && (!brandUp || !rBrands.map(b => b.toUpperCase()).includes(brandUp))) return false;
    const rFabs = _ruleFabrics(r);
    if (rFabs.length > 0 && (!fab || !rFabs.map(f => f.toUpperCase()).includes(fab))) return false;

    return true;
  });
}

function BannerBadges({ sku, brandAbbr, bannerRules }) {
  const banners = getMatchingBanners(sku, brandAbbr, bannerRules);
  if (banners.length === 0) return null;
  const byPos = {};
  banners.forEach(b => {
    const pos = b.position || 'top-left';
    if (!byPos[pos]) byPos[pos] = [];
    byPos[pos].push(b);
  });
  const posStyle = {
    'top-left':      (i) => ({ position:'absolute',top:6+i*24,left:6 }),
    'top-center':    (i) => ({ position:'absolute',top:6+i*24,left:'50%',transform:'translateX(-50%)' }),
    'top-right':     (i) => ({ position:'absolute',top:6+i*24,right:6 }),
    'middle-left':   (i) => ({ position:'absolute',top:'50%',left:6,transform:`translateY(calc(-50% + ${i*24}px))` }),
    'middle-right':  (i) => ({ position:'absolute',top:'50%',right:6,transform:`translateY(calc(-50% + ${i*24}px))` }),
    'bottom-left':   (i) => ({ position:'absolute',bottom:8+i*24,left:8 }),
    'bottom-center': (i) => ({ position:'absolute',bottom:8+i*24,left:'50%',transform:'translateX(-50%)' }),
    'bottom-right':  (i) => ({ position:'absolute',bottom:8+i*24,right:8 }),
  };
  const badges = [];
  for (const [pos, items] of Object.entries(byPos)) {
    const fn = posStyle[pos] || posStyle['top-left'];
    items.forEach((b, i) => {
      badges.push(
        <span key={`${pos}-${i}`} style={{ ...fn(i), background:b.bgColor||'rgba(220,38,38,0.9)',color:b.textColor||'#fff',padding:'3px 9px',borderRadius:6,fontSize:10,fontWeight:700,letterSpacing:'.3px',backdropFilter:'blur(2px)',zIndex:5,whiteSpace:'nowrap',maxWidth:'calc(100% - 16px)',overflow:'hidden',textOverflow:'ellipsis' }}>{b.text||''}</span>
      );
    });
  }
  return <>{badges}</>;
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// ANALYTICS VIEW — Brand → Color Breakdown
// ═══════════════════════════════════════════
const COLOR_CATS = ["white","black","navy","other_solids","fancies"];
const COLOR_CAT_LABELS = { white:"White Solid", black:"Black Solid", navy:"Navy Solid", other_solids:"Other Solids", fancies:"Fancies" };
const COLOR_CAT_EMOJI = { white:"⬜", black:"⬛", navy:"🟦", other_solids:"🎨", fancies:"✨" };

function AnalyticsView({ inventory, colorMap, styleOverrides, deductionAssignments }) {
  const [expandedBrand, setExpandedBrand] = useState({});
  const [sortBy, setSortBy] = useState("total-desc");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("color"); // "color" | "fabric"

  const data = useMemo(() => {
    if (!inventory?.length) return [];

    const brandMap = {};
    inventory.forEach(item => {
      if (!item.sku) return;
      const wh = (item.jtw||0) + (item.tr||0) + (item.dcw||0) + (item.qa||0);
      const incoming = item.incoming || 0;
      const committed = Math.abs(item.committed||0) + Math.abs(item.allocated||0);
      const totalStock = wh + incoming;
      const ats = item.total_ats || 0;

      // ── Split committed into WH vs Overseas using FIFO (same as rebuildBrands) ──
      let commWh = committed, commOs = 0;
      if (committed > 0) {
        const assign = (deductionAssignments || {})[item.sku] || null;
        if (assign === 'overseas') {
          commWh = 0; commOs = committed;
        } else if (assign === 'warehouse') {
          commWh = committed; commOs = 0;
        } else {
          // FIFO default: warehouse absorbs first, remainder to overseas
          commWh = Math.min(committed, wh);
          commOs = Math.max(0, committed - wh);
        }
      }

      // Brand resolution
      let brand = item.brand || "UNKNOWN";
      const _BA2 = { NM: "NICOLE" };
      if (_BA2[brand]) brand = _BA2[brand];
      const skuUp = item.sku.toUpperCase();
      if (skuUp.startsWith("VP")) brand = "VERSA";
      else if (skuUp.startsWith("LUCK")) brand = "LUCKY";
      else if (item.sku.length >= 4) {
        const code = item.sku.substring(2,4).toUpperCase();
        if (SKU_BRAND_CODE_MAP[code] && !BRAND_MAPPING[brand]) brand = SKU_BRAND_CODE_MAP[code];
      }
      if (styleOverrides) {
        const ov = getStyleOverride(item.sku, styleOverrides);
        if (ov && ov.brand) brand = ov.brand;
      }

      // Color classification
      const ci = getStyleColorInfo(item.sku, brand, colorMap, styleOverrides);
      const colorCat = classifyColor(ci ? ci.display : "", brand);

      // Fabric classification
      const fab = getFabricFromSKU(item.sku, styleOverrides);
      const fabKey = fab.code.toUpperCase();

      if (!brandMap[brand]) {
        brandMap[brand] = {
          brand,
          fullName: (BRAND_MAPPING[brand]||{}).full_name || brand,
          logo: (BRAND_MAPPING[brand]||{}).logo || DEFAULT_LOGO,
          colors: {},
          fabrics: {},
          totals: { wh:0, incoming:0, totalStock:0, committed:0, commWh:0, commOs:0, ats:0, skus:0 }
        };
        COLOR_CATS.forEach(c => { brandMap[brand].colors[c] = { wh:0, incoming:0, totalStock:0, committed:0, commWh:0, commOs:0, ats:0, skus:0 }; });
      }

      const b = brandMap[brand];

      // Color bucket
      const cc = b.colors[colorCat];
      cc.wh += wh; cc.incoming += incoming; cc.totalStock += totalStock; cc.committed += committed; cc.commWh += commWh; cc.commOs += commOs; cc.ats += ats; cc.skus++;

      // Fabric bucket
      if (!b.fabrics[fabKey]) b.fabrics[fabKey] = { code: fab.code, description: fab.description, wh:0, incoming:0, totalStock:0, committed:0, commWh:0, commOs:0, ats:0, skus:0 };
      const fc = b.fabrics[fabKey];
      fc.wh += wh; fc.incoming += incoming; fc.totalStock += totalStock; fc.committed += committed; fc.commWh += commWh; fc.commOs += commOs; fc.ats += ats; fc.skus++;

      b.totals.wh += wh; b.totals.incoming += incoming; b.totals.totalStock += totalStock; b.totals.committed += committed; b.totals.commWh += commWh; b.totals.commOs += commOs; b.totals.ats += ats; b.totals.skus++;
    });

    // Sort brands
    let list = Object.values(brandMap).filter(b => b.totals.totalStock > 0 || b.totals.ats !== 0);
    // Apply brand order first, then override with user sort
    list.sort((a, b) => {
      const ia = BRAND_ORDER.indexOf(a.brand);
      const ib = BRAND_ORDER.indexOf(b.brand);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.fullName.localeCompare(b.fullName);
    });

    const [key, dir] = sortBy.split("-");
    list.sort((a, b) => {
      let va, vb;
      if (key === "total") { va = a.totals.totalStock; vb = b.totals.totalStock; }
      else if (key === "ats") { va = a.totals.ats; vb = b.totals.ats; }
      else if (key === "wh") { va = a.totals.wh; vb = b.totals.wh; }
      else if (key === "incoming") { va = a.totals.incoming; vb = b.totals.incoming; }
      else if (key === "committed") { va = a.totals.committed; vb = b.totals.committed; }
      else if (key === "name") { return dir === "asc" ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName); }
      else { va = a.totals.totalStock; vb = b.totals.totalStock; }
      return dir === "asc" ? va - vb : vb - va;
    });

    return list;
  }, [inventory, colorMap, styleOverrides, sortBy, deductionAssignments]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(b => b.fullName.toLowerCase().includes(s) || b.brand.toLowerCase().includes(s));
  }, [data, search]);

  // Global sums
  const gTotals = useMemo(() => {
    const g = { wh:0, incoming:0, totalStock:0, committed:0, commWh:0, commOs:0, ats:0 };
    filtered.forEach(b => { g.wh += b.totals.wh; g.incoming += b.totals.incoming; g.totalStock += b.totals.totalStock; g.committed += b.totals.committed; g.commWh += b.totals.commWh; g.commOs += b.totals.commOs; g.ats += b.totals.ats; });
    return g;
  }, [filtered]);

  if (!inventory?.length) {
    return (
      <div style={{ textAlign:"center", padding:80, color:"#64748b" }}>
        <p style={{ fontSize:56, marginBottom:16 }}>📊</p>
        <p style={{ fontSize:20, fontWeight:700, color:"#e2e8f0", marginBottom:8 }}>No Inventory Data</p>
        <p style={{ fontSize:14, color:"#94a3b8" }}>Waiting for inventory to load...</p>
      </div>
    );
  }

  const numCell = { textAlign:"right", padding:"6px 8px", fontWeight:700, fontSize:13, fontFamily:"'DM Sans',monospace" };
  const headCell = { textAlign:"right", padding:"7px 8px", fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:".04em", whiteSpace:"nowrap" };
  const pctBadge = (ats, total) => {
    if (total <= 0) return null;
    const pct = Math.round((ats / total) * 100);
    const color = pct <= 15 ? "#ef4444" : pct <= 30 ? "#f59e0b" : "#34d399";
    return <span style={{ fontSize:10, fontWeight:800, color, marginLeft:4 }}>({pct}%)</span>;
  };

  return (
    <div style={{ paddingBottom:16 }}>
      {/* Global Summary Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:8, marginBottom:16 }}>
        {[
          { label:"Total Stock", val:gTotals.totalStock, color:"#e2e8f0", icon:"📦" },
          { label:"Warehouse", val:gTotals.wh, color:"#a78bfa", icon:"🏭" },
          { label:"Overseas", val:gTotals.incoming, color:"#fbbf24", icon:"🚢" },
          { label:"Total Committed", val:gTotals.committed, color:"#f87171", icon:"📋" },
          { label:"Comm (WH)", val:gTotals.commWh, color:"#fb923c", icon:"🏭" },
          { label:"Comm (OS)", val:gTotals.commOs, color:"#c084fc", icon:"🚢" },
          { label:"ATS", val:gTotals.ats, color:"#34d399", icon:"✅" },
        ].map((s, i) => (
          <div key={s.label} style={{
            background:"linear-gradient(135deg,rgba(30,41,59,.9),rgba(15,23,42,.9))",
            border:"1px solid rgba(255,255,255,.1)", borderRadius:12, padding:"12px 10px", textAlign:"center",
            ...(i === 6 ? { gridColumn:"span 2" } : {})
          }}>
            <div style={{ fontSize:10, marginBottom:2 }}>{s.icon}</div>
            <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.val.toLocaleString()}</div>
            <div style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mode Toggle */}
      <div style={{ display:"flex", background:"linear-gradient(135deg,rgba(30,41,59,.9),rgba(15,23,42,.9))", borderRadius:12, border:"1px solid rgba(255,255,255,.1)", overflow:"hidden", marginBottom:12 }}>
        {[{ key:"color", label:"🎨 By Color", desc:"White / Black / Navy / Solids / Fancies" }, { key:"fabric", label:"🧵 By Fabric", desc:"Fabric code breakdown" }].map(v => (
          <button key={v.key} onClick={() => { setMode(v.key); setExpandedBrand({}); }} style={{
            flex:1, padding:"12px 16px", border:"none", cursor:"pointer", transition:"all .15s", textAlign:"center",
            background: mode === v.key ? "rgba(129,140,248,.2)" : "transparent",
            borderBottom: mode === v.key ? "2px solid #818cf8" : "2px solid transparent"
          }}>
            <div style={{ fontSize:13, fontWeight:800, color: mode === v.key ? "#e2e8f0" : "#64748b" }}>{v.label}</div>
            <div style={{ fontSize:10, color: mode === v.key ? "#94a3b8" : "#475569", marginTop:2 }}>{v.desc}</div>
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter brands..."
            style={{ width:"100%", padding:"10px 14px 10px 34px", background:"rgba(255,255,255,.06)", border:"2px solid rgba(255,255,255,.12)", borderRadius:10, color:"#e2e8f0", fontSize:13, outline:"none", boxSizing:"border-box" }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding:"10px 12px", background:"rgba(255,255,255,.06)", border:"2px solid rgba(255,255,255,.12)", borderRadius:10, color:"#e2e8f0", fontSize:12, fontWeight:600, outline:"none" }}>
          <option value="total-desc">Total Stock ↓</option>
          <option value="total-asc">Total Stock ↑</option>
          <option value="ats-desc">ATS ↓</option>
          <option value="ats-asc">ATS ↑</option>
          <option value="wh-desc">Warehouse ↓</option>
          <option value="incoming-desc">Overseas ↓</option>
          <option value="committed-desc">Committed ↓</option>
          <option value="name-asc">Name A-Z</option>
        </select>
      </div>

      {/* Brand Cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(b => {
          const isOpen = !!expandedBrand[b.brand];
          const t = b.totals;
          const atsPct = t.totalStock > 0 ? Math.round((t.committed / t.totalStock) * 100) : 0;

          return (
            <div key={b.brand} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, overflow:"hidden" }}>
              {/* Brand Header */}
              <div onClick={() => setExpandedBrand(prev => ({...prev, [b.brand]: !prev[b.brand]}))}
                style={{ padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:14, transition:"transform 0.2s", transform:`rotate(${isOpen ? "90" : "0"}deg)`, flexShrink:0, color:"#64748b" }}>▶</div>
                <img src={b.logo} alt={b.fullName} style={{ height:26, maxWidth:80, objectFit:"contain", filter:"brightness(0) invert(1)", opacity:.7, flexShrink:0 }} onError={e => { e.target.style.display = "none"; }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:"#e2e8f0" }}>{b.fullName}</div>
                  <div style={{ fontSize:11, color:"#64748b", marginTop:1 }}>
                    {t.skus} styles
                  </div>
                </div>
                <div style={{ display:"flex", gap:16, alignItems:"center", flexShrink:0 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#a78bfa" }}>{t.wh.toLocaleString()}</div>
                    <div style={{ fontSize:8, color:"#64748b" }}>WH</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#fbbf24" }}>{t.incoming.toLocaleString()}</div>
                    <div style={{ fontSize:8, color:"#64748b" }}>OVERSEAS</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:"#34d399" }}>{t.ats.toLocaleString()}</div>
                    <div style={{ fontSize:8, color:"#64748b" }}>ATS</div>
                  </div>
                </div>
              </div>

              {/* Expanded: Breakdown Table */}
              {isOpen && (() => {
                // Build rows based on mode
                const rows = mode === "color"
                  ? COLOR_CATS.map(c => {
                      const cc = b.colors[c];
                      if (cc.totalStock === 0 && cc.ats === 0) return null;
                      return { key: c, label: COLOR_CAT_LABELS[c], icon: COLOR_CAT_EMOJI[c], ...cc };
                    }).filter(Boolean)
                  : Object.values(b.fabrics)
                      .filter(f => f.totalStock > 0 || f.ats !== 0)
                      .sort((a, b) => b.totalStock - a.totalStock)
                      .map(f => ({ key: f.code, label: f.description, icon: f.code, isFabric: true, ...f }));

                return (
                <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", background:"rgba(0,0,0,.15)", overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:680 }}>
                    <thead>
                      <tr style={{ borderBottom:"2px solid rgba(255,255,255,.1)" }}>
                        <th style={{ ...headCell, textAlign:"left", paddingLeft:16 }}>{mode === "color" ? "Color" : "Fabrication"}</th>
                        <th style={headCell}>Total Stock</th>
                        <th style={headCell}>Warehouse</th>
                        <th style={headCell}>Overseas</th>
                        <th style={headCell}>Comm (WH)</th>
                        <th style={headCell}>Comm (OS)</th>
                        <th style={headCell}>Total Comm</th>
                        <th style={headCell}>ATS</th>
                        <th style={headCell}>Sell-Thru %</th>
                        <th style={headCell}>Styles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(r => {
                        const sp = r.totalStock > 0 ? Math.round((r.committed / r.totalStock) * 100) : 0;
                        const spColor = sp >= 80 ? "#ef4444" : sp >= 60 ? "#f59e0b" : "#34d399";
                        return (
                          <tr key={r.key} style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                            <td style={{ padding:"8px 8px 8px 16px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                {r.isFabric
                                  ? <span style={{ fontSize:10, fontWeight:800, color:"#818cf8", background:"rgba(129,140,248,.15)", padding:"2px 6px", borderRadius:4, fontFamily:"monospace" }}>{r.icon}</span>
                                  : <span style={{ fontSize:14 }}>{r.icon}</span>
                                }
                                <span style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:180 }} title={r.label}>{r.label}</span>
                              </div>
                            </td>
                            <td style={{ ...numCell, color:"#e2e8f0" }}>{r.totalStock.toLocaleString()}</td>
                            <td style={{ ...numCell, color:"#a78bfa" }}>{r.wh.toLocaleString()}</td>
                            <td style={{ ...numCell, color:"#fbbf24" }}>{r.incoming.toLocaleString()}</td>
                            <td style={{ ...numCell, color:"#fb923c" }}>{r.commWh.toLocaleString()}</td>
                            <td style={{ ...numCell, color:"#c084fc" }}>{r.commOs.toLocaleString()}</td>
                            <td style={{ ...numCell, color:"#f87171" }}>{r.committed.toLocaleString()}</td>
                            <td style={{ ...numCell, color:"#34d399" }}>{r.ats.toLocaleString()}</td>
                            <td style={{ ...numCell }}>
                              <span style={{ fontSize:12, fontWeight:800, color:spColor, background: sp >= 80 ? "rgba(239,68,68,.12)" : sp >= 60 ? "rgba(245,158,11,.12)" : "rgba(52,211,153,.12)", padding:"3px 8px", borderRadius:6 }}>{sp}%</span>
                            </td>
                            <td style={{ ...numCell, color:"#94a3b8" }}>{r.skus}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop:"2px solid rgba(255,255,255,.1)" }}>
                        <td style={{ padding:"10px 8px 10px 16px", fontSize:12, fontWeight:800, color:"#94a3b8" }}>TOTAL</td>
                        <td style={{ ...numCell, fontWeight:800, color:"#e2e8f0" }}>{t.totalStock.toLocaleString()}</td>
                        <td style={{ ...numCell, fontWeight:800, color:"#a78bfa" }}>{t.wh.toLocaleString()}</td>
                        <td style={{ ...numCell, fontWeight:800, color:"#fbbf24" }}>{t.incoming.toLocaleString()}</td>
                        <td style={{ ...numCell, fontWeight:800, color:"#fb923c" }}>{t.commWh.toLocaleString()}</td>
                        <td style={{ ...numCell, fontWeight:800, color:"#c084fc" }}>{t.commOs.toLocaleString()}</td>
                        <td style={{ ...numCell, fontWeight:800, color:"#f87171" }}>{t.committed.toLocaleString()}</td>
                        <td style={{ ...numCell, fontWeight:800, color:"#34d399" }}>{t.ats.toLocaleString()}</td>
                        <td style={{ ...numCell }}>
                          <span style={{ fontSize:12, fontWeight:800, color: atsPct >= 80 ? "#ef4444" : atsPct >= 60 ? "#f59e0b" : "#34d399", background: atsPct >= 80 ? "rgba(239,68,68,.12)" : atsPct >= 60 ? "rgba(245,158,11,.12)" : "rgba(52,211,153,.12)", padding:"3px 8px", borderRadius:6 }}>{atsPct}%</span>
                        </td>
                        <td style={{ ...numCell, fontWeight:800, color:"#94a3b8" }}>{t.skus}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PRODUCTION RECAP VIEW
// ═══════════════════════════════════════════
const FOB_WAREHOUSE_DAYS = 37;
function getProdArrival(etd) {
  if (!etd) return null;
  const d = new Date(etd.getTime());
  d.setDate(d.getDate() + FOB_WAREHOUSE_DAYS);
  return d;
}
// Timezone-safe ledger date parser.
// Backend returns plain ISO strings like "2026-04-20". `new Date("2026-04-20")`
// parses that as midnight UTC, which renders as the PREVIOUS calendar day in
// any timezone west of UTC (EST, PST, etc). This parses YYYY-MM-DD as LOCAL
// midnight so the displayed date matches the ledger 1:1 in every timezone.
function parseLedgerDate(raw) {
  if (!raw) return null;
  const s = String(raw);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
function fmtDateShort(d) {
  if (!d || !(d instanceof Date) || isNaN(d)) return "—";
  return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"2-digit" });
}

function ProductionRecapView({ productionData, openOrdersData, styleOverrides, inventory, onStyleClick }) {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("etd-asc");
  const [expanded, setExpanded] = useState({});
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "producing" | "transit" | "arrived" | "noetd"

  // Find inventory item by base style and open the detail modal
  const handleStyleClick = useCallback((baseStyle) => {
    if (!inventory?.length || !onStyleClick) return;
    const match = inventory.find(i => (i.sku || "").toUpperCase().split("-")[0] === baseStyle.toUpperCase());
    if (match) onStyleClick(match);
  }, [inventory, onStyleClick]);

  // Status resolver — used for both filtering and display
  const getStatus = useCallback((g) => {
    const now = new Date();
    if (g.etds.length === 0) return { key:"noetd", label:"NO ETD", emoji:"❓", bg:"#fef2f2", color:"#dc2626" };
    const latestArr = getProdArrival(new Date(Math.max(...g.etds.map(d => d.getTime()))));
    const etdMin = new Date(Math.min(...g.etds.map(d => d.getTime())));
    if (latestArr < now) return { key:"arrived", label:"ARRIVED", emoji:"✅", bg:"#d1fae5", color:"#065f46" };
    if (etdMin < now) return { key:"transit", label:"IN TRANSIT", emoji:"🚢", bg:"#fef3c7", color:"#92400e" };
    return { key:"producing", label:"PRODUCING", emoji:"🏭", bg:"#dbeafe", color:"#1e40af" };
  }, []);

  // Group production data by production PO
  const groups = useMemo(() => {
    const g = {};
    productionData.forEach(p => {
      const key = p.production || "(No Production #)";
      if (!g[key]) g[key] = { production: key, poName: p.poName || "", lines: [], totalUnits: 0, styles: new Set(), etds: [], brands: new Set() };
      g[key].lines.push(p);
      g[key].totalUnits += p.units || 0;
      g[key].styles.add(p.style);
      if (p.brand) g[key].brands.add(p.brand);
      if (p.etd) g[key].etds.push(p.etd);
      if (p.poName && !g[key].poName) g[key].poName = p.poName;
    });
    return g;
  }, [productionData]);

  // Filter and sort
  const groupList = useMemo(() => {
    let list = Object.values(groups);

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter(g => getStatus(g).key === statusFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(g =>
        g.production.toLowerCase().includes(s) ||
        g.poName.toLowerCase().includes(s) ||
        [...g.brands].some(b => b.toLowerCase().includes(s)) ||
        g.lines.some(l => l.style.toLowerCase().includes(s)) ||
        g.lines.some(l => {
          if (!openOrdersData?.length) return false;
          return openOrdersData.filter(o => {
            const oBase = (o.style || o.baseStyle || "").toUpperCase().split("-")[0];
            return oBase === l.style && (o.openQty || o.open_qty || 0) > 0;
          }).some(o => (o.orderNo || o.po_number || "").toLowerCase().includes(s) || (o.customerFull || o.customer || "").toLowerCase().includes(s));
        })
      );
    }
    const [sortKey, sortDir] = sortMode.split("-");
    list.sort((a, b) => {
      let va, vb;
      if (sortKey === "units") { va = a.totalUnits; vb = b.totalUnits; }
      else if (sortKey === "etd") {
        va = a.etds.length ? Math.min(...a.etds.map(d => d.getTime())) : Infinity;
        vb = b.etds.length ? Math.min(...b.etds.map(d => d.getTime())) : Infinity;
      } else if (sortKey === "name") {
        va = (a.poName || a.production).toLowerCase();
        vb = (b.poName || b.production).toLowerCase();
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      } else if (sortKey === "styles") { va = a.styles.size; vb = b.styles.size; }
      else { va = a.totalUnits; vb = b.totalUnits; }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return list;
  }, [groups, search, sortMode, openOrdersData, statusFilter, getStatus]);

  // Status counts (from unfiltered groups, for pill badges)
  const statusCounts = useMemo(() => {
    const counts = { all:0, producing:0, transit:0, arrived:0, noetd:0 };
    Object.values(groups).forEach(g => {
      counts.all++;
      counts[getStatus(g).key]++;
    });
    return counts;
  }, [groups, getStatus]);

  // Summary stats
  const totalPOs = groupList.length;
  const totalLines = groupList.reduce((s, g) => s + g.lines.length, 0);
  const totalUnits = groupList.reduce((s, g) => s + g.totalUnits, 0);
  const allStyles = new Set(); groupList.forEach(g => g.styles.forEach(s => allStyles.add(s)));
  const allBrands = new Set(); groupList.forEach(g => g.brands.forEach(b => allBrands.add(b)));
  const allEtds = []; groupList.forEach(g => g.etds.forEach(d => allEtds.push(d)));
  const earliestEtd = allEtds.length ? new Date(Math.min(...allEtds.map(d => d.getTime()))) : null;
  const latestEtd = allEtds.length ? new Date(Math.max(...allEtds.map(d => d.getTime()))) : null;

  const toggleGroup = (prod) => setExpanded(prev => ({ ...prev, [prod]: !prev[prod] }));
  const expandAll = () => {
    const all = {};
    groupList.forEach(g => { all[g.production] = true; });
    setExpanded(all);
  };
  const collapseAll = () => setExpanded({});

  const getLinkedPOs = (style) => {
    if (!openOrdersData?.length) return [];
    return openOrdersData.filter(o => {
      const oBase = (o.style || o.baseStyle || "").toUpperCase().split("-")[0];
      return oBase === style && ((o.openQty || o.open_qty || 0) > 0 || (parseInt(o.pickQty) || 0) > 0);
    });
  };

  if (productionData.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:80, color:"#64748b" }}>
        <p style={{ fontSize:56, marginBottom:16 }}>🏭</p>
        <p style={{ fontSize:20, fontWeight:700, color:"#e2e8f0", marginBottom:8 }}>No Production Data</p>
        <p style={{ fontSize:14, color:"#94a3b8" }}>Production data is loading or unavailable</p>
      </div>
    );
  }

  const statCardStyle = { background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:"16px 12px", textAlign:"center" };

  return (
    <div style={{ paddingBottom:16 }}>
      {/* Summary Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:16 }}>
        <div style={statCardStyle}>
          <div style={{ fontSize:26, fontWeight:800, color:"#0891b2" }}>{totalPOs}</div>
          <div style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Production POs{search ? " (filtered)" : ""}</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize:26, fontWeight:800, color:"#7c3aed" }}>{totalLines}</div>
          <div style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Lines</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize:26, fontWeight:800, color:"#059669" }}>{totalUnits.toLocaleString()}</div>
          <div style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Total Units</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:20 }}>
        <div style={statCardStyle}>
          <div style={{ fontSize:26, fontWeight:800, color:"#d97706" }}>{allStyles.size}</div>
          <div style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Unique Styles</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize:26, fontWeight:800, color:"#dc2626" }}>{allBrands.size}</div>
          <div style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Brands</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize:14, fontWeight:800, color:"#e2e8f0" }}>{fmtDateShort(earliestEtd)}</div>
          <div style={{ fontSize:9, color:"#64748b", margin:"1px 0" }}>to</div>
          <div style={{ fontSize:14, fontWeight:800, color:"#e2e8f0" }}>{fmtDateShort(latestEtd)}</div>
          <div style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", marginTop:2 }}>ETD Range</div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
        {[
          { key:"all", label:"All", emoji:"📦", color:"#818cf8" },
          { key:"producing", label:"Producing", emoji:"🏭", color:"#3b82f6" },
          { key:"transit", label:"In Transit", emoji:"🚢", color:"#f59e0b" },
          { key:"arrived", label:"Arrived", emoji:"✅", color:"#10b981" },
          { key:"noetd", label:"No ETD", emoji:"❓", color:"#ef4444" },
        ].map(f => {
          const count = statusCounts[f.key];
          const active = statusFilter === f.key;
          return (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{
              display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:10, fontSize:12, fontWeight:700,
              border: active ? `2px solid ${f.color}` : "2px solid rgba(255,255,255,.1)",
              background: active ? `${f.color}22` : "rgba(255,255,255,.04)",
              color: active ? f.color : "#94a3b8",
              cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap"
            }}>
              <span style={{ fontSize:13 }}>{f.emoji}</span>
              {f.label}
              <span style={{
                fontSize:10, fontWeight:800, padding:"1px 6px", borderRadius:6, marginLeft:2,
                background: active ? `${f.color}33` : "rgba(255,255,255,.08)",
                color: active ? f.color : "#64748b"
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search + Sort + Actions */}
      <div style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:14, marginBottom:16 }}>
        <div style={{ position:"relative", marginBottom:10 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search PO #, production #, brand, style..."
            style={{ width:"100%", padding:"11px 14px 11px 38px", border:"2px solid rgba(255,255,255,.12)", borderRadius:10, fontSize:14, background:"rgba(255,255,255,.06)", color:"#e2e8f0", outline:"none", boxSizing:"border-box" }}
          />
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <select value={sortMode} onChange={e => setSortMode(e.target.value)}
            style={{ flex:1, minWidth:140, padding:"9px 12px", border:"2px solid rgba(255,255,255,.12)", borderRadius:10, fontSize:12, fontWeight:600, background:"rgba(255,255,255,.06)", color:"#e2e8f0", outline:"none", cursor:"pointer" }}>
            <option value="units-desc">Most Units</option>
            <option value="units-asc">Fewest Units</option>
            <option value="styles-desc">Most Styles</option>
            <option value="etd-asc">Earliest ETD</option>
            <option value="etd-desc">Latest ETD</option>
            <option value="name-asc">Name A-Z</option>
          </select>
          <button onClick={expandAll} style={{ padding:"9px 14px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, fontSize:11, fontWeight:700, color:"#94a3b8", cursor:"pointer" }}>Expand All</button>
          <button onClick={collapseAll} style={{ padding:"9px 14px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, fontSize:11, fontWeight:700, color:"#94a3b8", cursor:"pointer" }}>Collapse</button>
        </div>
      </div>

      {/* Production PO Groups */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {groupList.length === 0 ? (
          <div style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:48, textAlign:"center" }}>
            <p style={{ fontSize:48, marginBottom:16 }}>🔍</p>
            <p style={{ fontSize:18, fontWeight:700, color:"#e2e8f0" }}>No production found</p>
            <p style={{ fontSize:14, color:"#94a3b8" }}>Try adjusting your {statusFilter !== "all" ? "status filter or " : ""}search terms</p>
            {statusFilter !== "all" && (
              <button onClick={() => setStatusFilter("all")} style={{ marginTop:12, background:"rgba(129,140,248,.15)", color:"#818cf8", border:"1px solid rgba(129,140,248,.3)", padding:"8px 20px", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Show All Statuses
              </button>
            )}
          </div>
        ) : groupList.map(g => {
          const isOpen = !!expanded[g.production];
          const status = getStatus(g);
          const brandList = [...g.brands];
          const etdMin = g.etds.length ? new Date(Math.min(...g.etds.map(d => d.getTime()))) : null;
          const etdMax = g.etds.length ? new Date(Math.max(...g.etds.map(d => d.getTime()))) : null;
          const etdRange = etdMin ? (etdMin.getTime() === etdMax.getTime() ? fmtDateShort(etdMin) : `${fmtDateShort(etdMin)} → ${fmtDateShort(etdMax)}`) : "No ETD";
          const sortedLines = [...g.lines].sort((a, b) => (b.units || 0) - (a.units || 0));

          return (
            <div key={g.production} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, overflow:"hidden", borderLeft:`4px solid ${g.etds.length === 0 ? "#fecaca" : "#67e8f9"}` }}>
              {/* Header row - clickable */}
              <div onClick={() => toggleGroup(g.production)} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:16, transition:"transform 0.2s", transform:`rotate(${isOpen ? "90" : "0"}deg)`, flexShrink:0, color:"#94a3b8" }}>▶</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:4 }}>
                    <span style={{ fontWeight:800, fontSize:14, color:"#e2e8f0", fontFamily:"monospace" }}>{g.production}</span>
                    {g.poName && <span style={{ fontWeight:600, fontSize:12, color:"#94a3b8" }}>— {g.poName}</span>}
                    <span style={{ fontSize:10, fontWeight:700, background:status.bg, color:status.color, padding:"2px 8px", borderRadius:6 }}>{status.emoji} {status.label}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", fontSize:11, color:"#64748b" }}>
                    {brandList.map(b => (
                      <span key={b} style={{ fontWeight:700, background:"rgba(99,102,241,.15)", color:"#818cf8", padding:"1px 8px", borderRadius:4, fontSize:10 }}>{b}</span>
                    ))}
                    <span>📦 <strong style={{ color:"#e2e8f0" }}>{g.styles.size}</strong> styles</span>
                    <span>📅 {etdRange}</span>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#0891b2" }}>{g.totalUnits.toLocaleString()}</div>
                  <div style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>units</div>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", padding:"12px 12px 8px", background:"rgba(0,0,0,.15)" }}>
                  {sortedLines.map((l, li) => {
                    const arrival = l.etd ? getProdArrival(l.etd) : null;
                    const custPOs = getLinkedPOs(l.style);
                    const imgUrl = `${API_URL}/image/${l.style}?brand=${l.brand || ""}`;
                    return (
                      <div key={`${l.style}-${li}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 4px", borderBottom: li < sortedLines.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
                        <img src={imgUrl} alt={l.style} style={{ width:40, height:40, objectFit:"cover", borderRadius:8, border:"1px solid rgba(255,255,255,.1)", flexShrink:0 }}
                          onError={e => { e.target.style.display = "none"; }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div onClick={(e) => { e.stopPropagation(); handleStyleClick(l.style); }} style={{ fontWeight:700, fontFamily:"monospace", color:"#818cf8", fontSize:13, cursor:"pointer", textDecoration:"underline", textDecorationStyle:"dotted", textUnderlineOffset:3 }}>{l.style}</div>
                          <div style={{ fontSize:11, color:"#64748b", display:"flex", gap:8, flexWrap:"wrap", marginTop:2 }}>
                            <span>{l.brand}</span>
                            <span>ETD: {l.etd ? fmtDateShort(l.etd) : "—"}</span>
                            <span>Arrival: {arrival ? fmtDateShort(arrival) : "—"}</span>
                          </div>
                          {custPOs.length > 0 && (
                            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:4 }}>
                              {custPOs.slice(0, 4).map((o, oi) => {
                                const poNum = o.orderNo || o.po_number || "PO";
                                const isPipeline = o.isPipeline || o.is_pipeline;
                                const isOnPick = (parseInt(o.pickQty) || 0) > 0;
                                return (
                                  <span key={oi} style={{ fontSize:9, fontWeight:700, background: isOnPick ? "#f3e8ff" : isPipeline ? "#fef3c7" : "#f0fdf4", color: isOnPick ? "#7c3aed" : isPipeline ? "#92400e" : "#16a34a", padding:"2px 6px", borderRadius:4, fontFamily:"monospace", border: isOnPick ? "1px solid #ddd6fe" : "none" }}>
                                    {poNum}{isPipeline ? " B" : ""}{isOnPick ? " 🎟️" : ""}
                                  </span>
                                );
                              })}
                              {custPOs.length > 4 && <span style={{ fontSize:9, color:"#94a3b8", fontWeight:600 }}>+{custPOs.length - 4} more</span>}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontWeight:700, color:"#e2e8f0", fontSize:14 }}>{(l.units || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Footer */}
                  <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid rgba(255,255,255,.08)", display:"flex", gap:12, fontSize:10, color:"#64748b", flexWrap:"wrap" }}>
                    <span>🏭 <strong>{g.production}</strong></span>
                    {g.poName && <span>📋 {g.poName}</span>}
                    <span>📦 <strong>{g.totalUnits.toLocaleString()}</strong> units · <strong>{g.styles.size}</strong> styles</span>
                    <span>📅 {etdRange}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VersaInventoryApp() {
  const [view, setView] = useState("loading"); // loading, brands, inventory, detail
  const [inventory, setInventory] = useState([]);
  const [brands, setBrands] = useState({});
  const [currentBrand, setCurrentBrand] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const [flowMode, setFlowMode] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("ats-desc");
  const [syncStatus, setSyncStatus] = useState({ text: "⏳ Connecting...", type: "loading" });
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState(null);
  const [fitFilter, setFitFilter] = useState([]);
  const [fabricFilter, setFabricFilter] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [colorMap, setColorMap] = useState({});
  const [allocationData, setAllocationData] = useState([]);
  const [apoData, setApoData] = useState([]);
  const [openOrdersData, setOpenOrdersData] = useState([]);
  const [suppressionOverrides, setSuppressionOverrides] = useState(new Set());
  const [bannerRules, setBannerRules] = useState([]);
  const [styleOverrides, setStyleOverrides] = useState({});
  const [prepackDefaults, setPrepackDefaults] = useState([]);
  const [deductionAssignments, setDeductionAssignments] = useState({});
  const [showColorSummary, setShowColorSummary] = useState(false);
  const [showFabricSummary, setShowFabricSummary] = useState(false);
  const [colorCategoryFilter, setColorCategoryFilter] = useState(null); // { cat, label, skus: Set }
  const [fabricCodeFilter, setFabricCodeFilter] = useState(null);       // { code, label, skus: Set }
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandCategoryFilter, setBrandCategoryFilter] = useState("all"); // filters brand cards in brands view
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "production" | "analytics"

  // ─── Saved Transfers (view-only, sourced from web app's localStorage) ───
  // Mobile app never writes to this — it just reads `versa_saved_transfers`
  // and surfaces pending transfers on the style tile. Refreshes on mount
  // and when the tab regains focus (so newly-saved web-app transfers appear
  // without a full page reload).
  const [savedTransfers, setSavedTransfers] = useState(() => loadSavedTransfers());
  useEffect(() => {
    const refresh = () => setSavedTransfers(loadSavedTransfers());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh); // fires when another tab/window updates the key
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  // Re-index only when the transfers list actually changes — avoids per-card scans
  const transferIndex = useMemo(() => buildTransferIndex(savedTransfers), [savedTransfers]);

  const allItems = useMemo(() => {
    return Object.values(brands).flatMap(b => b.items || []);
  }, [brands]);

  // ─── 🎵 April 19 Easter Egg ──────────────────────────────────────────
  // Plays a hidden audio track once per session on April 19 (EST timezone).
  // Uses sessionStorage so it fires once per new app-load, not on every rerender
  // within the same session. Uses localStorage (keyed by date) as a secondary
  // guard so a refresh on the same day doesn't replay.
  // Muted auto-play is required by iOS/Android — we attach a one-time user-gesture
  // listener that unmutes and plays on first tap.
  useEffect(() => {
    try {
      // Get today's date in America/New_York (EST/EDT) — the Intl API handles DST automatically
      const nowNY = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date()); // e.g. "2026-04-19"

      const parts = nowNY.split('-');
      const month = parseInt(parts[1], 10);
      const day   = parseInt(parts[2], 10);

      // Only fire on April 19
      if (month !== 4 || day !== 19) return;

      // Guard: once per session (new load), and once per calendar day
      const sessionKey = 'easterEggPlayed_session';
      const dateKey    = 'easterEggPlayed_' + nowNY;
      if (sessionStorage.getItem(sessionKey) === '1') return;
      if (localStorage.getItem(dateKey) === '1') return;

      const audioUrl = 'https://nauticaslimfit.s3.us-east-2.amazonaws.com/Easter+Eggs/videoplayback.m4a';
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';

      const markPlayed = () => {
        sessionStorage.setItem(sessionKey, '1');
        localStorage.setItem(dateKey, '1');
      };

      // Attempt 1: direct play (works if browser autoplay policy allows)
      audio.play()
        .then(markPlayed)
        .catch(() => {
          // Autoplay blocked — wait for first user interaction, then play once
          const onFirstInteraction = () => {
            audio.play().then(markPlayed).catch(() => {});
            window.removeEventListener('touchstart', onFirstInteraction);
            window.removeEventListener('click', onFirstInteraction);
            window.removeEventListener('keydown', onFirstInteraction);
          };
          window.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true });
          window.addEventListener('click', onFirstInteraction, { once: true });
          window.addEventListener('keydown', onFirstInteraction, { once: true });
        });
    } catch (e) {
      // Silently ignore — an easter egg should never break the app
    }
  }, []); // Empty deps — fire exactly once on mount

  // allItems filtered by the brands-view category pill — used by stats bar
  const allItemsFiltered = useMemo(() => {
    if (brandCategoryFilter === "all") return allItems;
    return allItems.filter(i => matchesCategory(i.sku, i.brand_abbr || i.brand, brandCategoryFilter));
  }, [allItems, brandCategoryFilter, styleOverrides]);

  // Filter brand cards when a category is selected on the brands view
  const filteredBrands = useMemo(() => {
    const entries = sortBrands(Object.entries(brands));
    if (brandCategoryFilter === "all") return entries;
    return entries.filter(([, data]) =>
      (data.items || []).some(i => matchesCategory(i.sku, i.brand_abbr || i.brand, brandCategoryFilter))
    );
  }, [brands, brandCategoryFilter, styleOverrides]);

  // ─── Data Loading ──────────────────────
  useEffect(() => {
    const loadData = async () => {
      // Try localStorage first
      try {
        const cached = localStorage.getItem("versa_inventory_v2");
        if (cached) {
          const data = JSON.parse(cached);
          if (data.length > 0) {
            setInventory(data);
            setBrands(rebuildBrands(data, "all"));
            setView("brands");
            setSyncStatus({ text: `📦 Cached · ${data.length} items`, type: "cached" });
            backgroundPreloadAll(data);
          }
        }
      } catch (e) { /* ignore */ }

      // Fetch live data
      try {
        setSyncStatus({ text: "🔄 Syncing...", type: "loading" });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120000);
        const resp = await fetch(`${API_URL}/sync`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const result = await resp.json();
        if (result.inventory?.length > 0) {
          setInventory(result.inventory);
          setBrands(rebuildBrands(result.inventory, "all"));
          setView("brands");
          try { localStorage.setItem("versa_inventory_v2", JSON.stringify(result.inventory)); } catch (e) { /* quota */ }
          const t = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
          setSyncStatus({ text: `⚡ Live · ${result.inventory.length} items · ${t}`, type: "success" });
          _bgPreloadStarted = false; // reset so live data gets preloaded
          backgroundPreloadAll(result.inventory);
        }
      } catch (err) {
        console.warn("Sync failed:", err.message);
        if (inventory.length > 0) {
          setSyncStatus({ text: "📦 Offline (cached)", type: "cached" });
        } else {
          setSyncStatus({ text: "⚠️ Could not connect", type: "error" });
          setView("brands"); // Show empty state
        }
      }
    };
    loadData();

    // Load production data for shipment dates
    const loadProduction = async () => {
      try {
        const resp = await fetch(`${API_URL}/production`);
        if (!resp.ok) return;
        const json = await resp.json();
        const parsed = (json.production || []).map(p => {
          const etdDate = parseLedgerDate(p.etd);
          const arrivalDate = getProdArrival(etdDate);
          return { production: p.production || "", poName: p.poName || "", style: (p.style || "").toUpperCase(), units: p.units || 0, brand: p.brand || "", etd: etdDate, arrival: arrivalDate };
        });
        setProductionData(parsed);
      } catch (e) { console.warn("Production data unavailable:", e.message); }
    };
    loadProduction();

    // Load color map from S3 Excel
    const loadColorMap = async () => {
      try {
        // Dynamically load SheetJS
        if (!window.XLSX) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        const resp = await fetch(COLOR_MAP_URL);
        if (!resp.ok) throw new Error("Status " + resp.status);
        const data = await resp.arrayBuffer();
        const wb = window.XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets["Color Map"] || wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(sheet);
        const map = {};
        rows.forEach(row => {
          const key = (row.Key || row.Style_Number || row.Style_Num || '').toString().trim().toUpperCase();
          if (key && row.Color_Description) map[key] = row.Color_Description;
        });
        setColorMap(map);
        console.log("✓ Color map loaded:", Object.keys(map).length, "entries");
      } catch (e) { console.warn("Color map unavailable:", e.message); }
    };
    loadColorMap();

    // Load allocation data (virtual warehouse manual holds)
    const loadAllocations = async () => {
      try {
        const resp = await fetch(`${API_URL}/allocations`);
        if (!resp.ok) return;
        const json = await resp.json();
        setAllocationData(json.allocations || []);
        console.log("✓ Allocations loaded:", (json.allocations || []).length, "rows");
      } catch (e) { console.warn("Allocations unavailable:", e.message); }
    };
    loadAllocations();

    // Load APO data (virtual warehouse customer allocations)
    const loadApo = async () => {
      try {
        const resp = await fetch(`${API_URL}/apo`);
        if (!resp.ok) return;
        const json = await resp.json();
        setApoData(json.apo || []);
        console.log("✓ APO data loaded:", (json.apo || []).length, "rows");
      } catch (e) { console.warn("APO data unavailable:", e.message); }
    };
    loadApo();

    // Load open orders (A2000 committed PO breakdown)
    const loadOpenOrders = async () => {
      try {
        const c = new AbortController(); setTimeout(() => c.abort(), 12000);
        const resp = await fetch(`${ORDERS_API_URL}/api/orders`, { signal: c.signal });
        if (!resp.ok) return;
        const json = await resp.json();
        setOpenOrdersData(json.orders || []);
        console.log("✓ Open orders loaded:", (json.orders || []).length, "rows");
      } catch (e) { console.warn("Open orders unavailable:", e.message); }
    };
    loadOpenOrders();

    // Load suppression overrides (S3-backed SKU exemptions)
    const loadSuppressionOverrides = async () => {
      try {
        const c = new AbortController(); setTimeout(() => c.abort(), 10000);
        const resp = await fetch(`${API_URL}/suppression-overrides`, { signal: c.signal });
        if (!resp.ok) return;
        const json = await resp.json();
        setSuppressionOverrides(new Set((json.overrides || []).map(s => s.toUpperCase())));
        console.log("✓ Suppression overrides loaded:", (json.overrides || []).length);
      } catch (e) { console.warn("Suppression overrides unavailable:", e.message); }
    };
    loadSuppressionOverrides();

    // Load banner rules (S3-backed custom tile banners)
    const loadBannerRules = async () => {
      try {
        const c = new AbortController(); setTimeout(() => c.abort(), 10000);
        const resp = await fetch(`${API_URL}/banner-rules`, { signal: c.signal });
        if (!resp.ok) return;
        const json = await resp.json();
        const loaded = Array.isArray(json.rules) ? json.rules : [];
        setBannerRules(loaded.length > 0 ? loaded : BANNER_RULES_SEED);
        console.log("✓ Banner rules loaded:", loaded.length);
      } catch (e) {
        console.warn("Banner rules unavailable:", e.message);
        setBannerRules(BANNER_RULES_SEED);
      }
    };
    loadBannerRules();

    // Load style overrides (color/brand overrides from S3)
    const loadStyleOverrides = async () => {
      try {
        const c = new AbortController(); setTimeout(() => c.abort(), 10000);
        const resp = await fetch(`${API_URL}/overrides`, { signal: c.signal, headers: { 'Cache-Control': 'no-cache' } });
        if (!resp.ok) return;
        const json = await resp.json();
        const raw = json.overrides || {};
        let map = {};
        if (Array.isArray(raw)) {
          // Array format: each entry has a .sku field
          raw.forEach(ov => { if (ov.sku) map[ov.sku.toUpperCase()] = ov; });
        } else if (typeof raw === 'object') {
          // Object format (desktop standard): keys are SKUs, values are override objects
          Object.entries(raw).forEach(([sku, ov]) => { map[sku.toUpperCase()] = ov; });
        }
        setStyleOverrides(map);
        _imageCacheVersion = Date.now(); // bust browser cache for all image URLs
        _bgPreloadStarted = false; // allow background preloader to re-run with fresh URLs
        console.log("✓ Style overrides loaded:", Object.keys(map).length, "| cache version:", _imageCacheVersion);
      } catch (e) { console.warn("Style overrides unavailable:", e.message); }
    };
    loadStyleOverrides();

    // Load prepack defaults (dynamic size packs from S3)
    const loadPrepackDefaults = async () => {
      try {
        const c = new AbortController(); setTimeout(() => c.abort(), 10000);
        const resp = await fetch(`${API_URL}/prepack-defaults`, { signal: c.signal });
        if (!resp.ok) return;
        const json = await resp.json();
        setPrepackDefaults(Array.isArray(json.defaults) ? json.defaults : []);
        console.log("✓ Prepack defaults loaded:", (json.defaults || []).length);
      } catch (e) { console.warn("Prepack defaults unavailable:", e.message); }
    };
    loadPrepackDefaults();

    // Load deduction assignments (per-SKU routing rules)
    const loadDeductionAssignments = async () => {
      try {
        const c = new AbortController(); setTimeout(() => c.abort(), 10000);
        const resp = await fetch(`${API_URL}/deduction-assignments`, { signal: c.signal });
        if (!resp.ok) return;
        const json = await resp.json();
        setDeductionAssignments(json.assignments || {});
        console.log("✓ Deduction assignments loaded:", Object.keys(json.assignments || {}).length);
      } catch (e) { console.warn("Deduction assignments unavailable:", e.message); }
    };
    loadDeductionAssignments();

    // Auto-refresh inventory + style overrides every 5 minutes
    const refreshInterval = setInterval(async () => {
      try {
        const resp = await fetch(`${API_URL}/sync`);
        if (!resp.ok) return;
        const result = await resp.json();
        if (result.inventory?.length > 0) {
          setInventory(result.inventory);
          const t = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
          setSyncStatus({ text: `⚡ Live · ${result.inventory.length} items · ${t}`, type: "success" });
          try { localStorage.setItem("versa_inventory_v2", JSON.stringify(result.inventory)); } catch (e) {}
        }
      } catch (e) { /* silent retry next interval */ }
      // Also refresh style overrides so new S3 images are picked up
      loadStyleOverrides();
    }, 300000); // 5 min

    // Daily refresh for production data and color map
    const dailyRefresh = setInterval(() => {
      loadProduction();
      loadColorMap();
      console.log("🔄 Daily refresh: production + colors reloaded");
    }, 86400000); // 24 hours

    // Weekly refresh for allocation data (every 7 days)
    const weeklyRefresh = setInterval(() => {
      loadAllocations();
      console.log("🔄 Weekly refresh: allocations reloaded");
    }, 604800000); // 7 days

    return () => { clearInterval(refreshInterval); clearInterval(dailyRefresh); clearInterval(weeklyRefresh); };
  }, []);

  // Rebuild brands when filterMode or suppression-relevant data changes
  useEffect(() => {
    if (inventory.length > 0) {
      setBrands(rebuildBrands(inventory, filterMode, productionData, suppressionOverrides, deductionAssignments, styleOverrides, warehouseFilter, allocationData));
    }
  }, [filterMode, inventory, productionData, suppressionOverrides, deductionAssignments, styleOverrides, warehouseFilter, allocationData]);

  // ─── Navigation with Browser History ────────────────────────
  const goToBrands = useCallback(() => { 
    setView("brands"); setCurrentBrand(null); setSelectedItem(null); setSearchQuery(""); setFitFilter([]); setFabricFilter([]); 
    window.history.pushState({ view: "brands" }, "", "#brands");
  }, []);
  const goToInventory = useCallback((brandKey) => { 
    setCurrentBrand(brandKey); 
    setView("inventory"); 
    setSelectedItem(null); 
    setSearchQuery(""); 
    setFitFilter([]); 
    setFabricFilter([]);
    setShowColorSummary(false);
    setShowFabricSummary(false);
    setColorCategoryFilter(null);
    setFabricCodeFilter(null);
    // Pre-seed inventory category filter from brands-view filter when drilling in
    setCategoryFilter(brandCategoryFilter !== "all" ? brandCategoryFilter : "all");
    window.history.pushState({ view: "inventory", brand: brandKey }, "", `#brand-${brandKey}`);
    // Preload images for this brand
    const b = brands[brandKey];
    if (b?.items) preloadImages(b.items);
  }, [brands, brandCategoryFilter]);
  const goToDetail = useCallback((item) => { 
    setSelectedItem(item); 
    window.history.pushState({ view: "detail", sku: item.sku }, "", `#sku-${item.sku}`);
  }, []);

  // ─── Browser Back Button Support ────────────────────────
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      if (!state || state.view === "brands") {
        setView("brands"); setCurrentBrand(null); setSelectedItem(null); setSearchQuery(""); setFitFilter([]); setFabricFilter([]);
      } else if (state.view === "inventory" && state.brand) {
        setCurrentBrand(state.brand); setView("inventory"); setSelectedItem(null); setSearchQuery(""); setFitFilter([]); setFabricFilter([]);
      } else if (state.view === "detail") {
        // just close the modal, stay on inventory
        setSelectedItem(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    // Set initial state
    window.history.replaceState({ view: "brands" }, "", "#brands");
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ─── Backspace Key Navigation ────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't interfere if user is typing in an input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "Backspace") {
        e.preventDefault();
        if (selectedItem) {
          setSelectedItem(null);
          window.history.back();
        } else if (showCart) {
          setShowCart(false);
        } else if (view === "inventory") {
          goToBrands();
        }
      }
      // Escape also closes modals
      if (e.key === "Escape") {
        if (showExport) setShowExport(false);
        else if (selectedItem) { setSelectedItem(null); window.history.back(); }
        else if (showCart) setShowCart(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, showCart, showExport, view, goToBrands]);

  // ─── Cart Actions ──────────────────────
  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.findIndex(c => c.sku === item.sku);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], qty: updated[existing].qty + 1 };
        return updated;
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setToast({ message: `Added ${item.sku} to cart`, type: "success" });
  }, []);

  // ─── Filter Mode Toggle ────────────────
  const cycleFilterMode = useCallback(() => {
    setFilterMode(prev => {
      const next = prev === "all" ? "incoming" : prev === "incoming" ? "ats" : "all";
      // Reset sort if leaving overseas mode while on arrival sort
      if (prev === "incoming" && (sortBy === "arrival-asc" || sortBy === "arrival-desc")) {
        setSortBy("ats-desc");
      }
      // Reset flow mode when leaving overseas view
      if (prev === "incoming") setFlowMode(false);
      // Reset warehouse sub-filter when leaving ATS mode
      if (prev === "ats") setWarehouseFilter("all");
      return next;
    });
  }, [sortBy]);

  // ─── Brand View Filtering ─────────────
  const brandData = currentBrand ? brands[currentBrand] : null;
  const filteredItems = useMemo(() => {
    if (!brandData) return [];
    let items = [...brandData.items];
    // Category filter — inclusive: items can match multiple categories (e.g. BC bottom matches pants+sportswear+young_men)
    if (categoryFilter !== "all") {
      items = items.filter(i => matchesCategory(i.sku, i.brand_abbr || i.brand, categoryFilter));
    }
    // Color category filter (from Color Summary panel click)
    if (colorCategoryFilter) {
      items = items.filter(i => colorCategoryFilter.skus.has(i.sku.toUpperCase()));
    }
    // Fabric code filter (from Fabric Summary panel click)
    if (fabricCodeFilter) {
      items = items.filter(i => fabricCodeFilter.skus.has(i.sku.toUpperCase()));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.sku?.toLowerCase().includes(q));
    }
    if (fitFilter.length > 0) {
      items = items.filter(i => {
        const f = getFitFromSKU(i.sku, styleOverrides);
        return fitFilter.some(ff => f.toLowerCase().includes(ff.toLowerCase()));
      });
    }
    if (fabricFilter.length > 0) {
      items = items.filter(i => {
        const f = getFabricFromSKU(i.sku, styleOverrides);
        return fabricFilter.includes(f.code);
      });
    }
    // Sort
    if (sortBy === "ats-desc") items.sort((a,b) => (b.total_ats||0)-(a.total_ats||0));
    else if (sortBy === "ats-asc") items.sort((a,b) => (a.total_ats||0)-(b.total_ats||0));
    else if (sortBy === "sku-asc") items.sort((a,b) => (a.sku||"").localeCompare(b.sku||""));
    else if (sortBy === "sku-desc") items.sort((a,b) => (b.sku||"").localeCompare(a.sku||""));
    else if (sortBy === "arrival-asc") items.sort((a,b) => {
      const da = getEarliestDates(a.sku, productionData, (a.jtw||0)+(a.tr||0)+(a.dcw||0)+(a.qa||0), suppressionOverrides).arrival || new Date("2099");
      const db = getEarliestDates(b.sku, productionData, (b.jtw||0)+(b.tr||0)+(b.dcw||0)+(b.qa||0), suppressionOverrides).arrival || new Date("2099");
      return da - db;
    });
    else if (sortBy === "arrival-desc") items.sort((a,b) => {
      const da = getEarliestDates(a.sku, productionData, (a.jtw||0)+(a.tr||0)+(a.dcw||0)+(a.qa||0), suppressionOverrides).arrival || new Date("1970");
      const db = getEarliestDates(b.sku, productionData, (b.jtw||0)+(b.tr||0)+(b.dcw||0)+(b.qa||0), suppressionOverrides).arrival || new Date("1970");
      return db - da;
    });

    // ── FLOW MODE: Expand overseas items by production order ──
    // Production data provides DATES and PO names; QUANTITIES come from the ATS file.
    if (flowMode && filterMode === "incoming") {
      let flowItems = [];
      items.forEach(item => {
        // Get real warehouse qty from raw inventory (incoming mode zeros jtw/tr/dcw/qa)
        const rawItem = inventory.find(d => d.sku === item.sku);
        const rawWh = rawItem ? (rawItem.jtw||0)+(rawItem.tr||0)+(rawItem.dcw||0)+(rawItem.qa||0) : 0;
        const prods = getActiveProductionForSku(item.sku, productionData, rawWh, suppressionOverrides);
        if (prods.length > 0) {
          const sortedProds = [...prods].sort((a, b) => (a.arrival || new Date("2099")) - (b.arrival || new Date("2099")));
          const atsIncoming = item.incoming || 0;
          const overseasDed = item._overseas_deducted || 0;
          const totalProdUnits = sortedProds.reduce((s, p) => s + (p.units||0), 0);
          let remaining = overseasDed;
          let allocatedSoFar = 0;
          sortedProds.forEach((p, idx) => {
            let scaledUnits;
            if (idx === sortedProds.length - 1) {
              scaledUnits = atsIncoming - allocatedSoFar;
            } else {
              scaledUnits = totalProdUnits > 0 ? Math.round((p.units||0) / totalProdUnits * atsIncoming) : atsIncoming;
            }
            allocatedSoFar += scaledUnits;
            const deductFromThis = Math.min(remaining, scaledUnits);
            const flowAts = scaledUnits - deductFromThis;
            remaining -= deductFromThis;
            flowItems.push({
              ...item,
              total_ats: flowAts,
              _flow: true,
              _flow_key: `${item.sku}__flow_${idx}`,
              _flow_production: p.production,
              _flow_po: p.poName,
              _flow_units: scaledUnits,
              _flow_deducted: deductFromThis,
              _flow_etd: p.etd,
              _flow_arrival: p.arrival
            });
          });
        } else {
          flowItems.push({
            ...item,
            _flow: true,
            _flow_key: `${item.sku}__flow_noprod`,
            _flow_production: "",
            _flow_po: "No Production Data",
            _flow_units: item.total_ats,
            _flow_deducted: 0,
            _flow_etd: null,
            _flow_arrival: null
          });
        }
      });
      items = flowItems;
      // Re-sort flow items by date
      if (sortBy === "arrival-asc" || sortBy === "ats-desc") {
        items.sort((a, b) => (a._flow_arrival || new Date("2099")) - (b._flow_arrival || new Date("2099")));
      } else if (sortBy === "arrival-desc") {
        items.sort((a, b) => (b._flow_arrival || new Date("1970")) - (a._flow_arrival || new Date("1970")));
      }
    }

    return items;
  }, [brandData, categoryFilter, colorCategoryFilter, fabricCodeFilter, searchQuery, fitFilter, fabricFilter, sortBy, productionData, suppressionOverrides, styleOverrides, flowMode, filterMode, deductionAssignments, inventory]);

  // Items with only category filter applied — used by Color/Fabric summary panels
  // so their counts reflect the active category (e.g. Long Sleeve) without being
  // affected by their own click-to-filter selections (which would be circular).
  const categoryFilteredItems = useMemo(() => {
    if (!brandData) return [];
    if (categoryFilter === "all") return brandData.items;
    return brandData.items.filter(i => matchesCategory(i.sku, i.brand_abbr || i.brand, categoryFilter));
  }, [brandData, categoryFilter, styleOverrides]);

  // Get unique fits/fabrics for filters
  const availableFits = useMemo(() => {
    if (!brandData) return [];
    const fits = new Set(brandData.items.map(i => getFitFromSKU(i.sku, styleOverrides)));
    return [...fits].sort();
  }, [brandData]);

  const availableFabrics = useMemo(() => {
    if (!brandData) return [];
    const fabs = {};
    brandData.items.forEach(i => { const f = getFabricFromSKU(i.sku, styleOverrides); fabs[f.code] = f.description; });
    return Object.entries(fabs).sort((a,b) => a[1].localeCompare(b[1]));
  }, [brandData]);

  // ─── Sync Status Colors ────────────────
  const statusColors = { loading:"#fef3c7", success:"#dcfce7", cached:"#dbeafe", error:"#fee2e2" };
  const statusTextColors = { loading:"#a16207", success:"#166534", cached:"#1e40af", error:"#dc2626" };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div style={{ fontFamily:"'Outfit','DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",background:"linear-gradient(140deg,#0f172a 0%,#1e293b 40%,#334155 100%)",minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        .brand-card { background:#fff; border-radius:14px; border:2px solid #e5e7eb; cursor:pointer; transition:all .25s ease; overflow:hidden; }
        .brand-card:hover { transform:translateY(-6px); box-shadow:0 16px 40px rgba(99,102,241,.2); border-color:#818cf8; }
        .product-card { transition:all .25s ease; cursor:pointer; }
        .product-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,.12); border-color:#818cf8 !important; }
        .spinner { width:40px;height:40px;border:3px solid #334155;border-top:3px solid #818cf8;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes slideInRight { from { transform:translateX(300px); opacity:0; } to { transform:translateX(0); opacity:1; } }
        input:focus, select:focus { outline:none; border-color:#818cf8 !important; box-shadow:0 0 0 3px rgba(129,140,248,.15); }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:#475569; border-radius:3px; }
        .filter-pill { padding:6px 14px; border-radius:99px; font-size:12px; font-weight:600; border:2px solid #334155; cursor:pointer; transition:all .15s; background:transparent; color:#94a3b8; }
        .filter-pill:hover { border-color:#818cf8; color:#c7d2fe; }
        .filter-pill.active { background:#818cf8; border-color:#818cf8; color:#fff; }
      `}</style>

      {/* ─── HEADER ────────────────────────── */}
      <header style={{ background:"rgba(15,23,42,.85)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,.06)",padding:"14px 24px",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" style={{ width:38,height:38,flexShrink:0 }}>
              <defs>
                <linearGradient id="vl1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818cf8"/><stop offset="50%" stopColor="#667eea"/><stop offset="100%" stopColor="#764ba2"/></linearGradient>
                <linearGradient id="vl2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c4b5fd"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient>
                <linearGradient id="vl3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0f172a"/><stop offset="60%" stopColor="#1e293b"/><stop offset="100%" stopColor="#334155"/></linearGradient>
              </defs>
              <rect width="200" height="200" rx="42" fill="url(#vl3)"/>
              <circle cx="100" cy="95" r="64" fill="none" stroke="url(#vl1)" strokeWidth="2" opacity="0.15"/>
              <path d="M52,50 L100,130" stroke="url(#vl1)" strokeWidth="16" strokeLinecap="round" fill="none"/>
              <path d="M148,50 L100,130" stroke="url(#vl2)" strokeWidth="16" strokeLinecap="round" fill="none"/>
              <g transform="translate(100,132)" opacity="0.8"><polygon points="0,-6 5,0 0,6 -5,0" fill="#c4b5fd"/></g>
              <g transform="translate(100,168)" opacity="0.45">
                <rect x="-22" y="0" width="10" height="10" rx="2.5" fill="#818cf8"/>
                <rect x="-5" y="0" width="10" height="10" rx="2.5" fill="#667eea"/>
                <rect x="12" y="0" width="10" height="10" rx="2.5" fill="#764ba2"/>
              </g>
            </svg>
            <div>
              <h1 style={{ fontSize:20,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.02em" }}>{activeTab === "production" ? "Production Recap" : activeTab === "analytics" ? "Color Analytics" : "Inventory Management"}</h1>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <p style={{ fontSize:12,color:"#64748b" }}>Real-time inventory system</p>
                <span style={{ fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:99,background:statusColors[syncStatus.type],color:statusTextColors[syncStatus.type] }}>
                  {syncStatus.text}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            {/* Filter Mode */}
            <button onClick={cycleFilterMode} style={{
              background: filterMode === "all" ? "linear-gradient(135deg,#10b981,#059669)" : filterMode === "incoming" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#3b82f6,#4f46e5)",
              color:"#fff",border:"none",padding:"9px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"
            }}>
              {filterMode === "all" ? "📦 All Inventory" : filterMode === "incoming" ? "🚢 Overseas Only" : warehouseFilter !== "all" ? `🏭 ${warehouseFilter.toUpperCase()}` : "🏭 Warehouse ATS"}
            </button>
            {/* Export */}
            <button onClick={() => setShowExport(true)} style={{ background:"rgba(255,255,255,.08)",color:"#e2e8f0",border:"1px solid rgba(255,255,255,.1)",padding:"9px 16px",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer" }}>
              📊 Export
            </button>
            {/* Cart */}
            <button onClick={() => setShowCart(true)} style={{ background:"rgba(255,255,255,.08)",color:"#e2e8f0",border:"1px solid rgba(255,255,255,.1)",padding:"9px 16px",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer",position:"relative" }}>
              🛒 Cart
              {cart.length > 0 && (
                <span style={{ position:"absolute",top:-6,right:-6,background:"#ef4444",color:"#fff",fontSize:10,fontWeight:800,width:20,height:20,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── WAREHOUSE SUB-FILTER (ATS mode only) ─── */}
      {filterMode === "ats" && (
        <div style={{
          background:"rgba(15,23,42,.92)",backdropFilter:"blur(12px)",
          borderBottom:"1px solid rgba(99,102,241,.2)",
          padding:"8px 24px",position:"sticky",top:56,zIndex:99,
          display:"flex",alignItems:"center",gap:8,justifyContent:"center",flexWrap:"wrap"
        }}>
          <span style={{ fontSize:11,color:"#94a3b8",fontWeight:600,marginRight:4 }}>Warehouse:</span>
          {[
            { key:"all", label:"All Warehouses", icon:"📦" },
            { key:"jtw", label:"JTW", icon:"🏭" },
            { key:"tr",  label:"TR",  icon:"🏭" },
            { key:"dcw", label:"DCW", icon:"🏭" },
            { key:"qa",  label:"QA",  icon:"🔍" },
          ].map(wf => (
            <button key={wf.key} onClick={() => setWarehouseFilter(wf.key)} style={{
              background: warehouseFilter === wf.key ? "linear-gradient(135deg,#3b82f6,#4f46e5)" : "rgba(255,255,255,.06)",
              color: warehouseFilter === wf.key ? "#fff" : "#94a3b8",
              border: warehouseFilter === wf.key ? "1.5px solid #818cf8" : "1.5px solid rgba(255,255,255,.1)",
              padding:"6px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",
              transition:"all .15s",whiteSpace:"nowrap"
            }}>
              {wf.icon} {wf.label}
            </button>
          ))}
        </div>
      )}

      {/* ─── FLOW MODE TOGGLE (Overseas mode only) ─── */}
      {filterMode === "incoming" && activeTab === "inventory" && view === "inventory" && (
        <div style={{
          background:"rgba(15,23,42,.92)",backdropFilter:"blur(12px)",
          borderBottom:`1px solid ${flowMode ? "rgba(245,158,11,.4)" : "rgba(245,158,11,.15)"}`,
          padding:"8px 24px",position:"sticky",top:56,zIndex:99,
          display:"flex",alignItems:"center",gap:10,justifyContent:"center",flexWrap:"wrap"
        }}>
          <button onClick={() => {
            setFlowMode(f => {
              const next = !f;
              if (next && sortBy !== "arrival-asc" && sortBy !== "arrival-desc") setSortBy("arrival-asc");
              return next;
            });
          }} style={{
            background: flowMode ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#fef3c7,#fde68a)",
            color: flowMode ? "#fff" : "#92400e",
            border: flowMode ? "2px solid #b45309" : "2px solid #f59e0b",
            padding:"7px 18px",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer",
            transition:"all .2s",whiteSpace:"nowrap"
          }}>
            {flowMode ? "📊 Flow Mode ON" : "📊 Create a Flow"}
          </button>
          <span style={{ fontSize:11,color:"#94a3b8",fontWeight:500 }}>
            {flowMode ? "Styles expanded by production order" : "Expands styles by PO with delivery dates"}
          </span>
        </div>
      )}

      {/* ─── CONTENT ───────────────────────── */}
      <main style={{ maxWidth:1280,margin:"0 auto",padding:"24px 20px 100px",minHeight:"calc(100vh - 68px)" }}>
        
        {activeTab === "inventory" && <>
        {/* LOADING */}
        {view === "loading" && <LoadingSpinner text="Loading Inventory..." />}

        {/* BRANDS VIEW */}
        {view === "brands" && (
          <>
            <UniversalSearch items={allItems} onSelect={item => { goToInventory(item.brand_abbr || item.brand); setTimeout(() => goToDetail(item), 100); }} placeholder="🔍 Search any SKU across all brands..." styleOverrides={styleOverrides} />
            
            {/* Stats Bar */}
            <div style={{ display:"flex",gap:12,marginBottom:24,flexWrap:"wrap" }}>
              {[
                { label: warehouseFilter !== "all" ? `${warehouseFilter.toUpperCase()} Stock` : "WH Stock", value:allItemsFiltered.reduce((s,i) => s+(i.total_warehouse||0),0).toLocaleString(), icon:"🏭", bg:"linear-gradient(135deg,#a78bfa,#7c3aed)" },
                { label:"Incoming", value:allItemsFiltered.reduce((s,i) => s+(i.incoming||0),0).toLocaleString(), icon:"🚢", bg:"linear-gradient(135deg,#fbbf24,#d97706)" },
                { label:"Total ATS", value:allItemsFiltered.reduce((s,i) => s+(i.total_ats||0),0).toLocaleString(), icon:"✅", bg:"linear-gradient(135deg,#34d399,#10b981)" },
              ].map(s => (
                <div key={s.label} style={{ flex:1,minWidth:160,background:s.bg,padding:"14px 18px",borderRadius:14,color:"#fff",display:"flex",alignItems:"center",gap:12 }}>
                  <span style={{ fontSize:28 }}>{s.icon}</span>
                  <div>
                    <p style={{ fontSize:11,opacity:.8,fontWeight:600 }}>{s.label}</p>
                    <p style={{ fontSize:24,fontWeight:800 }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:20,alignItems:"center" }}>
              <span style={{ fontSize:12,fontWeight:700,color:"#64748b",whiteSpace:"nowrap" }}>Filter:</span>
              {[
                { value:"all",       label:"All Products" },
                { value:"long_sleeve", label:"👔 Long Sleeve" },
                { value:"short_sleeve", label:"👕 Short Sleeve" },
                { value:"big_tall",   label:"🧢 Big & Tall" },
                { value:"pants",      label:"👖 Dress Pants" },
                { value:"sportswear", label:"🏋️ Sportswear" },
                { value:"young_men",  label:"🧒 Young Men" },
                { value:"accessories",label:"🎀 Accessories" },
              ].map(({ value, label }) => (
                <button key={value}
                  onClick={() => setBrandCategoryFilter(value)}
                  className={`filter-pill${brandCategoryFilter === value ? " active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Brand Grid */}
            <div style={{ background:"rgba(255,255,255,.04)",borderRadius:20,border:"1px solid rgba(255,255,255,.06)",padding:24 }}>
              <h2 style={{ fontSize:18,fontWeight:700,color:"#e2e8f0",marginBottom:20 }}>
                Select a Brand
                <span style={{ fontSize:13,fontWeight:500,color:"#64748b",marginLeft:8 }}>
                  {filterMode === "incoming" ? "🚢 Overseas" : filterMode === "ats" ? (warehouseFilter !== "all" ? `🏭 ${warehouseFilter.toUpperCase()} Only` : "🏭 Warehouse ATS") : "📦 All"}
                </span>
                {brandCategoryFilter !== "all" && (
                  <span style={{ fontSize:12,fontWeight:700,color:"#818cf8",marginLeft:8,background:"rgba(99,102,241,.15)",padding:"3px 10px",borderRadius:20,border:"1px solid rgba(99,102,241,.3)" }}>
                    {filteredBrands.length} brand{filteredBrands.length !== 1 ? "s" : ""}
                  </span>
                )}
              </h2>
              {filteredBrands.length === 0 ? (
                <div style={{ textAlign:"center",padding:60,color:"#64748b" }}>
                  <p style={{ fontSize:48,marginBottom:12 }}>🔍</p>
                  <p style={{ fontSize:16 }}>No brands found for this category</p>
                  <button onClick={() => setBrandCategoryFilter("all")} style={{ marginTop:16,background:"linear-gradient(135deg,#818cf8,#6366f1)",color:"#fff",border:"none",padding:"10px 24px",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:14 }}>
                    Show All Brands
                  </button>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16 }}>
                  {filteredBrands.map(([abbr, data]) => (
                    <BrandCard key={abbr} abbr={abbr} data={data} onClick={() => goToInventory(abbr)} filterMode={filterMode} brandCategoryFilter={brandCategoryFilter} styleOverrides={styleOverrides} warehouseFilter={warehouseFilter} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* INVENTORY VIEW */}
        {view === "inventory" && brandData && (
          <>
            {/* Header */}
            <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20,flexWrap:"wrap" }}>
              <button onClick={goToBrands} style={{ background:"rgba(255,255,255,.08)",color:"#e2e8f0",border:"1px solid rgba(255,255,255,.1)",padding:"9px 16px",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer" }}>
                ← All Brands
              </button>
              <div style={{ display:"flex",alignItems:"center",gap:12,flex:1 }}>
                <img src={brandData.logo || DEFAULT_LOGO} alt={brandData.full_name} style={{ height:40,maxWidth:120,objectFit:"contain",filter:"brightness(0) invert(1)",opacity:.85 }} onError={e => e.target.style.display="none"} />
                <div>
                  <h2 style={{ fontSize:22,fontWeight:800,color:"#f1f5f9" }}>{brandData.full_name}</h2>
                  <p style={{ fontSize:13,color:"#64748b" }}>{currentBrand} · {brandData.items.length} styles</p>
                </div>
              </div>
              <button
                onClick={() => { setShowColorSummary(p => !p); if (showFabricSummary) setShowFabricSummary(false); }}
                style={{
                  background: showColorSummary ? "linear-gradient(135deg,#0ea5e9,#0284c7)" : "rgba(255,255,255,.08)",
                  color: showColorSummary ? "#fff" : "#c7d2fe",
                  border: showColorSummary ? "1px solid #0284c7" : "1px solid rgba(255,255,255,.1)",
                  padding:"9px 18px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",
                  transition:"all .2s",whiteSpace:"nowrap",flexShrink:0
                }}
              >
                🎨 {showColorSummary ? "✕ Hide Summary (Colors)" : "Show Summary (Colors)"}
              </button>
              <button
                onClick={() => { setShowFabricSummary(p => !p); if (showColorSummary) setShowColorSummary(false); }}
                style={{
                  background: showFabricSummary ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(255,255,255,.08)",
                  color: showFabricSummary ? "#fff" : "#c7d2fe",
                  border: showFabricSummary ? "1px solid #059669" : "1px solid rgba(255,255,255,.1)",
                  padding:"9px 18px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",
                  transition:"all .2s",whiteSpace:"nowrap",flexShrink:0
                }}
              >
                🧵 {showFabricSummary ? "✕ Hide Summary (Fabrics)" : "Show Summary (Fabrics)"}
              </button>
            </div>

            {/* Brand Stats Bar */}
            {(() => {
              const src = categoryFilteredItems;
              const wh = src.reduce((s,i) => s + (i.total_warehouse||0), 0);
              const inc = src.reduce((s,i) => s + (i.incoming||0), 0);
              const ats = src.reduce((s,i) => s + (i.total_ats||0), 0);
              return (
                <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
                  <div style={{ flex:1,minWidth:100,background:"linear-gradient(135deg,#a78bfa,#7c3aed)",padding:"12px 16px",borderRadius:12,color:"#fff" }}>
                    <p style={{ fontSize:10,opacity:.8,fontWeight:600 }}>{warehouseFilter !== "all" ? `🏭 ${warehouseFilter.toUpperCase()} Stock` : "🏭 WH Stock"}</p>
                    <p style={{ fontSize:22,fontWeight:800 }}>{wh.toLocaleString()}</p>
                  </div>
                  <div style={{ flex:1,minWidth:100,background:"linear-gradient(135deg,#fbbf24,#d97706)",padding:"12px 16px",borderRadius:12,color:"#fff" }}>
                    <p style={{ fontSize:10,opacity:.8,fontWeight:600 }}>🚢 Incoming</p>
                    <p style={{ fontSize:22,fontWeight:800 }}>{inc.toLocaleString()}</p>
                  </div>
                  <div style={{ flex:1,minWidth:100,background:"linear-gradient(135deg,#34d399,#059669)",padding:"12px 16px",borderRadius:12,color:"#fff" }}>
                    <p style={{ fontSize:10,opacity:.8,fontWeight:600 }}>📦 ATS</p>
                    <p style={{ fontSize:22,fontWeight:800 }}>{ats.toLocaleString()}</p>
                  </div>
                </div>
              );
            })()}

            {/* Search & Filters */}
            <div style={{ background:"rgba(255,255,255,.04)",borderRadius:16,border:"1px solid rgba(255,255,255,.06)",padding:18,marginBottom:20 }}>
              <div style={{ display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:14 }}>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`🔍 Search ${brandData.full_name} styles...`}
                  style={{ flex:1,minWidth:200,padding:"10px 16px",borderRadius:10,border:"2px solid #334155",background:"rgba(255,255,255,.04)",color:"#e2e8f0",fontSize:14 }}
                />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ padding:"10px 14px",borderRadius:10,border:"2px solid #334155",background:"#1e293b",color:"#e2e8f0",fontSize:13,fontWeight:600,cursor:"pointer" }}>
                  <option value="ats-desc">ATS: High → Low</option>
                  <option value="ats-asc">ATS: Low → High</option>
                  <option value="sku-asc">SKU: A → Z</option>
                  <option value="sku-desc">SKU: Z → A</option>
                  {filterMode === "incoming" && <option value="arrival-asc">📅 Arriving Earliest</option>}
                  {filterMode === "incoming" && <option value="arrival-desc">📅 Arriving Latest</option>}
                </select>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  style={{ padding:"10px 14px",borderRadius:10,border:"2px solid #334155",background:"#1e293b",color:"#e2e8f0",fontSize:13,fontWeight:600,cursor:"pointer" }}>
                  <option value="all">All Products</option>
                  <option value="long_sleeve">👔 Long Sleeve Shirts</option>
                  <option value="short_sleeve">👕 Short Sleeve Shirts</option>
                  <option value="big_tall">🧢 Big &amp; Tall</option>
                  <option value="pants">👖 Dress Pants</option>
                  <option value="sportswear">🏋️ Sportswear</option>
                  <option value="young_men">🧒 Young Men</option>
                  <option value="accessories">🎀 Ties &amp; Accessories</option>
                </select>
              </div>



              <p style={{ fontSize:12,color:"#64748b",marginTop:10,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                Showing <strong style={{ color:"#e2e8f0" }}>{filteredItems.length}</strong> {flowMode && filterMode === "incoming" ? "flow rows" : `of ${brandData.items.length} styles`}
                <span style={{ display:"inline-flex",gap:6,alignItems:"center",marginLeft:4 }}>
                  <span style={{ fontSize:11,color:"#c4b5fd",background:"rgba(124,58,237,.15)",padding:"2px 8px",borderRadius:12,fontWeight:700,border:"1px solid rgba(124,58,237,.25)" }}>
                    🏭 {filteredItems.reduce((s,i) => s + (i.total_warehouse||0), 0).toLocaleString()} {warehouseFilter !== "all" ? warehouseFilter.toUpperCase() : "WH"}
                  </span>
                  {filteredItems.reduce((s,i) => s + (i.incoming||0), 0) > 0 && (
                    <span style={{ fontSize:11,color:"#fbbf24",background:"rgba(245,158,11,.12)",padding:"2px 8px",borderRadius:12,fontWeight:700,border:"1px solid rgba(245,158,11,.25)" }}>
                      🚢 {filteredItems.reduce((s,i) => s + (i.incoming||0), 0).toLocaleString()} Inc
                    </span>
                  )}
                  <span style={{ fontSize:11,color:"#93c5fd",background:"rgba(99,102,241,.12)",padding:"2px 8px",borderRadius:12,fontWeight:700,border:"1px solid rgba(99,102,241,.25)" }}>
                    {filteredItems.reduce((s,i) => s + (i.total_ats||0), 0).toLocaleString()} ATS
                  </span>
                </span>
                {categoryFilter !== "all" && (
                  <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(99,102,241,.15)",color:"#818cf8",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,border:"1px solid rgba(99,102,241,.3)" }}>
                    {{ long_sleeve:"👔 Long Sleeve", short_sleeve:"👕 Short Sleeve", big_tall:"🧢 Big & Tall", pants:"👖 Pants", sportswear:"🏋️ Sportswear", young_men:"🧒 Young Men", accessories:"🎀 Accessories" }[categoryFilter]}
                    <button onClick={() => setCategoryFilter("all")} style={{ background:"none",border:"none",color:"#818cf8",cursor:"pointer",fontSize:12,padding:0,lineHeight:1,marginLeft:2 }}>✕</button>
                  </span>
                )}
                {colorCategoryFilter && (
                  <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(14,165,233,.15)",color:"#38bdf8",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,border:"1px solid rgba(14,165,233,.3)" }}>
                    🎨 {colorCategoryFilter.label}
                    <button onClick={() => setColorCategoryFilter(null)} style={{ background:"none",border:"none",color:"#38bdf8",cursor:"pointer",fontSize:12,padding:0,lineHeight:1,marginLeft:2 }}>✕</button>
                  </span>
                )}
                {fabricCodeFilter && (
                  <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(16,185,129,.15)",color:"#34d399",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,border:"1px solid rgba(16,185,129,.3)" }}>
                    🧵 {fabricCodeFilter.label}
                    <button onClick={() => setFabricCodeFilter(null)} style={{ background:"none",border:"none",color:"#34d399",cursor:"pointer",fontSize:12,padding:0,lineHeight:1,marginLeft:2 }}>✕</button>
                  </span>
                )}
                {filterMode !== "all" && (
                  <span style={{
                    display:"inline-flex",alignItems:"center",gap:4,
                    background: filterMode === "incoming" ? "rgba(245,158,11,.15)" : "rgba(59,130,246,.15)",
                    color: filterMode === "incoming" ? "#f59e0b" : "#60a5fa",
                    padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,
                    border: `1px solid ${filterMode === "incoming" ? "rgba(245,158,11,.3)" : "rgba(59,130,246,.3)"}`
                  }}>
                    {filterMode === "incoming" ? "🚢 Overseas Only" : warehouseFilter !== "all" ? `🏭 ${warehouseFilter.toUpperCase()} Only` : "🏭 Warehouse ATS"}
                  </span>
                )}
                {flowMode && filterMode === "incoming" && (
                  <span style={{
                    display:"inline-flex",alignItems:"center",gap:4,
                    background:"rgba(180,83,9,.15)",color:"#f59e0b",
                    padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,
                    border:"1px solid rgba(245,158,11,.4)"
                  }}>
                    📊 Flow Mode
                    <button onClick={() => setFlowMode(false)} style={{ background:"none",border:"none",color:"#f59e0b",cursor:"pointer",fontSize:12,padding:0,lineHeight:1,marginLeft:2 }}>✕</button>
                  </span>
                )}
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}
                    style={{ fontSize:11,color:"#818cf8",background:"none",border:"none",cursor:"pointer",fontWeight:600 }}>Clear search</button>
                )}
              </p>
            </div>

            {/* Color Summary Panel */}
            {showColorSummary && (
              <ColorSummaryPanel
                items={categoryFilteredItems}
                colorMap={colorMap}
                brandAbbr={currentBrand}
                filterMode={filterMode}
                activeColorFilter={colorCategoryFilter}
                onColorFilter={setColorCategoryFilter}
                styleOverrides={styleOverrides}
                warehouseFilter={warehouseFilter}
              />
            )}

            {/* Fabric Summary Panel */}
            {showFabricSummary && (
              <FabricSummaryPanel
                items={categoryFilteredItems}
                filterMode={filterMode}
                activeFabricFilter={fabricCodeFilter}
                onFabricFilter={setFabricCodeFilter}
                styleOverrides={styleOverrides}
                warehouseFilter={warehouseFilter}
              />
            )}

            {/* Product Grid */}
            {filteredItems.length === 0 ? (
              <div style={{ textAlign:"center",padding:60,color:"#64748b" }}>
                <p style={{ fontSize:48,marginBottom:12 }}>🔍</p>
                <p style={{ fontSize:16 }}>No products match your filters</p>
              </div>
            ) : flowMode && filterMode === "incoming" ? (
              /* ── Flow Mode Grid: grouped by delivery date ── */
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16 }}>
                {(() => {
                  let lastDateStr = null;
                  const useEtd = sortBy.startsWith("etd");
                  return filteredItems.map((item, idx) => {
                    const dateObj = useEtd ? item._flow_etd : item._flow_arrival;
                    const dateStr = dateObj ? formatDateShort(dateObj) : "No Date";
                    const etdStr = item._flow_etd ? formatDateShort(item._flow_etd) : "—";
                    const arrStr = item._flow_arrival ? formatDateShort(item._flow_arrival) : "—";
                    const showSep = dateStr !== lastDateStr;
                    if (showSep) lastDateStr = dateStr;
                    return (
                      <Fragment key={item._flow_key || `flow_${idx}`}>
                        {showSep && (
                          <div style={{ gridColumn:"1 / -1",margin:"12px 0 4px" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                              <div style={{ flex:1,height:2,background:"linear-gradient(90deg,#f59e0b,#fbbf24,transparent)" }} />
                              <span style={{ fontWeight:700,fontSize:13,color:"#92400e",whiteSpace:"nowrap",padding:"6px 16px",background:"linear-gradient(135deg,#fef3c7,#fde68a)",borderRadius:99,border:"1px solid #f59e0b" }}>
                                📅 Ex-Factory: {etdStr} → Arrival: {arrStr}
                              </span>
                              <div style={{ flex:1,height:2,background:"linear-gradient(90deg,transparent,#fbbf24,#f59e0b)" }} />
                            </div>
                          </div>
                        )}
                        <ProductCard key={item._flow_key || `${item.sku}_${idx}`} item={item} onClick={() => goToDetail(item)} filterMode={filterMode} prodData={productionData} colorMap={colorMap} bannerRules={bannerRules} suppressionOverrides={suppressionOverrides} styleOverrides={styleOverrides} warehouseFilter={warehouseFilter} deductionAssignments={deductionAssignments} transferIndex={transferIndex} />
                      </Fragment>
                    );
                  });
                })()}
              </div>
            ) : (
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16 }}>
                {filteredItems.map(item => (
                  <ProductCard key={item.sku} item={item} onClick={() => goToDetail(item)} filterMode={filterMode} prodData={productionData} colorMap={colorMap} bannerRules={bannerRules} suppressionOverrides={suppressionOverrides} styleOverrides={styleOverrides} warehouseFilter={warehouseFilter} deductionAssignments={deductionAssignments} transferIndex={transferIndex} />
                ))}
              </div>
            )}
          </>
        )}
        </>}

        {/* PRODUCTION TAB */}
        {activeTab === "production" && (
          <ProductionRecapView productionData={productionData} openOrdersData={openOrdersData} styleOverrides={styleOverrides} inventory={allItems} onStyleClick={(item) => setSelectedItem(item)} />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <AnalyticsView inventory={inventory} colorMap={colorMap} styleOverrides={styleOverrides} deductionAssignments={deductionAssignments} />
        )}
      </main>

      {/* ─── FLOATING BACK BUTTON (inventory view) ─── */}
      {activeTab === "inventory" && view === "inventory" && (
        <button onClick={goToBrands} style={{
          position:"fixed", bottom:88, left:24, zIndex:900,
          background:"linear-gradient(135deg,#334155,#1e293b)", color:"#e2e8f0",
          border:"1px solid rgba(255,255,255,.15)", padding:"12px 20px", borderRadius:14,
          fontWeight:700, fontSize:14, cursor:"pointer",
          boxShadow:"0 8px 24px rgba(0,0,0,.4)", display:"flex", alignItems:"center", gap:8,
          transition:"all .2s"
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#667eea,#764ba2)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#334155,#1e293b)"; }}
        >
          ← All Brands
        </button>
      )}

      {/* ─── BOTTOM TAB BAR ─── */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:950,
        background:"rgba(15,23,42,.95)", backdropFilter:"blur(16px)",
        borderTop:"1px solid rgba(255,255,255,.08)",
        display:"flex", justifyContent:"center", gap:0,
        paddingBottom:"env(safe-area-inset-bottom, 0px)"
      }}>
        {[
          { key:"inventory", label:"Inventory", icon:"📦", activeColor:"#818cf8" },
          { key:"production", label:"Production", icon:"🏭", activeColor:"#0891b2" },
          { key:"analytics", label:"Analytics", icon:"📊", activeColor:"#f59e0b" },
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex:1, maxWidth:200, display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              padding:"10px 0 12px", background:"transparent", border:"none", cursor:"pointer",
              position:"relative", transition:"all .2s"
            }}>
              {isActive && <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:3, borderRadius:"0 0 3px 3px", background:tab.activeColor }} />}
              <span style={{ fontSize:22, filter: isActive ? "none" : "grayscale(0.7)", transition:"filter .2s" }}>{tab.icon}</span>
              <span style={{ fontSize:11, fontWeight: isActive ? 800 : 600, color: isActive ? tab.activeColor : "#64748b", transition:"color .2s", letterSpacing:".02em" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── MODALS ────────────────────────── */}
      {selectedItem && (
        <ProductDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} filterMode={filterMode} prodData={productionData} colorMap={colorMap} allocationData={allocationData} apoData={apoData} openOrdersData={openOrdersData} suppressionOverrides={suppressionOverrides} styleOverrides={styleOverrides} prepackDefaults={prepackDefaults} deductionAssignments={deductionAssignments} />
      )}
      {showCart && (
        <CartModal cart={cart} onClose={() => setShowCart(false)}
          onRemove={i => setCart(prev => prev.filter((_,idx) => idx !== i))}
          onClear={() => { setCart([]); setShowCart(false); }}
          onUpdateQty={(i, qty) => setCart(prev => { const u = [...prev]; u[i] = {...u[i], qty}; return u; })}
          styleOverrides={styleOverrides}
        />
      )}
      {showExport && (
        <ExportPanel onClose={() => setShowExport(false)} brands={brands} currentBrand={currentBrand} filterMode={filterMode} API_URL={API_URL} filteredItems={filteredItems} productionData={productionData} viewMode={view} suppressionOverrides={suppressionOverrides} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
