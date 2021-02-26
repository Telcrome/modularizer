import { AgentController } from "./AgentController";
import { Agent } from "./Agent";
import { IOutMessage } from "./interfaces/IOutMessage";
import { ICmdDoc } from "./interfaces/ICmdDoc";
import { IInMessage } from "./interfaces/IInMessage";
import { SingletonDB } from "./db";
import { Command } from "./entity/Command";

export enum ChannelProtectionType {
    ByIP, ByUserJWT
}

export interface ICommChannelStatus {
    agent_ids: Array<string>
    commands: Array<string>
}

const c = {
    "ip": ChannelProtectionType.ByIP,
    "user_jwt": ChannelProtectionType.ByUserJWT
}
export function stringToChannelProtectionType(s: string): ChannelProtectionType {
    return c[s]
}

export class CommChannel {
    /**
     * Holds one communication room.
     */
    parentController: AgentController;
    name: string
    protection: ChannelProtectionType
    agents: Array<Agent>
    ip: string;

    constructor(parent_controller: AgentController, name: string, prot_type: ChannelProtectionType) {
        this.parentController = parent_controller;
        this.name = name;
        this.protection = prot_type;
        this.agents = [];
        this.ip = "";
    }

    available_commands(): { [k: string]: ICmdDoc } {
        const r = {};

        this.agents.forEach((a: Agent) => {
            Object.keys(a.cmds).forEach((k: string) => {
                r[k] = a.cmds[k];
            })
        });

        return r;
    }

    ping_agents(): void {
        this.agents.forEach((a: Agent) => {
            a.ping();
        });
    }

    add_agent(agent: Agent): boolean {
        console.log(`Current ip: ${this.ip}, agent entering: ${agent.ip}`);
        /** Checks if the agent is allowed to enter this channel and adds it */
        if (!this.ip) {
            this.ip = agent.ip;
        }

        if (this.ip !== agent.ip) {
            agent.notify({
                cmd: "ShowError",
                msg_type: "error",
                msg: `IP of ${agent.id} not authorized to enter channel ${this.name}`,
                from: "server"
            });
            return false;
        }

        if ((this.filter_agents(agent.id).length !== 0) || (agent.id === "server")) {
            agent.notify({
                cmd: "ShowError",
                msg_type: "error",
                msg: `Agent with identifier ${agent.id} already exists`,
                from: "server"
            });
            return false;
        }

        this.agents.push(agent);
        agent.notify({
            cmd: "ShowInfo",
            msg_type: "login_confirmation",
            msg: `Agent ${agent.id} added to channel ${this.name}`,
            data: {
                peers: this.agents.map((a: Agent) => a.id).filter((s: string) => s !== agent.id)
            },
            from: "server"
        });
        return true;
    }

    remove_agents(agent: Agent): void {
        let rem_agents = this.filter_agents(agent.id);
        this.agents.splice(this.agents.indexOf(rem_agents[0]), 1);
        console.log(`${this.name} removed agents: ${rem_agents.length}, remaining: ${this.agents.length}`);
    }

    filter_agents(filter: string): Array<Agent> {
        const res = []

        this.agents.forEach(agent => {
            if (agent.id === filter) {
                res.push(agent);
            }
        });

        return res;
    }

    async forward_msg(sender_agent: Agent, in_msg: IInMessage) {
        /**
         * Forwards a command to all recipients that fit the "to"-pattern.
         * Adds an sender-identifier s.t. the worker can address its supervisor.
         */
        // const cmdrp = SingletonDB.getInstance().con.getRepository(Command);

        const cmd = new Command();
        cmd.senderId = sender_agent.id;
        cmd.senderIp = sender_agent.ip;
        cmd.recipientId = in_msg.to;
        cmd.channelId = this.name;
        cmd.data = in_msg.data;
        cmd.name = in_msg.cmd;
        cmd.serverTimestamp = new Date();
        await SingletonDB.getInstance().con.manager.save(cmd);


        if (in_msg["to"] === "server") {
            // Forward the command to the server
            this.parentController.serverAgentHandler(in_msg, sender_agent, (answer_command) => {
                // Notify the agent that requested the information
                sender_agent.notify(answer_command);
            });
        } else {
            // Forward to an extern worker
            const recipients = this.filter_agents(in_msg["to"]);

            if (recipients.length === 0) {
                sender_agent.notify({
                    cmd: "ShowError",
                    msg_type: 'cmd',
                    msg: 'no valid recipient found',
                    from: sender_agent.id
                })
            }

            const notify_obj: IOutMessage = {
                cmd: in_msg["cmd"],
                msg_type: 'cmd',
                from: sender_agent.id
            }

            if ("data" in in_msg) {
                notify_obj["data"] = in_msg["data"]
            }

            recipients.forEach(recipient => {
                recipient.notify(notify_obj);
            });
        }
    }

    get_status(): ICommChannelStatus {
        const ts = this.agents.map((a) => a.id);
        const cs: Array<string> = ['not implemented'];
        const data: any = {
            agent_ids: ts,
            commands: cs
        };

        return data;
    }
}