import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {ResourcePermission, SurveyAnswer, SurveyInfo} from "../domain/survey";
import {Paging} from "../../catalogue-ui/domain/paging";
import {StakeholdersMembers} from "../domain/userInfo";
import {URLParameter} from "../../catalogue-ui/domain/url-parameter";
import {Model} from "../../catalogue-ui/domain/dynamic-form-model";

@Injectable()
export class SurveyService {

  options = {withCredentials: true};
  base = environment.API_ENDPOINT;

  constructor(public http: HttpClient) {}

  getLatestAnswer(stakeHolderId: string, surveyId: string) {
    return this.http.get<SurveyAnswer>(this.base + `/answers/latest?stakeholderId=${stakeHolderId}&surveyId=${surveyId}`, this.options);
  }

  changeAnswerValidStatus(answerId: string, valid: boolean) {
    return this.http.patch<SurveyAnswer>(this.base + `/answers/${answerId}/validation?validated=${valid}`, null, this.options);
  }

  getSurveys(type: string, id: string) {
    let params = new HttpParams();
    params = params.append(type, id);
    return this.http.get<Paging<Model>>(this.base + `/surveys`, {params});
  }

  getSurvey(surveyId: string) {
    return this.http.get<Model>(this.base + `/surveys/${surveyId}`);
  }

  getPermissions(resourceIds: string[]) {
    return this.http.get<ResourcePermission[]>(this.base + `/permissions?resourceIds=${resourceIds}`);
  }

  getAnswer(answerId: string) {
    return this.http.get<SurveyAnswer>(this.base + `/answers/${answerId}`, this.options);
  }

  addContributor(stakeholderId: string, email: string) {
    return this.http.post<StakeholdersMembers>(this.base + `/stakeholders/${stakeholderId}/contributors`, email, this.options);
  }

  getInvitationToken(inviteeEmail: string, inviteeRole: string, stakeholder: string) {
    return this.http.get(this.base + `/invitation?inviteeEmail=${inviteeEmail}&inviteeRole=${inviteeRole}&stakeholder=${stakeholder}`, { responseType: 'text'});
  }

  acceptInvitation(token: string) {
    return this.http.get(this.base + `/invitation/accept?invitationToken=${token}`);
  }

  removeContributor(stakeholderId: string, email: string) {
    return this.http.delete<StakeholdersMembers>(this.base + `/stakeholders/${stakeholderId}/contributors/${email}`, this.options);
  }

  getSurveyEntries(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    searchQuery.delete('to');

    return this.http.get<Paging<SurveyInfo>>(this.base + `/answers/info`, {params: searchQuery});
  }

  exportToCsv(surveyId: string) {
    // return this.http.get(this.base + `/csv/export/answers/${surveyId}`, { responseType: 'text'});
    window.open(this.base + `/csv/export/answers/${surveyId}`, '_blank');
  }

}
