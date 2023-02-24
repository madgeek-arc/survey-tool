import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";

declare var SockJS;
declare var Stomp;

const URL = environment.WS_ENDPOINT + '/websocket';

@Injectable()
export class WebsocketService {

  stompClient;
  msg = [];

  constructor() {
    this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection() {
    const ws = new SockJS(URL);
    this.stompClient = Stomp.over(ws);
    const that = this;

    this.stompClient.connect({}, function(frame) {
      that.stompClient.subscribe('/topic/test', (message) => {
        if (message.body) {
          that.msg = message.body;
        }
      });
    });
  }

  sendMessage(message) {
    setTimeout(next => {
      this.stompClient.send('/app/test' , {}, message);
    }, 2000);

  }
}
