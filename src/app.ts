import express from "express";
import http from "http";
import WebSocket from "ws";
import cors from "cors";

import { SingletonDB } from "./db";
import { Command } from "./entity/Command";

import { AgentController } from "./AgentController";
import { Agent } from "./Agent";

const app = express();
app.use(cors());
app.use('/static', express.static('public'));
const server = http.createServer(app);
const port = process.env.PORT || 8080; // default port to listen

const wss = new WebSocket.Server({ server: server });

const cmd_spec = {
    Ping: {
        example: {
            "msg_type": "cmd",
            "cmd": "Ping",
            "to": "server",
            "data": {}
        },
        markDownInstruction: "Returns an answer if the server is available"
    }
}

function server_agent(dict: any, a: Agent, cb: (cmd: any) => void): void {
    /** Performs operations regarding the server and answers using the local callback cb */
    if (dict['cmd'] === 'ListCommands') {
        const r = a.parent_channel.available_commands();

        // Add commands by server
        for (let key in cmd_spec) {
            r[key] = cmd_spec[key];
        }

        console.log("sending command list");

        cb({
            msg_type: "answer",
            cmd: 'ListCommands',
            to: a.id,
            data: r
        });
    }
}

const controller = new AgentController(wss, server_agent);

app.get("/", async (req: express.Request, res: express.Response) => {
    const repository = SingletonDB.getInstance().con.getRepository(Command);

    let asdf = await repository.find();

    const status = {
        "channels_number": Object.keys(controller.channels).length,
        "command_count": asdf.length
    }
    res.json(status);
});

app.get("/channels/:channelName", (req: express.Request, res: express.Response) => {
    const answer = {};
    let channel_name = req.params["channelName"];
    answer["success"] = (channel_name in controller.channels);
    if (answer["success"]) {
        answer["data"] = controller.channels[channel_name].get_status();
    }
    res.json(answer);
});

async function main() {
    const db = SingletonDB.getInstance();
    await db.init();
    server.listen(port, async () => {
        console.log(`Listening on ${port}`);


        // const cmd = new Cmd();
        // cmd.name = "Do";
        // await con.manager.save(cmd);
    });
}

main().catch(err => {
    console.error(err.stack);
    process.exit(1);
})
