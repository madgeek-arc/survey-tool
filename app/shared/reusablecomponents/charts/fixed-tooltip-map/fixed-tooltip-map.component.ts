import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";


HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');
const data = [
  {
    code: "AW",
    code3: "ABW",
    name: "Aruba",
    value: 582.34
  }, {
    code: "AF",
    code3: "AFG",
    name: "Afghanistan",
    value: 53.08
  }, {
    code: "AO",
    code3: "AGO",
    name: "Angola",
    value: 23.11
  }, {
    code: "AL",
    code3: "ALB",
    name: "Albania",
    value: 104.97
  }, {
    code: "AD",
    code3: "AND",
    name: "Andorra",
    value: 164.43
  }, {
    code: "AE",
    code3: "ARE",
    name: "United Arab Emirates",
    value: 110.88
  }, {
    code: "AR",
    code3: "ARG",
    name: "Argentina",
    value: 16.02
  }, {
    code: "AM",
    code3: "ARM",
    name: "Armenia",
    value: 102.73
  }, {
    code: "AS",
    code3: "ASM",
    name: "American Samoa",
    value: 278
  }, {
    code: "AG",
    code3: "ATG",
    name: "Antigua and Barbuda",
    value: 229.46
  }, {
    code: "AU",
    code3: "AUS",
    name: "Australia",
    value: 3.15
  }, {
    code: "AT",
    code3: "AUT",
    name: "Austria",
    value: 105.81
  }, {
    code: "AZ",
    code3: "AZE",
    name: "Azerbaijan",
    value: 118.04
  }, {
    code: "BI",
    code3: "BDI",
    name: "Burundi",
    value: 409.82
  }, {
    code: "BE",
    code3: "BEL",
    name: "Belgium",
    value: 374.45
  }, {
    code: "BJ",
    code3: "BEN",
    name: "Benin",
    value: 96.42
  }, {
    code: "BF",
    code3: "BFA",
    name: "Burkina Faso",
    value: 68.15
  }, {
    code: "BD",
    code3: "BGD",
    name: "Bangladesh",
    value: 1251.84
  }, {
    code: "BG",
    code3: "BGR",
    name: "Bulgaria",
    value: 65.66
  }, {
    code: "BH",
    code3: "BHR",
    name: "Bahrain",
    value: 1848.47
  }, {
    code: "BS",
    code3: "BHS",
    name: "Bahamas, The",
    value: 39.08
  }, {
    code: "BA",
    code3: "BIH",
    name: "Bosnia and Herzegovina",
    value: 68.69
  }, {
    code: "BY",
    code3: "BLR",
    name: "Belarus",
    value: 46.83
  }, {
    code: "BZ",
    code3: "BLZ",
    name: "Belize",
    value: 16.09
  }, {
    code: "BM",
    code3: "BMU",
    name: "Bermuda",
    value: 1307.52
  }, {
    code: "BO",
    code3: "BOL",
    name: "Bolivia",
    value: 10.05
  }, {
    code: "BR",
    code3: "BRA",
    name: "Brazil",
    value: 24.84
  }, {
    code: "BB",
    code3: "BRB",
    name: "Barbados",
    value: 662.78
  }, {
    code: "BN",
    code3: "BRN",
    name: "Brunei Darussalam",
    value: 80.3
  }, {
    code: "BT",
    code3: "BTN",
    name: "Bhutan",
    value: 20.93
  }, {
    code: "BW",
    code3: "BWA",
    name: "Botswana",
    value: 3.97
  }, {
    code: "CF",
    code3: "CAF",
    name: "Central African Republic",
    value: 7.38
  }, {
    code: "CA",
    code3: "CAN",
    name: "Canada",
    value: 3.99
  }, {
    code: "CH",
    code3: "CHE",
    name: "Switzerland",
    value: 211.87
  }, {
    code: "CL",
    code3: "CHL",
    name: "Chile",
    value: 24.09
  }, {
    code: "CN",
    code3: "CHN",
    name: "China",
    value: 146.85
  }, {
    code: "CI",
    code3: "CIV",
    name: "Cote d'Ivoire",
    value: 74.52
  }, {
    code: "CM",
    code3: "CMR",
    name: "Cameroon",
    value: 49.58
  }, {
    code: "CD",
    code3: "COD",
    name: "Congo, Dem. Rep.",
    value: 34.73
  }, {
    code: "CG",
    code3: "COG",
    name: "Congo, Rep.",
    value: 15.01
  }, {
    code: "CO",
    code3: "COL",
    name: "Colombia",
    value: 43.85
  }, {
    code: "KM",
    code3: "COM",
    name: "Comoros",
    value: 427.51
  }, {
    code: "CV",
    code3: "CPV",
    name: "Cabo Verde",
    value: 133.89
  }, {
    code: "CR",
    code3: "CRI",
    name: "Costa Rica",
    value: 95.13
  }, {
    code: "CU",
    code3: "CUB",
    name: "Cuba",
    value: 110.32
  }, {
    code: "CW",
    code3: "CUW",
    name: "Curacao",
    value: 359.6
  }, {
    code: "KY",
    code3: "CYM",
    name: "Cayman Islands",
    value: 253.19
  }, {
    code: "CY",
    code3: "CYP",
    name: "Cyprus",
    value: 126.64
  }, {
    code: "CZ",
    code3: "CZE",
    name: "Czech Republic",
    value: 136.85
  }, {
    code: "DE",
    code3: "DEU",
    name: "Germany",
    value: 236.42
  }, {
    code: "DJ",
    code3: "DJI",
    name: "Djibouti",
    value: 40.65
  }, {
    code: "DM",
    code3: "DMA",
    name: "Dominica",
    value: 98.06
  }, {
    code: "DK",
    code3: "DNK",
    name: "Denmark",
    value: 135.54
  }, {
    code: "DO",
    code3: "DOM",
    name: "Dominican Republic",
    value: 220.43
  }, {
    code: "DZ",
    code3: "DZA",
    name: "Algeria",
    value: 17.05
  }, {
    code: "EC",
    code3: "ECU",
    name: "Ecuador",
    value: 65.97
  }, {
    code: "EG",
    code3: "EGY",
    name: "Egypt, Arab Rep.",
    value: 96.13
  }, {
    code: "ES",
    code3: "ESP",
    name: "Spain",
    value: 92.93
  }, {
    code: "EE",
    code3: "EST",
    name: "Estonia",
    value: 31.04
  }, {
    code: "ET",
    code3: "ETH",
    name: "Ethiopia",
    value: 102.4
  }, {
    code: "FI",
    code3: "FIN",
    name: "Finland",
    value: 18.08
  }, {
    code: "FJ",
    code3: "FJI",
    name: "Fiji",
    value: 49.19
  }, {
    code: "FR",
    code3: "FRA",
    name: "France",
    value: 122.16
  }, {
    code: "FO",
    code3: "FRO",
    name: "Faroe Islands",
    value: 35.18
  }, {
    code: "FM",
    code3: "FSM",
    name: "Micronesia, Fed. Sts.",
    value: 149.91
  }, {
    code: "GA",
    code3: "GAB",
    name: "Gabon",
    value: 7.68
  }, {
    code: "GB",
    code3: "GBR",
    name: "United Kingdom",
    value: 271.13
  }, {
    code: "GE",
    code3: "GEO",
    name: "Georgia",
    value: 53.52
  }, {
    code: "GH",
    code3: "GHA",
    name: "Ghana",
    value: 123.96
  }, {
    code: "GI",
    code3: "GIB",
    name: "Gibraltar",
    value: 3440.8
  }, {
    code: "GN",
    code3: "GIN",
    name: "Guinea",
    value: 50.45
  }, {
    code: "GM",
    code3: "GMB",
    name: "Gambia, The",
    value: 201.43
  }, {
    code: "GW",
    code3: "GNB",
    name: "Guinea-Bissau",
    value: 64.57
  }, {
    code: "GQ",
    code3: "GNQ",
    name: "Equatorial Guinea",
    value: 43.55
  }, {
    code: "GR",
    code3: "GRC",
    name: "Greece",
    value: 83.56
  }, {
    code: "GD",
    code3: "GRD",
    name: "Grenada",
    value: 315.64
  }, {
    code: "GL",
    code3: "GRL",
    name: "Greenland",
    value: 1
  }, {
    code: "GT",
    code3: "GTM",
    name: "Guatemala",
    value: 154.74
  }, {
    code: "GU",
    code3: "GUM",
    name: "Guam",
    value: 301.66
  }, {
    code: "GY",
    code3: "GUY",
    name: "Guyana",
    value: 3.93
  }, {
    code: "HK",
    code3: "HKG",
    name: "Hong Kong SAR, China",
    value: 6987.24
  }, {
    code: "HN",
    code3: "HND",
    name: "Honduras",
    value: 81.44
  }, {
    code: "HR",
    code3: "HRV",
    name: "Croatia",
    value: 74.6
  }, {
    code: "HT",
    code3: "HTI",
    name: "Haiti",
    value: 393.59
  }, {
    code: "HU",
    code3: "HUN",
    name: "Hungary",
    value: 108.41
  }, {
    code: "ID",
    code3: "IDN",
    name: "Indonesia",
    value: 144.14
  }, {
    code: "IM",
    code3: "IMN",
    name: "Isle of Man",
    value: 146.91
  }, {
    code: "IN",
    code3: "IND",
    name: "India",
    value: 445.37
  }, {
    code: "IE",
    code3: "IRL",
    name: "Ireland",
    value: 68.95
  }, {
    code: "IR",
    code3: "IRN",
    name: "Iran, Islamic Rep.",
    value: 49.29
  }, {
    code: "IQ",
    code3: "IRQ",
    name: "Iraq",
    value: 85.66
  }, {
    code: "IS",
    code3: "ISL",
    name: "Iceland",
    value: 3.35
  }, {
    code: "IL",
    code3: "ISR",
    name: "Israel",
    value: 394.92
  }, {
    code: "IT",
    code3: "ITA",
    name: "Italy",
    value: 206.12
  }, {
    code: "JM",
    code3: "JAM",
    name: "Jamaica",
    value: 266.05
  }, {
    code: "JO",
    code3: "JOR",
    name: "Jordan",
    value: 106.51
  }, {
    code: "JP",
    code3: "JPN",
    name: "Japan",
    value: 348.35
  }, {
    code: "KZ",
    code3: "KAZ",
    name: "Kazakhstan",
    value: 6.59
  }, {
    code: "KE",
    code3: "KEN",
    name: "Kenya",
    value: 85.15
  }, {
    code: "KG",
    code3: "KGZ",
    name: "Kyrgyz Republic",
    value: 31.7
  }, {
    code: "KH",
    code3: "KHM",
    name: "Cambodia",
    value: 89.3
  }, {
    code: "KI",
    code3: "KIR",
    name: "Kiribati",
    value: 141.23
  }, {
    code: "KN",
    code3: "KNA",
    name: "St. Kitts and Nevis",
    value: 210.85
  }, {
    code: "KR",
    code3: "KOR",
    name: "Korea, Rep.",
    value: 525.7
  }, {
    code: "KW",
    code3: "KWT",
    name: "Kuwait",
    value: 227.42
  }, {
    code: "LA",
    code3: "LAO",
    name: "Lao PDR",
    value: 29.28
  }, {
    code: "LB",
    code3: "LBN",
    name: "Lebanon",
    value: 587.16
  }, {
    code: "LR",
    code3: "LBR",
    name: "Liberia",
    value: 47.9
  }, {
    code: "LY",
    code3: "LBY",
    name: "Libya",
    value: 3.58
  }, {
    code: "LC",
    code3: "LCA",
    name: "St. Lucia",
    value: 291.83
  }, {
    code: "LI",
    code3: "LIE",
    name: "Liechtenstein",
    value: 235.41
  }, {
    code: "LK",
    code3: "LKA",
    name: "Sri Lanka",
    value: 338.11
  }, {
    code: "LS",
    code3: "LSO",
    name: "Lesotho",
    value: 72.59
  }, {
    code: "LT",
    code3: "LTU",
    name: "Lithuania",
    value: 45.78
  }, {
    code: "LU",
    code3: "LUX",
    name: "Luxembourg",
    value: 224.72
  }, {
    code: "LV",
    code3: "LVA",
    name: "Latvia",
    value: 31.51
  }, {
    code: "MO",
    code3: "MAC",
    name: "Macao SAR, China",
    value: 20405.57
  }, {
    code: "MF",
    code3: "MAF",
    name: "St. Martin (French part)",
    value: 591.65
  }, {
    code: "MA",
    code3: "MAR",
    name: "Morocco",
    value: 79.04
  }, {
    code: "MC",
    code3: "MCO",
    name: "Monaco",
    value: 19249.5
  }, {
    code: "MD",
    code3: "MDA",
    name: "Moldova",
    value: 108.06
  }, {
    code: "MG",
    code3: "MDG",
    name: "Madagascar",
    value: 42.79
  }, {
    code: "MV",
    code3: "MDV",
    name: "Maldives",
    value: 1425.85
  }, {
    code: "MX",
    code3: "MEX",
    name: "Mexico",
    value: 65.61
  }, {
    code: "MH",
    code3: "MHL",
    name: "Marshall Islands",
    value: 294.81
  }, {
    code: "MK",
    code3: "MKD",
    name: "Macedonia, FYR",
    value: 82.52
  }, {
    code: "ML",
    code3: "MLI",
    name: "Mali",
    value: 14.75
  }, {
    code: "MT",
    code3: "MLT",
    name: "Malta",
    value: 1366.93
  }, {
    code: "MM",
    code3: "MMR",
    name: "Myanmar",
    value: 80.98
  }, {
    code: "ME",
    code3: "MNE",
    name: "Montenegro",
    value: 46.27
  }, {
    code: "MN",
    code3: "MNG",
    name: "Mongolia",
    value: 1.95
  }, {
    code: "MP",
    code3: "MNP",
    name: "Northern Mariana Islands",
    value: 119.62
  }, {
    code: "MZ",
    code3: "MOZ",
    name: "Mozambique",
    value: 36.66
  }, {
    code: "MR",
    code3: "MRT",
    name: "Mauritania",
    value: 4.17
  }, {
    code: "MU",
    code3: "MUS",
    name: "Mauritius",
    value: 622.4
  }, {
    code: "MW",
    code3: "MWI",
    name: "Malawi",
    value: 191.89
  }, {
    code: "MY",
    code3: "MYS",
    name: "Malaysia",
    value: 94.92
  }, {
    code: "NA",
    code3: "NAM",
    name: "Namibia",
    value: 3.01
  }, {
    code: "NC",
    code3: "NCL",
    name: "New Caledonia",
    value: 15.15
  }, {
    code: "NE",
    code3: "NER",
    name: "Niger",
    value: 16.32
  }, {
    code: "NG",
    code3: "NGA",
    name: "Nigeria",
    value: 204.21
  }, {
    code: "NI",
    code3: "NIC",
    name: "Nicaragua",
    value: 51.1
  }, {
    code: "NL",
    code3: "NLD",
    name: "Netherlands",
    value: 505.5
  }, {
    code: "NO",
    code3: "NOR",
    name: "Norway",
    value: 14.34
  }, {
    code: "NP",
    code3: "NPL",
    name: "Nepal",
    value: 202.18
  }, {
    code: "NR",
    code3: "NRU",
    name: "Nauru",
    value: 652.45
  }, {
    code: "NZ",
    code3: "NZL",
    name: "New Zealand",
    value: 17.82
  }, {
    code: "OM",
    code3: "OMN",
    name: "Oman",
    value: 14.3
  }, {
    code: "PK",
    code3: "PAK",
    name: "Pakistan",
    value: 250.63
  }, {
    code: "PA",
    code3: "PAN",
    name: "Panama",
    value: 54.27
  }, {
    code: "PE",
    code3: "PER",
    name: "Peru",
    value: 24.82
  }, {
    code: "PH",
    code3: "PHL",
    name: "Philippines",
    value: 346.51
  }, {
    code: "PW",
    code3: "PLW",
    name: "Palau",
    value: 46.75
  }, {
    code: "PG",
    code3: "PNG",
    name: "Papua New Guinea",
    value: 17.85
  }, {
    code: "PL",
    code3: "POL",
    name: "Poland",
    value: 124.01
  }, {
    code: "PR",
    code3: "PRI",
    name: "Puerto Rico",
    value: 384.59
  }, {
    code: "KP",
    code3: "PRK",
    name: "Korea, Dem. People’s Rep.",
    value: 210.69
  }, {
    code: "PT",
    code3: "PRT",
    name: "Portugal",
    value: 112.72
  }, {
    code: "PY",
    code3: "PRY",
    name: "Paraguay",
    value: 16.93
  }, {
    code: "PS",
    code3: "PSE",
    name: "West Bank and Gaza",
    value: 756.07
  }, {
    code: "PF",
    code3: "PYF",
    name: "French Polynesia",
    value: 76.56
  }, {
    code: "QA",
    code3: "QAT",
    name: "Qatar",
    value: 221.34
  }, {
    code: "RO",
    code3: "ROU",
    name: "Romania",
    value: 85.62
  }, {
    code: "RU",
    code3: "RUS",
    name: "Russian Federation",
    value: 8.81
  }, {
    code: "RW",
    code3: "RWA",
    name: "Rwanda",
    value: 483.08
  }, {
    code: "SA",
    code3: "SAU",
    name: "Saudi Arabia",
    value: 15.01
  }, {
    code: "SD",
    code3: "SDN",
    name: "Sudan",
    value: 16.66
  }, {
    code: "SN",
    code3: "SEN",
    name: "Senegal",
    value: 80.05
  }, {
    code: "SG",
    code3: "SGP",
    name: "Singapore",
    value: 7908.72
  }, {
    code: "SB",
    code3: "SLB",
    name: "Solomon Islands",
    value: 21.42
  }, {
    code: "SL",
    code3: "SLE",
    name: "Sierra Leone",
    value: 102.47
  }, {
    code: "SV",
    code3: "SLV",
    name: "El Salvador",
    value: 306.21
  }, {
    code: "SM",
    code3: "SMR",
    name: "San Marino",
    value: 553.38
  }, {
    code: "SO",
    code3: "SOM",
    name: "Somalia",
    value: 22.82
  }, {
    code: "RS",
    code3: "SRB",
    name: "Serbia",
    value: 80.7
  }, {
    code: "ST",
    code3: "STP",
    name: "Sao Tome and Principe",
    value: 208.24
  }, {
    code: "SR",
    code3: "SUR",
    name: "Suriname",
    value: 3.58
  }, {
    code: "SK",
    code3: "SVK",
    name: "Slovak Republic",
    value: 112.94
  }, {
    code: "SI",
    code3: "SVN",
    name: "Slovenia",
    value: 102.53
  }, {
    code: "SE",
    code3: "SWE",
    name: "Sweden",
    value: 24.36
  }, {
    code: "SZ",
    code3: "SWZ",
    name: "Swaziland",
    value: 78.09
  }, {
    code: "SX",
    code3: "SXM",
    name: "Sint Maarten (Dutch part)",
    value: 1175.56
  }, {
    code: "SC",
    code3: "SYC",
    name: "Seychelles",
    value: 205.82
  }, {
    code: "SY",
    code3: "SYR",
    name: "Syrian Arab Republic",
    value: 100.37
  }, {
    code: "TC",
    code3: "TCA",
    name: "Turks and Caicos Islands",
    value: 36.74
  }, {
    code: "TD",
    code3: "TCD",
    name: "Chad",
    value: 11.48
  }, {
    code: "TG",
    code3: "TGO",
    name: "Togo",
    value: 139.85
  }, {
    code: "TH",
    code3: "THA",
    name: "Thailand",
    value: 134.79
  }, {
    code: "TJ",
    code3: "TJK",
    name: "Tajikistan",
    value: 62.94
  }, {
    code: "TM",
    code3: "TKM",
    name: "Turkmenistan",
    value: 12.05
  }, {
    code: "TL",
    code3: "TLS",
    name: "Timor-Leste",
    value: 85.32
  }, {
    code: "TO",
    code3: "TON",
    name: "Tonga",
    value: 148.78
  }, {
    code: "TT",
    code3: "TTO",
    name: "Trinidad and Tobago",
    value: 266.07
  }, {
    code: "TN",
    code3: "TUN",
    name: "Tunisia",
    value: 73.4
  }, {
    code: "TR",
    code3: "TUR",
    name: "Turkey",
    value: 103.31
  }, {
    code: "TV",
    code3: "TUV",
    name: "Tuvalu",
    value: 369.9
  }, {
    code: "TZ",
    code3: "TZA",
    name: "Tanzania",
    value: 62.74
  }, {
    code: "UG",
    code3: "UGA",
    name: "Uganda",
    value: 206.9
  }, {
    code: "UA",
    code3: "UKR",
    name: "Ukraine",
    value: 77.69
  }, {
    code: "UY",
    code3: "URY",
    name: "Uruguay",
    value: 19.68
  }, {
    code: "US",
    code3: "USA",
    name: "United States",
    value: 35.32
  }, {
    code: "UZ",
    code3: "UZB",
    name: "Uzbekistan",
    value: 74.87
  }, {
    code: "VC",
    code3: "VCT",
    name: "St. Vincent and the Grenadines",
    value: 281.14
  }, {
    code: "VE",
    code3: "VEN",
    name: "Venezuela, RB",
    value: 35.79
  }, {
    code: "VG",
    code3: "VGB",
    name: "British Virgin Islands",
    value: 204.41
  }, {
    code: "VI",
    code3: "VIR",
    name: "Virgin Islands (U.S.)",
    value: 307.17
  }, {
    code: "VN",
    code3: "VNM",
    name: "Vietnam",
    value: 304.99
  }, {
    code: "VU",
    code3: "VUT",
    name: "Vanuatu",
    value: 22.18
  }, {
    code: "WS",
    code3: "WSM",
    name: "Samoa",
    value: 68.95
  }, {
    code: "YE",
    code3: "YEM",
    name: "Yemen, Rep.",
    value: 52.25
  }, {
    code: "ZA",
    code3: "ZAF",
    name: "South Africa",
    value: 46.18
  }, {
    code: "ZM",
    code3: "ZMB",
    name: "Zambia",
    value: 22.32
  }, {
    code: "ZW",
    code3: "ZWE",
    name: "Zimbabwe",
    value: 41.75
  }
]

