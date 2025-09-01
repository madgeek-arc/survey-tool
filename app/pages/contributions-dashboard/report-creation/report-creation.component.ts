import {Component, OnInit} from "@angular/core";
import {RouterLink} from "@angular/router";
import {ReportCreationService} from "../../../services/report-creation.service";
import {ChartsModule} from "../../../../../app/shared/charts/charts.module";
import {EoscReadinessDataService} from "../../../../../app/pages/services/eosc-readiness-data.service";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {
  CustomSeriesMapOptions,
  WorldMapComponent
} from "../../../../../app/shared/charts/world-map/world-map.component";
import {forkJoin} from "rxjs";
import {RawData} from "../../../../../app/domain/raw-data";
import {SeriesMappointOptions} from "highcharts";
import { SeriesPieOptions } from 'highcharts';
import { PointOptionsObject } from 'highcharts';
import {latlong} from "../../../../../app/domain/countries-lat-lon";
import { JsonPipe, NgForOf, NgIf } from "@angular/common";
import { HighchartsChartModule } from "highcharts-angular";



interface Chart {
  title: string;
  namedQueries: string[];
  data: any[];
  mapSeries: any[];
  pieSeries?: any[];
  stats?: string[],
  type?: string;
  order?: number;
}

interface ChartImageData {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  title?: string;
}

@Component({
  selector: 'app-report-creation',
  standalone: true,
  imports: [
    RouterLink,
    ChartsModule,
    WorldMapComponent,
    NgIf,
    NgForOf,
    JsonPipe,
    HighchartsChartModule
],
  providers: [StakeholdersService],
  templateUrl: './report-creation.component.html'
})

export class ReportCreationComponent implements OnInit {
  worldCharts: Highcharts.Chart[] = [];
  pieCharts: Highcharts.Chart[][] = [];

  year = '2023';

