/**
 * North American airline baggage size limits.
 * Dimensions are stored in cm (L x W x H), sorted descending.
 * Sources: official airline websites, verified April 2026.
 *
 * Note: Some airlines (Delta, Alaska, Hawaiian) do not publish strict
 * personal item dimensions — they require it to fit under the seat.
 * For those, widely-cited practical guidelines are used.
 *
 * Dimensions include handles and wheels where specified by the airline.
 */
const AIRLINES = [
  {
    name: "American Airlines",
    code: "AA",
    personal_item: { l: 45, w: 35, h: 20 },   // 18 x 14 x 8 in
    carry_on: { l: 56, w: 36, h: 23 },          // 22 x 14 x 9 in
    url: "https://www.aa.com/i18n/travel-info/baggage/carry-on-baggage.jsp"
  },
  {
    name: "Delta Air Lines",
    code: "DL",
    personal_item: { l: 46, w: 36, h: 20 },     // 18 x 14 x 8 in (guideline)
    carry_on: { l: 56, w: 35, h: 23 },           // 22 x 14 x 9 in
    note: "Personal item: must fit under seat; dimensions are practical guidelines.",
    url: "https://www.delta.com/us/en/baggage/carry-on-baggage"
  },
  {
    name: "United Airlines",
    code: "UA",
    personal_item: { l: 43, w: 25, h: 22 },     // 17 x 10 x 9 in
    carry_on: { l: 56, w: 35, h: 22 },           // 22 x 14 x 9 in
    url: "https://www.united.com/en/us/fly/baggage/carry-on-bags.html"
  },
  {
    name: "Southwest Airlines",
    code: "WN",
    personal_item: { l: 47, w: 34, h: 22 },     // 18.5 x 13.5 x 8.5 in
    carry_on: { l: 61, w: 41, h: 25 },           // 24 x 16 x 10 in
    url: "https://support.southwest.com/helpcenter/s/article/carryon-baggage-policy"
  },
  {
    name: "JetBlue Airways",
    code: "B6",
    personal_item: { l: 43, w: 33, h: 20 },     // 17 x 13 x 8 in
    carry_on: { l: 56, w: 36, h: 23 },           // 22 x 14 x 9 in
    url: "https://www.jetblue.com/at-the-airport/baggage-information"
  },
  {
    name: "Alaska Airlines",
    code: "AS",
    personal_item: { l: 43, w: 33, h: 20 },     // 17 x 13 x 8 in (guideline)
    carry_on: { l: 56, w: 36, h: 23 },           // 22 x 14 x 9 in
    note: "Personal item: must fit under seat; dimensions are practical guidelines.",
    url: "https://www.alaskaair.com/content/travel-info/baggage/carry-on-luggage"
  },
  {
    name: "Spirit Airlines",
    code: "NK",
    personal_item: { l: 45, w: 35, h: 20 },     // 18 x 14 x 8 in
    carry_on: { l: 56, w: 46, h: 25 },           // 22 x 18 x 10 in (paid add-on)
    url: "https://customersupport.spirit.com/en-us/category/article/KA-01143"
  },
  {
    name: "Frontier Airlines",
    code: "F9",
    personal_item: { l: 46, w: 36, h: 20 },     // 18 x 14 x 8 in
    carry_on: { l: 61, w: 41, h: 25 },           // 24 x 16 x 10 in (paid add-on)
    url: "https://www.flyfrontier.com/travel/travel-info/bag-options/"
  },
  {
    name: "Air Canada",
    code: "AC",
    personal_item: { l: 43, w: 33, h: 16 },     // 17 x 13 x 6 in
    carry_on: { l: 55, w: 40, h: 23 },           // 21.5 x 15.5 x 9 in
    url: "https://www.aircanada.com/ca/en/aco/home/plan/baggage/carry-on.html"
  },
  {
    name: "WestJet",
    code: "WS",
    personal_item: { l: 41, w: 33, h: 14 },     // 16 x 13 x 6 in
    carry_on: { l: 56, w: 36, h: 23 },           // 22 x 14 x 9 in (updated May 2025)
    url: "https://www.westjet.com/en-ca/baggage/carry-on"
  },
  {
    name: "Sun Country Airlines",
    code: "SY",
    personal_item: { l: 43, w: 33, h: 23 },     // 17 x 13 x 9 in
    carry_on: { l: 61, w: 41, h: 28 },           // 24 x 16 x 11 in (paid add-on)
    url: "https://suncountry.com/bags-optional-services"
  },
  {
    name: "Allegiant Air",
    code: "G4",
    personal_item: { l: 45, w: 35, h: 20 },     // 18 x 14 x 8 in
    carry_on: { l: 55, w: 40, h: 25 },           // 22 x 16 x 10 in (paid add-on)
    url: "https://www.allegiantair.com/baggage-1"
  },
  {
    name: "Hawaiian Airlines",
    code: "HA",
    personal_item: { l: 43, w: 33, h: 20 },     // 17 x 13 x 8 in (guideline)
    carry_on: { l: 56, w: 35, h: 23 },           // 22 x 14 x 9 in
    note: "Personal item: must fit under seat; now operated under Alaska Airlines.",
    url: "https://www.hawaiianairlines.com/legal/domestic-contract-of-carriage/rule-17"
  }
];
