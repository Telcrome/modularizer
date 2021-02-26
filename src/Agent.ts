import WebSocket from "ws";
import { CommChannel } from "./CommChannel";
import { IOutMessage } from "./interfaces/IOutMessage";
import { ICmdDoc } from "./interfaces/ICmdDoc";

export class Agent {
    /**
     * Represents one entity that can send, register and receive commands.
     */
    ip: string
    id: string
    cmds: { [cmdKey: string]: ICmdDoc }
    ws: WebSocket
    parent_channel: CommChannel

    constructor(
        ws: WebSocket,
        agent_id: string,
        ip: string,
        cmds: { [cmdKey: string]: ICmdDoc },
        parent_channel: CommChannel
    ) {
        this.ws = ws;
        this.ip = ip;
        this.id = agent_id;
        this.cmds = cmds;
        this.parent_channel = parent_channel;
    }

    notify(msg: IOutMessage): void {
        this.ws.send(JSON.stringify(msg));
    }

    ping(): boolean {
        try {
            this.ws.ping();
            return true;
        } catch (error) {
            return false;
        }
    }

    message_handler(e: WebSocket.MessageEvent): void {
        /**
         * Receives commands from the agent to the network.
         * Forwards the command to the channel.
         */
        try {
            let data_obj = JSON.parse(e.data.toString());
            this.parent_channel.forward_msg(this, data_obj);
        } catch (error) {
            this.notify({
                cmd: "ShowError",
                msg_type: "cmd",
                msg: error.message,
                from: "server"
            });
        }
    }
}