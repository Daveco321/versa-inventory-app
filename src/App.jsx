import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════
const API_URL = "https://versa-inventory-api.onrender.com";
const ORDERS_API_URL = "https://open-orders-api.onrender.com";
const S3_LOGO_BASE = "https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/";
const DEFAULT_LOGO = "https://versamens.com/wp-content/uploads/2025/02/ac65455c-6152-4e4a-91f8-534f08254f81.png";

const CUSTOMER_CODES = {"AF":"AAFES","BK":"BELK","BJ":"BJS","BL":"BLOOMINGDALE","BO":"BOSCOV","BU":"BURLINGTON","CC":"COSTCO CANADA","CU":"COSTCO USA","CM":"COSTCO MEXICO","CT":"COSTCO TAIWAN","FM":"FORMAN MILLS","HA":"HAMRICKS","JC":"JC PENNY","MB":"MACYS BACKSTAGE","MC":"MACYS.COM","MA":"MACYS","MW":"MENS WEARHOUSE","NO":"NORDSTROM","RO":"ROSS","SK":"SAKS","TJ":"TJX","VE":"VETERANS","WN":"WINNERS","KH":"KOHLS","WA":"WALMART (PEERLESS)","NC":"NAUTICA.COM","CY":"CENTURY 21","TK":"TKX","TG":"TARGET","WM":"WALMART","AM":"AMAZON","SE":"SEARS & KMART","PH":"PETER HARRIS","TM":"TJX (with size UPC)","VG":"VERSA GROUP","PS":"PRICE SMART","BF":"Beall's Florida","BI":"Beall's Inc (Outlet)","PB":"Porta Bella","DD":"DD'S Discount","HP":"HALF PRICE","TT":"TIKTOK","VW":"Big Lots/Variety","VP":"Versa Group (Purchase)","PR":"PRATO","MS":"ME SALVE","BR":"BRANDS for LESS","PM":"PROMODA","CI":"CITI TRENDS","CB":"Centric Brands","RM":"ROSS (with size UPC)","JT":"JC PENNY (SHIRT-TIE set)"};

