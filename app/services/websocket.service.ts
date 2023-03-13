import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {BehaviorSubject} from "rxjs";
import {UserActivity} from "../domain/userInfo";

declare var SockJS;
declare var Stomp;

const URL = environment.WS_ENDPOINT + '/websocket';

@Injectable()
export class WebsocketService {

  stompClient: Promise<typeof Stomp>;
  msg: BehaviorSubject<UserActivity[]> = new BehaviorSubject<UserActivity[]>(null);

  constructor() {
    // this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection(id: string, resourceType: string, action?: string) {
    const ws = new SockJS(URL);
    const that = this;

    this.stompClient = new Promise((resolve, reject) => {
      let stomp = Stomp.over(ws);

      stomp.connect({}, function(frame) {
        const timer = setInterval(() => {
          if (stomp.connected) {
            clearInterval(timer);
            stomp.subscribe(`/topic/active-users/${resourceType}/${id}`, (message) => {
              if (message.body) {
                that.msg.next(JSON.parse(message.body));
              }
            });
            resolve(stomp);
          }
        }, 500);
      }, function (error) {
        setTimeout( () => {that.initializeWebSocketConnection(id, resourceType)}, 10000);
        console.log('STOMP: Reconecting in 10 seconds');
      });
    });

    this.stompClient.then(client => client.ws.onclose = (event) => {
      this.msg.next(null);
      this.initializeWebSocketConnection(id, resourceType);
    });
  };

  WsLeave(id: string, resourceType: string, action: string) {
    this.stompClient.then( client => client.send(`/app/leave/${resourceType}/${id}`, {}, action));
  }

  WsJoin(id: string, resourceType: string, action: string) {
    this.stompClient.then( client => client.send(`/app/join/${resourceType}/${id}`, {}, action));
  }
}
