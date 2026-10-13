// Savar's Beli "Been" list, ranks 1-73, best first. Read from a screen recording of
// the Beli app on 2026-10-13 (Beli has no export). Coordinates come from OpenStreetMap;
// `approx: true` means the place was not found, so the pin sits near its neighbourhood.

export type CountryCode = "CAN" | "USA" | "JPN" | "IDN" | "TUR";

export type Place = {
  rank: number;
  name: string;
  /** Beli score, 0-10 */
  score: number;
  /** Beli price level, 1-4 ($ to $$$$); null when Beli shows none */
  price: number | null;
  cuisines: string[];
  /** Neighbourhood and city as Beli shows them, without the province and country */
  area: string;
  city: string;
  /** Beli's full location line, used to search Google Maps */
  location: string;
  country: CountryCode;
  /** ISO 3166-2 code of the province, state, or prefecture */
  region: string;
  regionName: string;
  lat: number;
  lng: number;
  approx: boolean;
};

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  CAN: "Canada",
  USA: "United States",
  JPN: "Japan",
  IDN: "Indonesia",
  TUR: "Türkiye",
};

export const places: Place[] = [
  {"rank":1,"name":"Lunch Lady","score":10,"price":3,"cuisines":["Vietnamese"],"area":"Grandview-Woodland, Vancouver","city":"Vancouver","location":"Grandview-Woodland, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.27497,"lng":-123.06928,"approx":false},
  {"rank":2,"name":"JJ Bakes Company","score":10,"price":2,"cuisines":["Bakery","Cafe"],"area":"Langley Township","city":"Langley Township","location":"Langley Township, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.12299,"lng":-122.66384,"approx":true},
  {"rank":3,"name":"Elephant Garden Creamery","score":10,"price":2,"cuisines":["Ice Cream","Dessert"],"area":"Grandview-Woodland, Vancouver","city":"Vancouver","location":"Grandview-Woodland, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.26625,"lng":-123.06946,"approx":false},
  {"rank":4,"name":"Elisa","score":10,"price":4,"cuisines":["Steakhouse"],"area":"Yaletown, Vancouver","city":"Vancouver","location":"Yaletown, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.27592,"lng":-123.12138,"approx":false},
  {"rank":5,"name":"Anh and Chi","score":10,"price":3,"cuisines":["Vietnamese"],"area":"South Main, Vancouver","city":"Vancouver","location":"South Main, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.25506,"lng":-123.10089,"approx":false},
  {"rank":6,"name":"Ginjo Ramen Kubota","score":9.9,"price":2,"cuisines":["Ramen","Japanese"],"area":"Kyoto","city":"Kyoto","location":"Kyoto, Japan","country":"JPN","region":"JP-26","regionName":"Kyoto","lat":34.99308,"lng":135.75527,"approx":false},
  {"rank":7,"name":"Kitada","score":9.9,"price":2,"cuisines":["Japanese","Ramen"],"area":"Kyoto","city":"Kyoto","location":"Kyoto, Japan","country":"JPN","region":"JP-26","regionName":"Kyoto","lat":35.01428,"lng":135.76454,"approx":true},
  {"rank":8,"name":"Halelea","score":9.9,"price":2,"cuisines":[],"area":"Hiroshima","city":"Hiroshima","location":"Hiroshima, Japan","country":"JPN","region":"JP-34","regionName":"Hiroshima","lat":34.39442,"lng":132.44819,"approx":true},
  {"rank":9,"name":"Yamamoto Menzou","score":9.9,"price":1,"cuisines":["Japanese","Udon"],"area":"Kyoto","city":"Kyoto","location":"Kyoto, Japan","country":"JPN","region":"JP-26","regionName":"Kyoto","lat":35.01427,"lng":135.78479,"approx":false},
  {"rank":10,"name":"Sushi Naritaya","score":9.8,"price":2,"cuisines":["Japanese","Sushi"],"area":"Kyoto","city":"Kyoto","location":"Kyoto, Japan","country":"JPN","region":"JP-26","regionName":"Kyoto","lat":35.01454,"lng":135.67704,"approx":false},
  {"rank":11,"name":"Musashi Sushi","score":9.8,"price":1,"cuisines":["Japanese","Sushi"],"area":"Kyoto","city":"Kyoto","location":"Kyoto, Japan","country":"JPN","region":"JP-26","regionName":"Kyoto","lat":35.00892,"lng":135.76877,"approx":false},
  {"rank":12,"name":"Tonkatsu Hinata","score":9.8,"price":2,"cuisines":["Japanese","Meat"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.71296,"lng":139.70752,"approx":false},
  {"rank":13,"name":"Krave Kulture Yogurt","score":9.8,"price":1,"cuisines":["Ice Cream","Dessert"],"area":"North Vancouver","city":"North Vancouver","location":"North Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.31047,"lng":-123.08165,"approx":false},
  {"rank":14,"name":"Center Beef @WEST-Shinjuku","score":9.8,"price":2,"cuisines":["Japanese"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.67956,"lng":139.76026,"approx":true},
  {"rank":15,"name":"Arsicault Bakery Civic Center","score":9.8,"price":2,"cuisines":["Bakery","French"],"area":"Civic Center, San Francisco","city":"San Francisco","location":"Civic Center, San Francisco, CA","country":"USA","region":"US-CA","regionName":"California","lat":37.78079,"lng":-122.41338,"approx":false},
  {"rank":16,"name":"Phnom Penh Restaurant","score":9.8,"price":2,"cuisines":["Cambodian","Vietnamese","Chinese"],"area":"Strathcona, Vancouver","city":"Vancouver","location":"Strathcona, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.27835,"lng":-123.0982,"approx":false},
  {"rank":17,"name":"Asakusa Gyukatsu (Beef Cutlet)","score":9.7,"price":3,"cuisines":["Japanese","Meat"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.67122,"lng":139.7645,"approx":true},
  {"rank":18,"name":"ヨリドコロ 由比ヶ浜大通り店","score":9.7,"price":2,"cuisines":["Japanese"],"area":"Kamakura","city":"Kamakura","location":"Kamakura, Japan","country":"JPN","region":"JP-14","regionName":"Kanagawa","lat":35.32198,"lng":139.54335,"approx":true},
  {"rank":19,"name":"Gyubee Japanese Grill (Vancouver)","score":9.7,"price":3,"cuisines":["Japanese","Barbecue"],"area":"Richmond","city":"Richmond","location":"Richmond, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.17114,"lng":-123.13605,"approx":false},
  {"rank":20,"name":"Raisu","score":9.7,"price":3,"cuisines":["Izakaya","Japanese"],"area":"Kitsilano, Vancouver","city":"Vancouver","location":"Kitsilano, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.2681,"lng":-123.15829,"approx":false},
  {"rank":21,"name":"SHOGUN BURGER 祇園四条店","score":9.7,"price":2,"cuisines":["Burgers"],"area":"Kyoto","city":"Kyoto","location":"Kyoto, Japan","country":"JPN","region":"JP-26","regionName":"Kyoto","lat":35.00594,"lng":135.76874,"approx":true},
  {"rank":22,"name":"Sushi Dai","score":9.6,"price":2,"cuisines":["Japanese","Sushi","Omakase"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.68236,"lng":139.76908,"approx":true},
  {"rank":23,"name":"Kaiten Sushi Numazuko","score":9.6,"price":2,"cuisines":["Sushi","Japanese"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.67547,"lng":139.75419,"approx":true},
  {"rank":24,"name":"Tozen Sushi Bar","score":9.6,"price":3,"cuisines":["Japanese","Sushi"],"area":"Fairview, Vancouver","city":"Vancouver","location":"Fairview, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.26355,"lng":-123.12569,"approx":false},
  {"rank":25,"name":"GOODBOY frozen yogurt","score":9.6,"price":null,"cuisines":[],"area":"Kitsilano, Vancouver","city":"Vancouver","location":"Kitsilano, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.27211,"lng":-123.15979,"approx":true},
  {"rank":26,"name":"Jeju","score":9.6,"price":4,"cuisines":["Korean"],"area":"East Vancouver, Vancouver","city":"Vancouver","location":"East Vancouver, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.2623,"lng":-123.09196,"approx":false},
  {"rank":27,"name":"Uogashi Nihon-Ichi","score":9.5,"price":2,"cuisines":["Japanese","Sushi"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.69,"lng":139.69729,"approx":false},
  {"rank":28,"name":"Juniper","score":9.5,"price":2,"cuisines":["Bakery","Cafe","Coffee"],"area":"Polk Gulch, San Francisco","city":"San Francisco","location":"Polk Gulch, San Francisco, CA","country":"USA","region":"US-CA","regionName":"California","lat":37.78974,"lng":-122.42069,"approx":false},
  {"rank":29,"name":"Eitomen Kamiyacho Honten","score":9.5,"price":2,"cuisines":[],"area":"Hiroshima","city":"Hiroshima","location":"Hiroshima, Japan","country":"JPN","region":"JP-34","regionName":"Hiroshima","lat":34.38608,"lng":132.45236,"approx":true},
  {"rank":30,"name":"Teppei","score":9.5,"price":2,"cuisines":["Japanese"],"area":"Hiroshima","city":"Hiroshima","location":"Hiroshima, Japan","country":"JPN","region":"JP-34","regionName":"Hiroshima","lat":34.39722,"lng":132.45687,"approx":true},
  {"rank":31,"name":"Ramen DANBO Lonsdale","score":9.5,"price":2,"cuisines":["Ramen"],"area":"North Vancouver","city":"North Vancouver","location":"North Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.32172,"lng":-123.07259,"approx":false},
  {"rank":32,"name":"Ichiran Shinjuku Kabuki-cho","score":9.5,"price":2,"cuisines":["Japanese","Ramen"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.6944,"lng":139.70157,"approx":false},
  {"rank":33,"name":"Ramen Danbo","score":9.4,"price":1,"cuisines":["Japanese","Ramen"],"area":"Kitsilano, Vancouver","city":"Vancouver","location":"Kitsilano, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.26823,"lng":-123.1464,"approx":false},
  {"rank":34,"name":"Tian Shi Fu","score":9.4,"price":null,"cuisines":["Chinese","Noodles"],"area":"Richmond","city":"Richmond","location":"Richmond, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.16918,"lng":-123.13679,"approx":false},
  {"rank":35,"name":"Pepino's Spaghetti House","score":9.4,"price":3,"cuisines":["Italian"],"area":"Grandview-Woodland, Vancouver","city":"Vancouver","location":"Grandview-Woodland, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.27888,"lng":-123.0706,"approx":false},
  {"rank":36,"name":"Krave Kulture Yogurt","score":9.4,"price":2,"cuisines":["Dessert","Frozen Yogurt"],"area":"North Vancouver","city":"North Vancouver","location":"North Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.31047,"lng":-123.08165,"approx":false},
  {"rank":37,"name":"Khao Tiew","score":9.4,"price":3,"cuisines":["Thai"],"area":"West of Twin Peaks, San Francisco","city":"San Francisco","location":"West of Twin Peaks, San Francisco, CA","country":"USA","region":"US-CA","regionName":"California","lat":37.74106,"lng":-122.46502,"approx":false},
  {"rank":38,"name":"Tin Roof Maui","score":9.4,"price":1,"cuisines":["Hawaiian","Poke","Chicken"],"area":"Kahului","city":"Kahului","location":"Kahului, HI","country":"USA","region":"US-HI","regionName":"Hawaii","lat":20.88503,"lng":-156.45372,"approx":false},
  {"rank":39,"name":"OO LA LA","score":9.3,"price":1,"cuisines":["Korean"],"area":"Burnaby","city":"Burnaby","location":"Burnaby, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.24608,"lng":-122.97706,"approx":true},
  {"rank":40,"name":"Yang's Dumpling","score":9.3,"price":2,"cuisines":["Chinese"],"area":"Richmond","city":"Richmond","location":"Richmond, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.17751,"lng":-123.12981,"approx":false},
  {"rank":41,"name":"Nemesis Coffee TriCity Pavilion","score":9.3,"price":2,"cuisines":["Coffee","Cafe"],"area":"Coquitlam","city":"Coquitlam","location":"Coquitlam, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.287,"lng":-122.7978,"approx":true},
  {"rank":42,"name":"Şişçi İbo Konyaaltı Şubesi","score":9.3,"price":2,"cuisines":["Kebab","Turkish"],"area":"Antalya","city":"Antalya","location":"Antalya, Türkiye","country":"TUR","region":"TR-07","regionName":"Antalya","lat":36.88927,"lng":30.69933,"approx":true},
  {"rank":43,"name":"Flatbread Company","score":9.3,"price":2,"cuisines":["Pizza"],"area":"Paia","city":"Paia","location":"Paia, HI","country":"USA","region":"US-HI","regionName":"Hawaii","lat":20.91584,"lng":-156.38198,"approx":false},
  {"rank":44,"name":"No. 1 Beef Noodle","score":9.2,"price":1,"cuisines":["Taiwanese","Noodles"],"area":"Burnaby","city":"Burnaby","location":"Burnaby, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.24246,"lng":-123.00399,"approx":false},
  {"rank":45,"name":"Crystal Mall Food Court","score":9.2,"price":1,"cuisines":["Chinese","Cantonese"],"area":"Metrotown, Burnaby","city":"Burnaby","location":"Metrotown, Burnaby, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.22853,"lng":-123.00841,"approx":true},
  {"rank":46,"name":"Long's Noodle","score":9.2,"price":2,"cuisines":["Shanghainese"],"area":"Richmond","city":"Richmond","location":"Richmond, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.17872,"lng":-123.12588,"approx":false},
  {"rank":47,"name":"Ramen Afro Beats","score":9.2,"price":2,"cuisines":["Japanese","Ramen"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.67206,"lng":139.77318,"approx":true},
  {"rank":48,"name":"Moda da Nata","score":9.2,"price":null,"cuisines":["Portuguese","Dessert"],"area":"Anatolian Side, İstanbul","city":"İstanbul","location":"Anatolian Side, İstanbul, Türkiye","country":"TUR","region":"TR-34","regionName":"Istanbul","lat":40.98595,"lng":29.02731,"approx":false},
  {"rank":49,"name":"RAD BROS CAFE","score":9.2,"price":1,"cuisines":["Dessert","Cake"],"area":"Tokyo","city":"Tokyo","location":"Tokyo, Japan","country":"JPN","region":"JP-13","regionName":"Tokyo","lat":35.68632,"lng":139.76076,"approx":true},
  {"rank":50,"name":"Foodland","score":9.1,"price":2,"cuisines":["Hawaiian","Grocery","Poke"],"area":"Kihei","city":"Kihei","location":"Kihei, HI","country":"USA","region":"US-HI","regionName":"Hawaii","lat":20.73305,"lng":-156.45175,"approx":false},
  {"rank":51,"name":"Tobi's Poke & Shave Ice","score":9.1,"price":2,"cuisines":["Poke","Hawaiian","Dessert"],"area":"Paia","city":"Paia","location":"Paia, HI","country":"USA","region":"US-HI","regionName":"Hawaii","lat":20.9166,"lng":-156.38088,"approx":false},
  {"rank":52,"name":"The Lawn Canggu Beach Club","score":9.1,"price":2,"cuisines":["Bar"],"area":"Badung Regency","city":"Badung Regency","location":"Badung Regency, Indonesia","country":"IDN","region":"ID-BA","regionName":"Bali","lat":-8.65848,"lng":115.12976,"approx":false},
  {"rank":53,"name":"Excelsior Caffé","score":9.1,"price":2,"cuisines":["Cafe"],"area":"Osaka","city":"Osaka","location":"Osaka, Japan","country":"JPN","region":"JP-27","regionName":"Osaka","lat":34.69646,"lng":135.49786,"approx":true},
  {"rank":54,"name":"Aunty Sandy's Banana Bread","score":9.1,"price":1,"cuisines":["Bakery","Hawaiian"],"area":"Haiku, Haiku-Pauwela","city":"Haiku-Pauwela","location":"Haiku, Haiku-Pauwela, HI","country":"USA","region":"US-HI","regionName":"Hawaii","lat":20.93146,"lng":-156.32497,"approx":true},
  {"rank":55,"name":"Osaka Kitchen","score":9.1,"price":2,"cuisines":["Japanese"],"area":"Guildford, Surrey","city":"Surrey","location":"Guildford, Surrey, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.19194,"lng":-122.78933,"approx":false},
  {"rank":56,"name":"Cheese Tart Pablo Shinsaibashi","score":9,"price":2,"cuisines":["Japanese","Bakery","Dessert"],"area":"Osaka","city":"Osaka","location":"Osaka, Japan","country":"JPN","region":"JP-27","regionName":"Osaka","lat":34.68812,"lng":135.50205,"approx":true},
  {"rank":57,"name":"Kyo no Onikudokoro Hiro","score":9,"price":1,"cuisines":["Japanese","Street Food"],"area":"Kyoto","city":"Kyoto","location":"Kyoto, Japan","country":"JPN","region":"JP-26","regionName":"Kyoto","lat":35.01708,"lng":135.77329,"approx":true},
  {"rank":58,"name":"Sushiro","score":9,"price":1,"cuisines":["Sushi"],"area":"Kyoto","city":"Kyoto","location":"Kyoto, Japan","country":"JPN","region":"JP-26","regionName":"Kyoto","lat":35.00391,"lng":135.774,"approx":false},
  {"rank":59,"name":"MIYO","score":9,"price":3,"cuisines":["Frozen Yogurt"],"area":"Badung Regency","city":"Badung Regency","location":"Badung Regency, Indonesia","country":"IDN","region":"ID-BA","regionName":"Bali","lat":-8.60189,"lng":115.17561,"approx":true},
  {"rank":60,"name":"Osteria Savio Volpe","score":9,"price":3,"cuisines":["Italian"],"area":"Mount Pleasant, Vancouver","city":"Vancouver","location":"Mount Pleasant, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.25746,"lng":-123.09095,"approx":false},
  {"rank":61,"name":"Sooda Korean BBQ","score":8.9,"price":2,"cuisines":["Barbecue","Korean"],"area":"Burnaby","city":"Burnaby","location":"Burnaby, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.26827,"lng":-123.0014,"approx":false},
  {"rank":62,"name":"SKOBI sushi & korean bbq","score":8.9,"price":3,"cuisines":["Barbecue","Japanese","Korean","Sushi"],"area":"Willoughby, Langley Township","city":"Langley Township","location":"Willoughby, Langley Township, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.14577,"lng":-122.65636,"approx":true},
  {"rank":63,"name":"Paia Fish Market South Side","score":8.9,"price":2,"cuisines":["Seafood"],"area":"Kihei","city":"Kihei","location":"Kihei, HI","country":"USA","region":"US-HI","regionName":"Hawaii","lat":20.73202,"lng":-156.45202,"approx":false},
  {"rank":64,"name":"John 3:16 Malaysian Delights (Kingsway)","score":8.9,"price":null,"cuisines":["Malaysian"],"area":"Metrotown, Burnaby","city":"Burnaby","location":"Metrotown, Burnaby, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.22495,"lng":-122.98991,"approx":false},
  {"rank":65,"name":"Sopra Sotto Pizzeria","score":8.9,"price":2,"cuisines":["Pizza"],"area":"Burnaby","city":"Burnaby","location":"Burnaby, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.27118,"lng":-123.0694,"approx":false},
  {"rank":66,"name":"Keumsan Restaurant","score":8.8,"price":2,"cuisines":["Korean"],"area":"Marpole, Vancouver","city":"Vancouver","location":"Marpole, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.21338,"lng":-123.14498,"approx":true},
  {"rank":67,"name":"Paris Baguette","score":8.8,"price":2,"cuisines":["Cafe"],"area":"Central Vancouver, Vancouver","city":"Vancouver","location":"Central Vancouver, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.2859,"lng":-123.12497,"approx":false},
  {"rank":68,"name":"Green Leaf Sushi | Burnaby","score":8.8,"price":2,"cuisines":["Sushi","Japanese"],"area":"Burnaby","city":"Burnaby","location":"Burnaby, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.23166,"lng":-123.03081,"approx":false},
  {"rank":69,"name":"Din Tai Fung","score":8.8,"price":3,"cuisines":["Taiwanese","Chinese","Dim Sum"],"area":"Torrance","city":"Torrance","location":"Torrance, CA","country":"USA","region":"US-CA","regionName":"California","lat":33.83337,"lng":-118.35082,"approx":false},
  {"rank":70,"name":"Din Tai Fung 鼎泰豐","score":8.8,"price":3,"cuisines":["Taiwanese","Chinese"],"area":"Central Vancouver, Vancouver","city":"Vancouver","location":"Central Vancouver, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.27411,"lng":-123.10578,"approx":true},
  {"rank":71,"name":"Dang! Cookies - Ubud","score":8.8,"price":null,"cuisines":["Cookies"],"area":"Gianyar Regency","city":"Gianyar Regency","location":"Gianyar Regency, Indonesia","country":"IDN","region":"ID-BA","regionName":"Bali","lat":-8.5042,"lng":115.25952,"approx":true},
  {"rank":72,"name":"Joe Fortes Seafood & Chop House","score":8.7,"price":3,"cuisines":["Seafood","Steakhouse"],"area":"West End, Vancouver","city":"Vancouver","location":"West End, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.28851,"lng":-123.13765,"approx":true},
  {"rank":73,"name":"Selene Aegean Bistro","score":8.7,"price":3,"cuisines":["Mediterranean","Greek","Turkish"],"area":"East Vancouver, Vancouver","city":"Vancouver","location":"East Vancouver, Vancouver, BC, Canada","country":"CAN","region":"CA-BC","regionName":"British Columbia","lat":49.28214,"lng":-123.07119,"approx":true},
];

/** "$$" style price, in yen for Japan */
export function priceLabel(p: Place): string {
  return p.price ? (p.country === "JPN" ? "¥" : "$").repeat(p.price) : "";
}

export function googleMapsUrl(p: Place): string {
  const name = p.name.replace(/\s*\|.*$/, "");
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${name} ${p.location}`);
}
