import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {BehaviorSubject} from "rxjs";

declare var SockJS;
declare var Stomp;

const URL = environment.WS_ENDPOINT + '/websocket';

@Injectable()
export class WebsocketService {

  stompClient;
  msg: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor() {
    // this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection(id) {
    const ws = new SockJS(URL);
    this.stompClient = Stomp.over(ws);
    const that = this;

    this.stompClient.connect({}, function(frame) {
      console.log('Connected: ' + frame);
      that.stompClient.subscribe(`/topic/test/${id}`, (message) => {
        if (message.body) {
          that.msg.next(message.body);
        }
      });

      that.stompClient.send(`/app/test/${id}` , {}, 'test');
    });
  }

  sendMessage(id, message) {
    this.stompClient.send(`/app/test/${id}` , {}, message);
  }
}
