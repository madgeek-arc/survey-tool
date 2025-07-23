import { AfterViewInit, Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ReportCreationService } from "../../../services/report-creation.service";
import { ChartsModule } from "../../../../../app/shared/charts/charts.module";
import { zip } from "rxjs/internal/observable/zip";
import { EoscReadinessDataService } from "../../../../../app/pages/services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../services/stakeholders.service";
import { WorldMapComponent } from "../../../../../app/shared/charts/world-map/world-map.component";

interface Chart {
  title: string;
  namedQueries: string[];
  data: any[];
  type: string;
  order: number;
}

@Component({
  selector: 'app-report-creation',
  standalone: true,
  imports: [
    RouterLink,
    ChartsModule,
    WorldMapComponent
  ],
  providers: [StakeholdersService],
  templateUrl: './report-creation.component.html'
})

export class ReportCreationComponent implements OnInit, AfterViewInit {
  private worldChart!: Highcharts.Chart;

  year = '2023';
  countriesArray: string[] = [];

  reportCfg: {
    charts: Chart[];
  } = {
    charts: [
      {
        title: 'Participating countries',
        namedQueries: ['Question22','Question22.1'],
        data: [],
        type: 'map',
        order: 1
      },
    ]
  }

  data: object = {
    Question22: '33%',
    'Question22.1': 12 + ' %',
    chartImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==",
  }

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService,
              private reportService: ReportCreationService) {}

  ngOnInit() {
    this.data['Question22.1'] = 12 + ' %'
    // this.data['chartImage'] = "data:image/svg;base64,PHN2ZyBoZWlnaHQ9IjEwMCIgd2lkdGg9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0icmVkIi8+PC9zdmc+IA=="
    // this.data['chartImage'] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg=="

  }


  ngAfterViewInit() {
    setTimeout( ()=> {
      this.downloadMap();

      // this.data['chartImage'] = (this.worldChart as any).createCanvas().toDataURL('image/png');
      this.reportService.exportDoc().then(res => {});
    },2000);
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion(this.year, 'Question22'),
      this.queryData.getQuestion(this.year, 'Question22.1'),
      // this.queryData.getQuestionComment(this.year, 'Question22'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        // this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        // this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        // this.participatingCountries[2] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        // this.participatingCountriesPercentage[2] = Math.round((this.participatingCountries[2]/this.countriesArray.length + Number.EPSILON) * 100);
        // for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
        //   this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        // }
        // this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        // // this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[3]);
        // this.createMapDataFromCategorizationWithDots(1,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  onChildChartReady(chart: Highcharts.Chart) {
    this.worldChart = chart;
  }

  downloadMap() {
    if (!this.worldChart) { return; }
    // Option A: use built‑in exporting
    // const tmpImg = this.worldChart.getSVG();
    // const tmpImg = this.worldChart.exportChartLocal({ type: 'image/png' });
    // console.log(tmpImg);
    // Option B: create a dataURL yourself
    // const canvas = (this.worldChart as any).createCanvas();
    // const dataURL = canvas.toDataURL('image/png');
  }
}
