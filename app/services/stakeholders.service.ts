import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RawData } from "../domain/raw-data";
import {Stakeholder} from "../domain/userInfo";
import {Paging} from "../../catalogue-ui/domain/paging";


const headerOptions = {
  headers : new HttpHeaders().set('Content-Type', 'application/json')
    .set('Accept', 'application/json'),
};

@Injectable ()
export class StakeholdersService {

  base: string = environment.API_ENDPOINT;

  constructor(private httpClient: HttpClient) {}

  public getEOSCSBCountries() {
    return this.httpClient.get<string[]>(this.base + `/stakeholders/countries?type=country`, headerOptions);
  }

  getStakeholdersByType(type: string) {
    let searchQuery = new HttpParams();
    searchQuery = searchQuery.append('type', type);

    return this.httpClient.get<Paging<Stakeholder>>(this.base + '/stakeholders', {params: searchQuery});
  }
}
