import {Component, OnInit} from "@angular/core";
import {DataService} from "../../../services/data.service";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {DataHandlerService} from "../../../services/data-handler.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {zip} from "rxjs/internal/observable/zip";
import {mapSubtitles} from "../../../domain/mapSubtitles";
import {latlong} from "../../../domain/countries-lat-lon";
import {FundingForEOSCSums} from "../../../domain/funding-for-eosc";

import {ActivatedRoute} from "@angular/router";
import UIkit from "uikit";

@Component({
  selector: 'app-policies',
  templateUrl: './policies.component.html'
})

export class PoliciesComponent implements OnInit{

  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapPointData: CountryTableData[];
  question3: CountryTableData[];
  question12: CountryTableData[];
  question14: CountryTableData[];
  countriesArray: string[] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = mapSubtitles;


  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private route: ActivatedRoute, private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      queryParams => {
        if (queryParams['chart'])
          UIkit.switcher('#policies-tabs').show(queryParams['chart']);
        else
          UIkit.switcher('#policies-tabs').show(0);
      }
    );
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion4(),
      this.dataService.getQuestion14(),
      this.dataService.getQuestion15(),
      this.dataService.getQuestion16()).subscribe(
      rawData => {
        this.countriesArray = rawData[0];
        this.tableAbsoluteDataArray[2] = this.dataHandlerService.convertRawDataToTableData(rawData[1]);
        this.createMapDataset(0, 2);
        this.tableAbsoluteDataArray[12] = this.dataHandlerService.convertRawDataToTableData(rawData[2]);
        this.createMapDataset(0, 12);
        this.tableAbsoluteDataArray[13] = this.dataHandlerService.convertRawDataToTableData(rawData[3]);
        this.createMapDataset(0, 13);
        this.tableAbsoluteDataArray[14] = this.dataHandlerService.convertRawDataToTableData(rawData[4]);
        this.createMapDataset(0, 14);
      },
      error => {
        console.log(error);
      }
    );
    zip(this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion5()).subscribe(
       rawData => {
          this.countriesArray = rawData[0];
          this.tableAbsoluteDataArray[3] = this.dataHandlerService.convertRawDataToTableData(rawData[1]);
          this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData[1]);
          for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
            this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
          }
          this.createMapDataFromCategorization(0,3);
          // this.questionsDataArray[4] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[1]);
          // this.questionsDataArray[5] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[2]);
          // this.questionsDataArray[6] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[3]);
          // this.questionsDataArray[9] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[4]);
          // this.questionsDataArray[10] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[5]);
          // this.questionsDataArray[11] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[6]);
        },
        error => {
          console.log(error);
        }
      );

    zip(
      this.dataService.getEOSCRelevantPolicies(),
      this.dataService.getUseCasesAndPracticesByDimension(),
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion5(),
      this.dataService.getQuestion14(),
      this.dataService.getQuestion16()).subscribe(
      next => {
        this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(next[0]);
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(next[1]);
        this.countriesArray = next[2];
        this.question3 = this.dataHandlerService.convertRawDataToMapPoint(next[3]);
        this.question12 = this.dataHandlerService.convertRawDataToMapPoint(next[4]);
        this.question14 = this.dataHandlerService.convertRawDataToMapPoint(next[5]);
      },
      error => {},
      () => {
        this.createComplexMapDataset(0, 1);
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

  createComplexMapDataset(index: number, mapCount: number) {

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

    if (index > 2) {
      let mapPointArray = [];
      for (let i = 0; i < this.mapPointData.length; i++) {
        if (this.mapPointData[i].mapPointData[index] === 'true') {
          mapPointArray.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
        }
      }
      const pos = this.questionsDataArray[mapCount].series.length
      this.questionsDataArray[mapCount].series[pos] = new Series('Countries with use cases and best practices relevant to the policy', false, 'mappoint');
      this.questionsDataArray[mapCount].series[pos].data = mapPointArray;
      this.questionsDataArray[mapCount].series[pos].color = '#7CFC00';
      this.questionsDataArray[mapCount].series[pos].marker.symbol = 'circle';
      this.questionsDataArray[mapCount].series[pos].showInLegend = true;
    }

    if (index === 0 || index === 4 || index === 7) {

      let mapPointArray = [];
      if (index === 0) {
        for (let i = 0; i < this.question3.length; i++) {
          mapPointArray.push({name: this.question3[i].code, lat: latlong.get(this.question3[i].code).latitude, lon: latlong.get(this.question3[i].code).longitude});
        }
      }

      if (index === 4) {
        for (let i = 0; i < this.question12.length; i++) {
          mapPointArray.push({name: this.question12[i].code, lat: latlong.get(this.question12[i].code).latitude, lon: latlong.get(this.question12[i].code).longitude});
        }
      }

      if (index === 7) {
        for (let i = 0; i < this.question14.length; i++) {
          mapPointArray.push({name: this.question14[i].code, lat: latlong.get(this.question14[i].code).latitude, lon: latlong.get(this.question14[i].code).longitude});
        }
      }

      const pos = this.questionsDataArray[mapCount].series.length
      this.questionsDataArray[mapCount].series[pos] = new Series('Countries with financial strategies linked to the policy', false, 'mappoint');
      this.questionsDataArray[mapCount].series[pos].data = mapPointArray;
      this.questionsDataArray[mapCount].series[pos].color = '#FFEF00';
      this.questionsDataArray[mapCount].series[pos].marker.symbol = 'diamond';
      this.questionsDataArray[mapCount].series[pos].showInLegend = true;
    }

    // console.log(this.countryCodeArray);

  }

}
