import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════
const API_URL = "https://versa-inventory-api.onrender.com";
const S3_BASE = "https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/PHOTOS+INVENTORY";
const S3_OVERRIDE = "https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/STYLE+OVERRIDES";
const S3_LOGO_BASE = "https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/";
const DEFAULT_LOGO = "https://versamens.com/wp-content/uploads/2025/02/ac65455c-6152-4e4a-91f8-534f08254f81.png";

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

const FABRIC_RULES = {AW:"All-Over Wash",BF:"Bedford Cord",BR:"Brushed Twill",CB:"Chambray",CH:"Check",CK:"Tattersall Check",CL:"Cluster Print",CR:"Corduroy",CT:"Cotton",DB:"Dobby",DC:"Denim Chambray",DG:"Digital Print",DL:"Delave",DM:"Denim",DN:"Donegal",DP:"Dot Print",DS:"Dash Stripe",EN:"End on End",FD:"Feeder Stripe",FL:"Flannel",FP:"Floral Print",GH:"Gingham",GP:"Geo Print",GT:"Garment Wash",HB:"Houndstooth",HD:"Heather",HT:"Herringbone",IN:"Indigo",IR:"Iridescent",JQ:"Jacquard",KN:"Knit",LI:"Linen",LN:"Linen Blend",MD:"Madras",ML:"Melange",MR:"Micro Print",NP:"Novelty Print",OG:"Organic Cotton",OH:"Oxford Horizontal",OX:"Oxford",PA:"Paisley",PD:"Plaid",PG:"Pigment Dye",PK:"Pique",PL:"Poplin",PN:"Pinpoint",PP:"Polka Dot Print",PR:"Performance",PT:"Print",QT:"Quilted",RP:"Retro Print",SA:"Sateen",SD:"Solid",SH:"Stretch Herringbone",SL:"Slim",SN:"Seersucker",SP:"Stripe",SR:"Stretch",SS:"Satin Stripe",ST:"Stretch Poplin",SW:"Stretch Woven",TB:"Textured Basket",TC:"Texture Check",TD:"Texture Dobby",TH:"Thermal Heather",TP:"Tropical Print",TR:"Twill",TS:"Texture Stripe",TT:"Tattersall",TW:"Tweed",TY:"Ticking Stripe",VL:"Velvet",VT:"Vintage",WF:"Waffle",WN:"Window Pane",WV:"Woven"};

const FIT_CODES = {S:"Slim Fit",R:"Regular Fit",T:"Trim Fit",A:"Athletic Fit",C:"Classic Fit",F:"Fitted",K:"Skinny Fit",P:"Performance Fit",X:"Extra Slim Fit"};

// ═══════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════
function getImageUrl(item) {
  const sku = item.sku || "";
  const prefix = BRAND_IMAGE_PREFIX[item.brand_abbr || item.brand] || "XX";
  return `${S3_BASE}/${prefix}/${sku}.jpg`;
}

function getFabricFromSKU(sku) {
  if (!sku || sku.length < 8) return { code: "—", description: "Unknown" };
  const code = sku.substring(6, 8).toUpperCase();
  return { code, description: FABRIC_RULES[code] || code };
}

function getFitFromSKU(sku) {
  if (!sku || sku.length < 9) return "Unknown";
  const code = sku[8]?.toUpperCase();
  return FIT_CODES[code] || code || "Unknown";
}

