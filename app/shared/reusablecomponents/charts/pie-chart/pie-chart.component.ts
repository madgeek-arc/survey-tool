import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
    selector: 'app-pie-chart',
    template: '<div id="chartId"></div>',
})
export class PieChartComponent implements AfterViewInit, OnChanges{

    @Input() chartId: string;
    @Input() series: any = [{}];

    pie: Highcharts.Chart;

    backgroundColor: string = '#F3F4F5';


    ngAfterViewInit() {
        // this.initChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.series) {
            console.log(this.series);
            // this.pie.series[0].data = this.series.data;
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
        }
    }

    initChart() {
        console.log(this.chartId);
        this.pie = Highcharts.chart('chartId', {
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
