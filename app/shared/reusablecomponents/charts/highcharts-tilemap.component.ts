import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component} from "@angular/core";
HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world.geo.json');

interface ExtendedPointOptionsObject extends Highcharts.PointOptionsObject {
  country: string;
}

@Component({
  selector: 'app-highcharts-tilemap',
  templateUrl: './highcharts-tilemap.component.html'
})

export class HighchartsTilemapComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  chartData = [
    { code3: "ABW", z: 105 },
    { code3: "AFG", z: 35530 }
  ];

  chartOptions: Highcharts.Options = {
    chart: {
      // map: worldMap
      type: 'tilemap',
      // height: '600px',
      height: '50%',
      inverted: true
    },
    colors: [
      'rgba(103, 232, 99, 0.5)', 'rgba(135, 207, 233, 0.5)',
      'rgba(255, 241, 118, 0.5)', 'rgba(233, 135, 207, 0.5)'
    ],

    title: {
      text: 'European Countries'
    },

    subtitle: {
      text: 'Source: <a href="https://en.wikipedia.org/wiki/File:European_sub-regions_(according_to_EuroVoc,_the_thesaurus_of_the_EU).png">Wikipedia.org</a>'
    },

    xAxis: {
      visible: false
    },

    yAxis: {
      visible: false
    },

    tooltip: {
      headerFormat: '',
      pointFormat: '<b>{point.name}</b> belongs to <b>{series.name}</b>'
    },

    plotOptions: {
      series: {
        // pointPadding: 2,
        dataLabels: {
          enabled: true,
          format: '{point.country}',
          color: '#000000',
          // style: {
          //   textOutline: false
          // }
        }
      }
    },
    series: [
      {
        type: "tilemap",
        name: "Eastern Europe",
        data: [{
          name: 'Belarus',
          country: 'BY',
          // z: 13.8,
          x: 3,
          y: 7
        } as ExtendedPointOptionsObject
          , {
            country: 'BA',
            name: 'Bosnia and Herzegovina',
            x: 7,
            y: 5
          }, {
            country: 'BG',
            name: 'Bulgaria',
            x: 6,
            y: 7
          }, {
            country: 'HR',
            name: 'Croatia',
            x: 6,
            y: 5
          }, {
            country: 'CZ',
            name: 'Czech Republic',
            x: 4,
            y: 5
          }, {
            country: 'EE',
            name: 'Estonia',
            x: 1,
            y: 7
          }, {
            country: 'HU',
            name: 'Hungary',
            x: 5,
            y: 6
          }, {
            country: 'LV',
            name: 'Latvia',
            x: 2,
            y: 7
          }, {
            country: 'LT',
            name: 'Lithuania',
            x: 2,
            y: 6
          }, {
            country: 'MD',
            name: 'Moldova',
            x: 5,
            y: 8
          }, {
            country: 'PL',
            name: 'Poland',
            x: 3,
            y: 6
          }, {
            country: 'RO',
            name: 'Romania',
            x: 5,
            y: 7
          }, {
            country: 'RU',
            name: 'Russia',
            x: 3,
            y: 8
          }, {
            country: 'SK',
            name: 'Slovakia',
            x: 4,
            y: 6
          }, {
            country: 'UA',
            name: 'Ukraine',
            x: 4,
            y: 7
          }, {
            country: 'KV',
            name: 'Kosovo',
            x: 8,
            y: 6
          }, {
            country: 'MK',
            name: 'Macedonia',
            x: 7,
            y: 7
          }, {
            country: 'ME',
            name: 'Montenegro',
            x: 7,
            y: 6
          }, {
            country: 'RS',
            name: 'Republic of Serbia',
            x: 6,
            y: 6
          }, {
            country: 'SI',
            name: 'Slovenia',
            x: 6,
            y: 4
          }, {
            country: 'TR',
            name: 'Turkey',
            x: 7,
            y: 8
          }]
      },
      {
        type: "tilemap",
        name: 'Northern Europe',
        data: [{
          country: 'DK',
          name: 'Denmark',
          x: 2,
          y: 4
        }, {
          country: 'FO',
          name: 'Faroe Islands',
          x: 0,
          y: 2
        }, {
          country: 'FI',
          name: 'Finland',
          x: 0,
          y: 6
        }, {
          country: 'IS',
          name: 'Iceland',
          x: -1,
          y: 2
        }, {
          country: 'NO',
          name: 'Norway',
          x: 0,
          y: 4
        }, {
          country: 'SE',
          name: 'Sweden',
          x: 0,
          y: 5
        }]
      },
      {
        type: "tilemap",
        name: 'Southern Europe',
        data: [{
          country: 'IT',
          name: 'Italy',
          x: 6,
          y: 3
        }, {
          country: 'GR',
          name: 'Greece',
          x: 9,
          y: 6
        }, {
          country: 'MT',
          name: 'Malta',
          x: 7,
          y: 2
        }, {
          country: 'AL',
          name: 'Albania',
          x: 8,
          y: 5
        }, {
          country: 'PT',
          name: 'Portugal',
          x: 5,
          y: 1
        }, {
          country: 'ES',
          name: 'Spain',
          x: 5,
          y: 2
        }, {
          country: 'CY',
          name: 'Cyprus',
          x: 9,
          y: 8
        }]
      },
      {
        type: "tilemap",
        name: 'Western Europe',
        data: [{
          country: 'LI',
          name: 'Liechtenstein',
          x: 5,
          y: 4
        }, {
          country: 'AT',
          name: 'Austria',
          x: 5,
          y: 5
        }, {
          country: 'BE',
          name: 'Belgium',
          x: 3,
          y: 3
        }, {
          country: 'FR',
          name: 'France',
          x: 4,
          y: 2
        }, {
          country: 'DE',
          name: 'Germany',
          x: 3,
          y: 5
        }, {
          country: 'IE',
          name: 'Ireland',
          x: 2,
          y: 0
        }, {
          country: 'LU',
          name: 'Luxembourg',
          x: 4,
          y: 3
        }, {
          country: 'NL',
          name: 'Netherlands',
          x: 3,
          y: 4
        }, {
          country: 'CH',
          name: 'Switzerland',
          x: 4,
          y: 4
        }, {
          country: 'GB',
          name: 'United Kingdom',
          x: 2,
          y: 1
        }]
      }]
  };
}
