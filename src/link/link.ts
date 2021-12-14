import { Order } from 'src/order/order';
import { User } from 'src/user/user';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product/product';

@Entity('links')
export class Link {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique: true})
    code:string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'user_id'})
    user:string;

    @ManyToMany(() => Product)
    @JoinTable({
        name: 'link_product',
        joinColumn: {name: 'link_id', referencedColumnName: 'id'},
        inverseJoinColumn: {name: 'product_id', referencedColumnName: 'id'}
    })
    product:Product[];

    @OneToMany(() => Order, order => order.link, {
        createForeignKeyConstraints:false
    })
    @JoinColumn({name: 'code', referencedColumnName: 'code'})
    orders:Order[];
}