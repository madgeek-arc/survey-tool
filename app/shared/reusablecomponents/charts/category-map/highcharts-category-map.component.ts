import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {CategorizedAreaData} from "../../../../domain/categorizedAreaData";
import {SeriesOptionsType} from "highcharts/highmaps";
import {PremiumSortPipe} from "../../../../../catalogue-ui/shared/pipes/premium-sort.pipe";

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');

@Component({
  selector: 'app-highcharts-category-map',
  templateUrl: './highcharts-category-map.component.html'
})

export class HighchartsCategoryMapComponent implements OnInit, OnChanges {

  @Input() mapData: CategorizedAreaData = null;
  @Input() title: string = null;
  @Input() subtitle: string = null;
  @Input() pointFormat: string = null;
  @Input() mapType: string = null;
  @Output() mapClick = new EventEmitter<any>();

  chart;
  chartCallback;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  colorPallet = ['#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A9A9A9'];
  datasetOrder = [ 'Yes', 'Partly', 'In planning', 'No', 'Awaiting data' ];
  premiumSort = new PremiumSortPipe();
  chartConstructor = "mapChart";
  ready = false;
  chartOptions: Highcharts.Options;

  constructor() {
    const self = this;

    this.createMap();
    this.chartCallback = chart => {
      // saving chart reference
      self.chart = chart;
      // console.log(self.chart);
    };
  }

  ngOnInit() {
    this.createMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ready = false;
    if (this.mapData) {
      const self = this, chart = this.chart;
      // chart.showLoading();
      self.chartOptions.series = [];
      if (this.subtitle) {
        self.chartOptions.subtitle.text = this.subtitle;
      }
      if (this.pointFormat) {
        self.chartOptions.plotOptions.map.tooltip.pointFormat = this.pointFormat;
      }
      if (this.mapType === 'Categorization') {
        for (let i = 0; i < this.mapData.series.length; i++) {
          this.premiumSort.transform(this.mapData.series, this.datasetOrder);
          this.mapData.series[i].color = this.colorPallet[this.datasetOrder.indexOf(this.mapData.series[i].name)];
        }
      } else {
        if (this.mapData.series[0] && !this.mapData.series[0].color)
          this.mapData.series[0].color = '#008792';
        if (this.mapData.series[1] && !this.mapData.series[1].color)
          this.mapData.series[1].color = this.colorPallet[4];
      }

      this.mapData.series[0].allAreas = true;
      setTimeout(() => {
        self.chartOptions.title.text = this.title;
        self.chartOptions.series = this.mapData.series as SeriesOptionsType[];
        console.log(this.mapData.series);
        // console.log(self.chartOptions.series)
        // chart.hideLoading();
        this.ready = true;
        self.updateFlag = true;
      }, 0);

    }
  }

  createMap() {
    const that = this;

    this.chartOptions = {

      chart: {
        map: worldMap,
        spacingBottom: 20,
        backgroundColor: 'rgba(0,0,0,0)'
      },
      mapView: {
        center: [15, 50],
        zoom: 4.1
      },

      title: {
        text: this.title
      },

      subtitle: {
        text: this.subtitle
      },

      mapNavigation: {
        enabled: true,
        buttonOptions: {
          alignTo: "spacingBox"
        },
        enableMouseWheelZoom: false
      },

      legend: {
        enabled: true,
        accessibility: {
          enabled: true
        }
      },

      tooltip: {
        headerFormat: '',
        pointFormat: '<b>{point.name}</b>'
      },

      plotOptions: {
        map: {
          joinBy: ['iso-a2', 'code'],
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}'
          }
        },
        series: {
          events: {
            legendItemClick: function(e) {
              // console.log(e);
              e.preventDefault(); // disable legend item click
            }
          },
          point: {
            events: {
              click: function () {
                // console.log(this);
                that.mapClick.emit(this);
              },
            }
          }
        }
      },

      series: [] as SeriesOptionsType[],
    }
  }

}
