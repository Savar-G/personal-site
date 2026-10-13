import type { StyleSpecification } from "maplibre-gl";

// The free OpenFreeMap "Liberty" street map (no key, no limits), recoloured to the
// quiet look of Airbnb's map (decision F-3): soft blue water, off-white land, green
// parks, white roads, small grey labels. Other restaurants, shops, and bus stops are
// hidden so only Savar's places stand out.
export const BASE_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

type Palette = {
  land: string;
  water: string;
  waterLine: string;
  park: string;
  wood: string;
  sand: string;
  ice: string;
  aeroway: string;
  road: string;
  casingMinor: string;
  casingMajor: string;
  building: string;
  buildingLine: string;
  rail: string;
  border: string;
  borderMinor: string;
  text: string;
  textStrong: string;
  textHalo: string;
  waterText: string;
  waterHalo: string;
};

// Sampled from Airbnb's Vancouver map, 2026-10-13.
const LIGHT: Palette = {
  land: "#f4f2ef",
  water: "#cae8f2",
  waterLine: "#b5dcec",
  park: "#dbf2c4",
  wood: "#d3edbd",
  sand: "#f3eedf",
  ice: "#eef3f5",
  aeroway: "#ebeae7",
  road: "#ffffff",
  casingMinor: "#e4e3e0",
  casingMajor: "#d6d8d6",
  building: "#ebe8e4",
  buildingLine: "#e2dfda",
  rail: "#d9d9d9",
  border: "#a9a9a9",
  borderMinor: "#c9c9c9",
  text: "#6f6f6f",
  textStrong: "#3d3d3d",
  textHalo: "#ffffff",
  waterText: "#5b8fae",
  waterHalo: "rgba(202,232,242,0.7)",
};

// The same map at night, on the site's dark tokens.
const DARK: Palette = {
  land: "#1c1c1f",
  water: "#16242c",
  waterLine: "#1d2f39",
  park: "#1d2820",
  wood: "#1b261d",
  sand: "#25241f",
  ice: "#23282a",
  aeroway: "#232326",
  road: "#2e2e33",
  casingMinor: "#252528",
  casingMajor: "#2a2a2e",
  building: "#242427",
  buildingLine: "#28282c",
  rail: "#333338",
  border: "#5b5b62",
  borderMinor: "#46464c",
  text: "#8e8e96",
  textStrong: "#c9c9cf",
  textHalo: "#121214",
  waterText: "#6e95ab",
  waterHalo: "rgba(22,36,44,0.7)",
};

const DROP = new Set([
  "natural_earth",
  "building-3d",
  "road_area_pattern",
  "road_one_way_arrow",
  "road_one_way_arrow_opposite",
  "poi_r20",
  "highway-shield-non-us",
  "highway-shield-us-interstate",
  "road_shield_us",
]);

const HIDDEN_POI = ["bus", "restaurant", "fast_food", "cafe", "bar", "pub", "beer", "ice_cream", "bakery", "shop", "grocery", "clothing_store", "alcohol_shop", "lodging"];

type Loose = Record<string, unknown>;

// Text sizes come as numbers or zoom curves; scale the output values only.
function scaleSize(v: unknown, f: number): unknown {
  if (typeof v === "number") return v * f;
  if (Array.isArray(v) && v[0] === "interpolate") return v.map((x, i) => (i >= 4 && i % 2 === 0 && typeof x === "number" ? x * f : x));
  return v;
}

export function buildStyle(base: StyleSpecification, dark: boolean): StyleSpecification {
  const C = dark ? DARK : LIGHT;
  const style = structuredClone(base);
  style.layers = style.layers.filter((l) => !DROP.has(l.id));
  for (const layer of style.layers) {
    const l = layer as unknown as Loose & { id: string; type: string };
    const p = ((l.paint as Loose) ??= {});
    const id = l.id;
    const lineOrFill = l.type === "fill" ? "fill-color" : "line-color";

    if (id === "background") p["background-color"] = C.land;
    else if (id === "park") Object.assign(p, { "fill-color": C.park, "fill-outline-color": C.park });
    else if (id === "park_outline") l.layout = { ...((l.layout as Loose) ?? {}), visibility: "none" };
    else if (id === "landcover_wood") p["fill-color"] = C.wood;
    else if (["landcover_grass", "landuse_pitch", "landuse_track", "landuse_cemetery"].includes(id)) p["fill-color"] = C.park;
    else if (id === "landcover_sand") p["fill-color"] = C.sand;
    else if (id === "landcover_ice") p["fill-color"] = C.ice;
    else if (id === "landuse_residential") p["fill-color"] = "rgba(0,0,0,0)";
    else if (id === "landuse_hospital" || id === "landuse_school") p["fill-color"] = C.building;
    else if (id === "water") p["fill-color"] = C.water;
    else if (id.startsWith("waterway") && l.type === "line") p["line-color"] = C.waterLine;
    else if (id.startsWith("aeroway")) p[lineOrFill] = l.type === "fill" ? C.aeroway : C.road;
    else if (id === "building") Object.assign(p, { "fill-color": C.building, "fill-outline-color": C.buildingLine });
    else if (l.type === "line" && /rail/.test(id)) p["line-color"] = C.rail;
    else if (l.type === "line" && /casing/.test(id)) p["line-color"] = /minor|street|service|path/.test(id) ? C.casingMinor : C.casingMajor;
    else if (l.type === "line" && /^(road|bridge|tunnel)_/.test(id)) p["line-color"] = C.road;
    else if (id === "boundary_2" || id === "boundary_disputed") p["line-color"] = C.border;
    else if (id === "boundary_3") p["line-color"] = C.borderMinor;

    if (id === "poi_transit") l.filter = ["match", ["get", "class"], ["airport", "rail"], true, false];

    if (l.type === "symbol") {
      const lay = ((l.layout as Loose) ??= {});
      if (lay["text-size"] != null) lay["text-size"] = scaleSize(lay["text-size"], 0.88);
      // English place names ("China", not "China 中国"); streets keep their local names.
      if (lay["text-field"] != null && !/^highway|^road/.test(id)) lay["text-field"] = ["coalesce", ["get", "name:en"], ["get", "name:latin"], ["get", "name"]];
      if (/^water/.test(id)) Object.assign(p, { "text-color": C.waterText, "text-halo-color": C.waterHalo });
      else Object.assign(p, { "text-color": /^label_(city|country|town)/.test(id) ? C.textStrong : C.text, "text-halo-color": C.textHalo, "text-halo-width": 1.2 });
      if (/^poi_r/.test(id)) {
        l.filter = ["all", l.filter, ["!", ["match", ["get", "class"], HIDDEN_POI, true, false]]];
        lay["icon-size"] = 0.8;
        if (dark) p["icon-opacity"] = 0.6;
      }
    }
  }
  return style;
}