const BRAND_IMAGE_PREFIX = {NAUTICA:"NA",DKNY:"DK",EB:"EB",REEBOK:"RB",VINCE:"VC",BEN:"BE",USPA:"US",CHAPS:"CH",LUCKY:"LB",JNY:"JN",BEENE:"GB",NICOLE:"NM",SHAQ:"SH",TAYION:"TA",STRAHAN:"MS",VD:"VD",VERSA:"VR",CHEROKEE:"CK",AMERICA:"AC",BLO:"BL",DN:"D9",KL:"KL",NE:"NE"};

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
  DN:{full_name:"Divine 9",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/Divine9-logo-spaced-1280x720.png"},
  KL:{full_name:"Karl Lagerfeld Paris",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/klp-wht-blue-back-1-1024x576.png"},
  NE:{full_name:"Neiman Marcus",logo:"https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/Neiman_Marcus-Logo.wine-copy-1024x576.png"},
};

const BRAND_ORDER = ["NAUTICA","DKNY","EB","VINCE","KL","CHAPS","USPA","LUCKY","BEN","BEENE","NE","JNY","NICOLE","VD","REEBOK","SHAQ","TAYION","STRAHAN","VERSA","AMERICA","BLO","DN"];

const SKU_BRAND_CODE_MAP = {};
Object.entries(BRAND_IMAGE_PREFIX).forEach(([brand, prefix]) => { SKU_BRAND_CODE_MAP[prefix] = brand; });

const FABRIC_RULES = {AW:"4 Way Stretch",CA:"Cataonic 95% Polyester / 5% Spandex",TD:"CVC Dobby 60% Polyester / 40% Cotton",CH:"Chambray TC Stretch",CS:"Cooling Stretch",CV:"Cotton / Poly CVC",DS:"4 Way Stretch Dobby 95% Polyester / 5% Spandex",OX:"Pinpoint Oxford 65%/35% Poly/Cotton",PP:"100% Polyester 150D",SA:"150D Sateen 100% Polyester",LN:"100% Slab Linen",ST:"97% Cotton 3% Spandex",SW:"97% Cotton 3% Stretch Twill",SU:"Stretch Supershirt (95% Polyester, 5% Spandex)",TR:"Traveler Stretch",TW:"4 Way Stretch Twill",TS:"TC Stretch (77% Polyester / 20% Cotton / 3% Spandex)",WS:"4 Way Stretch (95%,5%) Sateen",PC:"TC Poplin 65%/35% Poly/Cotton",PT:"97% Poly 3% Stretch 150D",VS:"Viscose (31%) Stretch",VP:"50% Viscose 50% Polyester",LP:"Linen Polyester/Spandex",MR:"50% Microfiber 50% Rayon",CT:"100% Cotton",CP:"98% Cotton / 2% Spandex",BP:"50% Bamboo / 50% Polyester",TC:"TC Stretch (52P, 45C, 3S %)",SC:"60% Cotton, 38% Poly, 2% Spandex",BM:"30% Rayon Bamboo / 30% Microfiber / 36% Poly / 4% Spandex Twill",VM:"62% Poly 35% Viscose Bamboo 3% Spandex",SP:"52% Poly 45% Cotton 3% Spandex CVC Yarn Dye",TP:"Solid Twill 21% Rayon / 75.5% Poly / 3.5% Spandex",LC:"Linen 51% Cotton / 49% Poly",CX:"97% Cotton / 3% Polyester",WF:"96% Poly 4% Spandex Waffle",FT:"97% Poly / 3% Spandex Flax Texture",CE:"88% Polyester / 7% Cellulose / 5% Spandex Tech",PK:"100% Polyester Knit",PD:"60% Cotton / 40% Polyester Dobby",PY:"50% Cotton / 47% Polyester / 3% Spandex CVC Oxford",UP:"95% Poly / 5% Spandex Perforated",NY:"78% Nylon / 22% Spandex",CL:"35% Lyocell / 35% Cotton / 27% Nylon / 3% Spandex",PM:"50% Polyester / 50% Microfiber",PX:"95% Polyester / 5% Spandex Core",CN:"71% Cotton / 27% Nylon / 2% Spandex",MP:"74% Modal / 26% Polyester",LE:"100% Linen",PE:"96% Polyester / 4% Spandex End on End",OC:"100% Cotton Oxford",CD:"100% Cotton Dobby",CY:"100% Cotton Yarn Dye",CW:"100% Cotton Twill",CJ:"100% Cotton Jacquard",LT:"45% Cotton / 55% Linen",DP:"95% Polyester / 5% Spandex Knit Performance",PR:"87% Polyamide / 13% Elastic",PS:"94% Polyester / 6% Spandex Knit",CG:"100% Cotton Poplin 105gsm",PA:"88% Polyester / 12% Spandex Seamless Lux Knit",PN:"88% Polyester / 12% Spandex Non-Seamless",CF:"100% Cotton 50s 2 Ply",CB:"100% Cotton 80s 2 Ply (Bloomingdale)",KN:"Knits",WT:"Woven Tops",SD:"Sweaters",SF:"Flannel (Shackets)",SB:"Trucker (Shackets)",CO:"Corduroy (Shackets)",YD:"Yarn Dye"};

const FIT_CODES = {SL:"Slim Fit",RF:"Regular Fit",TF:"Tailored Fit",MF:"Modern Fit",BT:"Big & Tall",CF:"Classic Fit",AF:"Athletic Fit"};

// ═══════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════
// Folder name mapping for brands whose S3 folder doesn't match brand_abbr
function getImageUrl(item) {
  const baseStyle = (item.sku || "").split("-")[0].toUpperCase();
  const brand = item.brand_abbr || item.brand || "";
  return `${API_URL}/image/${baseStyle}?brand=${brand}`;
}

function getFabricFromSKU(sku) {
  if (!sku || sku.length < 6) return { code: "—", description: "Unknown" };
  // SKU structure: [0-1] customer + [2-3] brand + [4-5] fabric + [6-9] style# + [9-10] fit + [11] collar
  const brand = sku.substring(2, 4).toUpperCase();
  const code = sku.substring(4, 6).toUpperCase();
  let desc = FABRIC_RULES[code] || code;
  // Special brand overrides
  if (brand === "CH" && code === "YD") desc = "50% Microfiber / 50% Polyester Yarn Dye";
  if (brand === "CH" && code === "PT") desc = "97% Polyester / 3% Spandex (150D STRETCH)";
  if (brand === "BE" && code === "YD") desc = "77% Poly / 20% Cotton / 3% Spandex";
  return { code, description: desc };
}

function getFitFromSKU(sku) {
  if (!sku || sku.length < 3) return "Unknown";
  // Fit code is 2nd and 3rd characters from the end of the base style
  const baseStyle = sku.split("-")[0].toUpperCase();
  const fitCode = baseStyle.slice(-3, -1);
  return FIT_CODES[fitCode] || fitCode || "Unknown";
}

const SIZE_PACKS = {
  "Slim Fit": { master_qty:36, inner_qty:9, sizes:[["14-14.5 / 32-33",4],["15-15.5 / 32-33",8],["15-15.5 / 34-35",4],["16-16.5 / 32-33",4],["16-16.5 / 34-35",8],["17-17.5 / 34-35",8]] },
  "Regular Fit": { master_qty:36, inner_qty:9, sizes:[["15-15.5 / 32-33",8],["15-15.5 / 34-35",8],["16-16.5 / 32-33",4],["16-16.5 / 34-35",4],["17-17.5 / 34-35",4],["17-17.5 / 36-37",4],["18-18.5 / 36-37",4]] },
  "Von Dutch": { master_qty:36, inner_qty:9, sizes:[["S (14-14.5)",6],["M (15-15.5)",8],["L (16-16.5)",8],["XL (17-17.5)",8],["XXL (18-18.5)",6]] }
};

function getSizePack(sku, brandAbbr) {
  if (brandAbbr === "VD") return SIZE_PACKS["Von Dutch"];
  const fit = getFitFromSKU(sku);
  return SIZE_PACKS[fit] || SIZE_PACKS["Regular Fit"];
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

function rebuildBrands(inventory, filterMode = "all") {
  const brands = {};
  let source = [...inventory];

  if (filterMode === "incoming") {
    source = source.filter(i => (i.incoming || 0) > 0).map(item => {
      const incoming = item.incoming || 0;
      const wh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
      const ded = Math.abs(item.committed||0)+Math.abs(item.allocated||0);
      let osDed = 0;
      if (ded > 0) {
        if (wh <= 0) osDed = ded;
        else if (incoming > 0) {
          const neg = (wh - ded) < 0;
          const covers = incoming >= ded;
          const margin = ded > wh && Math.abs(incoming - ded) <= ded * 0.05;
          if (margin || (neg && covers)) osDed = ded;
        }
      }
      return { ...item, total_ats: incoming - osDed, total_warehouse: 0, jtw:0,tr:0,dcw:0,qa:0, _overseas_deducted: osDed, _display_mode:"overseas" };
    });
  } else if (filterMode === "ats") {
    source = source.map(item => {
      const wh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
      if (wh <= 0) return null;
      const ded = Math.abs(item.committed||0)+Math.abs(item.allocated||0);
      const incoming = item.incoming || 0;
      let apply = ded;
      if (ded > 0 && incoming > 0) {
        const neg = (wh - ded) < 0;
        const covers = incoming >= ded;
        const margin = ded > wh && Math.abs(incoming - ded) <= ded * 0.05;
        if (margin || (neg && covers)) apply = 0;
      }
      const sell = wh - apply;
      if (sell <= 0) return null;
      return { ...item, total_ats: sell, total_warehouse: wh, incoming: 0, _display_mode:"ats" };
    }).filter(Boolean);
  } else {
    // "all" mode: recalculate total_ats client-side (matches main catalog formula)
    // warehouse + incoming - committed - allocated (allows negative for over-allocated)
    source = source.map(item => {
      const wh = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
      const incoming = item.incoming || 0;
      const committed = Math.abs(item.committed||0);
      const allocated = Math.abs(item.allocated||0);
      const total_ats = wh + incoming - committed - allocated;
      return { ...item, total_ats, total_warehouse: wh };
    });
  }

  source.forEach(item => {
    if (!item.sku) return;
    let brand = item.brand || "UNKNOWN";
    const skuUp = item.sku.toUpperCase();
    // VP prefix = Versa Group Purchase — always VERSA (matches main catalog)
    if (skuUp.startsWith("VP")) brand = "VERSA";
    else if (skuUp.startsWith("LUCK")) brand = "LUCKY";
    else if (item.sku.length >= 4) {
      const code = item.sku.substring(2,4).toUpperCase();
      if (SKU_BRAND_CODE_MAP[code]) brand = SKU_BRAND_CODE_MAP[code];
    }
    item.brand = brand;
    item.brand_abbr = brand;
    item.brand_full = (BRAND_MAPPING[brand]||{}).full_name || brand;
    if (!brands[brand]) brands[brand] = { full_name: item.brand_full, logo: (BRAND_MAPPING[brand]||{}).logo || DEFAULT_LOGO, items: [], sku_count: 0, total_ats: 0 };
    brands[brand].items.push(item);
    brands[brand].sku_count++;
    brands[brand].total_ats += (item.total_ats || 0);
  });
  return brands;
}

// ─── Product Category Helpers (mirrors main catalog) ─────────
const SPORTSWEAR_COLLARS = new Set(["Z","U","M","N","O","R"]);
const SHORT_SLEEVE_FIT_CODES = new Set(["SS","SR","SB","ST"]);
const BT_FIT_CODES = new Set(["BT","BB","TT","SB","ST"]);

function isBigAndTall(sku) {
  if (!sku) return false;
  const base = sku.split("-")[0].toUpperCase();
  if (base.length < 11) return false;
  return BT_FIT_CODES.has(base.substring(9, 11));
}

function isShortSleeve(sku) {
  if (!sku) return false;
  const base = sku.split("-")[0].toUpperCase();
  if (base.length < 11) return false;
  return SHORT_SLEEVE_FIT_CODES.has(base.substring(9, 11));
}

function getItemCategory(sku, brandAbbr) {
  if (!sku) return "shirts";
  const base = sku.split("-")[0].toUpperCase();
  // Pants: position 6 is 'P' followed by 2 digits, position 9 is a letter
  if (base.length >= 10 && base[6] === "P" && /\d/.test(base[7]) && /\d/.test(base[8]) && /[A-Z]/.test(base[9])) return "pants";
  if (base.length >= 11 && SPORTSWEAR_COLLARS.has(base.slice(-1))) return "sportswear";
  const brand = (brandAbbr || "").toUpperCase();
  if (brand === "CHAPS" && base.startsWith("CTH")) return "accessories";
  if (brand === "SHAQ" && base.length >= 3 && /T/.test(base.slice(0, 3))) return "accessories";
  return "shirts";
}

function getDetailedCategory(sku, brandAbbr) {
  const base = getItemCategory(sku, brandAbbr);
  if (base === "pants") return "pants";
  if (base === "sportswear") return "sportswear";
  if (base === "accessories") return "accessories";
  if (isBigAndTall(sku)) return "big_tall";
  return isShortSleeve(sku) ? "short_sleeve" : "long_sleeve";
}

// ─── Color Classification (mirrors main catalog) ──────────────
function classifyColor(colorDisplay, brandAbbr) {
  if (!colorDisplay) return "fancies";
  const c = colorDisplay.trim().toLowerCase();
  // Disqualifiers: presence of any of these forces fancies regardless of solid/sld
  const _hasPrint = /\bprint\b|\bprnt\b|\bgrnd\b|\bstripe\b|\bstripes\b|\bgeo\b|\bcheck\b/.test(c);
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
function ColorSummaryPanel({ items, colorMap, brandAbbr, filterMode, activeColorFilter, onColorFilter }) {
  // Compute counts + build per-category SKU sets for click-to-filter
  let cWhite = 0, cBlack = 0, cNavy = 0, cOther = 0, cFancy = 0;
  const skuSets = { white: new Set(), black: new Set(), navy: new Set(), other_solids: new Set(), fancies: new Set() };
  items.forEach(item => {
    const qty = item.total_ats || 0;
    if (qty <= 0) return;
    const ci = getStyleColorInfo(item.sku, brandAbbr, colorMap);
    const cat = classifyColor(ci ? ci.display : "", brandAbbr);
    if (cat === "white") cWhite += qty;
    else if (cat === "black") cBlack += qty;
    else if (cat === "navy") cNavy += qty;
    else if (cat === "other_solids") cOther += qty;
    else cFancy += qty;
    if (skuSets[cat]) skuSets[cat].add(item.sku.toUpperCase());
  });

  const barTotal = cWhite + cBlack + cNavy + cOther + cFancy;
  const pct = v => barTotal ? Math.round(v / barTotal * 100) : 0;
  const bW = pct(cWhite), bB = pct(cBlack), bN = pct(cNavy), bO = pct(cOther), bF = pct(cFancy);
  const modeLabel = filterMode === "incoming" ? "Overseas" : filterMode === "ats" ? "Warehouse ATS" : "Total";

  const LABEL_MAP = { white:"White Solid", black:"Black Solid", navy:"Navy Solid", other_solids:"Other Solids", fancies:"Fancies" };

  const handleClick = (cat) => {
    if (!skuSets[cat] || skuSets[cat].size === 0) return;
    if (activeColorFilter && activeColorFilter.cat === cat) {
      onColorFilter(null); // toggle off
    } else {
      onColorFilter({ cat, label: LABEL_MAP[cat], skus: skuSets[cat] });
    }
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

  return (
    <div style={{ background:"white",borderRadius:12,padding:"20px",marginBottom:16,border:"1px solid #e2e8f0",boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>📊 Color Summary <span style={{ fontSize:11,fontWeight:500,color:"#64748b" }}>— {modeLabel} ATS</span></span>
          {activeColorFilter && (
            <span style={{ background:"#dbeafe",color:"#1d4ed8",border:"1px solid #93c5fd",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}>
              Filtering: {activeColorFilter.label}
              <span onClick={() => onColorFilter(null)} style={{ cursor:"pointer",color:"#6b7280",marginLeft:2 }}>✕</span>
            </span>
          )}
        </div>
        <span style={{ fontSize:11,color:"#6366f1",background:"#eef2ff",padding:"3px 10px",borderRadius:99,fontWeight:600 }}>
          {barTotal.toLocaleString()} total units
        </span>
      </div>

      {/* Stacked bar — segments are clickable */}
      <div style={{ display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:14,background:"#f1f5f9" }}>
        {bW > 0 && <div style={barSegStyle("#e2e8f0", bW, "white")} onClick={() => handleClick("white")} title={`White Solid ${bW}%`} />}
        {bB > 0 && <div style={barSegStyle("#1e293b", bB, "black")} onClick={() => handleClick("black")} title={`Black Solid ${bB}%`} />}
        {bN > 0 && <div style={barSegStyle("#1e3a5f", bN, "navy")} onClick={() => handleClick("navy")} title={`Navy Solid ${bN}%`} />}
        {bO > 0 && <div style={barSegStyle("linear-gradient(90deg,#3b82f6,#8b5cf6)", bO, "other_solids")} onClick={() => handleClick("other_solids")} title={`Other Solids ${bO}%`} />}
        {bF > 0 && <div style={barSegStyle("linear-gradient(90deg,#f59e0b,#ec4899)", bF, "fancies")} onClick={() => handleClick("fancies")} title={`Fancies ${bF}%`} />}
      </div>

      {/* Clickable grid — all 5 rows always shown */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:13 }}>
        {[["white","⬜ White Solid",cWhite],["black","⬛ Black Solid",cBlack],["navy","🟦 Navy Solid",cNavy],["other_solids","🎨 Other Solids",cOther]].map(([cat, label, val]) => (
          <div key={cat} onClick={() => handleClick(cat)} style={rowStyle(cat)}>
            <span style={{ color:"#64748b" }}>{label}</span>
            <span style={{ fontWeight:700,color:"#1e293b" }}>{val.toLocaleString()}</span>
          </div>
        ))}
        <div onClick={() => handleClick("fancies")} style={rowStyle("fancies", true)}>
          <span style={{ color:"#64748b" }}>✨ Fancies</span>
          <span style={{ fontWeight:700,color:"#1e293b" }}>{cFancy.toLocaleString()}</span>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",padding:"7px 10px",background:"#e0f2fe",borderRadius:6,border:"1px solid #bae6fd",gridColumn:"span 2" }}>
          <span style={{ color:"#0369a1",fontWeight:600 }}>Total ATS</span>
          <span style={{ fontWeight:800,color:"#0369a1" }}>{barTotal.toLocaleString()}</span>
        </div>
      </div>
      <p style={{ fontSize:11,color:"#94a3b8",margin:"8px 0 0",textAlign:"center" }}>Click any row to filter the inventory below · Click again to clear</p>
    </div>
  );
}

// ─── Fabric Summary Panel ─────────────────────────────────────
function FabricSummaryPanel({ items, filterMode, activeFabricFilter, onFabricFilter }) {
  // Build fabric map — same logic as main catalog's showAdminFabricSummary
  const fabricMap = {};
  items.forEach(item => {
    const qty = item.total_ats || 0;
    const f = getFabricFromSKU(item.sku);
    const key = f.code.toUpperCase();
    if (!fabricMap[key]) fabricMap[key] = { code: f.code, description: f.description, ats: 0, skus: new Set(), allSkus: new Set() };
    fabricMap[key].ats += qty;
    fabricMap[key].skus.add(item.sku.split("-")[0].toUpperCase()); // base style count
    fabricMap[key].allSkus.add(item.sku.toUpperCase()); // full SKU set for filtering
  });

  const rows = Object.values(fabricMap).sort((a, b) => b.ats - a.ats);
  const totalAts = rows.reduce((s, r) => s + r.ats, 0);
  const modeLabel = filterMode === "incoming" ? "Overseas" : filterMode === "ats" ? "Warehouse ATS" : "Total";

  const handleClick = (code) => {
    const row = fabricMap[code];
    if (!row) return;
    if (activeFabricFilter && activeFabricFilter.code === code) {
      onFabricFilter(null); // toggle off
    } else {
      onFabricFilter({ code, label: code, skus: row.allSkus });
    }
  };

  return (
    <div style={{ background:"white",borderRadius:12,padding:"20px",marginBottom:16,border:"1px solid #e2e8f0",boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>🧵 Fabric Summary <span style={{ fontSize:11,fontWeight:500,color:"#64748b" }}>— {modeLabel} ATS</span></span>
          {activeFabricFilter && (
            <span style={{ background:"#dcfce7",color:"#15803d",border:"1px solid #86efac",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}>
              Filtering: {activeFabricFilter.label}
              <span onClick={() => onFabricFilter(null)} style={{ cursor:"pointer",color:"#6b7280",marginLeft:2 }}>✕</span>
            </span>
          )}
        </div>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13,borderRadius:8,overflow:"hidden" }}>
          <thead>
            <tr style={{ background:"#1e293b",color:"white" }}>
              {["Code","Fabrication","Styles","ATS Units","%"].map((h, i) => (
                <th key={h} style={{ padding:"9px 14px",textAlign: i >= 2 ? "right" : "left",fontSize:11,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",
                  ...(i===1?{textAlign:"left"}:{}), ...(i===2?{textAlign:"center"}:{}) }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const isActive = activeFabricFilter?.code === r.code.toUpperCase();
              const pct = totalAts ? Math.round(r.ats / totalAts * 100) : 0;
              const barW = rows[0]?.ats ? Math.round(r.ats / rows[0].ats * 100) : 0;
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
                  <td style={{ padding:"8px 14px",textAlign:"right",fontWeight:700,color:"#0f172a" }}>{r.ats.toLocaleString()}</td>
                  <td style={{ padding:"8px 14px",textAlign:"right",color:"#94a3b8" }}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background:"#f8fafc",borderTop:"2px solid #e2e8f0" }}>
              <td colSpan={3} style={{ padding:"9px 14px",fontSize:13,fontWeight:700,color:"#0369a1" }}>Total</td>
              <td style={{ padding:"9px 14px",textAlign:"right",fontSize:13,fontWeight:800,color:"#0369a1" }}>{totalAts.toLocaleString()}</td>
              <td style={{ padding:"9px 14px",textAlign:"right",fontSize:13,fontWeight:800,color:"#0369a1" }}>100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p style={{ fontSize:11,color:"#94a3b8",margin:"10px 0 0",textAlign:"center" }}>Click any row to filter the inventory below · Click again to clear</p>
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

function resolveImageUrl(item) {
  return getImageUrl(item);
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
function BrandCard({ abbr, data, onClick }) {
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
            <p style={{ fontSize:18,fontWeight:800,color:"#166534" }}>{data.sku_count}</p>
          </div>
          <div style={{ background:"#eef2ff",padding:"6px 10px",borderRadius:8,flex:1,textAlign:"center" }}>
            <p style={{ fontSize:10,color:"#4f46e5",fontWeight:600 }}>ATS</p>
            <p style={{ fontSize:18,fontWeight:800,color:"#3730a3" }}>{(data.total_ats||0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────
function ProductCard({ item, onClick, filterMode, prodData, colorMap }) {
  const fabric = getFabricFromSKU(item.sku);
  const fit = getFitFromSKU(item.sku);
  const ats = item.total_ats || 0;
  const isOverseas = filterMode === "incoming";
  const atsLabel = isOverseas ? "Overseas ATS" : filterMode === "ats" ? "WH ATS" : "ATS";
  const atsColor = ats > 0 ? (isOverseas ? "#d97706" : "#16a34a") : "#dc2626";
  const colorInfo = getStyleColorInfo(item.sku, item.brand_abbr || item.brand, colorMap);
  const [prodOpen, setProdOpen] = useState(false);

  // Production data
  const prods = getEarliestDates(item.sku, prodData).productions;
  const hasProd = prods.length > 0;
  const totalProdUnits = prods.reduce((s, p) => s + (p.units || 0), 0);
  const nearestArrival = prods.length > 0 ? prods[0].arrival : null; // already sorted soonest first

  // Category badges
  const itemCat = getItemCategory(item.sku, item.brand_abbr || item.brand);
  const isSS = isShortSleeve(item.sku) && !isBigAndTall(item.sku);
  const isBT = isBigAndTall(item.sku);

  return (
    <div onClick={onClick} className="product-card" style={{ background:"#fff",borderRadius:14,overflow:"hidden",border: isOverseas ? "2px solid #fcd34d" : "2px solid #e5e7eb" }}>
      <div style={{ position:"relative",overflow:"hidden" }}>
        <ImageWithFallback src={resolveImageUrl(item)} alt={item.sku} style={{ width:"100%",height:220,objectFit:"cover",background:"#f3f4f6" }} />
        {isOverseas && <span style={{ position:"absolute",top:8,right:8,background:"rgba(217,119,6,.9)",color:"#fff",padding:"3px 8px",borderRadius:8,fontSize:10,fontWeight:700 }}>🚢 Overseas</span>}
        {/* Category badges — bottom of image */}
        {isSS && <span style={{ position:"absolute",bottom:8,left:8,background:"rgba(14,165,233,.9)",color:"#fff",padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:700,letterSpacing:".3px",backdropFilter:"blur(2px)" }}>SHORT SLEEVE</span>}
        {isBT && <span style={{ position:"absolute",bottom: isSS ? 30 : 8,left:8,background:"rgba(124,58,237,.9)",color:"#fff",padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:700,letterSpacing:".3px",backdropFilter:"blur(2px)" }}>BIG & TALL</span>}
        {itemCat === "pants" && <span style={{ position:"absolute",bottom:8,right:8,background:"rgba(107,114,128,.9)",color:"#fff",padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:700,letterSpacing:".3px",backdropFilter:"blur(2px)" }}>PANTS</span>}
        {itemCat === "sportswear" && <span style={{ position:"absolute",bottom:8,right:8,background:"rgba(234,88,12,.9)",color:"#fff",padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:700,letterSpacing:".3px",backdropFilter:"blur(2px)" }}>SPORTSWEAR</span>}
        {itemCat === "accessories" && <span style={{ position:"absolute",bottom:8,right:8,background:"rgba(168,85,247,.9)",color:"#fff",padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:700,letterSpacing:".3px",backdropFilter:"blur(2px)" }}>
          {(item.brand_abbr||item.brand||"").toUpperCase() === "SHAQ" ? "TIE & SHIRT" : "TIE & HANKY"}
        </span>}
      </div>
      <div style={{ padding:"12px 14px" }}>
        <h3 style={{ fontSize:15,fontWeight:700,color:"#1f2937",marginBottom:2 }}>{item.sku}</h3>
        <p style={{ fontSize:12,color:"#6b7280",marginBottom:colorInfo ? 2 : 4 }}>{item.brand_full}</p>
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

        {/* Production badge — matches main catalog */}
        {hasProd && (
          <div style={{ marginBottom:8 }} onClick={e => { e.stopPropagation(); setProdOpen(o => !o); }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:prodOpen ? "8px 8px 0 0" : 8,padding:"5px 10px",cursor:"pointer",fontSize:11,color:"#166534",transition:"all .2s" }}>
              <span>🏭</span>
              <span style={{ fontWeight:700 }}>In Production</span>
              <span style={{ color:"#16a34a",fontWeight:600 }}>{nearestArrival ? formatDateShort(nearestArrival) : "—"}</span>
              <span style={{ marginLeft:"auto",fontWeight:700,color:"#15803d" }}>{totalProdUnits.toLocaleString()} units</span>
              <span style={{ fontSize:10,transition:"transform .2s",transform: prodOpen ? "rotate(180deg)" : "none" }}>▼</span>
            </div>
            {prodOpen && (
              <div style={{ background:"#f9fffe",border:"1px solid #bbf7d0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"8px 10px",fontSize:11 }}>
                {prods.map((p, i) => (
                  <div key={i} style={{ ...(i > 0 ? { borderTop:"1px solid #dcfce7",paddingTop:7,marginTop:7 } : {}) }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                      <span style={{ fontWeight:700,color:"#15803d",fontSize:12 }}>{(p.units||0).toLocaleString()} units</span>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#6b7280" }}>
                      <span style={{ background:"#dcfce7",color:"#166534",fontWeight:600,padding:"1px 6px",borderRadius:99 }}>Ex-Factory {formatDateShort(p.etd) || "—"}</span>
                      <span style={{ color:"#9ca3af" }}>→</span>
                      <span style={{ background:"#dcfce7",color:"#166534",fontWeight:600,padding:"1px 6px",borderRadius:99 }}>Arrival {formatDateShort(p.arrival) || "—"}</span>
                    </div>
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
function ExportPanel({ onClose, brands, currentBrand, filterMode, API_URL, filteredItems, productionData, viewMode }) {
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
        const dates = getEarliestDates(item.sku, productionData);
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
function ProductDetailModal({ item, onClose, onAddToCart, filterMode, prodData, colorMap, allocationData, apoData, openOrdersData }) {
  if (!item) return null;
  const fabric = getFabricFromSKU(item.sku);
  const fit = getFitFromSKU(item.sku);
  const sp = getSizePack(item.sku, item.brand_abbr || item.brand);
  const totalStock = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
  const ats = item.total_ats || 0;
  const [showFullImage, setShowFullImage] = useState(false);
  const [showAllocations, setShowAllocations] = useState(false);
  const isOverseas = filterMode === "incoming";
  const dates = getEarliestDates(item.sku, prodData);
  const prods = dates.productions;
  const colorInfo = getStyleColorInfo(item.sku, item.brand_abbr || item.brand, colorMap);

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
  const openOrdersTotal = openOrders.reduce((s, o) => s + (parseInt(o.openQty) || 0), 0);

  const committed = Math.abs(item.committed || 0);
  const allocated = Math.abs(item.allocated || 0);
  const hasDeductions = committed > 0 || allocated > 0 || apoTotal > 0 || manualHolds.length > 0;

  return (
    <>
    {showFullImage && (
      <FullscreenImage src={resolveImageUrl(item)} alt={item.sku} onClose={() => setShowFullImage(false)} />
    )}
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16 }} onClick={onClose}>
      <div style={{ background:"rgba(255,255,255,.97)",borderRadius:14,maxWidth:580,width:"100%",maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,.3)",position:"relative" }} onClick={e => e.stopPropagation()}>
        
        {/* Sticky header with close button */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid #e5e7eb",flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:18,fontWeight:800,color:"#1f2937" }}>{item.sku}</h2>
            <p style={{ fontSize:12,color:"#6b7280" }}>{item.brand_full}</p>
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
              <ImageWithFallback src={resolveImageUrl(item)} alt={item.sku} style={{ width:140,height:180,borderRadius:10,objectFit:"cover",border:"2px solid #e5e7eb" }} />
              <div style={{ position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,.5)",color:"#fff",borderRadius:6,padding:"3px 6px",fontSize:10,fontWeight:600,backdropFilter:"blur(4px)" }}>🔍 Tap</div>
            </div>
            <div style={{ flex:1,display:"flex",flexDirection:"column",gap:8 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <div style={{ background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",padding:10,borderRadius:10 }}>
                  <p style={{ fontSize:10,opacity:.85 }}>ATS</p>
                  <p style={{ fontSize:22,fontWeight:800 }}>{ats.toLocaleString()}</p>
                </div>
                <div style={{ background:"linear-gradient(135deg,#3b82f6,#4f46e5)",color:"#fff",padding:10,borderRadius:10 }}>
                  <p style={{ fontSize:10,opacity:.85 }}>Total Stock</p>
                  <p style={{ fontSize:22,fontWeight:800 }}>{totalStock.toLocaleString()}</p>
                </div>
              </div>
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
                    <span>Customer</span><span style={{ textAlign:"right" }}>Order #</span><span style={{ textAlign:"right",paddingLeft:12 }}>Open Qty</span>
                  </div>
                  {openOrders.map((o, i) => {
                    const rawCust = (o.customer || "").toUpperCase().trim();
                    const custCode = rawCust.length <= 4 ? rawCust : rawCust.substring(0, 2);
                    const custFull = CUSTOMER_CODES[custCode] || o.customerFull || custCode || "—";
                    return (
                      <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr auto auto",padding:"5px 10px",fontSize:11,borderTop:"1px solid #fef3c7",background:i%2===0?"#fff":"#fffbeb",gap:0 }}>
                        <span style={{ fontWeight:600,color:"#1f2937" }}>{custFull}</span>
                        <span style={{ textAlign:"right",color:"#6b7280",fontFamily:"monospace",fontSize:10 }}>{o.orderNo || o.ctrlNo || "—"}</span>
                        <span style={{ textAlign:"right",fontWeight:700,fontFamily:"monospace",paddingLeft:12 }}>{(parseInt(o.openQty)||0).toLocaleString()}</span>
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
                  if (wh <= 0) overseasDed = totalDed;
                  else if (incoming > 0) {
                    const neg = (wh - totalDed) < 0;
                    const covers = incoming >= totalDed;
                    const margin = totalDed > wh && Math.abs(incoming - totalDed) <= totalDed * 0.05;
                    if (margin || (neg && covers)) overseasDed = totalDed;
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
function CartModal({ cart, onClose, onRemove, onClear, onUpdateQty }) {
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
                <ImageWithFallback src={resolveImageUrl(c)} alt={c.sku} style={{ width:56,height:56,borderRadius:8,objectFit:"cover" }} />
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
function UniversalSearch({ items, onSelect, placeholder }) {
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
              <ImageWithFallback src={resolveImageUrl(item)} alt={item.sku} style={{ width:48,height:48,objectFit:"cover",borderRadius:8,marginRight:14 }} />
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
const COLOR_MAP_URL = "https://nauticaslimfit.s3.us-east-2.amazonaws.com/Inventory+Colors+Data/style_color_map.xlsx";

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

function getStyleColorInfo(sku, brandAbbr, colorMap) {
  if (!colorMap || Object.keys(colorMap).length === 0) return null;
  const fullSku = (sku || "").toUpperCase().trim();
  const baseSku = fullSku.split("-")[0];
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

function getEarliestDates(sku, prodData) {
  const prods = getProductionForSku(sku, prodData);
  if (prods.length === 0) return { ex_factory: null, arrival: null, productions: [] };
  const sorted = [...prods].sort((a, b) => (a.arrival || new Date("2099")) - (b.arrival || new Date("2099")));
  return {
    ex_factory: sorted[0].etd,
    arrival: sorted[0].arrival,
    productions: sorted
  };
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function VersaInventoryApp() {
  const [view, setView] = useState("loading"); // loading, brands, inventory, detail
  const [inventory, setInventory] = useState([]);
  const [brands, setBrands] = useState({});
  const [currentBrand, setCurrentBrand] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
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
  const [showColorSummary, setShowColorSummary] = useState(false);
  const [showFabricSummary, setShowFabricSummary] = useState(false);
  const [colorCategoryFilter, setColorCategoryFilter] = useState(null); // { cat, label, skus: Set }
  const [fabricCodeFilter, setFabricCodeFilter] = useState(null);       // { code, label, skus: Set }
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showExport, setShowExport] = useState(false);

  const allItems = useMemo(() => {
    return Object.values(brands).flatMap(b => b.items || []);
  }, [brands]);

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
          let etdDate = p.etd ? new Date(p.etd) : null;
          if (etdDate && isNaN(etdDate.getTime())) etdDate = null;
          let arrivalDate = etdDate ? new Date(etdDate.getTime() + 37 * 24 * 60 * 60 * 1000) : null;
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
          if (row.Key && row.Color_Description) map[row.Key] = row.Color_Description;
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
        const resp = await fetch(`${ORDERS_API_URL}/api/orders`, { signal: AbortSignal.timeout(12000) });
        if (!resp.ok) return;
        const json = await resp.json();
        setOpenOrdersData(json.orders || []);
        console.log("✓ Open orders loaded:", (json.orders || []).length, "rows");
      } catch (e) { console.warn("Open orders unavailable:", e.message); }
    };
    loadOpenOrders();

    // Auto-refresh inventory every 5 minutes
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

  // Rebuild brands when filterMode changes
  useEffect(() => {
    if (inventory.length > 0) {
      setBrands(rebuildBrands(inventory, filterMode));
    }
  }, [filterMode, inventory]);

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
    setCategoryFilter("all");
    window.history.pushState({ view: "inventory", brand: brandKey }, "", `#brand-${brandKey}`);
    // Preload images for this brand
    const b = brands[brandKey];
    if (b?.items) preloadImages(b.items);
  }, [brands]);
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
      return next;
    });
  }, [sortBy]);

  // ─── Brand View Filtering ─────────────
  const brandData = currentBrand ? brands[currentBrand] : null;
  const filteredItems = useMemo(() => {
    if (!brandData) return [];
    let items = [...brandData.items];
    // Category filter
    if (categoryFilter !== "all") {
      items = items.filter(i => getDetailedCategory(i.sku, i.brand_abbr || i.brand) === categoryFilter);
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
        const f = getFitFromSKU(i.sku);
        return fitFilter.some(ff => f.toLowerCase().includes(ff.toLowerCase()));
      });
    }
    if (fabricFilter.length > 0) {
      items = items.filter(i => {
        const f = getFabricFromSKU(i.sku);
        return fabricFilter.includes(f.code);
      });
    }
    // Sort
    if (sortBy === "ats-desc") items.sort((a,b) => (b.total_ats||0)-(a.total_ats||0));
    else if (sortBy === "ats-asc") items.sort((a,b) => (a.total_ats||0)-(b.total_ats||0));
    else if (sortBy === "sku-asc") items.sort((a,b) => (a.sku||"").localeCompare(b.sku||""));
    else if (sortBy === "sku-desc") items.sort((a,b) => (b.sku||"").localeCompare(a.sku||""));
    else if (sortBy === "arrival-asc") items.sort((a,b) => {
      const da = getEarliestDates(a.sku, productionData).arrival || new Date("2099");
      const db = getEarliestDates(b.sku, productionData).arrival || new Date("2099");
      return da - db;
    });
    else if (sortBy === "arrival-desc") items.sort((a,b) => {
      const da = getEarliestDates(a.sku, productionData).arrival || new Date("1970");
      const db = getEarliestDates(b.sku, productionData).arrival || new Date("1970");
      return db - da;
    });
    return items;
  }, [brandData, categoryFilter, colorCategoryFilter, fabricCodeFilter, searchQuery, fitFilter, fabricFilter, sortBy, productionData]);

  // Get unique fits/fabrics for filters
  const availableFits = useMemo(() => {
    if (!brandData) return [];
    const fits = new Set(brandData.items.map(i => getFitFromSKU(i.sku)));
    return [...fits].sort();
  }, [brandData]);

  const availableFabrics = useMemo(() => {
    if (!brandData) return [];
    const fabs = {};
    brandData.items.forEach(i => { const f = getFabricFromSKU(i.sku); fabs[f.code] = f.description; });
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
              <h1 style={{ fontSize:20,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.02em" }}>Inventory Management</h1>
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
              {filterMode === "all" ? "📦 All Inventory" : filterMode === "incoming" ? "🚢 Overseas Only" : "🏭 Warehouse ATS"}
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

      {/* ─── CONTENT ───────────────────────── */}
      <main style={{ maxWidth:1280,margin:"0 auto",padding:"24px 20px",minHeight:"calc(100vh - 68px)" }}>
        
        {/* LOADING */}
        {view === "loading" && <LoadingSpinner text="Loading Inventory..." />}

        {/* BRANDS VIEW */}
        {view === "brands" && (
          <>
            <UniversalSearch items={allItems} onSelect={item => { goToInventory(item.brand_abbr || item.brand); setTimeout(() => goToDetail(item), 100); }} placeholder="🔍 Search any SKU across all brands..." />
            
            {/* Stats Bar */}
            <div style={{ display:"flex",gap:12,marginBottom:24,flexWrap:"wrap" }}>
              {[
                { label:"Brands", value:Object.keys(brands).length, icon:"🏷️", bg:"linear-gradient(135deg,#818cf8,#6366f1)" },
                { label:"Total SKUs", value:allItems.length.toLocaleString(), icon:"📦", bg:"linear-gradient(135deg,#34d399,#10b981)" },
                { label:"Total ATS", value:allItems.reduce((s,i) => s+(i.total_ats||0),0).toLocaleString(), icon:"✅", bg:"linear-gradient(135deg,#fbbf24,#f59e0b)" },
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

            {/* Brand Grid */}
            <div style={{ background:"rgba(255,255,255,.04)",borderRadius:20,border:"1px solid rgba(255,255,255,.06)",padding:24 }}>
              <h2 style={{ fontSize:18,fontWeight:700,color:"#e2e8f0",marginBottom:20 }}>
                Select a Brand
                <span style={{ fontSize:13,fontWeight:500,color:"#64748b",marginLeft:8 }}>
                  {filterMode === "incoming" ? "🚢 Overseas" : filterMode === "ats" ? "🏭 Warehouse ATS" : "📦 All"}
                </span>
              </h2>
              {Object.keys(brands).length === 0 ? (
                <div style={{ textAlign:"center",padding:60,color:"#64748b" }}>
                  <p style={{ fontSize:48,marginBottom:12 }}>📭</p>
                  <p style={{ fontSize:16 }}>No inventory data available</p>
                  <p style={{ fontSize:13,marginTop:8 }}>Backend may still be waking up — refresh in a moment</p>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16 }}>
                  {sortBrands(Object.entries(brands)).map(([abbr, data]) => (
                    <BrandCard key={abbr} abbr={abbr} data={data} onClick={() => goToInventory(abbr)} />
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
                  <option value="accessories">🎀 Ties &amp; Accessories</option>
                </select>
              </div>



              <p style={{ fontSize:12,color:"#64748b",marginTop:10,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                Showing <strong style={{ color:"#e2e8f0" }}>{filteredItems.length}</strong> of {brandData.items.length} styles
                {categoryFilter !== "all" && (
                  <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(99,102,241,.15)",color:"#818cf8",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,border:"1px solid rgba(99,102,241,.3)" }}>
                    {{ long_sleeve:"👔 Long Sleeve",short_sleeve:"👕 Short Sleeve",big_tall:"🧢 Big & Tall",pants:"👖 Pants",sportswear:"🏋️ Sportswear",accessories:"🎀 Accessories" }[categoryFilter]}
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
                    {filterMode === "incoming" ? "🚢 Overseas Only" : "🏭 Warehouse ATS"}
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
                items={brandData.items}
                colorMap={colorMap}
                brandAbbr={currentBrand}
                filterMode={filterMode}
                activeColorFilter={colorCategoryFilter}
                onColorFilter={setColorCategoryFilter}
              />
            )}

            {/* Fabric Summary Panel */}
            {showFabricSummary && (
              <FabricSummaryPanel
                items={brandData.items}
                filterMode={filterMode}
                activeFabricFilter={fabricCodeFilter}
                onFabricFilter={setFabricCodeFilter}
              />
            )}

            {/* Product Grid */}
            {filteredItems.length === 0 ? (
              <div style={{ textAlign:"center",padding:60,color:"#64748b" }}>
                <p style={{ fontSize:48,marginBottom:12 }}>🔍</p>
                <p style={{ fontSize:16 }}>No products match your filters</p>
              </div>
            ) : (
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16 }}>
                {filteredItems.map(item => (
                  <ProductCard key={item.sku} item={item} onClick={() => goToDetail(item)} filterMode={filterMode} prodData={productionData} colorMap={colorMap} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── FLOATING BACK BUTTON (inventory view) ─── */}
      {view === "inventory" && (
        <button onClick={goToBrands} style={{
          position:"fixed", bottom:24, left:24, zIndex:900,
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

      {/* ─── MODALS ────────────────────────── */}
      {selectedItem && (
        <ProductDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} filterMode={filterMode} prodData={productionData} colorMap={colorMap} allocationData={allocationData} apoData={apoData} openOrdersData={openOrdersData} />
      )}
      {showCart && (
        <CartModal cart={cart} onClose={() => setShowCart(false)}
          onRemove={i => setCart(prev => prev.filter((_,idx) => idx !== i))}
          onClear={() => { setCart([]); setShowCart(false); }}
          onUpdateQty={(i, qty) => setCart(prev => { const u = [...prev]; u[i] = {...u[i], qty}; return u; })}
        />
      )}
      {showExport && (
        <ExportPanel onClose={() => setShowExport(false)} brands={brands} currentBrand={currentBrand} filterMode={filterMode} API_URL={API_URL} filteredItems={filteredItems} productionData={productionData} viewMode={view} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
