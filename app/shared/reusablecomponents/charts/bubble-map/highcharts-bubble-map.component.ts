import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';

HC_exporting(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');


@Component({
  selector: 'app-highcharts-bubble-map',
  templateUrl: 'highcharts-bubble-map.component.html',
  styleUrls: ['highcharts-bubble-map.component.scss']
})

export class HighchartsBubbleMapComponent implements OnChanges {
  @Input() legend: string[] = null;
  @Input() dataArray: any[] = null;

  chart;
  chartCallback;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  ready = true;
  chartOptions: Highcharts.Options = null
  colorPallet = ['#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A9A9A9'];

  data: any;
  activeView:number = null;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    const self = this;
    if (this.legend && this.dataArray) {
      const tmpArray = [];
      this.loadMap(tmpArray, this.legend[0], this.colorPallet[0]);
      this.chartCallback = chart => {
        // saving chart reference
        self.chart = chart;
      };
      this.changeView(0);
    }
  }

  changeView(view: number) {
    const self = this, chart = this.chart;
    if (view !== this.activeView) {
      this.activeView = view;
      setTimeout(() => {
        self.chartOptions.series[1] = {
          name: this.legend[view],
          color: this.colorPallet[view],
          data: this.dataArray[view] as Highcharts.SeriesMapbubbleDataOptions[]
        } as Highcharts.SeriesMapbubbleOptions;
        self.updateFlag = true;
      }, 0);
    }
  }

  loadMap(data, seriesName, seriesColor) {
    this.chartOptions = {
      chart: {
        map: worldMap,
        // events: {
        //   click: event => {
        //     console.log(event);
        //   }
        // }
      },

      mapView: {
        center: [30, 51],
        zoom: 3.5
      },

      title: {
        text: ""
      },

      mapNavigation: {
        enabled: true,
        buttonOptions: {
          alignTo: "spacingBox"
        },
        enableMouseWheelZoom: false
      },

      plotOptions: {
        series: {
          // general options for all series
          cursor: 'pointer',
          events: {
            // click: event => {
            //   console.log(event);
            // }
          }
        },
        mapbubble: {
          // shared options for all mapbubble series
        }
      },

      legend: {
        enabled: false
      },

      series: [
        {
          type: "map",
          name: "Countries",
          borderColor: '#fff',
          negativeColor: 'rgba(139,151,167,0.2)',
          enableMouseTracking: false
        },
        {
          type: "mapbubble",
          name: seriesName,
          color: seriesColor,
          // @ts-ignore
          joinBy: ["iso-a2", "id"],
          data: data as Highcharts.SeriesMapbubbleDataOptions[],
          minSize: 4,
          maxSize: '12%',
          marker: {
            fillOpacity: 0.6,
          },
          states: {
            hover: {
              brightness: 0.7,
              borderWidth: 7
            }
          },
          dataLabels: {
            enabled: true,
            style: {
              color: '#fff',
              fontSize: '13px',
              fontWeight: 'bold',
              // textOutline: '1px #a1a1a1'
              textOutline: '1px #000'
            },
            allowOverlap: true,
            formatter: function () {
              // return this.point.z.toFixed(1) + '%';
              return this.point['z'].toLocaleString();
            }
          },
          tooltip: {
            headerFormat: '<span style="font-size: 120%; font-weight: bold; margin-bottom: 15px">{point.key}</span><br>',
            pointFormat: '{point.z} {series.name}',
          }
        }
      ]
    };
  }

}
