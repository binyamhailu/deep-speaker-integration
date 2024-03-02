import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    phoneNumber: string
    @Column()
    profileId: string
    @Column({
        nullable: true
    })
    enrollmentStatus: string

    @Column({
        nullable: true
    })
    profileStatus: string

    @Column({
        type: 'bytea',
        nullable: true
    })
    enrolledVoice: Buffer;
}