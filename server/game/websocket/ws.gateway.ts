/**
 * WebSocket Gateway — Socket.io server for real-time World State push to frontend.
 * Subscribes to Redis pub/sub 'state:changed' channel.
 * Players join their session room on connect; the gateway fans out to all clients in that room.
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getRedis } from '../engine/worldState.redis';
import { readWorldState } from '../engine/worldState.engine';

let io: SocketIOServer | null = null;

export function initWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Player joins their session room
    socket.on('join_session', async (data: { session_id: string }) => {
      const { session_id } = data;
      socket.join(`session:${session_id}`);
      console.log(`[WS] Socket ${socket.id} joined session ${session_id}`);

      // Send full current World State on join (reconnect sync)
      const state = await readWorldState(session_id);
      if (state) {
        socket.emit('world_state_full', state);
      }
    });

    socket.on('leave_session', (data: { session_id: string }) => {
      socket.leave(`session:${data.session_id}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  // Subscribe to Redis pub/sub for World State changes
  const subscriber = getRedis().duplicate();
  subscriber.subscribe('state:changed', (err) => {
    if (err) {
      console.error('[WS] Redis sub error:', err);
      return;
    }
    console.log('[WS] Subscribed to state:changed');
  });

  subscriber.on('message', (_channel: string, message: string) => {
    try {
      const { session_id, patch } = JSON.parse(message) as {
        session_id: string;
        patch: object;
      };

      // Fan out to all clients in this session's room
      if (io) {
        io.to(`session:${session_id}`).emit('world_state_update', {
          session_id,
          patch,
          ts: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('[WS] Message handling error:', err);
    }
  });

  console.log('[WS] Gateway initialised');
  return io;
}

/** Emit an event directly to a session room (for server-initiated events) */
export function emitToSession(sessionId: string, event: string, data: object): void {
  if (!io) return;
  io.to(`session:${sessionId}`).emit(event, data);
}
