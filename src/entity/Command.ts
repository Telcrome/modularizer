import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Command {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    // @Column()
    // timestamp: Date;
}