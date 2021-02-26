import "reflect-metadata";

import { Connection, createConnection } from "typeorm";

export class SingletonDB {
    con: Connection;

    private static instance: SingletonDB;

    private constructor() { }

    public static getInstance(): SingletonDB {
        if (!SingletonDB.instance) {
            SingletonDB.instance = new SingletonDB();
        }

        return SingletonDB.instance;
    }

    public async init(): Promise<void> {
        this.con = await createConnection();
        console.log("DB connection set up");
    }
}