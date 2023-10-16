import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import * as Highcharts from "highcharts";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

@Component({
  selector: 'app-column-ranges-chart',
  template: '<div id="columnChart" style="display: block; height: 100%; width: 100%"></div>',
})

export class HighchartsColumnRangesComponent implements OnChanges {


  @Input() series: any = [];
  @Input() title: string = null;
  // @Input() subTitle: string = null;

  backgroundColor: string = '#F3F4F5';
  chartOptions: Highcharts.Options = {}
  stackedColumns: Highcharts.Chart;


  ngOnChanges(changes: SimpleChanges) {
    if (this.series?.length > 0) {
      this.initializeOptions();
      this.createChart();
    }
  }

  private initializeOptions(): void {

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: this.backgroundColor
      },
      title: {
        text: this.title
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
      series: this.series
    }
  }

  createChart() {
    this.stackedColumns = Highcharts.chart('columnChart', this.chartOptions);
  }

}
