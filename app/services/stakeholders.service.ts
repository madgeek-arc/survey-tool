import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Paging } from "../../catalogue-ui/domain/paging";
import { Stakeholder, GroupMembers, Coordinator } from "../domain/userInfo";
import { URLParameter } from "../domain/url-parameter";


const headerOptions = {
  headers: new HttpHeaders().set('Content-Type', 'application/json')
    .set('Accept', 'application/json'),
};

@Injectable()
export class StakeholdersService {

  base: string = environment.API_ENDPOINT;

  constructor(private httpClient: HttpClient) {}

  public getEOSCSBCountries() {
    return this.httpClient.get<string[]>(this.base + `/stakeholders/countries?type=eosc-sb`, headerOptions);
  }

  getStakeholder(id: string) {
    return this.httpClient.get<Stakeholder>(this.base + `/stakeholders/${id}`);
  }

  getStakeholdersByType(type: string, urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    searchQuery = searchQuery.append('type', type);

    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }

    return this.httpClient.get<Paging<Stakeholder>>(this.base + '/stakeholders', {params: searchQuery});

  }

  postStakeholder(stakeholder: Stakeholder) {
    return this.httpClient.post(this.base + '/stakeholders', stakeholder, {withCredentials: true});
  }

  putStakeholder(stakeholder: Stakeholder) {
    return this.httpClient.put(this.base + `/stakeholders/${stakeholder.id}`, stakeholder, {withCredentials: true});
  }

  getStakeholderMembers(id: string) {
    return this.httpClient.get<GroupMembers>(this.base + `/stakeholders/${id}/users`);
  }

  /** Coordinators **/

  getCoordinatorById(id: string) {
    return this.httpClient.get<Coordinator>(this.base + `/coordinators/${id}`);
  }

}
