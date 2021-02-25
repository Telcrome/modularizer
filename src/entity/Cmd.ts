import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cmd {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    // @Column()
    // timestamp: Date;
}