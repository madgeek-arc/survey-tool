import {Component, OnInit} from "@angular/core";
import {CountryTableData} from "../../../domain/country-table-data";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {latlong} from "../../../domain/countries-lat-lon";
import {zip} from "rxjs";

@Component({
  selector: 'app-ncte-policies',
  templateUrl: './ncte-policies.component.html'
})

export class NCTEPoliciesComponent implements OnInit{

  tableAbsoluteData: CountryTableData[];
  mapPointData: CountryTableData[];
  question3: CountryTableData[];
  question12: CountryTableData[];
  question14: CountryTableData[];
  countryCodeArray: CategorizedAreaData = null;
  mapSubtitle: string = null;
  loadingAbsoluteTable: boolean = true;
  countriesArray: string[] = [];

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private stakeholdersService: StakeholdersService) {}

  ngOnInit() {
    this.loadingAbsoluteTable = true;
    zip(
      this.dataService.getEOSCRelevantPolicies(),
      this.dataService.getUseCasesAndPracticesByDimension(),
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion5(),
      this.dataService.getQuestion14(),
      this.dataService.getQuestion16()).subscribe(
        next => {
          this.tableAbsoluteData = this.dataHandlerService.convertRawDataToTableData(next[0]);
          this.loadingAbsoluteTable = false;
          this.mapPointData = this.dataHandlerService.convertRawDataToTableData(next[1]);
          this.countriesArray = next[2];
          this.question3 = this.dataHandlerService.convertRawDataToMapPoint(next[3]);
          this.question12 = this.dataHandlerService.convertRawDataToMapPoint(next[4]);
          this.question14 = this.dataHandlerService.convertRawDataToMapPoint(next[5]);
        },
      error => {},
      () => {
        this.createMapDataset(0);
      }
    );
  }

  createMapDataset(index: number) {

    this.createMapSubtitle(index);

    this.countryCodeArray = new CategorizedAreaData();
    this.countryCodeArray.series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteData.length; i++) {
      if (this.tableAbsoluteData[i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteData[i].code);
      }
    }
    this.countryCodeArray.series[0].data = countryCodeArray;

    this.countryCodeArray.series[1] = new Series('No Policy', false);
    this.countryCodeArray.series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < this.countryCodeArray.series.length; i++) {
      this.countryCodeArray.series[i].data = this.countryCodeArray.series[i].data.map(code => ({ code }));
    }

    if (index > 2) {
      let mapPointArray = [];
      for (let i = 0; i < this.mapPointData.length; i++) {
        if (this.mapPointData[i].mapPointData[index] === 'true') {
          mapPointArray.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
        }
      }
      const pos = this.countryCodeArray.series.length
      this.countryCodeArray.series[pos] = new Series('Countries with use cases and best practices relevant to the policy', false, 'mappoint');
      this.countryCodeArray.series[pos].data = mapPointArray;
      this.countryCodeArray.series[pos].color = '#7CFC00';
      this.countryCodeArray.series[pos].marker.symbol = 'circle';
      this.countryCodeArray.series[pos].showInLegend = true;
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

      const pos = this.countryCodeArray.series.length
      this.countryCodeArray.series[pos] = new Series('Countries with financial strategies linked to the policy', false, 'mappoint');
      this.countryCodeArray.series[pos].data = mapPointArray;
      this.countryCodeArray.series[pos].color = '#FFEF00';
      this.countryCodeArray.series[pos].marker.symbol = 'diamond';
      this.countryCodeArray.series[pos].showInLegend = true;
    }

        // console.log(this.countryCodeArray);

  }

  createMapSubtitle(index: number) {
    switch (index) {
      case 0:
        this.mapSubtitle = 'There are one or more policies relevant for the EOSC in place';
        break;
      case 1:
        this.mapSubtitle = 'Policy in planning';
        break;
      case 2:
        this.mapSubtitle = 'One or more of the open science policies explicitly mentions EOSC';
        break;
      case 3:
        this.mapSubtitle = 'Policy addresses Open access to data, data management and/or FAIR';
        break;
      case 4:
        this.mapSubtitle = 'Policy addresses FAIRisation of data';
        break;
      case 5:
        this.mapSubtitle = 'Policy addresses Open access to software';
        break;
      case 6:
        this.mapSubtitle = 'Policy addresses Preservation and reuse of scientific information';
        break;
      case 7:
        this.mapSubtitle = 'Policy addresses Infrastructures that include aspects of open science';
        break;
      case 8:
        this.mapSubtitle = 'Policy addresses Skills and competencies';
        break;
      case 9:
        this.mapSubtitle = 'Policy addresses Incentives and rewards';
        break;
      case 10:
        this.mapSubtitle = 'Policy addresses Citizen science';
        break;
      case 11:
        this.mapSubtitle = 'Other';
        break;
    }
  }

}
