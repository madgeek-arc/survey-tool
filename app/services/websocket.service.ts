import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {BehaviorSubject} from "rxjs";
import {UserActivity} from "../domain/userInfo";

declare var SockJS;
declare var Stomp;

const URL = environment.WS_ENDPOINT + '/websocket';

@Injectable()
export class WebsocketService {

  stompClient;
  msg: BehaviorSubject<UserActivity[]> = new BehaviorSubject<UserActivity[]>(null);

  constructor() {
    // this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection(id: string, resourceType: string, action: string) {
    const ws = new SockJS(URL);
    this.stompClient = Stomp.over(ws);
    const that = this;

    this.stompClient.connect({}, function(frame) {
      console.log('Connected: ' + frame);
      that.stompClient.subscribe(`/topic/active-users/${resourceType}/${id}`, (message) => {
        if (message.body) {
          that.msg.next(JSON.parse(message.body));
        }
      });
      that.stompClient.send(`/app/join/${resourceType}/${id}`, {}, action);
      // that.stompClient.send(`/app/active-users/${resourceType}/${id}`, {}, action);

      // that.stompClient.subscribe(`/topic/listening`, (message) => {
      //   // console.log(message);
      //   if (message.body) {
      //     console.log(message);
      //   }
      // });
      //
      // let msg: string = 'ok'
      // that.stompClient.send(`/app/listening`, {}, msg);
    });
  }

  WsUnsubscribe(id: string, resourceType: string, action: string) {
    // this.stompClient.subscribe(`/topic/leave/${resourceType}/${id}`, (message) => {
    //   if (message.body) {
    //     console.log(message);
    //   }
    // });
    this.stompClient.send(`/app/leave/${resourceType}/${id}`, {}, action);
  }

  sendMessage(id, message) {
    this.stompClient.send(`/app/join/${id}` , {}, message);
  }
}
