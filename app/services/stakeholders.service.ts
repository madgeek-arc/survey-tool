import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Paging } from "../../catalogue-ui/domain/paging";
import {Stakeholder, GroupMembers, Coordinator, Administrator, User} from "../domain/userInfo";
import { URLParameter } from "../domain/url-parameter";
import {Observable} from "rxjs";


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

  getStakeholderManagersPublic(id: string) {
    return this.httpClient.get<User[]>(this.base + `/stakeholders/${id}/managers/public`);
  }

  /** Coordinators **/

  getCoordinatorById(id: string) {
    return this.httpClient.get<Coordinator>(this.base + `/coordinators/${id}`);
  }

  getCoordinators(coordinatorType: string): Observable<Paging<Coordinator>> {
    let params = new HttpParams().set('type', coordinatorType);

    const apiUrl = this.base + `/coordinators`;
    return this.httpClient.get<Paging<Coordinator>>(apiUrl, {params: params});
  }

  removeCoordinatorMember(coordinatorId: string, memberId: string): Observable<any> {
    return this.httpClient.delete(this.base + `/coordinators/${coordinatorId}/members/${memberId}`);
  }

  addCoordinatorMember(coordinatorId: string, email: string) {
    return this.httpClient.post(this.base + `/coordinators/${coordinatorId}/members`, email)
  }

  getCoordinatorUsers(id: string) {
    return this.httpClient.get<GroupMembers>(this.base + `/coordinators/${id}/users`);
  }

  postCoordinator(coordinator: Coordinator) {
    return this.httpClient.post<Coordinator>(this.base + `/coordinators`,coordinator, {withCredentials: true});
  }

  putCoordinator(coordinator: Coordinator) {
    return this.httpClient.put<Coordinator>(this.base + `/coordinators/${coordinator.id}`,coordinator, {withCredentials: true});
  }

  deleteCoordinator(coordinatorId: string) {
    return this.httpClient.delete(this.base + `/coordinators/${coordinatorId}`);
  }
  /** Administrators **/

  getAdministratorById(id: string) {
    return this.httpClient.get<Administrator>(this.base + `/administrators/${id}`);
  }

  getAdministrators(id: string) {
    return this.httpClient.get<Administrator>(this.base + `/administrators/${id}`);
  }

  postStakeholderAdmin(administratorId: string) {
    return this.httpClient.post<Administrator>(this.base + `/administrators/`, administratorId, {withCredentials: true});
  }

  putStakeholderAdmin(administrator: Administrator) {
    return this.httpClient.put<Administrator>(this.base + `/administrators/${administrator.id}`, administrator, {withCredentials: true});
  }
}