@Component({
  selector: 'app-fixed-tooltip-map',
  styleUrls: ['fixed-tooltip-map.component.scss'],
  template: '<highcharts-chart id="container" [Highcharts]="Highcharts" [constructorType]="chartConstructor" [options]="chartOptions" style="width: 100%; height: 400px; display: block;"></highcharts-chart>'
})

export class FixedTooltipMapComponent implements OnChanges, OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  chartOptions: Highcharts.Options;

  ngOnInit() {
    console.log(data);
    // Prevent logarithmic errors in color calulcation
    // data.forEach(function (p) {
    //   p.value = (p.value < 1 ? 1 : p.value);
    // });
    this.createMap();
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  createMap() {
    this.chartOptions = {

      chart: {
        map: worldMap
      },

      title: {
        text: 'Fixed tooltip with HTML'
      },

      legend: {
        title: {
          text: 'Number of Resaercher-performing organizations',
          style: {
            color: ( // theme
              Highcharts.defaultOptions &&
              Highcharts.defaultOptions.legend &&
              Highcharts.defaultOptions.legend.title &&
              Highcharts.defaultOptions.legend.title.style &&
              Highcharts.defaultOptions.legend.title.style.color
            ) || 'black'
          }
        }
      },

      mapNavigation: {
        enabled: true,
        buttonOptions: {
          alignTo: "spacingBox"
        },
        enableMouseWheelZoom: false
      },

      tooltip: {
        backgroundColor: 'none',
        borderWidth: 0,
        shadow: false,
        useHTML: true,
        padding: 0,
        headerFormat: '<span style="color: {point.color}">\u25CF</span>{series.name}',
        pointFormat: '<br><span class="f32"><span class="flag {point.properties.hc-key}"></span></span> {point.name}<br><span style="font-size:30px">{point.value}/km²</span>',
        positioner: function () {
          return { x: 0, y: 250 };
        }
      },

      colorAxis: {
        min: 1,
        max: 1000,
        type: 'logarithmic'
      },

      credits: {
        enabled: false
      },

      series: [{
        type: "map",
        data: data,
        joinBy: ['iso-a3', 'code3'],
        name: 'Number of RPO <br> There are 206 Universities in Turkey that we can mention as a research perfororming. There are also other research performing organisations but the number is unknown. '

      }]
    }
  }
}
