import { Entity, PrimaryGeneratedColumn, Column, Connection, BaseEntity, LessThan } from "typeorm";
import { assert, expect } from 'chai';
import { createTypeormDb } from "../../src/tests/test-utils";

// Declare an entity
@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn({ type: 'integer' })
    id!: number;

    @Column({ type: 'text' })
    firstName!: string;

    @Column({ type: 'text' })
    lastName!: string;

    @Column({ type: 'int' })
    age!: number;

}

export async function typeormSimpleSample () {

    //==== create a memory db
    const db = createTypeormDb();

    //==== create a Typeorm connection
    const got: Connection = await db.adapters.createTypeormConnection({
        type: 'postgres',
        entities: [User]
    });

    try {

        //==== create tables
        await got.synchronize();
        const users = got.getRepository(User);

        //==== create entities
        await users.create({
            firstName: 'john',
            lastName: 'doe',
            age: 18,
        }).save();
        await users.create({
            firstName: 'john',
            lastName: 'lennon',
            age: 99,
        }).save();
        const duck = await users.create({
            firstName: 'donald',
            lastName: 'duck',
            age: 12,
        }).save();

        //==== query entities
        const youngJohns = await users.find({
            where: {
                firstName: 'john',
                age: LessThan(30)
            }
        });

        expect(youngJohns.map(x => x.lastName))  // outputs 'doe' !
            .to.deep.equal(['doe']);


        //==== modify entities
        duck.firstName = 'daisy';
        await duck.save();

    } finally {
        // do not forget to close the connection once done...
        // ... typeorm stores connections in a static object,
        // and does not like opening 'default connections.
        await got.close();
    }
}
