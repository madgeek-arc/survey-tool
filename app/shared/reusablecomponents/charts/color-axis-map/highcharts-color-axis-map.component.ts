import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import {Component, Input, SimpleChanges} from "@angular/core";
import {colorAxisDataWithZeroValue} from "../../../../domain/categorizedAreaData";
import {SeriesMapDataOptions} from "highcharts/highmaps";
import {ColorAxisOptions, LegendOptions} from "highcharts";

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');
let componentContext;

@Component({
  selector: 'app-highcharts-color-axis',
  templateUrl: 'highcharts-color-axis-map.component.html'
})

export class HighchartsColorAxisMapComponent {

  @Input() mapData: (number | SeriesMapDataOptions | [string, number])[] = [];
  @Input() title: string = null;
  @Input() subtitle: string = null;
  @Input() dataSeriesSuffix: string = null;
  @Input() toolTipData: Map<string, string> = new Map;
  @Input() participatingCountries: string[] = [];
  @Input() legend: LegendOptions = {};
  @Input() colorAxis: ColorAxisOptions = {min: 0, max: 25, stops: [[0, '#F1EEF6'], [1, '#008792']]};

  chart: any;
  updateFlag = false;
  backgroundColor: string = '#ffffff';
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  chartOptions: Highcharts.Options;
  dataForInitialization = colorAxisDataWithZeroValue;

  ready: boolean = false;

  constructor() {
    componentContext = this;
    this.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--medium-grey');
    this.createMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ready = false;
    const componentContext = this, chart = this.chart;

    if (this.mapData?.length >= 0) {
      // console.log(this.colorAxis);
      setTimeout(() => {
        componentContext.chartOptions.title.text = this.title;
        componentContext.chartOptions.subtitle.text = this.subtitle;
        let tmpArray: (number | SeriesMapDataOptions | [string, number])[] = [];
        let found = false;
        for (let i = 0; i < this.dataForInitialization.length; i++) {
          found = false;
          for (let j = 0; j < this.mapData?.length; j++) {
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
        componentContext.chartOptions.series[0]['data'] = this.mapData;
        componentContext.chartOptions.colorAxis = this.colorAxis;
        componentContext.chartOptions.legend = this.legend;
        // console.log(componentContext.chartOptions.series)
        // chart.hideLoading();
        this.ready = true;
        componentContext.updateFlag = true;
      }, 0);
    }
  }

  chartCallback: Highcharts.ChartCallbackFunction = chart => {
    this.chart = chart;
  };

  createMap() {
    let that = this;
    this.chartOptions = {
      chart: {
        map: worldMap,
        backgroundColor: this.backgroundColor,
        events: {
          load: function () {
            let chart = this;
            let color = '#a9a9a9'; // Specify the color here

            // Loop through the country names
            that.participatingCountries.forEach(function(countryName: string) {
              // Find the country point
              let countryPoint = chart.series[0].points.find(function(point) {
                return point.properties["iso-a2"]?.toLowerCase() === countryName;
              });

              // (1) Change the color of the country
              if (countryPoint) {
                // update point colors without redrawing the map every time.
                countryPoint.update({color: color}, false);
              }
            });
            // Redraw the chart for changes (1) to take effect
            chart.update({}, true);
          }
        }
      },
      mapView: {
        center: [15, 50],
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
      legend: this.legend,
      // legend: {
      //   layout: 'horizontal',
      //   verticalAlign: 'top'
      // },
      colorAxis: this.colorAxis,

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
      tooltip: {
        formatter: function () {
          let comment = that.toolTipData.get(this.point.properties['iso-a2'].toLowerCase()) ? that.toolTipData.get(this.point.properties['iso-a2'].toLowerCase()):'';
          comment = comment.replace(/\\n/g,'<br>');
          comment = comment.replace(/\\t/g,' ');
          if (this.point.value < 0)
            return '<b>' + this.point.properties['name'] + '</b>: ' + 'N/A' + (comment ? ('<br><br>' + '<p>'+comment+'</p>') : '');

          if (this.point.value >= 0 && this.point['dataClass'] >= 0)
            return '<b>' + this.point.properties['name'] + '</b>: ' +'<br><br>'+ '<p>'+comment+'</p>';

          return '<b>' + this.point.properties['name'] + '</b>: ' + this.point.value + ' ' + (that.dataSeriesSuffix !== null ? that.dataSeriesSuffix : ' M') +'<br><br>'+ '<p>'+comment+'</p>';
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
            formatter:  function () {
              if (this.point.value >= 0) {
                // ---------> temp hack/fix for display purposes
                if (this.point['dataClass'] >= 0) {
                  switch (this.point['dataClass']) {
                    case 0: return '< 1 M';
                    case 1: return '1 - 5 M';
                    case 2: return '5 - 10 M';
                    case 3: return '10 - 20 M';
                    case 4: return '> 20 M';
                  }
                } // <--------- temp hack/fix for display purposes
                return this.point.value + (componentContext.dataSeriesSuffix !== null ? componentContext.dataSeriesSuffix : ' M');
              }
              else
                return '';
            }
          },
          allAreas: false,
          data: [],
          // tooltip: {
          //   headerFormat: '<span style="font-size:10px">{series.name}</span><br/>',
          //   pointFormat: '{point.name}: <b>{point.value} </b><br/>',
          //   valueSuffix: ' M',
          //   footerFormat: ''
          // }
        }
      ],
      exporting: {
        sourceWidth: 1200,
        sourceHeight: 800
        // scale: 1,
      }
    }
  }

}
