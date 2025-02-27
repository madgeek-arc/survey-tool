import { Component, Input, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import VariablePie from 'highcharts/modules/variable-pie';

// Initialize the variable pie module
VariablePie(Highcharts);

@Component({
  selector: 'app-pie-chart',
  template: '<div *ngIf="chartId" [id]="chartId"></div>',
})
export class PieChartComponent implements OnChanges {

  @Input() chartId: string = null;
  @Input() title = 'Countries distribution';
  @Input() type = 'pie';
  @Input() tooltip = null;
  @Input() series: any = [];

  backgroundColor: string = '#FFFFFF';
  pie: Highcharts.Chart;


  ngOnChanges() {
    if (this.series?.length > 0 && this.chartId !== null) {

      setTimeout(() => { // Timeout with delay 0 to reorder the
        // console.log(document.getElementById(this.chartId));
        this.initChart();
        this.pie.update({
          tooltip: this.tooltip,
          chart: {
            type: this.type,
            backgroundColor: this.backgroundColor
          },
          title: {
            text: this.title
          },
          series: this.series
        }, true, true, true);
      }, 0)

    }
  }

  initChart() {
    // console.log(this.chartId);
    this.pie = Highcharts.chart(this.chartId, {
      chart: {
        type: this.type,
        backgroundColor: this.backgroundColor
      },
      title: {
        text: this.title
      },
      credits: {
        enabled: false
      },
      series: this.series
    } as any);
  }
}
