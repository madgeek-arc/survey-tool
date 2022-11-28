import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RawData } from "../domain/raw-data";


const headerOptions = {
  headers : new HttpHeaders().set('Content-Type', 'application/json')
    .set('Accept', 'application/json'),
};

@Injectable ()
export class StakeholdersService {

  base = environment.API_ENDPOINT;

  constructor(private httpClient: HttpClient) {}

  public getEOSCSBCountries() {
    return this.httpClient.get<string[]>(this.base + `/stakeholders/countries?type=country`, headerOptions);
  }
}
