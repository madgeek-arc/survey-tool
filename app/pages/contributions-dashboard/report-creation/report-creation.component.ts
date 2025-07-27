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
import {latlong} from "../../../../../app/domain/countries-lat-lon";
import {NgForOf, NgIf} from "@angular/common";

interface Chart {
  title: string;
  namedQueries: string[];
  data: any[];
  series: any[];
  // type: string;
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
    NgForOf
  ],
  providers: [StakeholdersService],
  templateUrl: './report-creation.component.html'
})

export class ReportCreationComponent implements OnInit {
  worldCharts: Highcharts.Chart[] = [];

  year = '2023';

  reportCfg: {
    charts: Chart[];
  } = {
    charts: [
      {
        title: 'National policy on open access publications',
        namedQueries: ['Question6','Question6.1'],
        data: [],
        series: [],
        // type: 'mapWithPoints',
        // order: 1
      },
      {
        title: 'National policy on data management',
        namedQueries: ['Question10','Question10.1'],
        data: [],
        series: [],
        // type: 'mapWithPoints',
        // order: 2
      },
      {
        title: 'National policy on FAIR data',
        namedQueries: ['Question14','Question14.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on open data',
        namedQueries: ['Question18','Question18.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on open source software',
        namedQueries: ['Question22','Question22.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on offering services through EOSC',
        namedQueries: ['Question26','Question26.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on connecting repositories to EOSC',
        namedQueries: ['Question30','Question30.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on data stewardship',
        namedQueries: ['Question34','Question34.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on long-term data preservation ',
        namedQueries: ['Question38','Question38.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on shills/training for Open Science',
        namedQueries: ['Question42','Question42.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on incentives/rewards for Open Science',
        namedQueries: ['Question46','Question46.1'],
        data: [],
        series: [],
      },
      {
        title: 'National policy on citizen science',
        namedQueries: ['Question50','Question50.1'],
        data: [],
        series: [],
      },
      {
        title: 'Financial strategy on open access publications',
        namedQueries: ['Question7'],
        data: [],
        series: [],
      },
      {
        title: 'Financial strategy on data management',
        namedQueries: ['Question11'],
        data: [],
        series: [],
      }
    ]
  }

  constructor(private queryData: EoscReadinessDataService, private reportService: ReportCreationService) {}

  ngOnInit() {
    this.reportCfg.charts.forEach(chart => this.loadChart(chart));
  }

  loadChart(chart: Chart) {
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
        chart.series = this.mapSeries(results); // Create map series
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

      // Add static images if needed
      staticImages['logoImage'] = { path: 'assets/images/2-2.png', width: 200, height: 300 };

      // Prepare the data report
      const reportData = {
        "Question22": "33%",
        Question22_1: 12 + ' %',
        generatedDate: new Date().toLocaleDateString(),
        totalCharts: this.worldCharts.length
      };

      // Export document with both chart images and static images
      await this.reportService.exportDocWithMultipleImages(reportData, chartImages, staticImages);

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

}
