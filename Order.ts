import {Base, Col} from "./Base.ts";

export class Order extends Base<Order>{
    @Col({type:''})
    age:bigint
    @Col({type:''})
    sex:number
}