  reportData: Record<string, string> = {};
  chartsCfg: Chart[] = [
    {
      title: 'National policy on open access publications',
      namedQueries: ['Question6','Question6.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      type: 'mapWithPoints',
      stats: ['Question6','Question6.1'],
      // order: 1
    },
    {
      title: 'Countries with a Specific Policy on Immediate Open Access to Publications',
      namedQueries: ['Question6.3', 'Question6.3.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      type: 'mapWithPoints',
      stats: ['Question6.3', 'Question6.3.1'],
      // order: 1
    },
    {
      title: ' Countries with a Specific Policy on Open Licensing of Publications',
      namedQueries: ['Question6.5', 'Question6.5.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      type: 'mapWithPoints',
      stats: ['Question6.5', 'Question6.5.1'],
    },
    {
      title: 'Countries with a Specific Policy on Retention of IPR on Publications',
      namedQueries: ['Question6.4', 'Question6.4.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      type: 'mapWithPoints',
      stats: ['Question6.4',' Question6.4.1'],
      // order: 1
    },
    {
      title: 'Countries with a Financial Strategy on Open Access to Publications',
      namedQueries: ['Question7'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      type: 'mapWithPoints',
      stats: ['Question7'],
    },
    {
      title: 'Countries with a National Monitoring on Open Access to Publications',
      namedQueries: ['Question54'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      type: 'mapWithPoints',
      stats: ['Question54'],
    },
    {
       title: 'National policy on data management',
       namedQueries: ['Question10','Question10.1'],
       data: [],
       mapSeries: [],
       pieSeries: [],
       type: 'mapWithPoints',
       stats: ['Question10','Question10.1'],
       // order: 2
     },
     {
       title: 'National policy on FAIR data',
       namedQueries: ['Question14','Question14.1'],
       data: [],
       mapSeries: [],
       pieSeries: [],
       stats: ['Question14','Question14.1'],
     },
     {
       title: 'National policy on open data',
       namedQueries: ['Question18','Question18.1'],
       data: [],
       mapSeries: [],
       pieSeries: [],
       stats: ['Question18','Question18.1'],
     },
     {
       title: 'Financial Strategy on Data Management',
       namedQueries: ['Question11'],
       data: [],
       mapSeries: [],
       pieSeries: [],
       stats: ['Question11'],
     },
     {
      title: 'Countries with a Financial Strategy on FAIR Data',
      namedQueries: ['Question15'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question15'],
     },
     {
      title: 'Financial Strategy on Open Data',
      namedQueries: ['Question19'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question19'],
     },
     {
      title: 'National Monitoring on Data Management',
      namedQueries: ['Question58'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question58'],
     },
     {
      title: 'National Monitoring on FAIR Data',
      namedQueries: ['Question62'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question62'],
     },
     {
      title: 'National Monitoring on Open Data',
      namedQueries: ['Question66'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question66'],
     },
     {
      title: 'National Policy on Open Source Software',
      namedQueries: ['Question22','Question22.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question22','Question22.1'],
     },
     {
      title: 'National Monitoring on Open Source Software',
      namedQueries: ['Question70'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question70'],
     },
     {
      title: 'National Policy on Offering Services through EOSC',
      namedQueries: ['Question26','Question26.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question26','Question26.1'],
     },
     {
      title: 'National Monitoring on Offering Services through EOSC',
      namedQueries: ['Question74'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question74'],
     },
     {
      title: 'National Policy on Connecting Repositories to EOSC',
      namedQueries: ['Question30','Question30.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question30','Question30.1'],
     },
     {
      title: 'National Policy on Data Stewardship',
      namedQueries: ['Question34','Question34.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question34','Question34.1'],
     },
     {
      title: 'National Policy on Long-term Data Preservation',
      namedQueries: ['Question38','Question38.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question38','Question38.1'],
     },
     {
      title: 'Financial Strategy on Connecting Repositories to EOSC',
      namedQueries: ['Question31'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question31'],
     },
     {
      title: 'Financial Strategy on Data Stewardship',
      namedQueries: ['Question35'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question35'],
     },
     {
      title: 'Financial Strategy on Long-term Data Preservation',
      namedQueries: ['Question39'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question39'],
     },
     {
      title: 'National Monitoring on Connecting Repositories to EOSC',
      namedQueries: ['Question78'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question78'],
     },
     {
      title: 'National Monitoring on Data Stewardship',
      namedQueries: ['Question82'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question82'],
     },
     {
      title: 'National Monitoring on Long-term Data Preservation',
      namedQueries: ['Question86'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question86'],
     },
     {
      title: 'National Policy on Skills/Training for Open Science',
      namedQueries: ['Question42','Question42.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question42','Question42.1'],
     },
     {
      title: 'Financial Strategy on Skills/Training for Open Science',
      namedQueries: ['Question43'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question43'],
     },
     {
      title: 'National Monitoring on Skills/Training for Open Science',
      namedQueries: ['Question90'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question90'],
     },
     {
      title: 'National Policy on Incentives/Rewards for Open Science',
      namedQueries: ['Question46','Question46.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question46','Question46.1'],
     },
     {
      title: 'Financial Strategy on Incentives/Rewards for Open Science',
      namedQueries: ['Question47'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question47'],
     },
     {
      title: 'National Policy on Citizen Science',
      namedQueries: ['Question50','Question50.1'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question50','Question50.1'],
     },
     {
      title: 'Financial Strategy on Citizen Science',
      namedQueries: ['Question51'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question51'],
     },
     {
      title: 'National Monitoring on Citizen Science',
      namedQueries: ['Question98'],
      data: [],
      mapSeries: [],
      pieSeries: [],
      stats: ['Question98'],
     },
  ]
  constructor(private queryData: EoscReadinessDataService, private reportService: ReportCreationService) {}

  ngOnInit() {

    this.chartsCfg.forEach(chart => this.loadChart(chart));
  }

  loadChart(chart: Chart) {
    this.worldCharts = [];
    this.pieCharts = [];
    // map each key to its observable
    const calls = chart.namedQueries.map(q =>
      this.queryData.getQuestion(this.year, q)
    );

    // run them all in parallel
    forkJoin(calls).subscribe({
      next: results => {
        // results is an array in the same order as namedQueries
        chart.data = results;
        console.log(`Loaded ${chart.title}:`, results);
        chart.mapSeries = this.mapSeries(results); // Create map series
        results.forEach(result => {
          console.log('Pie input result:', result);
          chart.pieSeries.push(this.pieSeries(result));
        });

        if (chart.stats) {
          chart.stats.forEach((query, index) => {
            this.reportData[query] = this.countAnswer(chart.data[index]);
          });
        }
      },
      error: err => console.error(`Error loading ${chart.title}`, err)
    });
  }

  async generateReport() {
    try {
      console.log(`Processing ${this.worldCharts.length} charts...`);

      // Generate image buffers for all charts
      const chartImages: { [key: string]: ChartImageData } = {};
      const staticImages: { [key: string]: { path: string, width: number, height: number } } = {};

      // Process Highcharts
      for (let i = 0; i < this.worldCharts.length; i++) {
        const chart = this.worldCharts[i];
        console.log(`Converting chart ${i + 1} to image buffer...`);

        const imageBuffer = await this.chartToArrayBuffer(chart, 400, 300);
        chartImages[`chartImage${i + 1}`] = {
          buffer: imageBuffer,
          width: 400,
          height: 300,
          title: `Chart ${i + 1}`
        };
      }

      // Process Pie Charts
      for (let i = 0; i < this.pieCharts.length; i++) {
        if (!this.pieCharts[i]) continue; // Skip if no pie charts for this index

        for (let j = 0; j < this.pieCharts[i].length; j++) {
          const pieChart = this.pieCharts[i][j];
          if (!pieChart) continue; // Skip if no pie chart at this index

          console.log(`Exporting pie chart [${i}, ${j}]...`);
          console.log(pieChart);
          const buffer = await this.chartToArrayBuffer(pieChart, 400, 300);
          chartImages[`pieChartImage_${i}_${j}`] = {
            buffer: buffer,
            width: 400,
            height: 300,
            title: `Pie Chart [${i + 1}, ${j + 1}]`
          };
        }
      }

      // Add static images if needed
      staticImages['logoImage'] = { path: 'assets/images/2-2.png', width: 200, height: 300 };

      // Export document with both chart images and static images
      await this.reportService.exportDocWithMultipleImages(this.reportData, chartImages, staticImages);

      console.log('Report generated successfully!');

    } catch (error) {
      console.error('Error generating report:', error);
    }
  }

  // Convert Highcharts instance to ArrayBuffer
  private async chartToArrayBuffer(chart: Highcharts.Chart, width: number, height: number): Promise<ArrayBuffer> {
    try {
      // Get SVG from Highcharts
      const svgString = chart.getSVG({
        // chart: {
        //   backgroundColor: '#ffffff'
        // }
      });

      // Convert SVG to ArrayBuffer using the service helper
      return await this.reportService.svgToArrayBuffer(svgString, width, height);
    } catch (error) {
      console.error('Error converting chart to ArrayBuffer:', error);
      throw error;
    }
  }

  // Handle multiple charts from child components
  onChildChartReady(chart: Highcharts.Chart, chartIndex: number) {
    console.log(`Chart ${chartIndex + 1} ready`);
    if (this.worldCharts[chartIndex]) // Skip if the chart already exists
      return;

    this.worldCharts[chartIndex] = chart;
    // this.chartCounter++;

    // Optional: Add unique identifiers or metadata
    // (chart as any).customId = `chart_${chartIndex + 1}`;
    // (chart as any).customTitle = `World Map ${chartIndex + 1}`;
  }

  // Handle multiple charts from child components
  onPieChartReady(chart: Highcharts.Chart, i: number, j: number) {
    console.log(`Pie Chart ready - chart group ${i}, pie ${j}`);
    if (!this.pieCharts[i]) {
      this.pieCharts[i] = [];
    }

    this.pieCharts[i][j] = chart;
  }

  // Generate individual chart image (useful for testing)
  async downloadSingleChart(chartIndex: number) {
    if (this.worldCharts[chartIndex]) {
      try {
        const imageBuffer = await this.chartToArrayBuffer(this.worldCharts[chartIndex], 800, 600);

        // Create a download link for testing
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chart_${chartIndex + 1}.png`;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`Chart ${chartIndex + 1} downloaded successfully`);
      } catch (error) {
        console.error(`Error downloading chart ${chartIndex + 1}:`, error);
      }
    }
  }

  pieSeries(data: RawData) {

    let yesCount = 0;
    let noCount = 0;

  data.datasets[0].series.result.forEach(entry => {
    console.log('Row:', entry.row);
    if (entry.row[1] === 'Yes') yesCount++;
    else if (entry.row[1] === 'No') noCount++;
  });

    let series: SeriesPieOptions[] = [
      {
        name: 'Policy',
        type: 'pie',
        data: [
          {
            name: 'Has policy',
            y: yesCount,
            color: '#137CBD'
          },
          {
            name: 'Does not have policy',
            y: noCount,
            color: '#EC7A1C'
          }
        ]
      }
    ];

    return series;
  }

  mapSeries(data: RawData[]) {

    let series = [];
    const mapLegendSeries = [
      {
        type: 'map',
        name: 'Has national policy',
        color: '#2A9D8F',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from map but show in legend
      },
      {
        type: 'map',
        name: 'Does not have national policy',
        color: '#E76F51',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from map but show in legend
      },
      {
        type: 'map',
        name: 'Awaiting data',
        color: '#A9A9A9',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from map but show in legend
      }
    ];

    if (data.length >= 1) {
      const tmpSeries: CustomSeriesMapOptions = {
        type: 'map',
        name: 'Countries',
        allAreas: true,
        data: [],
        showInLegend: false,
      }

      let flag1 = false;
      let flag2 = false;
      let flag3 = false;
      data[0].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes') {
          tmpSeries.data.push({code: element.row[0], value: 0});
          flag1 = true;
        }
        else if (element.row[1] === 'No') {
          tmpSeries.data.push({code: element.row[0], value: 1});
          flag2 = true;
        }
        else {
          tmpSeries.data.push({code: element.row[0], value: 2});
          flag3 = true;
        }
      });

      // Filter out legend series that aren't needed
      const activeLegendSeries = [];
      if (flag1) activeLegendSeries.push(mapLegendSeries[0]);
      if (flag2) activeLegendSeries.push(mapLegendSeries[1]);
      if (flag3) activeLegendSeries.push(mapLegendSeries[2]);

      series.push(...activeLegendSeries);

      series.push(tmpSeries);
    }

    if (data.length === 2) {

      const tmpMandatorySeries: SeriesMappointOptions = {
        type: 'mappoint',
        name: 'Mandatory',
        marker: {
          symbol: 'circle',
        },
        dataLabels: {
          enabled: false,
        },
        color: '#7CFC00',
        data: [],
        showInLegend: true
      }

      const tmpNotMandatorySeries: SeriesMappointOptions = {
        type: 'mappoint',
        name: 'Not Mandatory',
        marker: {
          symbol: 'diamond',
        },
        dataLabels: {
          enabled: false,
        },
        color: '#FFEF00',
        data: [],
        showInLegend: true
      }

      // console.log(data[1].datasets[0].series.result);
      data[1].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes')
          tmpMandatorySeries.data.push({name: element.row[0], lat: latlong.get(element.row[0]).latitude, lon: latlong.get(element.row[0]).longitude});
        else if (element.row[1] === 'No')
          tmpNotMandatorySeries.data.push({name: element.row[0], lat: latlong.get(element.row[0]).latitude, lon: latlong.get(element.row[0]).longitude});
      });

      if (tmpMandatorySeries.data.length)
        series.push(tmpMandatorySeries);
      if (tmpNotMandatorySeries.data.length)
        series.push(tmpNotMandatorySeries);
    }

    // console.log(series);

    return series;
  }

  countAnswer(data: RawData) {
    console.log(data);
    let count = 0;
    let total = 0;
    let percentage: number;
    data.datasets[0].series.result.forEach(element => {
      if (element.row[1] !== null && element.row[1].trim() !== '')
        total++;

      if (element.row[1] === 'Yes')
        count++;
    });
    percentage = Math.round((count / total + Number.EPSILON) * 100);

    return `${percentage}% (${count}/${total})`
  }

}
