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
export class DataService {

  private statsAPIURL = environment.STATS_API_ENDPOINT + 'raw?json=';
  private profileName = environment.profileName;
  private OSOStatsAPIURL = environment.OSO_STATS_API_ENDPOINT + 'raw?json=';
  private osoProfileName = environment.osoStatsProfileName;

  constructor(private httpClient: HttpClient) {}

  public getFinancialContrToEOSCLinkedToPolicies(): Observable<RawData> {
    const financialContrToEOSCLinkedToPoliciesQuery = `{"series":[{"query":{"name":"eosc.obs.question5","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(financialContrToEOSCLinkedToPoliciesQuery), headerOptions);
  }

  public getMandatedStatus(): Observable<RawData> {
    const mandatedStatusQuery = `{"series":[{"query":{"name":"eosc.obs.question17","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(mandatedStatusQuery), headerOptions);
  }


  public getFundingForEOSCSums(): Observable<RawData> {
    const totalFundingForEOSCQuery = `{"series":[{"query":{"name":"eosc.obs.question6.sum","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question7.sum","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question8.sum","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(totalFundingForEOSCQuery), headerOptions);
  }

  public getFundingForEOSC(): Observable<RawData> {
    const totalFundingForEOSCQuery = `{"series":[{"query":{"name":"eosc.obs.question6","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question7","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question8","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question11","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question12","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question13","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(totalFundingForEOSCQuery), headerOptions);
  }

  public getFundingForEOSCBubbleSeries(): Observable<RawData> {
    const totalFundingForEOSCQuery = `{"series":[{"query":{"name":"eosc.obs.question11","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question12","profile":"${this.profileName}"}},{"query":{"name":"eosc.obs.question13","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(totalFundingForEOSCQuery), headerOptions);
  }

  public getEOSCRelevantPolicies(): Observable<RawData> {
    const EOSCRelevantPoliciesQuery = `{"series":[{"query":{"name":"eosc.obs.question3","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(EOSCRelevantPoliciesQuery), headerOptions);
  }

  public getUseCasesAndPracticesByDimension(): Observable<RawData> {
    const UseCasesAndPracticesByDimension = `{"series":[{"query":{"name":"eosc.obs.question20","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(UseCasesAndPracticesByDimension), headerOptions);
  }

  public getOAPublicationPerCountry(): Observable<RawData> {
    const OAPublicationsPerCountryQuery = `{"series":[{"query":{"name":"oso.results.oa_percentage.affiliated.peer_reviewed.bycountry","parameters":["publication"],"profile":"${this.osoProfileName}"}},{"query":{"name":"oso.results.oa_percentage.bycountry","parameters":["publication"],"profile":"${this.osoProfileName}"}},{"query":{"name":"oso.results.oa_percentage.deposited.peer_reviewed.bycountry","parameters":["publication"],"profile":"${this.osoProfileName}"}},{"query":{"name":"oso.results.oa_percentage.deposited.bycountry","parameters":["publication"],"profile":"${this.osoProfileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.OSOStatsAPIURL + encodeURIComponent(OAPublicationsPerCountryQuery), headerOptions);
  }

  public getQuestion19(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question19","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }
  public getQuestion18(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question18","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }
  public getQuestion17(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question17","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }
  public getQuestion16(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question16","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion15(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question15","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion14(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question14","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion13(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question13","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion12(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question12","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion11(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question11","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

public getQuestion10(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question10","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion9(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question9","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion8(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question8","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion7(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question7","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion6(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question6","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion5(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question5","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion4(): Observable<RawData> {
    const query = `{"series":[{"query":{"name":"eosc.obs.question4","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }
}
