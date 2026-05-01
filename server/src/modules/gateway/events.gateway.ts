import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('✅ WebSocket Gateway 已初始化');
  }

  emitDataUpdate(type: string, data: any) {
    this.server.emit('data_update', { type, data, timestamp: new Date().toISOString() });
  }
}
