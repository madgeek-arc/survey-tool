import {Component, Input, OnChanges, SimpleChanges, ViewChild} from "@angular/core";
import * as Highcharts from "highcharts";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import {SeriesMapDataOptions} from "highcharts/highmaps";

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);
let componentContext;

@Component({
  selector: 'app-column-ranges-chart',
  templateUrl: './highcharts-column-ranges.component.html'
})

export class HighchartsColumnRangesComponent implements OnChanges{

  @ViewChild('chart') componentRef;

  @Input() mapData: (number | SeriesMapDataOptions | [string, number])[] = [];
  @Input() title: string = null;
  @Input() subTitle: string = null;
  @Input() dataSeriesSuffix: string = null;

  backgroundColor: string = '#F3F4F5';
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {}
  chartRef: Highcharts.Chart;
  updateFlag: any;
  ready = false;

  ngOnChanges(changes: SimpleChanges) {
    componentContext = this;
    // this.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--medium-grey');
    if (this.mapData?.length > 0) {
      this.mapData = this.mapData.filter((element) => {
        return element[1] > 0;
      });
      this.createChartColumnRanges();
      this.ready = true;
    }

    this.createChartColumnRanges();
    this.ready = true;
  }

  private createChartColumnRanges(): void {

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: this.backgroundColor
      },
      title: {
        text: 'Country investments in EOSC and Open Science in ranges'
      },
      legend: {
        enabled: false
      },
      // xAxis: {
      //   categories: ['<1 M', '1-5 M', '5-10 M', '10-20 M', '>20 M']
      // },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        visible: false
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
            inside: true,
            align: 'center',
            verticalAlign: 'middle',
            style: {
              fontWeight: 'bold'
            },
            formatter: function() {
              return this.series.name;
            }
          }
        }
      },
      // fixme replace with variable data series
      series: [{
        name: 'TR',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'BA',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'GR',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'RS',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'UA',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'SK',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'LV',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'LU',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'GE',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'CY',
        type: 'column',
        data: [
          ['<1 M', 1],
        ]
      }, {
        name: 'BG',
        type: 'column',
        data: [
          ['1-5 M', 1],
        ]
      }, {
        name: 'AT',
        type: 'column',
        data: [
          ['1-5 M', 1],
        ]
      }, {
        name: 'PL',
        type: 'column',
        data: [
          ['1-5 M', 1],
        ]
      }, {
        name: 'EE',
        type: 'column',
        data: [
          ['1-5 M', 1],
        ]
      }, {
        name: 'DK',
        type: 'column',
        data: [
          ['1-5 M', 1],
        ]
      }, {
        name: 'NO',
        type: 'column',
        data: [
          ['5-10 M', 1],
        ]
      }, {
        name: 'IE',
        type: 'column',
        data: [
          ['10-20 M', 1],
        ]
      }, {
        name: 'CZ',
        type: 'column',
        data: [
          ['>20 M', 1],
        ]
      }, {
        name: 'FI',
        type: 'column',
        data: [
          ['>20 M', 1],
        ]
      }, {
        name: 'ES',
        type: 'column',
        data: [
          ['>20 M', 1],
        ]
      }, {
        name: 'FR',
        type: 'column',
        data: [
          ['>20 M', 1],
        ]
      }, {
        name: 'DE',
        type: 'column',
        data: [
          ['>20 M', 1],
        ]
      }, {
        name: 'NL',
        type: 'column',
        data: [
          ['>20 M', 1],
        ]
      }]
    }
  }

  chartCallback: Highcharts.ChartCallbackFunction = chart => {
    this.chartRef = chart;
  };

}
