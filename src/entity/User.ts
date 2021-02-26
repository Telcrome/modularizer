import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    channelId: string;

    /** The timestamp when the server processed the message */
    @Column()
    serverTimestamp: Date;

    @Column({ type: 'jsonb' })
    data: any

    @Column({ nullable: true })
    msg: string

    /** The timestamp when the client claimed the server should have processed the message */
    @Column({ nullable: true })
    senderTimestamp: Date;

    @Column()
    senderId: string;

    @Column()
    recipientId: string;
}