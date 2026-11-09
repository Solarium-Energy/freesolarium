/**
 * Single source of truth for copy, pricing and contact details.
 *
 * Values marked TODO are still awaiting written confirmation from Solarium.
 * They are kept here (rather than buried in components) so they can be
 * updated in one place before launch.
 */

export const site = {
  brand: "SOLARIUM",
  legalName: "Solarium Green Energy Ltd",
  tagline: "India's integrated solar company",
  phoneDisplay: "80030 80020",
  phoneHref: "tel:+918003080020",
  whatsappNumber: "918003080020",
  email: "info@solariumenergy.in",
  address:
    "B-1207, World Trade Tower, S.G. Highway, Sarkhej, Ahmedabad, Gujarat 380051",
  linkedin: "https://www.linkedin.com/company/solariumgreenenergy/home/",
  youtube: "https://www.youtube.com/@solariumenergy",
  instagram: "https://www.instagram.com/solariumgreenenergy/",
  facebook: "https://www.facebook.com/solariumgreenenergy",
};

export function whatsappUrl(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** TODO: confirm final pricing with Solarium before launch. */
export const PRICING = {
  systemValue: 100_000,
  centralSubsidy: 63_240,
  stateSubsidy: 36_760,
  /** 0 means "quoted after the rooftop survey". */
  multiFloorCost: 0,
  /** 0 means "quoted after the rooftop survey". */
  elevatedCost: 0,
} as const;

export const HERO_PRICE = Math.max(
  0,
  PRICING.systemValue - PRICING.centralSubsidy - PRICING.stateSubsidy
);

export const inr = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;

export const SYSTEM = {
  size: "2.18 kW",
  panels: "Solarium solar modules",
  inverter: "On-grid inverter",
  structure: "ZAM mounting structure",
  moduleCount: 4,
} as const;

export const TRUST_STATS = [
  { value: "25,000+", guValue: "25,000+", label: "Homes solarised", guLabel: "સોલર ઊર્જાથી સજ્જ ઘરો" },
  { value: "Since 2018", guValue: "2018થી", label: "In rooftop solar", guLabel: "રૂફટોપ સોલરમાં" },
  { value: "BSE listed", guValue: "BSE પર લિસ્ટેડ", label: "Public, audited company", guLabel: "જાહેર, ઓડિટ થયેલી કંપની" },
  { value: "#1 in Gujarat*", guValue: "ગુજરાતમાં #1*", label: "Home rooftop solar", guLabel: "ઘરની છત પર સોલર (Home rooftop solar)" },
] as const;

export const INCLUDED = [
  {
    title: "Solar Panels",
    guTitle: "સોલર પેનલ્સ",
    subtitle: "Higher wattages are just the beginning",
    guSubtitle: "વધુ વોટેજ તો માત્ર શરૂઆત છે",
    tag: "PV Modules",
    guTag: "PV મોડ્યુલ્સ",
    body: "World-class manufacturing, certified quality, and a reliable supply provide complete solutions for every project.",
    guBody:
      "વિશ્વસ્તરીય ઉત્પાદન, પ્રમાણિત ગુણવત્તા અને વિશ્વસનીય સપ્લાય દરેક પ્રોજેક્ટ માટે સંપૂર્ણ ઉકેલો પૂરા પાડે છે.",
    specs: [
      "1.2 GW automated manufacturing capacity",
      "30-year performance warranty",
      "DCR: 720Wp, 600Wp & 545Wp N-Type available",
      "Non-DCR: 725Wp N-Type available",
    ],
    guSpecs: [
      "1.2 GW સ્વચાલિત ઉત્પાદન ક્ષમતા",
      "30 વર્ષની કાર્યક્ષમતા વોરંટી",
      "DCR: 720Wp, 600Wp અને 545Wp N-Type ઉપલબ્ધ",
      "Non-DCR: 725Wp N-Type ઉપલબ્ધ",
    ],
    image: "/images/products/product-01-solar-panel.png",
    imageAlt: "Solarium high-efficiency N-Type solar panels",
    guImageAlt: "Solarium હાઈ-એફિશિયન્સી N-Type સોલર પેનલ્સ",
    icon: "panels",
  },
  {
    title: "Solar Inverter",
    guTitle: "સોલર ઇન્વર્ટર",
    subtitle: "Brain of a Solar Plant",
    guSubtitle: "સોલર પ્લાન્ટનું મગજ",
    tag: "Power Conversion",
    guTag: "પાવર કન્વર્ઝન",
    body: "Generation, protection, and monitoring combined. Robust aluminum die-cast body with LCD display and remote dashboard.",
    guBody:
      "વીજ ઉત્પાદન, સુરક્ષા અને મોનિટરિંગનું સંયોજન. LCD ડિસ્પ્લે અને રિમોટ ડેશબોર્ડ સાથે મજબૂત એલ્યુમિનિયમ ડાઈ-કાસ્ટ બોડી.",
    specs: [
      "Up to 130% overloading capacity & 20–23A input",
      "Type-II SPD surge protection (DC & AC)",
      "In-built anti-islanding & optional AFCI protection",
      "Remote plant monitoring & 10 years warranty",
    ],
    guSpecs: [
      "130% સુધી ઓવરલોડિંગ ક્ષમતા અને 20–23A ઇનપુટ",
      "Type-II SPD સર્જ પ્રોટેક્શન (DC અને AC)",
      "ઇન-બિલ્ટ એન્ટી-આઇલેન્ડિંગ અને વૈકલ્પિક AFCI સુરક્ષા",
      "રિમોટ પ્લાન્ટ મોનિટરિંગ અને 10 વર્ષની વોરંટી",
    ],
    image: "/images/products/product-02-solar-inverter.png",
    imageAlt: "Solarium on-grid solar inverter",
    guImageAlt: "Solarium ઓન-ગ્રીડ સોલર ઇન્વર્ટર",
    icon: "inverter",
  },
  {
    title: "Mounting Structure",
    guTitle: "માઉન્ટિંગ સ્ટ્રક્ચર",
    subtitle: "Engineered for 30-Year Rooftop Life",
    guSubtitle: "રૂફટોપ પર 30 વર્ષના આયુષ્ય માટે એન્જિનિયર કરેલ",
    tag: "HDGI Structure",
    guTag: "HDGI સ્ટ્રક્ચર",
    body: "This is exactly where low-cost systems quietly compromise. Heavy-duty HDGI steel engineered to survive extreme weather.",
    guBody:
      "આ એવો ભાગ છે જ્યાં સસ્તી સિસ્ટમ્સમાં ગુણવત્તા સાથે બાંધછોડ કરવામાં આવે છે. આ સ્ટ્રક્ચર અત્યંત હવામાન પરિસ્થિતિઓમાં ટકી રહે તે માટે હેવી-ડ્યુટી HDGI સ્ટીલમાંથી બનાવવામાં આવ્યું છે.",
    specs: [
      "HDGI steel with certified ISI mark",
      "HDGI 60*40 & 40*40 mm pipes as per design",
      "HDGI 2mm+ pipe thickness and minimum 60 micron coating",
    ],
    guSpecs: [
      "પ્રમાણિત ISI માર્ક ધરાવતું HDGI સ્ટીલ",
      "ડિઝાઇન મુજબ HDGI 60*40 અને 40*40 mm પાઇપ્સ",
      "HDGI પાઇપની જાડાઈ 2mm કે તેથી વધુ અને ઓછામાં ઓછું 60 માઇક્રોન કોટિંગ",
    ],
    image: "/images/products/product-03-mounting-structure.png",
    imageAlt: "HDGI solar mounting structure",
    guImageAlt: "HDGI સોલર માઉન્ટિંગ સ્ટ્રક્ચર",
    icon: "structure",
  },
  {
    title: "Base Plate",
    guTitle: "બેઝ પ્લેટ",
    subtitle: "Silver Painted Foundation Support",
    guSubtitle: "સિલ્વર પેઇન્ટેડ ફાઉન્ડેશન સપોર્ટ",
    tag: "Foundation",
    guTag: "ફાઉન્ડેશન",
    body: "High-strength color-coated mild steel base plates engineered for rock-solid stability under severe wind loads.",
    guBody:
      "તીવ્ર પવનના દબાણ સામે મજબૂત સ્થિરતા પ્રદાન કરવા માટે, ઉચ્ચ ક્ષમતા ધરાવતી કલર-કોટેડ માઇલ્ડ સ્ટીલ (M.S.) બેઝ પ્લેટ્સ.",
    specs: [
      "Size: 150 X 150 mm heavy-duty base plate",
      "Material: M.S (Color Coated finish)",
      "Heavy 5 mm plate thickness",
      "Solid 900 gm weight for wind resistance",
    ],
    guSpecs: [
      "કદ: 150 X 150 mm હેવી-ડ્યુટી બેઝ પ્લેટ",
      "મટિરિયલ: M.S. (કલર કોટેડ ફિનિશ)",
      "5 mm ની મજબૂત પ્લેટ જાડાઈ",
      "પવન સામે ટકી રહેવા માટે 900 ગ્રામ વજન ધરાવતી મજબૂત પ્લેટ",
    ],
    image: "/images/products/product-04-base-plate.png",
    imageAlt: "Solarium heavy-duty base plate",
    guImageAlt: "Solarium હેવી-ડ્યુટી બેઝ પ્લેટ",
    icon: "baseplate",
  },
  {
    title: "SS Fasteners & Hardware",
    guTitle: "SS ફાસ્ટનર્સ અને હાર્ડવેર",
    subtitle: "S.S304 Stainless Steel Grade",
    guSubtitle: "S.S304 સ્ટેનલેસ સ્ટીલ ગ્રેડ",
    tag: "SS Hardware",
    guTag: "SS હાર્ડવેર",
    body: "Full marine-grade S.S304 stainless steel hardware ensuring zero corrosion, rust, or structural weakness for 30+ years.",
    guBody:
      "સંપૂર્ણપણે મરીન-ગ્રેડ (marine-grade) S.S304 સ્ટેનલેસ સ્ટીલ હાર્ડવેર, જે ૩૦ વર્ષથી વધુ સમય સુધી કાટ, રસ્ટ (ઝાંખ) કે માળખાકીય નબળાઈ આવવા દેતું નથી.",
    specs: [
      "Nut-Bolt: Marine-grade S.S304, Size M10x180",
      "Anchor Bolt: High-tensile S.S304, Size M10x100",
      "J-Bolt: SS304M with 8 Flange Nuts",
      "100% rust-proof & corrosion-resistant stainless steel",
    ],
    guSpecs: [
      "નટ-બોલ્ટ: મરીન-ગ્રેડ S.S304, સાઈઝ M10x180",
      "એન્કર બોલ્ટ: હાઈ-ટેન્સાઈલ (મજબૂત) S.S304, સાઈઝ M10x100",
      "J-બોલ્ટ: SS304, સાથે ૮ ફ્લેન્જ નટ્સ",
      "૧૦૦% રસ્ટ-પ્રૂફ અને કાટ-પ્રતિરોધક સ્ટેનલેસ સ્ટીલ",
    ],
    image: "/images/products/product-05-fasteners.png",
    imageAlt: "S.S304 stainless steel fasteners and anchor bolts",
    guImageAlt: "S.S304 સ્ટેનલેસ સ્ટીલ ફાસ્ટનર્સ અને એન્કર બોલ્ટ્સ",
    icon: "fasteners",
  },
  {
    title: "ACDB / DCDB / Switch",
    guTitle: "ACDB / DCDB / સ્વિચ",
    subtitle: "Small in size, vital for safety",
    guSubtitle: "કદમાં નાના, પરંતુ સુરક્ષા માટે અત્યંત મહત્વપૂર્ણ",
    tag: "Electrical Safety",
    guTag: "ઇલેક્ટ્રિકલ સેફ્ટી",
    body: "ACDB, DCDB, and isolation switches protect both equipment and people from electrical surges, shocks, and faults.",
    guBody:
      "ACDB, DCDB અને આઈસોલેશન સ્વિચ સાધનો તેમજ વ્યક્તિઓને ઇલેક્ટ્રિકલ સર્જ (અચાનક વોલ્ટેજ વધારો), શોક અને ફોલ્ટથી સુરક્ષિત રાખે છે.",
    specs: [
      "5 years comprehensive manufacturer warranty",
      "Premium SPD & MCB: Schneider, Eaton, Elmex & L&K",
      "IP65/IP66 certified outdoor weatherproof enclosures",
      "100% factory tested for surge and electrical safety",
    ],
    guSpecs: [
      "૫ વર્ષની સંપૂર્ણ ઉત્પાદક વોરંટી",
      "પ્રીમિયમ SPD અને MCB: Schneider, Eaton, Elmex અને L&K",
      "IP65/IP66 પ્રમાણિત, બહારના વાતાવરણમાં ટકી શકે તેવા (વેધરપ્રૂફ) એન્ક્લોઝર",
      "સર્જ અને ઇલેક્ટ્રિકલ સુરક્ષા માટે ફેક્ટરીમાં ૧૦૦% ટેસ્ટ કરાયેલ",
    ],
    image: "/images/products/product-06-electrical-panels.png",
    imageAlt: "ACDB DCDB solar distribution and isolation boxes",
    guImageAlt: "ACDB DCDB સોલર ડિસ્ટ્રિબ્યુશન અને આઈસોલેશન બોક્સ",
    icon: "bos",
  },
  {
    title: "Pipes and Fittings",
    guTitle: "પાઈપ્સ અને ફિટિંગ્સ",
    subtitle: "UV-Protected RPVC Conduit",
    guSubtitle: "UV-સુરક્ષિત RPVC કોન્ડ્યુટ",
    tag: "Conduit System",
    guTag: "કોન્ડ્યુટ સિસ્ટમ",
    body: "Complete UV and weather-resistant conduit network protecting critical solar cables against extreme heat and cracking.",
    guBody:
      "સંપૂર્ણપણે UV અને હવામાન-પ્રતિરોધક કોન્ડ્યુટ નેટવર્ક, જે મહત્વપૂર્ણ સોલર કેબલ્સને અતિશય ગરમી અને તિરાડો પડવાથી બચાવે છે.",
    specs: [
      "Certified IS standard pipes",
      "RPVC 25 mm pipe, elbow, tee, coupler & saddle",
      "UV and weather-protected for outdoor rooftop use",
      "Rust-resistant and long-lasting ISI mark",
      "Strong RPVC prevents cable exposure & cracking",
    ],
    guSpecs: [
      "IS (ભારતીય માનક) પ્રમાણિત પાઈપ્સ",
      "RPVC ૨૫ mm પાઈપ, એલ્બો, ટી (T), કપલર અને સેડલ",
      "છત પર (આઉટડોર) ઉપયોગ માટે UV અને હવામાન સામે સુરક્ષિત",
      "કાટ-પ્રતિરોધક અને લાંબા સમય સુધી ચાલતા, ISI માર્ક ધરાવતા",
      "મજબૂત RPVC કેબલને ખુલ્લા પડતા અને તિરાડો પડતા અટકાવે છે",
    ],
    image: "/images/products/product-07-pvc-fittings.png",
    imageAlt: "Heavy-duty RPVC conduit pipes and fittings",
    guImageAlt: "હેવી-ડ્યુટી RPVC કોન્ડ્યુટ પાઈપ્સ અને ફિટિંગ્સ",
    icon: "pipes",
  },
  {
    title: "Solar & Earthing Cables",
    guTitle: "સોલર અને અર્થિંગ કેબલ્સ",
    subtitle: "What hides behind the wall ensures safety",
    guSubtitle: "દિવાલની પાછળ છુપાયેલા કેબલ્સ જ સુરક્ષા સુનિશ્ચિત કરે છે",
    tag: "Solar Cabling",
    guTag: "સોલર કેબલિંગ",
    body: "After installation, cables become invisible — verify quality first. High-purity copper guarantees low loss and safety.",
    guBody:
      "ઇન્સ્ટોલેશન પછી, કેબલ્સ દેખાતા નથી — તેથી તેની ગુણવત્તા પહેલા જ તપાસી લેવી જોઈએ. ઉચ્ચ શુદ્ધતા ધરાવતું તાંબું (કોપર) ઉર્જાનો ઓછો વ્યય અને સુરક્ષાની ખાતરી આપે છે.",
    specs: [
      "DC Solar Cable: 1 Core 4.0 SQ MM Polycab/Johanson Type 1",
      "AC Cable: 2 Core 4.0 SQ MM copper flexible (Polycab/Johanson)",
      "Earthing Cable: 1 Core 6 SQ MM Cu & 1 Core 16 SQ MM Al",
      "High-purity copper with UV, heat & weather insulation",
    ],
    guSpecs: [
      "DC સોલર કેબલ: 1 કોર 4.0 SQ MM (Polycab/Johanson Type 1)",
      "AC કેબલ: 2 કોર 4.0 SQ MM કોપર ફ્લેક્સિબલ (Polycab/Johanson)",
      "અર્થિંગ કેબલ: 1 કોર 6 SQ MM કોપર (Cu) અને 1 કોર 16 SQ MM એલ્યુમિનિયમ (Al)",
      "UV, ગરમી અને હવામાન સામે રક્ષણ આપતું ઇન્સ્યુલેશન ધરાવતું ઉચ્ચ શુદ્ધતાવાળું કોપર (તાંબુ)",
    ],
    image: "/images/products/product-08-cables.png",
    imageAlt: "Polycab/Johanson solar DC and AC copper cables",
    guImageAlt: "Polycab/Johanson સોલર DC અને AC કોપર કેબલ્સ",
    icon: "cables",
  },
  {
    title: "Earthing Components",
    guTitle: "અર્થિંગના ઘટકો",
    subtitle: "Complete Grounding & Lightning Safety",
    guSubtitle: "સંપૂર્ણ ગ્રાઉન્ડિંગ અને વીજળી (લાઈટનિંગ) સામે સુરક્ષા",
    tag: "Grounding",
    guTag: "ગ્રાઉન્ડિંગ",
    body: "Low earth resistance protection system designed for reliable lightning dissipation and shock safety in all soil types.",
    guBody:
      "તમામ પ્રકારની જમીનમાં વીજળીના પ્રવાહને સુરક્ષિત રીતે જમીનમાં ઉતારવા (dissipation) અને શોક સામે રક્ષણ આપવા માટે રચાયેલ, 'લો અર્થ રેઝિસ્ટન્સ' (ઓછો અવરોધ ધરાવતી) સુરક્ષા પ્રણાલી.",
    specs: [
      "Chemical earthing compound: 2 bags of 15 kg each",
      "14 mm dia, 1000 mm spike arrester (FRP, 50 micron)",
      "High-strength FRP pit chamber (165×250×250 mm)",
      "Low earth resistance, rust-proof all-weather safety",
    ],
    guSpecs: [
      "કેમિકલ અર્થિંગ કમ્પાઉન્ડ: 15 કિલોની 2 બેગ",
      "14 mm વ્યાસ, 1000 mm સ્પાઇક એરેસ્ટર (FRP, 50 માઇક્રોન)",
      "મજબૂત FRP પિટ ચેમ્બર (165×250×250 mm)",
      "ઓછો અર્થ રેઝિસ્ટન્સ, કાટ-મુક્ત અને તમામ હવામાનમાં સુરક્ષિત",
    ],
    image: "/images/products/product-09-earthing-duct.png",
    imageAlt: "Earthing chemical bag rod and FRP pit",
    guImageAlt: "અર્થિંગ કેમિકલ, રોડ અને FRP પિટ",
    icon: "earthing",
  },
  {
    title: "Accessories & Connectors",
    guTitle: "એસેસરીઝ અને કનેક્ટર્સ",
    subtitle: "Trust in every single connection",
    guSubtitle: "દરેક જોડાણમાં ભરોસો",
    tag: "Connections",
    guTag: "જોડાણો",
    body: "Industrial-grade certified connectors, UV cable ties, and lugs ensuring leak-free current flow and long-term durability.",
    guBody:
      "ઔદ્યોગિક ગુણવત્તાના પ્રમાણિત કનેક્ટર્સ, UV-પ્રતિરોધક કેબલ ટાઈ અને લગ્સ (lugs), જે વીજ પ્રવાહના લીકેજને રોકે છે અને લાંબા સમય સુધી ટકાઉપણું સુનિશ્ચિત કરે છે.",
    specs: [
      "MC4 Connector: Dash PV, 1500 V DC | IP68 | TÜV",
      "UV-protected heavy-duty solar cable ties",
      "High-quality certified crimp lugs from top brands",
      "Factory-rated watertight seals for zero power loss",
    ],
    guSpecs: [
      "MC4 કનેક્ટર: Dash PV, 1500 V DC | IP68 | TÜV પ્રમાણિત",
      "UV-સુરક્ષિત, મજબૂત (heavy-duty) સોલર કેબલ ટાઈ",
      "અગ્રણી બ્રાન્ડ્સના ઉચ્ચ ગુણવત્તાયુક્ત, પ્રમાણિત ક્રિમ્પ લગ્સ (crimp lugs)",
      "પાવર લોસ (ઉર્જાનો વ્યય) શૂન્ય રહે તે માટે ફેક્ટરી-રેટેડ વોટરટાઈટ સીલ",
    ],
    image: "/images/products/product-10-accessories.png",
    imageAlt: "Dash PV MC4 connectors and solar accessories",
    guImageAlt: "Dash PV MC4 કનેક્ટર્સ અને સોલર એસેસરીઝ",
    icon: "accessories",
  },
] as const;

export const INSTITUTIONS = [
  "Indian Armed Forces",
  "Military Engineer Services",
  "DRDO",
  "BARC",
  "LIC",
  "Indian Railways",
  "Leading banks & PSUs",
] as const;

export const JOURNEY = [
  {
    n: "01",
    guN: "૦૧",
    title: "Book online",
    guTitle: "ઓનલાઇન બુક કરો",
    when: "Today",
    guWhen: "આજે જ",
    body: "Share basic details. Pay & get 100% subsidy back.",
    guBody: "મૂળભૂત વિગતો આપો. ચૂકવણી કરો અને ૧૦૦% સબસિડી પાછી મેળવો.",
  },
  {
    n: "02",
    guN: "૦૨",
    title: "Share documents",
    guTitle: "દસ્તાવેજો આપો",
    when: "Same day",
    guWhen: "તે જ દિવસે",
    body: "Upload bill and roof photos here or on WhatsApp.",
    guBody: "વીજળીનું બિલ અને છતની તસવીરો અહીં અથવા વોટ્સએપ (WhatsApp) પર અપલોડ કરો.",
  },
  {
    n: "03",
    guN: "૦૩",
    title: "Rooftop survey",
    guTitle: "છતનું સર્વેક્ષણ (Rooftop Survey)",
    when: "We call to schedule",
    guWhen: "અમે સંપર્ક કરીશું",
    body: "We inspect your roof, load and connection.",
    guBody: "અમે તમારી છત, લોડ ક્ષમતા અને વીજ જોડાણની તપાસ કરીશું.",
  },
  {
    n: "04",
    guN: "૦૪",
    title: "Final confirmation",
    guTitle: "અંતિમ પુષ્ટિ",
    when: "Before work starts",
    guWhen: "કામ શરૂ થાય તે પહેલાં",
    body: "Approve the final quote before work starts.",
    guBody: "કામ શરૂ થાય તે પહેલાં, અંતિમ ક્વોટ (ખર્ચનો અંદાજ) મંજૂર કરો.",
  },
  {
    n: "05",
    guN: "૦૫",
    title: "Installation",
    guTitle: "ઇન્સ્ટોલેશન (સ્થાપન)",
    when: "After your approval",
    guWhen: "તમારી મંજૂરી મળ્યા પછી",
    body: "Our team installs, tests and hands over the system.",
    guBody: "અમારી ટીમ સિસ્ટમ ઇન્સ્ટોલ કરશે, તેનું પરીક્ષણ કરશે અને તમને સોંપશે.",
  },
  {
    n: "06",
    guN: "૦૬",
    title: "Subsidy & net meter",
    guTitle: "સબસિડી અને નેટ મીટર",
    when: "As per DISCOM",
    guWhen: "DISCOM (વીજ વિતરણ કંપની) ના નિયમો મુજબ",
    body: "We file net-meter and subsidy paperwork with you.",
    guBody: "અમે તમારી સાથે મળીને નેટ મીટર અને સબસિડી માટેની જરૂરી કાગળની કાર્યવાહી પૂર્ણ કરીશું.",
  },
] as const;

export const CUSTOMER_SAVINGS = {
  systemSize: "2.18 kW",
  monthlySavings: 2000,
  monthlySavingsText: "₹2,000 / month",
  agreementYears: 25,
  totalSavings: 600000,
  totalSavingsText: "₹6,00,000",
  calculationFormula: "₹2,000 × 12 months × 25 years = ₹6,00,000",
  googleRating: 4.7,
  googleReviewCount: "1,450+",
} as const;

export const TESTIMONIALS = [
  {
    id: "rajveer-mishra",
    name: "Rajveer Mishra",
    guName: "રાજવીર મિશ્રા",
    meta: "6 reviews · 2 photos",
    guMeta: "6 રિવ્યૂ · 2 ફોટા",
    timeAgo: "5 months ago",
    guTimeAgo: "5 મહિના પહેલા",
    city: "Verified Google Reviewer",
    system: "3 kW Solarium Solar System",
    guSystem: "3 kW સોલેરિયમ સોલર સિસ્ટમ",
    rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/106552496677713033949/reviews?hl=en-IN",
    avatarColor: "#0A4D8C",
    photos: ["/images/solar-panels.webp", "/images/solar-inverter-installation.webp"],
    quote:
      "I had 3kW solar panels from Solarium Green Energy installed 10 months ago. My experience has been absolutely fantastic. My electricity bill has become negligible. The installation was completed very quickly, and the support team is extremely helpful. If you are looking for a reliable and high-efficiency solar system, this is an excellent choice.",
    guQuote:
      "મેં 10 મહિના પહેલાં સોલેરિયમ ગ્રીન એનર્જીના 3kW સોલર પેનલ્સ ઇન્સ્ટોલ કરાવ્યા હતા. મારો અનુભવ ખરેખર અદ્ભુત રહ્યો છે. મારું વીજળીનું બિલ નજીવું થઈ ગયું છે. ઇન્સ્ટોલેશન ખૂબ જ ઝડપથી પૂર્ણ થયું હતું અને સપોર્ટ ટીમ અત્યંત મદદરૂપ છે. જો તમે વિશ્વસનીય અને ઉચ્ચ કાર્યક્ષમતાવાળી સોલર સિસ્ટમ શોધી રહ્યા છો, તો આ એક ઉત્તમ પસંદગી છે.",
    initials: "RM",
    verified: true,
  },
  {
    id: "shubham-sahu",
    name: "Shubham Sahu",
    guName: "શુભમ સાહુ",
    meta: "9 reviews · 2 photos",
    guMeta: "9 રિવ્યૂ · 2 ફોટા",
    timeAgo: "9 months ago",
    guTimeAgo: "9 મહિના પહેલા",
    city: "Verified Google Reviewer",
    system: "Solarium Solar + 5-Yr Insurance",
    guSystem: "સોલેરિયમ સોલર + 5 વર્ષનો વીમો",
    rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/111887772841502566003/reviews?hl=en-IN",
    avatarColor: "#D97724",
    photos: ["/images/solar-monitoring-app.webp", "/images/solar-net-meter-kit.webp"],
    quote:
      "I purchased solar insurance through Solarium, and my claim experience was very smooth. The insurance team was highly responsive, and the entire process was completed on time without any hassle. The service felt reliable, and overall I am very satisfied. I would definitely recommend Solarium.",
    guQuote:
      "મેં સોલેરિયમ મારફતે સોલર વીમો લીધો હતો અને મારો ક્લેમ કરવાનો અનુભવ ખૂબ જ સરળ રહ્યો. વીમા ટીમે તરત જ પ્રતિસાદ આપ્યો અને સમગ્ર પ્રક્રિયા કોઈપણ મુશ્કેલી વિના સમયસર પૂર્ણ થઈ. સેવા ખરેખર વિશ્વસનીય લાગી અને એકંદરે હું ખૂબ જ સંતુષ્ટ છું. હું ચોક્કસપણે સોલેરિયમની ભલામણ કરીશ.",
    initials: "SS",
    verified: true,
  },
  {
    id: "jaya-kona",
    name: "Jaya Kona",
    guName: "જયા કોના",
    meta: "2 reviews · 3 photos",
    guMeta: "2 રિવ્યૂ · 3 ફોટા",
    timeAgo: "a year ago",
    guTimeAgo: "1 વર્ષ પહેલા",
    city: "Verified Google Reviewer",
    system: "4.4 kW Solarium Solar System",
    guSystem: "4.4 kW સોલેરિયમ સોલર સિસ્ટમ",
    rating: 5,
    reviewUrl: "https://www.google.com/maps/contrib/104149512153706818945/reviews?hl=en-IN",
    avatarColor: "#1E7E45",
    photos: ["/images/solar-mounting-kit.webp", "/images/home-solar.png"],
    quote:
      "I have installed a 4.4 kW solar panel from a solarium company. My experience is very good. After talking to the company, solar installation was completed at my home within 20 days. The quality and durability of the solar panel is very good, all the material required to install the solar was of good quality and good.",
    guQuote:
      "મેં સોલેરિયમ કંપનીનું 4.4 kW સોલર પેનલ ઇન્સ્ટોલ કરાવ્યું છે. મારો અનુભવ ખૂબ જ સારો રહ્યો છે. કંપની સાથે વાત કર્યા પછી, મારા ઘરે 20 દિવસની અંદર સોલર ઇન્સ્ટોલેશન પૂર્ણ થઈ ગયું. સોલર પેનલની ગુણવત્તા અને ટકાઉપણું ખૂબ જ સરસ છે તથા સોલર ઇન્સ્ટોલ કરવા માટે વપરાયેલ તમામ મટિરિયલ ઉચ્ચ ગુણવત્તાનું હતું.",
    initials: "JK",
    verified: true,
  },
] as const;

export const FAQS = [
  {
    q: "Is it really free?",
    guQ: "શું તે ખરેખર મફત છે?",
    a: "Effective cost is ₹0 for the standard 2.18 kW system: a ₹1,00,000 system value, less ₹63,240 central assistance under PM Surya Ghar and ₹36,760 Gujarat state assistance. You pay nothing to reserve. Site-specific customisation is quoted after the rooftop survey and confirmed by you before any work begins.",
    guA: "સ્ટાન્ડર્ડ 2.18 kW સિસ્ટમ માટે વાસ્તવિક ખર્ચ (effective cost) શૂન્ય (₹0) છે: સિસ્ટમની કુલ કિંમત ₹1,00,000 છે, જેમાંથી 'પીએમ સૂર્ય ઘર' (PM Surya Ghar) યોજના હેઠળ ₹63,240 ની કેન્દ્રીય સહાય અને ₹36,760 ની ગુજરાત રાજ્ય સહાય મળે છે. બુકિંગ માટે તમારે કોઈ રકમ ચૂકવવાની રહેતી નથી. રૂફટોપ સર્વે કર્યા પછી, તમારી જરૂરિયાત મુજબના ફેરફારો (customisation) સાથેનો ખર્ચ જણાવવામાં આવશે, અને કામ શરૂ થાય તે પહેલાં તમારી મંજૂરી લેવામાં આવશે.",
  },
  {
    q: "When is the subsidy credited, and to whom?",
    guQ: "સબસિડી ક્યારે અને કોના ખાતામાં જમા થાય છે?",
    a: "Assistance is credited by the government directly to the customer's bank account after installation, commissioning and DISCOM inspection. Timelines are set by MNRE, GEDA and your DISCOM — your relationship manager tracks the claim with you and shares the status at each stage.",
    guA: "સિસ્ટમ ઇન્સ્ટોલ થયા પછી, કાર્યરત (commissioning) થયા બાદ અને DISCOM દ્વારા નિરીક્ષણ (inspection) પૂર્ણ થયા પછી, સરકાર દ્વારા સબસિડીની રકમ સીધી ગ્રાહકના બેંક ખાતામાં જમા કરવામાં આવે છે. આ પ્રક્રિયાનો સમયગાળો MNRE, GEDA અને તમારી DISCOM દ્વારા નક્કી કરવામાં આવે છે — અમારા રિલેશનશિપ મેનેજર તમારી સાથે રહીને આ ક્લેમ (claim) પર નજર રાખશે અને દરેક તબક્કે તમને સ્ટેટસ જણાવશે.",
  },
  {
    q: "Who is eligible?",
    guQ: "કોણ પાત્ર છે?",
    a: "Residential consumers in Gujarat with their own roof, a valid DISCOM connection and no previous rooftop solar subsidy. The name on the electricity bill should match the applicant. We verify your eligibility before the survey.",
    guA: "ગુજરાતમાં રહેતા એવા ગ્રાહકો જેમની પાસે પોતાનું છત (રૂફટોપ) છે, જેમનું DISCOM સાથેનું વીજ જોડાણ માન્ય છે, અને જેમણે અગાઉ ક્યારેય રૂફટોપ સોલર માટે સબસિડી મેળવી નથી. વીજળીના બિલમાં જે નામ છે તે અરજદારના નામ સાથે મેળ ખાતું હોવું જોઈએ. સર્વે કરતા પહેલા અમે તમારી પાત્રતાની ચકાસણી કરીએ છીએ.",
  },
  {
    q: "What could cost extra?",
    guQ: "કઈ બાબતો માટે વધારાનો ખર્ચ થઈ શકે છે?",
    a: "Select the floor and structure height for quotation in the top quotation box.",
    guA: "ઉપર આપેલા ક્વોટેશન બોક્સમાં ફ્લોર (માળ) અને સ્ટ્રક્ચરની ઊંચાઈ પસંદ કરો.",
  },
  {
    q: "What does the 5-year insurance cover?",
    guQ: "૫ વર્ષના વીમામાં શું આવરી લેવામાં આવે છે?",
    a: "Every Solarium home system includes five years of system insurance at no extra cost. Cover, the insurer and the claim process are set out in the policy document shared with your order.",
    guA: "દરેક 'સોલેરિયમ' (Solarium) હોમ સિસ્ટમ સાથે પાંચ વર્ષનો સિસ્ટમ વીમો કોઈપણ વધારાના ખર્ચ વિના મળે છે. વીમામાં શું આવરી લેવામાં આવ્યું છે, વીમા કંપની કોણ છે અને ક્લેમ (દાવા) કરવાની પ્રક્રિયા શું છે - તે તમામ વિગતો તમારા ઓર્ડર સાથે આપવામાં આવેલા પોલિસી દસ્તાવેજમાં દર્શાવવામાં આવી છે.",
  },
] as const;

export const DISCLAIMER =
  "Effective cost assumes approval of central assistance under PM Surya Ghar: Muft Bijli Yojana and Gujarat state assistance as notified at the time of commissioning, for the standard 2.18 kW configuration. Subsidy amounts, eligibility and disbursement timelines are set by MNRE, GEDA and the DISCOM, not by Solarium. Site-specific customisation is quoted after survey and before order confirmation.";
