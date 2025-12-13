import TcpSocket from 'react-native-tcp-socket';
import * as Network from 'expo-network';
import { useGameStore, Player } from '../store/gameStore';

const PORT = 12345;

class NetworkManager {
    private server: any = null;
    private client: any = null;
    private clients: any[] = [];

    // Get Local IP
    async getIpAddress() {
        try {
            return await Network.getIpAddressAsync();
        } catch (e) {
            console.error("Error getting IP", e);
            return null;
        }
    }

    // HOST: Start Server
    async startHosting(playerName: string) {
        const ip = await this.getIpAddress();
        if (!ip) throw new Error("Could not get IP");

        const myId = Math.random().toString(36).substr(2, 9);

        // Init Store
        useGameStore.getState().setIsHost(true);
        useGameStore.getState().setHostIp(ip);
        useGameStore.getState().setMyId(myId);

        const myPlayer: Player = {
            id: myId,
            name: playerName,
            level: 1,
            gear: 0,
            gender: 'Male',
        };
        useGameStore.getState().setPlayers([myPlayer]);

        // Start TCP Server
        this.server = TcpSocket.createServer((socket) => {
            console.log('Client connected', socket.address());
            this.clients.push(socket);

            socket.on('data', (data) => {
                try {
                    const str = data.toString();
                    // Handle potential multiple messages in one chunk or split messages (simple line split for now)
                    const lines = str.split('\n').filter(Boolean);
                    for (const line of lines) {
                        this.handleServerMessage(JSON.parse(line), socket);
                    }
                } catch (e) {
                    console.log('Error parsing data', e);
                }
            });

            socket.on('error', (error) => console.log('Socket error', error));
            socket.on('close', () => {
                console.log('Client disconnected');
                this.clients = this.clients.filter(c => c !== socket);
                // Ideally remove player from list? Or keep as offline?
                // For now, keep them.
            });
        });

        this.server.listen({ port: PORT, host: '0.0.0.0' }, () => {
            console.log(`Server listening on ${ip}:${PORT}`);
        });
    }

    // CLIENT: Join Game
    joinGame(hostIp: string, playerName: string) {
        const myId = Math.random().toString(36).substr(2, 9);
        useGameStore.getState().setMyId(myId);
        useGameStore.getState().setIsHost(false);

        this.client = TcpSocket.createConnection({ port: PORT, host: hostIp }, () => {
            console.log('Connected to host');
            // Send HELLO
            const myPlayer: Player = {
                id: myId,
                name: playerName,
                level: 1,
                gear: 0,
                gender: 'Male',
            };
            this.send({ type: 'HELLO', payload: myPlayer });
        });

        this.client.on('data', (data) => {
            const str = data.toString();
            const lines = str.split('\n').filter(Boolean);
            for (const line of lines) {
                this.handleClientMessage(JSON.parse(line));
            }
        });

        this.client.on('error', (e) => console.log('Client error', e));
        this.client.on('close', () => console.log('Connection closed'));
    }

    // SEND MESSAGE (Generic)
    send(action: any) {
        const msg = JSON.stringify(action) + '\n';
        if (this.client) {
            this.client.write(msg);
        } else if (this.server) {
            // If I am Host, treat local action as received
            // But usually 'send' is called by UI.
            // So if Host calls send, we just broadcast it?
            // No, if Host calls send, it means "I did something".
            // Host should broadcast Update to everyone.
        }
    }

    startGame() {
        if (this.server) {
            useGameStore.getState().setGameState('GAME');
            this.broadcast({ type: 'SYNC_GAME_STATE', payload: 'GAME' });
        }
    }

    // Broadcast to all clients (Host use only)
    broadcast(action: any, excludeSocket?: any) {
        const msg = JSON.stringify(action) + '\n';
        this.clients.forEach(c => {
            if (c !== excludeSocket) {
                c.write(msg);
            }
        });
    }

    // Broadcast My changes (Called by UI hooks)
    broadcastPlayerUpdate(player: Player) {
        const action = { type: 'UPDATE_PLAYER_STATE', payload: player };
        if (this.server) {
            this.broadcast(action);
            // Store already updated by UI?
            // Yes, Zustand is updated optimistically.
        } else if (this.client) {
            this.send(action);
        }
    }

    // --- Handlers ---

    handleServerMessage(msg: any, socket: any) {
        const store = useGameStore.getState();

        switch (msg.type) {
            case 'HELLO':
                const newPlayer = msg.payload;
                // Check if exists?
                const exists = store.players.find(p => p.id === newPlayer.id);
                const newPlayers = exists ? store.players : [...store.players, newPlayer];

                useGameStore.getState().setPlayers(newPlayers);

                // Send FULL SYNC to new client
                const syncMsg = { type: 'SYNC_PLAYERS', payload: newPlayers };
                socket.write(JSON.stringify(syncMsg) + '\n');

                // Broadcast new player to others
                this.broadcast({ type: 'UPDATE_PLAYER_STATE', payload: newPlayer }, socket);
                break;

            case 'UPDATE_PLAYER_STATE':
                const p = msg.payload;
                store.updatePlayer(p.id, p);
                // Broadcast to others
                this.broadcast(msg, socket);
                break;
        }
    }

    handleClientMessage(msg: any) {
        const store = useGameStore.getState();
        switch (msg.type) {
            case 'SYNC_PLAYERS':
                store.setPlayers(msg.payload);
                break;
            case 'UPDATE_PLAYER_STATE':
                store.updatePlayer(msg.payload.id, msg.payload);
                break;
            case 'SYNC_GAME_STATE':
                store.setGameState(msg.payload);
                break;
        }
    }
}

export const networkManager = new NetworkManager();
