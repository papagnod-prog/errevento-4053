/**
 * Mappa dei vecchi tag WooCommerce (/product-tag/<slug>) verso una ricerca nel
 * catalogo. Generata offline verificando che il termine restituisca almeno un
 * risultato sul database prodotti. I tag non presenti in questa mappa non danno
 * risultati e vengono rediretti al catalogo generico.
 */
export const LEGACY_TAG_SEARCH: Record<string, string> = {
  "18-anni": "18 anni",
  "25": "25",
  "25-anniversario": "25 anniversario",
  "50": "50",
  "50-anniversario": "50 anniversario",
  "aeroplano": "aeroplano",
  "albero": "albero",
  "albero-della-vita": "albero della vita",
  "ali": "ali",
  "alluminio": "alluminio",
  "alzatina": "alzatina",
  "amore": "amore",
  "anfora": "anfora",
  "angelo": "angelo",
  "angioletto": "angioletto",
  "anniversario": "anniversario",
  "antipastiera": "antipastiera",
  "aperitivo": "aperitivo",
  "appendino": "appendino",
  "apribottiglia": "apribottiglia",
  "apribottiglie": "apribottiglie",
  "arcobaleno": "arcobaleno",
  "ballerina": "ballerina",
  "ballerine": "ballerine",
  "barattolini": "barattolini",
  "barattolino": "barattolino",
  "barchetta": "barchetta",
  "battesimo": "battesimo",
  "bomboniera": "bomboniera",
  "bomboniere": "bomboniere",
  "bottiglia-olio": "bottiglia olio",
  "boy": "boy",
  "cactus": "cactus",
  "caffe": "caffe",
  "caffettiera": "caffettiera",
  "calamita": "calamita",
  "calamite": "calamite",
  "candela": "candela",
  "carillon": "carillon",
  "carrozza": "carrozza",
  "cassetto": "cassetto",
  "castello": "castello",
  "cavatappi": "cavatappi",
  "ceramica": "ceramica",
  "ciondolo": "ciondolo",
  "ciotola": "ciotola",
  "clessidra": "clessidra",
  "collana": "collana",
  "compleanni": "compleanni",
  "compleanno": "compleanno",
  "comunione": "comunione",
  "confettata": "confettata",
  "confettate": "confettate",
  "confetti": "confetti",
  "cornice": "cornice",
  "corona": "corona",
  "cresima": "cresima",
  "cristallo": "cristallo",
  "cuore": "cuore",
  "cuori": "cuori",
  "decina": "decina",
  "diciottesimo": "diciottesimo",
  "diffusore": "diffusore",
  "disney": "disney",
  "dondolo": "dondolo",
  "ecopelle": "ecopelle",
  "elefantini": "elefantini",
  "elefantino": "elefantino",
  "ermetico": "ermetico",
  "essenza": "essenza",
  "farfalla": "farfalla",
  "farfalle": "farfalle",
  "fatina": "fatina",
  "feste": "feste",
  "frasi": "frasi",
  "giostrina": "giostrina",
  "girl": "girl",
  "glitter": "glitter",
  "gufetto": "gufetto",
  "icona-sacra": "icona sacra",
  "iniziali": "iniziali",
  "inviti": "inviti",
  "lampada": "lampada",
  "lanterna": "lanterna",
  "laurea": "laurea",
  "led": "led",
  "legno": "legno",
  "levatappi": "levatappi",
  "love": "love",
  "lume": "lume",
  "luna": "luna",
  "maiolica": "maiolica",
  "mani": "mani",
  "manico": "manico",
  "mappamondo": "mappamondo",
  "mare": "mare",
  "matrimonio": "matrimonio",
  "memo-clip": "memo clip",
  "memoclip": "memoclip",
  "metallo": "metallo",
  "minnie": "minnie",
  "moka": "moka",
  "nascita": "nascita",
  "nota-musicale": "nota musicale",
  "nozze-oro": "nozze oro",
  "oliera": "oliera",
  "olio-e-aceto": "olio e aceto",
  "orologio": "orologio",
  "orsetto": "orsetto",
  "orso": "orso",
  "ostia": "ostia",
  "paletta": "paletta",
  "paletta-torta": "paletta torta",
  "palloncino": "palloncino",
  "partecipazione": "partecipazione",
  "personalizzate": "personalizzate",
  "piccolo-principe": "piccolo principe",
  "pigna": "pigna",
  "poggiamestolo": "poggiamestolo",
  "pomo": "pomo",
  "porcellana": "porcellana",
  "porta-pianta": "porta pianta",
  "porta-sale-e-pepe": "porta sale e pepe",
  "porta-spezie": "porta spezie",
  "portacandela": "portacandela",
  "portachiavi": "portachiavi",
  "portaconfetti": "portaconfetti",
  "portafiori": "portafiori",
  "portafoto": "portafoto",
  "portapiante": "portapiante",
  "portatovaglioli": "portatovaglioli",
  "prima-comunione": "prima comunione",
  "principe": "principe",
  "principessa": "principessa",
  "profumatore": "profumatore",
  "provette": "provette",
  "puglia": "puglia",
  "pumo": "pumo",
  "quadretti": "quadretti",
  "resina": "resina",
  "rosa": "rosa",
  "rosario": "rosario",
  "ruota-panoramica": "ruota panoramica",
  "sabbia": "sabbia",
  "sacchetti": "sacchetti",
  "sacchetto": "sacchetto",
  "sacra-famiglia": "sacra famiglia",
  "sacramento": "sacramento",
  "sacri": "sacri",
  "salvadanaio": "salvadanaio",
  "salvagoccia": "salvagoccia",
  "santa-cresima": "santa cresima",
  "scatola": "scatola",
  "scatola-plex": "scatola plex",
  "scatolina": "scatolina",
  "schiaccianoci": "schiaccianoci",
  "segnalibro": "segnalibro",
  "segnaposto": "segnaposto",
  "set": "set",
  "set-formaggio": "set formaggio",
  "set-sale-e-pepe": "set sale e pepe",
  "set-tazzine": "set tazzine",
  "set-vino": "set vino",
  "sottobicchieri": "sottobicchieri",
  "sottomoka": "sottomoka",
  "sottopentola": "sottopentola",
  "sposi": "sposi",
  "spremiagrumi": "spremiagrumi",
  "statuina": "statuina",
  "stella": "stella",
  "strass": "strass",
  "tagliapizza": "tagliapizza",
  "tagliere": "tagliere",
  "tao": "tao",
  "tappo": "tappo",
  "tazze": "tazze",
  "teiera": "teiera",
  "termometro": "termometro",
  "terracotta": "terracotta",
  "timone": "timone",
  "topolino": "topolino",
  "trulli": "trulli",
  "vaso": "vaso",
  "vetro": "vetro",
  "vino": "vino",
  "wedding-box": "wedding box",
  "zuccheriera": "zuccheriera",
};

