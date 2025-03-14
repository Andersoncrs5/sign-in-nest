import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id:number

    @Column({ type: "varchar", length: 250})
    name: string

    @Column({ type: "varchar", unique: true, length: 250 })
    email: string

    @Column({ type: "varchar" , length: 250})
    password: string

    @Column({ type: "varchar" , length: 500, nullable: true})
    refreshToken: string | null;

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
