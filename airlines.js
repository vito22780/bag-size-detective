/**
 * North American airline baggage size limits.
 * Dimensions are stored in cm (L x W x H), sorted descending.
 * Sources: official airline websites (as of 2025).
 *
 * Note: Some airlines specify "including handles and wheels".
 * The dimensions here represent the maximum allowed size.
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
    personal_item: { l: 46, w: 35, h: 20 },     // 18 x 14 x 8 in
    carry_on: { l: 56, w: 35, h: 23 },           // 22 x 14 x 9 in
    url: "https://www.delta.com/us/en/baggage/carry-on-baggage"
  },
  {
    name: "United Airlines",
    code: "UA",
    personal_item: { l: 43, w: 25, h: 22 },     // 17 x 10 x 9 in
    carry_on: { l: 56, w: 35, h: 22 },           // 22 x 14 x 9 in
    url: "https://www.united.com/en/us/fly/travel/baggage/carry-on.html"
  },
  {
    name: "Southwest Airlines",
    code: "WN",
    personal_item: { l: 46, w: 34, h: 21 },     // 18.5 x 13.5 x 8.5 in
    carry_on: { l: 61, w: 41, h: 26 },           // 24 x 16 x 10 in
    url: "https://www.southwest.com/help/baggage"
  },
  {
    name: "JetBlue Airways",
    code: "B6",
    personal_item: { l: 43, w: 33, h: 20 },     // 17 x 13 x 8 in
    carry_on: { l: 56, w: 36, h: 23 },           // 22 x 14 x 9 in
    url: "https://www.jetblue.com/help/carry-on-bags"
  },
  {
    name: "Alaska Airlines",
    code: "AS",
    personal_item: { l: 43, w: 35, h: 20 },     // 17 x 14 x 8 in (must fit under seat)
    carry_on: { l: 56, w: 35, h: 23 },           // 22 x 14 x 9 in
    url: "https://www.alaskaair.com/content/travel-info/baggage/carry-on-luggage"
  },
  {
    name: "Spirit Airlines",
    code: "NK",
    personal_item: { l: 46, w: 36, h: 18 },     // 18 x 14 x 8 in
    carry_on: { l: 56, w: 36, h: 23 },           // 22 x 14 x 9 in (paid add-on)
    url: "https://www.spirit.com/help/optional-services/bags"
  },
  {
    name: "Frontier Airlines",
    code: "F9",
    personal_item: { l: 46, w: 35, h: 20 },     // 18 x 14 x 8 in
    carry_on: { l: 61, w: 41, h: 25 },           // 24 x 16 x 10 in (paid add-on)
    url: "https://www.flyfrontier.com/travel/travel-info/bag-options/"
  },
  {
    name: "Air Canada",
    code: "AC",
    personal_item: { l: 43, w: 33, h: 16 },     // 17 x 13 x 6 in
    carry_on: { l: 55, w: 40, h: 23 },           // 21.5 x 15.5 x 9 in
    url: "https://www.aircanada.com/en-ca/fly/baggage/carry-on"
  },
  {
    name: "WestJet",
    code: "WS",
    personal_item: { l: 41, w: 33, h: 15 },     // 16 x 13 x 6 in
    carry_on: { l: 53, w: 38, h: 23 },           // 21 x 15 x 9 in
    url: "https://www.westjet.com/en-ca/baggage/carry-on"
  },
  {
    name: "Sun Country Airlines",
    code: "SY",
    personal_item: { l: 46, w: 33, h: 18 },     // 18 x 13 x 7 in
    carry_on: { l: 61, w: 41, h: 25 },           // 24 x 16 x 10 in (paid add-on)
    url: "https://www.suncountry.com/bags"
  },
  {
    name: "Allegiant Air",
    code: "G4",
    personal_item: { l: 43, w: 36, h: 18 },     // 17 x 14 x 7 in
    carry_on: { l: 56, w: 36, h: 23 },           // 22 x 14 x 9 in (paid add-on)
    url: "https://www.allegiantair.com/baggage-info"
  },
  {
    name: "Hawaiian Airlines",
    code: "HA",
    personal_item: { l: 46, w: 33, h: 22 },     // 18 x 13 x 8.5 in
    carry_on: { l: 56, w: 36, h: 23 },           // 22 x 14 x 9 in
    url: "https://www.hawaiianairlines.com/baggage/carry-on-baggage"
  }
];