/** Categorie WooCommerce non piu esistenti nel nuovo catalogo. */
export const LEGACY_CATEGORY_SKIP = new Set(["uncategorized"]);

/** Vecchi percorsi ecommerce: il sito non vende online, portano al catalogo. */
export const LEGACY_SHOP_PATHS = new Set([
  "/shop",
  "/negozio",
  "/cart",
  "/carrello",
  "/checkout",
  "/my-account",
  "/mio-account",
  "/wishlist",
  "/yith-compare",
  "/compare",
  "/store-manager",
  "/dashboard",
  "/product",
  "/product-tag",
  "/product-category",
]);

/** Vecchi articoli e archivi del blog: rediretti alla home. */
export const LEGACY_BLOG_PATHS = new Set([
  "/blog",
  "/perche-5-confetti-nella-bomboniera",
  "/un-po-di-voi",
  "/mirto-simbolo-di-amore-e-vitalita",
  "/category/curiosita",
  "/tag/bomboniera",
  "/tag/confetti",
  "/tag/errevento-it",
  "/tag/mirto",
  "/tag/tradizione",
]);

/** Vecchie pagine di contatto/informative con slug diverso. */
export const LEGACY_PAGE_MAP: Record<string, string> = {
  "/contatti-2": "/contatti",
  "/contact": "/contatti",
  "/chi-sono": "/chi-siamo",
  "/about": "/chi-siamo",
  "/about-us": "/chi-siamo",
  "/prenota-appuntamento": "/contatti",
  "/wedding-planner-2": "/wedding-planner",
  "/allestimenti-2": "/allestimenti",
};

/**
 * Risolve un vecchio URL nel percorso corrispondente del nuovo sito.
 * Restituisce null se non esiste una destinazione sensata (-> 404).
 */
export function resolveLegacyPath(rawPath: string): string | null {
  const path = rawPath.replace(/\/+$/, "").toLowerCase() || "/";

  if (LEGACY_SHOP_PATHS.has(path)) return "/catalogo";
  if (LEGACY_BLOG_PATHS.has(path)) return "/";
  if (LEGACY_PAGE_MAP[path]) return LEGACY_PAGE_MAP[path];

  const product = path.match(/^\/product\/([^/]+)/);
  if (product) return `/prodotto/${product[1]}`;

  const tag = path.match(/^\/product-tag\/([^/]+)/);
  if (tag) {
    const term = LEGACY_TAG_SEARCH[decodeURIComponent(tag[1])];
    return term ? `/catalogo?q=${encodeURIComponent(term)}` : "/catalogo";
  }

  const category = path.match(/^\/product-category\/(.+)$/);
  if (category) {
    const segments = category[1].split("/").filter(Boolean);
    const last = decodeURIComponent(segments[segments.length - 1] ?? "");
    if (!last || LEGACY_CATEGORY_SKIP.has(last)) return "/catalogo";
    return `/catalogo?categoria=${encodeURIComponent(last)}`;
  }

  if (path.startsWith("/blog/")) return "/";

  return null;
}
