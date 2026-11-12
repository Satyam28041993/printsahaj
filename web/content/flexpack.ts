/** Copy for the flexible-packaging calculators at /calculators/flexible. */

export interface FlexpackTool {
  slug: "structure" | "cost" | "cylinder" | "ink";
  href: string;
  name: string;
  short: string;
  summary: string;
  inputs: string;
  outputs: string;
}

export interface ComingTool {
  name: string;
  summary: string;
}

export const flexpack = {
  kicker: "Flexible packaging · free calculators",
  heading: "Flexible packaging costing, sahi formula ke saath.",
  intro:
    "Laminate GSM, pouch cost, cylinder spread and ink / adhesive consumption for gravure and flexo converters. Formulas and film densities are sourced. Rates are yours — every example rupee is labelled Example.",
  rateBook: {
    href: "/calculators/flexible/rates/",
    name: "Rate book",
    summary: "Film, ink, adhesive, conversion, cylinder, zipper, margin and GST — ek jagah. Isi browser mein save hota hai.",
  },
  tools: [
    {
      slug: "structure",
      href: "/calculators/flexible/structure/",
      name: "Structure / GSM / Yield",
      short: "Structure",
      summary: "2, 3 ya 4-layer laminate banao — foil, MET, nylon, paper ke saath. Total GSM, m²/kg, ₹/m² aur ₹/kg.",
      inputs: "Layers, microns, density or measured GSM, dry adhesive and ink",
      outputs: "Total GSM, yield m²/kg, ₹/m², ₹/kg",
    },
    {
      slug: "cost",
      href: "/calculators/flexible/cost/",
      name: "Pouch Cost",
      short: "Pouch cost",
      summary: "3-side seal, center seal ya standy. Film kg, pouches/kg, cost per pouch — first order aur repeat order alag, GST alag.",
      inputs: "Pouch type and size, quantity, structure, waste, conversion, cylinder, zipper",
      outputs: "Cost per pouch and per 1,000, first vs repeat, breakdown, film to buy",
    },
    {
      slug: "cylinder",
      href: "/calculators/flexible/cylinder/",
      name: "Cylinder / Plate Spread",
      short: "Cylinder",
      summary: "Gravure cylinder ya flexo plate ka kharcha, aur woh first order ke har pouch par kitna padta hai.",
      inputs: "Face length, circumference, colours, ₹/cm²",
      outputs: "Tooling ₹, ₹ per pouch first vs repeat",
    },
    {
      slug: "ink",
      href: "/calculators/flexible/ink/",
      name: "Ink & Adhesive Consumption",
      short: "Ink & adhesive",
      summary: "Kitni ink aur adhesive lagegi — dry kg jo film par rehta hai, aur wet kg jo drum se nikalta hai.",
      inputs: "Web area, coverage %, dry GSM, solids %",
      outputs: "Dry kg, wet kg, cost",
    },
  ] satisfies FlexpackTool[],
  comingHeading: "Aage aane wale tools",
  comingNote: "Yeh abhi bane nahi hain. Planned hain — jab banenge tab yahan khulenge.",
  coming: [
    { name: "Roll length / weight / OD", summary: "OD, core, thickness aur width se metres aur kg." },
    { name: "Web / slit / layflat", summary: "Pouch type, seals, trim aur lanes se slit aur master width." },
    { name: "Quote PDF + quantity slabs", summary: "GST alag dikhata hua quotation, first vs repeat ke saath." },
    { name: "Pouch size / volume", summary: "Fill weight aur bulk density se suggested W × H + G." },
    { name: "Unit converters", summary: "Micron / mil / gauge, yield, OTR / WVTR units." },
    { name: "Flexo vs gravure break-even", summary: "Kis quantity par kaun sa process sasta padta hai." },
    { name: "Rollstock cost", summary: "Label rate tool ka rollstock extension." },
    { name: "Barrier starting-point selector", summary: "Product ke hisaab se ek starting structure — lab-certified OTR nahi." },
    { name: "Recyclability helper", summary: "Guided sawal aur RecyClass / CEFLEX ke links." },
    { name: "MOQ helper", summary: "Cylinder aur setup waste se minimum sensible quantity." },
  ] satisfies ComingTool[],
  disclaimer:
    "These calculators are estimating aids. Example rupees are not market prices. Densities are library starting values — use your supplier TDS or a weighed GSM. GST default 18%; confirm HSN with your CA. This is not tax advice.",
};
