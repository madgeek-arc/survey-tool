import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import {Component, Input, SimpleChanges} from "@angular/core";
import {CategorizedAreaData, colorAxisDataWithZeroValue} from "../../../../domain/categorizedAreaData";
import {SeriesMapDataOptions, SeriesOptionsType} from "highcharts/highmaps";

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');


@Component({
  selector: 'app-highcharts-color-axis',
  templateUrl: 'highcharts-color-axis-map.component.html'
})

export class HighchartsColorAxisMapComponent {

  @Input() mapData: (number | SeriesMapDataOptions | [string, number])[] = [];
  @Input() title: string = null;
  @Input() subtitle: string = null;

  chart;
  chartCallback;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  chartOptions: Highcharts.Options;
  dataForInitialization = colorAxisDataWithZeroValue;

  ready: boolean = false;

  constructor() {
    const self = this;

    this.createMap();
    this.chartCallback = chart => {
      // saving chart reference
      self.chart = chart;
      // console.log(self.chart);
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ready = false;
    const self = this, chart = this.chart;

    if (this.mapData?.length > 0) {
      setTimeout(() => {
        self.chartOptions.title.text = this.title;
        self.chartOptions.subtitle.text = this.subtitle;
        let tmpArray: (number | SeriesMapDataOptions | [string, number])[] = [];
        let found = false;
        for (let i = 0; i < this.dataForInitialization.length; i++) {
          found = false;
          for (let j = 0; j < this.mapData.length; j++) {
            if (this.dataForInitialization[i][0] === this.mapData[j][0]) {
              tmpArray.push(this.mapData[j]);
              found = true;
              break;
            }
          }
          if (!found) {
            tmpArray.push(this.dataForInitialization[i]);
          }
        }
        this.mapData = tmpArray;
        self.chartOptions.series[0]['data'] = this.mapData;
        // console.log(self.chartOptions.series)
        // chart.hideLoading();
        this.ready = true;
        self.updateFlag = true;
      }, 0);
    }
  }

  createMap() {
    this.chartOptions = {
    chart: {
      map: worldMap,
      backgroundColor: 'rgba(0,0,0,0)'
    },
    mapView: {
      center: [30, 50],
      zoom: 4
    },
    title: {
      text: this.title
    },
    subtitle: {
      text: this.subtitle,
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        alignTo: "spacingBox"
      },
      enableMouseWheelZoom: false
    },
    legend: {
      enabled: true
    },
      colorAxis: {
        min: 0,
        max: 25,
        // tickInterval: 3,
        stops: [[0, '#F1EEF6'], [1, '#008792']],
        // labels: {
        //   format: '{value}%'
        // }
      },
    plotOptions: {
      series: {
        point: {
          events: {
            click: function () {
              console.log(this);
            },
          }
        }
      }
    },
    series: [
      {
        type: "map",
        name: "Amount",
        states: {
          hover: {
            color: "#8E8E8E"
          }
        },
        dataLabels: {
          enabled: true,
          // format: "{point.value}",
          formatter: function () {
            if (this.point.value > 0)
              return this.point.value + ' M';
            else
              return '';
          }
        },
        allAreas: false,
        data: [],
        // tooltip: {
        //   pointFormat: '{point.code}: {point.value} M'
        // }
        tooltip: {
          valueSuffix: ' M'
        },
      }
    ]
  }
  }

}
