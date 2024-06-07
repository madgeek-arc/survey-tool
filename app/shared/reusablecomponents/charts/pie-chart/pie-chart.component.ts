import { Component, Input, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-pie-chart',
  template: '<div *ngIf="chartId" [id]="chartId"></div>',
})
export class PieChartComponent implements OnChanges {

  @Input() chartId: string = null;
  @Input() series: any = [];

  backgroundColor: string = '#FFFFFF';
  pie: Highcharts.Chart;


  ngOnChanges() {
    if (this.series?.length > 0 && this.chartId !== null) {

      setTimeout(() => { // Timeout with delay 0 to reorder the
        // console.log(document.getElementById(this.chartId));
        this.initChart();
        this.pie.update({
          chart: {
            type: 'pie'
          },
          title: {
            text: 'Countries distribution'
          },
          series: this.series
        }, true);
      }, 0)

    }
  }

  initChart() {
    // console.log(this.chartId);
    this.pie = Highcharts.chart(this.chartId, {
      chart: {
        type: 'pie',
        backgroundColor: this.backgroundColor
      },
      title: {
        text: 'Countries distribution'
      },
      series: this.series
    } as any);
  }
}
