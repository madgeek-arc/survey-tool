import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AcceptedPrivacyPolicy} from "../domain/privacy-policy";


@Injectable()
export class PrivacyPolicyService  {

  base = environment.API_ENDPOINT;

  constructor(public http: HttpClient) {}

  hasAcceptedPolicy(type: string) {
    return this.http.get<AcceptedPrivacyPolicy>(this.base + `/privacy/policies/status?type=${type}`);
  }
}
