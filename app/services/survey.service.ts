import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  DisplayHistory,
  ResourcePermission,
  SurveyAnswer,
  SurveyAnswerPublicMetadata,
  SurveyInfo,
  SurveyNotifications
} from "../domain/survey";
import { Paging } from "../../catalogue-ui/domain/paging";
import { GroupMembers } from "../domain/userInfo";
import { URLParameter } from "../domain/url-parameter";
import { Model } from "../../catalogue-ui/domain/dynamic-form-model";

@Injectable()
export class SurveyService {

  options = {withCredentials: true};
  base = environment.API_ENDPOINT;

  constructor(public http: HttpClient) {
  }

  getLatestAnswer(stakeHolderId: string, surveyId: string) {
    return this.http.get<SurveyAnswer>(this.base + `/answers/latest?stakeholderId=${stakeHolderId}&surveyId=${surveyId}`, this.options);
  }

  putAnswer(surveyAnswer: object, id: string) {
    return this.http.put<SurveyAnswer>(this.base + `/answers/${id}/answer`, surveyAnswer, this.options);
  }

  getAnswerWithVersion(surveyAnswerId: string, version: string) {
    return this.http.get<SurveyAnswer>(this.base + `/answers/${surveyAnswerId}/versions/${version}`, this.options);
  }

  restoreToVersion(surveyAnswerId: string, versionId: string) {
    return this.http.put<SurveyAnswer>(this.base + `/answers/${surveyAnswerId}/versions/${versionId}/restore`, this.options);
  }

  changeAnswerValidStatus(answerId: string, valid: boolean) {
    return this.http.patch<SurveyAnswer>(this.base + `/answers/${answerId}/validation?validated=${valid}`, null, this.options);
  }

  importSurveyAnswer(answerId: string, modelId: string) {
    return this.http.put(this.base + `/answers/${answerId}/import/${modelId}`, {});
  }

  getSurveys(type: string, id: string) {
    let params = new HttpParams();
    params = params.append(type, id);
    params = params.append('order', 'desc');
    params = params.append('sort', 'creationDate');
    return this.http.get<Paging<Model>>(this.base + `/surveys`, {params});
  }

  getSurvey(surveyId: string) {
    return this.http.get<Model>(this.base + `/surveys/${surveyId}`);
  }

  getSurveyValidatedCountries(surveyId: string) {
    return this.http.get<string[]>(this.base + `/surveys/${surveyId}/answers/validated`);
  }

  getPermissions(resourceIds: string[]) {
    return this.http.get<ResourcePermission[]>(this.base + `/permissions?resourceIds=${resourceIds}`);
  }

  getAnswer(answerId: string) {
    return this.http.get<SurveyAnswer>(this.base + `/answers/${answerId}`, this.options);
  }

  getAnswerHistory(answerId: string) {
    return this.http.get<DisplayHistory>(this.base + `/answers/${answerId}/history`, this.options);
  }

  getInvitationToken(inviteeEmail: string, role: string, groupId: string, group: string = 'stakeholder') {
    return this.http.post<{ token: string, emailSent: boolean }>(this.base + `/invitation`, {inviteeEmail, role, group, groupId});
  }

  acceptInvitation(token: string) {
    return this.http.post<void>(this.base + `/invitation/accept`, {token});
  }

  removeManager(stakeholderId: string, email: string) {
    return this.http.delete<GroupMembers>(this.base + `/stakeholders/${stakeholderId}/managers/${email}`, this.options);
  }

  addGroupMember(groupType: string, groupId: string, email: string) {
    const path = groupType === 'stakeholder' ? 'contributors' : 'members';
    return this.http.post(this.base + `/${this.groupPath(groupType)}/${groupId}/${path}`, email, {headers: {'Content-Type': 'text/plain'}});
  }

  removeGroupMember(groupType: string, groupId: string, email: string) {
    const path = groupType === 'stakeholder' ? 'contributors' : 'members';
    return this.http.delete(this.base + `/${this.groupPath(groupType)}/${groupId}/${path}/${email}`, this.options);
  }

  private groupPath(groupType: string) {
    return groupType === 'administration' ? 'administrators' : groupType === 'coordinator' ? 'coordinators' : 'stakeholders';
  }

  removeContributor(stakeholderId: string, email: string) {
    return this.http.delete<GroupMembers>(this.base + `/stakeholders/${stakeholderId}/contributors/${email}`, this.options);
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

  getSurveyInfoByGroup(groupId: string) {
    return this.http.get<Paging<SurveyInfo>>(this.base + `/answers/info?groupId=${groupId}`, this.options);
  }

  exportToCsv(surveyId: string) {
    // return this.http.get(this.base + `/csv/export/answers/${surveyId}`, { responseType: 'text'});
    window.open(this.base + `/csv/export/answers/${surveyId}`, '_blank');
  }

  getPublicAnswer(stakeHolderId: string, surveyId: string) {
    return this.http.get<Object>(this.base + `/answers/public?stakeholderId=${stakeHolderId}&surveyId=${surveyId}`, this.options);
  }

  getPublicAnswerMetadata(stakeHolderId: string, surveyId: string) {
    return this.http.get<SurveyAnswerPublicMetadata>(this.base + `/answers/public/metadata?stakeholderId=${stakeHolderId}&surveyId=${surveyId}`, this.options);
  }

  addManagerToStakeholder(stakeholderId: string, email: string) {
    return this.http.post(this.base + `/stakeholders/${stakeholderId}/managers`, email);
  }

  generateAnswers(surveyId: string) {
    return this.http.post(this.base + `/answers/generate/${surveyId}`, {}, this.options);
  }

  updateSurvey(id: string, model: Model) {
    return this.http.put<Model>(this.base + `/surveys/${id}`, model, this.options);
  }

  getNotificationSettings(surveyType: string) {
    return this.http.get<SurveyNotifications>(this.base + `/surveys/types/${surveyType}/settings`);
  }

  upsertNotificationSettings(surveyType: string, settings: SurveyNotifications) {
    return this.http.put<SurveyNotifications>(this.base + `/surveys/types/${surveyType}/settings`, settings, this.options);
  }

}
