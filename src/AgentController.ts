import WebSocket from "ws";
import { CommChannel, ChannelProtectionType, stringToChannelProtectionType } from "./CommChannel";
import { Agent } from "./Agent";
import { ICmdDoc } from "./interfaces/ICmdDoc";

export class AgentController {
    /**
     * Holds a list of channels and pushes the agent into the correct one.
     */
    channels: { [name: string]: CommChannel };
    connections: number;
    pingInterval: number;
    serverAgentHandler: (dict: any, a: Agent, cb: (cmd: any) => void) => void

    constructor(wss: WebSocket.Server, server_agent_handler: (dict: any, a: Agent, cb: (cmd: any) => void) => void) {
        this.channels = {};
        this.connections = 0;
        this.pingInterval = 50;
        this.serverAgentHandler = server_agent_handler;

        wss.on('connection', (ws, req) => this.ws_connection_handler(ws, req));

        // Heroku requires all open WebSocket connections to have activity at least every 55 seconds
        setInterval(() => {
            console.log('pinging all agents');
            Object.keys(this.channels).forEach((k: string) => {
                this.channels[k].ping_agents();
            })
        }, this.pingInterval * 1000);
    }

    ws_connection_handler(ws: WebSocket, req) {
        this.connections += 1;
        console.log(`New connection, now holding ${this.connections} clients`);
        // At this point the agent still has to register

        // Hack for heroku. req.socket.remoteAddress changes for clients connected to heroku, even from the same address.
        let address = req.headers['x-forwarded-for'] ? (req.headers['x-forwarded-for'] as string).split(',')[0] : req.socket.remoteAddress;
        console.log(`IP: ${address}`);
        let login = false;

        // One connection can only have one agent
        let agent: Agent;

        // An agent can only have one channel
        let channel_pointer: CommChannel;

        ws.onclose = (event: WebSocket.CloseEvent) => {
            this.connections -= 1;
            console.log(`Removed connection, now holding ${this.connections} clients`);

            if (channel_pointer) {
                // If the agent only opens the connection but does not log in,
                // it does not yet have a channel
                channel_pointer.remove_agents(agent);
            }
        }

        ws.onmessage = async (event: WebSocket.MessageEvent) => {
            // Process login
            if (!login) {
                try {
                    let msg_obj = JSON.parse(event.data.toString());
                    let cmds: { [cmdKey: string]: ICmdDoc } = msg_obj["cmds"];
                    let channel_name: string = msg_obj["channel"];
                    let protection_type: ChannelProtectionType = stringToChannelProtectionType(msg_obj["protection"]);
                    let agent_id: string = msg_obj["id"];


                    // If the channel does not yet exist, create it!
                    if (!(channel_name in this.channels)) {
                        channel_pointer = new CommChannel(
                            this,
                            channel_name,
                            protection_type
                        );
                        this.channels[channel_name] = channel_pointer;
                    } else {
                        channel_pointer = this.channels[channel_name];
                    }

                    agent = new Agent(
                        ws,
                        agent_id,
                        address,
                        cmds,
                        channel_pointer
                    );
                    login = channel_pointer.add_agent(agent);
                } catch (error) {
                    agent.notify({
                        cmd: "ShowError",
                        msg_type: "cmd",
                        msg: JSON.stringify(error),
                        from: "server"
                    });
                }
            } else {
                await agent.message_handler(event);
            }
        };
    }
}