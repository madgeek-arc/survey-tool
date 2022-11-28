import {Component, OnInit} from "@angular/core";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {zip} from "rxjs/internal/observable/zip";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {mapSubtitles} from "../../../domain/mapSubtitles";
import {ActivatedRoute} from "@angular/router";
import UIkit from "uikit";

@Component({
  selector: 'app-policies',
  templateUrl: './practices.component.html'
})

export class PracticesComponent implements OnInit {

  questionsDataArray: CategorizedAreaData[] = [];
  tmpQuestionsDataArray: CategorizedAreaData[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = mapSubtitles;
  countriesArray: string[] = [];

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private route: ActivatedRoute, private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      queryParams => {
        if (queryParams['chart'])
          UIkit.switcher('#practices-tabs').show(queryParams['chart']);
        else
          UIkit.switcher('#practices-tabs').show(0);
      }
    );
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion18(),
      this.dataService.getQuestion19(),
      this.dataService.getUseCasesAndPracticesByDimension(),
      this.dataService.getMandatedStatus()).subscribe(
      rawData => {
        this.countriesArray = rawData[0];
        this.tableAbsoluteDataArray[16] = this.dataHandlerService.convertRawDataToTableData(rawData[1]);
        this.createMapDataset(0, 16);
        this.tableAbsoluteDataArray[17] = this.dataHandlerService.convertRawDataToTableData(rawData[2]);
        this.createMapDataset(0, 17);
        this.tableAbsoluteDataArray[18] = this.dataHandlerService.convertRawDataToTableData(rawData[3]);
        this.createMapDataset(0, 18);
        this.tableAbsoluteDataArray[15] = this.dataHandlerService.convertRawDataToTableData(rawData[4]);
        this.tmpQuestionsDataArray[15] = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData[4]);
        for (let i = 0; i < this.tmpQuestionsDataArray[15].series.length; i++) {
          this.tmpQuestionsDataArray[15].series[i].data = this.tmpQuestionsDataArray[15].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(0,15);
      },
      error => {
        console.log(error);
      }
    );
  }

  createMapDataset(index: number, mapCount: number) {
    this.mapSubtitles[mapCount] = mapSubtitles[mapCount][index];

    this.questionsDataArray[mapCount] = new CategorizedAreaData();
    this.questionsDataArray[mapCount].series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteDataArray[mapCount].length; i++) {
      if (this.tableAbsoluteDataArray[mapCount][i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteDataArray[mapCount][i].code);
      }
    }
    this.questionsDataArray[mapCount].series[0].data = countryCodeArray;

    this.questionsDataArray[mapCount].series[1] = new Series('No Policy', false);
    this.questionsDataArray[mapCount].series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < this.questionsDataArray[mapCount].series.length; i++) {
      this.questionsDataArray[mapCount].series[i].data = this.questionsDataArray[mapCount].series[i].data.map(code => ({ code }));
    }

  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    this.mapSubtitles[mapCount] = mapSubtitles[mapCount][index];

    this.questionsDataArray[mapCount] = new CategorizedAreaData();

    this.questionsDataArray[mapCount].series[0] = new Series(this.mapSubtitles[mapCount], false);
    for (let i = 0; i < this.tmpQuestionsDataArray[mapCount].series.length; i++) {
      if (this.tmpQuestionsDataArray[mapCount].series[i].name === this.mapSubtitles[mapCount]){
        this.questionsDataArray[mapCount].series[0].data = this.tmpQuestionsDataArray[mapCount].series[i].data;
        break;
      }
    }
    let countryCodeArray = [];
    for (const data of this.questionsDataArray[mapCount].series[0].data) {
      countryCodeArray.push(data.code)
    }

    this.questionsDataArray[mapCount].series[1] = new Series('Other', false);
    this.questionsDataArray[mapCount].series[1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[mapCount].series[1].data = this.questionsDataArray[mapCount].series[1].data.map(code => ({ code }));

  }

}
