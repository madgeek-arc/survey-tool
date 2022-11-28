import { Component, Input, OnChanges } from '@angular/core';
import { CountryTableData } from "../../domain/country-table-data";


@Component({
  selector: 'app-countries-table',
  templateUrl: './countries-table.component.html',
})

export class CountriesTableComponent implements OnChanges {

  @Input() countries: CountryTableData[];
  @Input() entity: string;
  @Input() tableType: string;

  isSortedBy: string;
  isDescending: boolean = true;

  constructor() {}

  ngOnChanges() {
    this.countries.sort((a, b) => (a['name'] > b['name']) ? 1 : -1);
    // console.log('countries ->', this.countries);
  }

  sortBy(field: string) {

    console.log('Sort clicked, field: ', field);

    if (field === this.isSortedBy) {
      this.isDescending = !this.isDescending;
    } else {
      this.isDescending = true;
    }

    this.isSortedBy = field;

    if (field === 'oaSharePublicationsAffiliatedPeerReviewed' || field === 'oaSharePublicationsAffiliated'
      || field === 'oaSharePublicationsDepositedPeerReviewed' || field === 'oaSharePublicationsDeposited') {

      console.log('sorting number');
      if (this.isDescending) {
        this.countries.sort((a, b) => b[field] - a[field]);
      } else {
        this.countries.sort((a, b) => a[field] - b[field]);
      }
    } else if (field !== 'country') {

      console.log('sorting string');
      if (this.isDescending) {
        this.countries.sort((a, b) => (a[field] < b[field]) ? 1 : -1);
      } else {
        this.countries.sort((a, b) => (a[field] > b[field]) ? 1 : -1);
      }
    } else {

      console.log('sorting country');
      if (this.isDescending) {
        this.countries.sort((a, b) => (a['name'] < b['name']) ? 1 : -1);
      } else {
        this.countries.sort((a, b) => (a['name'] > b['name']) ? 1 : -1);
      }
    }

    // console.log('Sort clicked!!');
    //
    // if (field === this.isSortedBy) {
    //   this.isDescending = !this.isDescending;
    // } else {
    //   this.isDescending = true;
    // }
    //
    // this.isSortedBy = field;
    //
    // //number sort
    // // if (field !== 'country') {
    // //   if (this.isDescending) {
    // //     this.countries.sort((a, b) => b[field] - a[field]);
    // //   } else {
    // //     this.countries.sort((a, b) => a[field] - b[field]);
    // //   }
    // // } else {
    // //   if (this.isDescending) {
    // //     this.countries.sort((a, b) => (a['name'] < b['name']) ? 1 : -1);
    // //   } else {
    // //     this.countries.sort((a, b) => (a['name'] > b['name']) ? 1 : -1);
    // //   }
    // // }
    //
    // if (this.isDescending) {
    //   this.countries.sort((a, b) => (a[field] < b[field]) ? 1 : -1);
    // } else {
    //   this.countries.sort((a, b) => (a[field] > b[field]) ? 1 : -1);
    // }

  }
}