function getSizePack(sku) {
  if (!sku || sku.length < 12) return { master_qty: "—", inner_qty: "—", sizes: [] };
  const packChar = sku[9];
  const sizeCode = sku.substring(10, 12);
  const packs = {"A":{master:36,inner:6},"B":{master:48,inner:8},"C":{master:60,inner:10},"D":{master:24,inner:4},"E":{master:72,inner:12},"F":{master:30,inner:5},"G":{master:42,inner:7},"H":{master:54,inner:9},"J":{master:66,inner:11}};
  const sizeSets = {"LS":[["S",1],["M",2],["L",2],["XL",1]],"LX":[["M",1],["L",2],["XL",2],["XXL",1]],"LB":[["L",2],["XL",2],["XXL",1],["3XL",1]],"NS":[["14.5/32-33",1],["15/32-33",1],["15.5/32-33",1],["16/34-35",1],["16.5/34-35",1],["17/34-35",1]]};
  const p = packs[packChar] || { master: "—", inner: "—" };
  const s = sizeSets[sizeCode] || [["N/A", 1]];
  return { master_qty: p.master, inner_qty: p.inner, sizes: s };
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
  }

  source.forEach(item => {
    if (!item.sku) return;
    let brand = item.brand || "UNKNOWN";
    const skuUp = item.sku.toUpperCase();
    if (skuUp.startsWith("LUCK")) brand = "LUCKY";
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

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════

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
// fallback chain only runs once per SKU
// ═══════════════════════════════════════════
const imageUrlCache = {};

function resolveImageUrl(item) {
  const sku = item.sku || item.alt || "";
  if (imageUrlCache[sku]) return imageUrlCache[sku];
  return getImageUrl(item);
}

function cacheImageUrl(sku, url) {
  imageUrlCache[sku] = url;
}

// Preload a batch of images into browser cache
function preloadImages(items) {
  items.slice(0, 30).forEach(item => {
    const url = resolveImageUrl(item);
    const img = new Image();
    img.src = url;
  });
}

// Background preloader — loads ALL images across every brand in batches
let _bgPreloadStarted = false;
function backgroundPreloadAll(inventory) {
  if (_bgPreloadStarted) return;
  _bgPreloadStarted = true;
  
  const BATCH_SIZE = 8;   // concurrent loads
  const DELAY_MS = 100;   // pause between batches
  let idx = 0;

  function loadBatch() {
    if (idx >= inventory.length) return;
    const batch = inventory.slice(idx, idx + BATCH_SIZE);
    batch.forEach(item => {
      const sku = item.sku || "";
      if (imageUrlCache[sku]) return; // already resolved
      const url = getImageUrl(item);
      const img = new Image();
      img.onload = () => cacheImageUrl(sku, url);
      img.onerror = () => {
        // try override
        const url2 = `${S3_OVERRIDE}/${sku}.jpg`;
        const img2 = new Image();
        img2.onload = () => cacheImageUrl(sku, url2);
        img2.onerror = () => {
          // try png
          const url3 = url2.replace(".jpg", ".png");
          const img3 = new Image();
          img3.onload = () => cacheImageUrl(sku, url3);
          img3.src = url3;
        };
        img2.src = url2;
      };
      img.src = url;
    });
    idx += BATCH_SIZE;
    setTimeout(loadBatch, DELAY_MS);
  }
  
  // Start after a short delay so UI loads first
  setTimeout(loadBatch, 1500);
}

function ImageWithFallback({ src, alt, style, className, onClick }) {
  const sku = alt || "";
  const cached = imageUrlCache[sku];
  const [currentSrc, setCurrentSrc] = useState(cached || src);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const triedRef = useRef(new Set());

  useEffect(() => {
    const c = imageUrlCache[sku];
    setCurrentSrc(c || src);
    setError(false);
    setLoaded(false);
    triedRef.current.clear();
  }, [src, sku]);

  const handleLoad = () => {
    setLoaded(true);
    cacheImageUrl(sku, currentSrc);
  };

  const handleError = () => {
    if (!triedRef.current.has("override")) {
      triedRef.current.add("override");
      setCurrentSrc(`${S3_OVERRIDE}/${sku}.jpg`);
    } else if (!triedRef.current.has("png")) {
      triedRef.current.add("png");
      setCurrentSrc(currentSrc.replace(".jpg", ".png"));
    } else {
      setError(true);
    }
  };

  if (error) return (
    <div style={{ ...style, background:"linear-gradient(135deg,#f1f5f9,#e2e8f0)", display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:13,fontWeight:600 }} className={className}>
      No Image
    </div>
  );
  return (
    <img
      src={currentSrc}
      alt={alt}
      style={{ ...style, opacity: loaded ? 1 : 0, transition:"opacity .15s ease" }}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
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
function ProductCard({ item, onClick }) {
  const fabric = getFabricFromSKU(item.sku);
  const fit = getFitFromSKU(item.sku);
  const ats = item.total_ats || 0;
  return (
    <div onClick={onClick} className="product-card" style={{ background:"#fff",borderRadius:14,overflow:"hidden",border:"2px solid #e5e7eb" }}>
      <div style={{ position:"relative",overflow:"hidden" }}>
        <ImageWithFallback src={resolveImageUrl(item)} alt={item.sku} style={{ width:"100%",height:220,objectFit:"cover",background:"#f3f4f6" }} />
      </div>
      <div style={{ padding:"12px 14px" }}>
        <h3 style={{ fontSize:15,fontWeight:700,color:"#1f2937",marginBottom:2 }}>{item.sku}</h3>
        <p style={{ fontSize:12,color:"#6b7280",marginBottom:4 }}>{item.brand_full}</p>
        <p style={{ fontSize:11,color:"#9ca3af",marginBottom:8 }}>{fit} · {fabric.description.length > 30 ? fabric.description.substring(0,28)+"..." : fabric.description}</p>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontSize:13,fontWeight:700,color: ats > 0 ? "#16a34a" : "#dc2626" }}>
            {ats > 0 ? `${ats.toLocaleString()} ATS` : "Out of Stock"}
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

// ─── Product Detail Modal ────────────────
function ProductDetailModal({ item, onClose, onAddToCart }) {
  if (!item) return null;
  const fabric = getFabricFromSKU(item.sku);
  const fit = getFitFromSKU(item.sku);
  const sp = getSizePack(item.sku);
  const totalStock = (item.jtw||0)+(item.tr||0)+(item.dcw||0)+(item.qa||0);
  const ats = item.total_ats || 0;

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16 }} onClick={onClose}>
      <div style={{ background:"rgba(255,255,255,.97)",borderRadius:14,maxWidth:580,width:"100%",maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,.3)",position:"relative" }} onClick={e => e.stopPropagation()}>
        
        {/* Sticky header with close button */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid #e5e7eb",flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:18,fontWeight:800,color:"#1f2937" }}>{item.sku}</h2>
            <p style={{ fontSize:12,color:"#6b7280" }}>{item.brand_full}</p>
          </div>
          <button onClick={onClose} style={{ fontSize:24,background:"#f3f4f6",border:"none",color:"#6b7280",cursor:"pointer",lineHeight:1,width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0 }}>✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY:"auto",padding:"16px 20px" }}>
          
          {/* Image + Key Stats Row */}
          <div style={{ display:"flex",gap:16,marginBottom:16 }}>
            <ImageWithFallback src={resolveImageUrl(item)} alt={item.sku} style={{ width:140,height:180,borderRadius:10,objectFit:"cover",border:"2px solid #e5e7eb",flexShrink:0 }} />
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

          {/* Committed & Incoming */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12 }}>
            <div style={{ background:"#fefce8",padding:8,borderRadius:8 }}>
              <p style={{ fontSize:10,color:"#a16207",fontWeight:600 }}>Committed & Allocated</p>
              <p style={{ fontSize:16,fontWeight:800 }}>{((item.committed||0)+(item.allocated||0)).toLocaleString()}</p>
            </div>
            <div style={{ background:"#ecfeff",padding:8,borderRadius:8 }}>
              <p style={{ fontSize:10,color:"#0e7490",fontWeight:600 }}>Incoming</p>
              <p style={{ fontSize:16,fontWeight:800 }}>{(item.incoming||0).toLocaleString()}</p>
            </div>
          </div>

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
        if (selectedItem) { setSelectedItem(null); window.history.back(); }
        else if (showCart) setShowCart(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, showCart, view, goToBrands]);

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
    setFilterMode(prev => prev === "all" ? "incoming" : prev === "incoming" ? "ats" : "all");
  }, []);

  // ─── Brand View Filtering ─────────────
  const brandData = currentBrand ? brands[currentBrand] : null;
  const filteredItems = useMemo(() => {
    if (!brandData) return [];
    let items = [...brandData.items];
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
    return items;
  }, [brandData, searchQuery, fitFilter, fabricFilter, sortBy]);

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
            <img src="https://nauticaslimfit.s3.us-east-2.amazonaws.com/ALL+INVENTORY+Photos/Brand+Logos/Versa+LOGO111.png"
              alt="Versa Group" style={{ height:38,filter:"brightness(0) invert(1)",opacity:.9 }} onError={e => e.target.style.display="none"} />
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
                </select>
              </div>



              <p style={{ fontSize:12,color:"#64748b",marginTop:10 }}>
                Showing <strong style={{ color:"#e2e8f0" }}>{filteredItems.length}</strong> of {brandData.items.length} styles
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}
                    style={{ marginLeft:8,fontSize:11,color:"#818cf8",background:"none",border:"none",cursor:"pointer",fontWeight:600 }}>Clear search</button>
                )}
              </p>
            </div>

            {/* Product Grid */}
            {filteredItems.length === 0 ? (
              <div style={{ textAlign:"center",padding:60,color:"#64748b" }}>
                <p style={{ fontSize:48,marginBottom:12 }}>🔍</p>
                <p style={{ fontSize:16 }}>No products match your filters</p>
              </div>
            ) : (
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16 }}>
                {filteredItems.map(item => (
                  <ProductCard key={item.sku} item={item} onClick={() => goToDetail(item)} />
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
        <ProductDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
      )}
      {showCart && (
        <CartModal cart={cart} onClose={() => setShowCart(false)}
          onRemove={i => setCart(prev => prev.filter((_,idx) => idx !== i))}
          onClear={() => { setCart([]); setShowCart(false); }}
          onUpdateQty={(i, qty) => setCart(prev => { const u = [...prev]; u[i] = {...u[i], qty}; return u; })}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
