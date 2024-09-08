import {classMap,createInstance} from "./oapi";
import {conf} from "./conf";
import {reactive} from "vue"

let Pool,pool: { connect: () => any; }
export function initdb() {
    Pool= require('pg').Pool;
    // 创建一个连接池
    pool = new Pool({
        connectionString:conf?.pg?.dsn||`postgres://${conf.appid}:${conf.appid}@oop-dev.com:5432/${conf.appid}`,
        max: 10, // 连接池中最大的连接数
        idleTimeoutMillis: 300000, // 30秒内未被使用的连接将被关闭
        connectionTimeoutMillis: 3000, // 2秒内无法建立连接则报错
    });
}
export class Base<T> {
    @Col({tag:'id',type:'',filter:true,show:'0111'})//1111代表增删改查是否显示
    id=0;
    list:T[]
    select: (keyof T)|string[]=[]
    on=''
    constructor() {
        if (typeof window !== 'undefined') {
            let obj=reactive(this)
            wrapMethods(obj)
            return obj
        }
    }
    sel(...keys: ((keyof T)|'*')[]) {
        // 只允许传入当前类的有效属性名
        this.select = keys;
        return this
    }

    //增删改查方法被代理，
    static async gets(where?:string){
        let o=this
        if (this.constructor.name=='Function'){
            o=new classMap[this.name.toLowerCase()]()
        }
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try{
            let parseMap = {}
            return await gets(o, conn, parseMap,isEmptyObject(where)?undefined:where)
        }catch (e) {
            throw e
        }finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
    }
    async gets(where?:string){
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try{
            let parseMap = {}
            return await gets(this, conn, parseMap,isEmptyObject(where)?undefined:where)
        }catch (e) {
            throw e
        }finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
    }
    static async get(where?:string){
        let o=this
        if (this.constructor.name=='Function'){
            o=new classMap[this.name.toLowerCase()]()
        }
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try{
            let parseMap = {}
            return await get(o, conn, parseMap,isEmptyObject(where)?undefined:where)
        }catch (e) {
            throw e
        }finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
    }
    async get(where?:string){
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try{
            let parseMap = {}
            return await get(this, conn, parseMap,isEmptyObject(where)?undefined:where)
        }catch (e) {
            throw e
        }finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
    }
    static async add(data?){
        let o=this
        if (this.constructor.name=='Function'){
            o=createInstance(this.name.toLowerCase(),data)
        }
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            await conn.query('BEGIN'); // 开始事务
            await add(null, null, o, conn)
            await conn.query('COMMIT'); // 提交事务
            console.log('Transaction committed successfully');
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    async add(){
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            await conn.query('BEGIN'); // 开始事务
            await add(null, null, this, conn)
            await conn.query('COMMIT'); // 提交事务
            console.log('Transaction committed successfully');
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    static async update(where?:string,data?){
        let o=this
        if (this.constructor.name=='Function'){
            o=createInstance(this.name.toLowerCase(),data)
        }
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            await conn.query('BEGIN'); // 开始事务
            await update(null, null, o, conn,where)
            await conn.query('COMMIT'); // 提交事务
            console.log('Transaction committed successfully');
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    async update(where?:string){
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            await conn.query('BEGIN'); // 开始事务
            await update(null, null, this, conn)
            await conn.query('COMMIT'); // 提交事务
            console.log('Transaction committed successfully');
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    static async del(where?:string){
        let o=this
        if (this.constructor.name=='Function'){
            o=new classMap[this.name.toLowerCase()]()
        }
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            await conn.query('BEGIN'); // 开始事务
            await del( o, conn,isEmptyObject(where)?undefined:where)
            await conn.query('COMMIT'); // 提交事务
            console.log('Transaction committed successfully');
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    async del(where?:string){
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            await conn.query('BEGIN'); // 开始事务
            await del( this, conn,isEmptyObject(where)?undefined:where)
            await conn.query('COMMIT'); // 提交事务
            console.log('Transaction committed successfully');
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    static async count(where?:string){
        let clazz=this.name
        if (this.constructor.name=='Function'){
            clazz=this.name
        }
        clazz=clazz.toLowerCase()
        where=where?`where ${where}`:''
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            console.log(`select count(*) from ${clazz} ${where}`)
            let rsp=await conn.query(`select count(*) from "${clazz}" ${where}`); // 提交事务
            return parseInt(rsp.rows[0].count)
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
     async count(where?:string){
        let clazz=this.constructor.name.toLowerCase()
        where=where?`where ${where}`:''
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            let rsp=await conn.query(`select count(*) from "${clazz}" ${where}`); // 提交事务
            return parseInt(rsp.rows[0].count)
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    static async query(sql:string){
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            let rsp=await conn.query(sql); // 提交事务
            return rsp
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    async query(sql:string){
        const conn = await pool.connect(); // 从连接池获取一个客户端连接
        try {
            let rsp=await conn.query(sql); // 提交事务
            return rsp
        } catch (err) {
            await conn.query('ROLLBACK'); // 事务回滚
            console.log('Transaction rolled back due to error:', err);
            throw err
        } finally {
            conn.release(); // 释放客户端连接，返回连接池
            console.log('release')
        }
        return null
    }
    tx(){

    }
    err(msg) {
        return (e)=> {
            console.error( JSON.stringify(this),msg,e.stack); // 打印错误日志
            throw msg; // 返回动态的错误处理信息
        };
    }
    cols():[]{
        return this.constructor.metadata
    }
    col(k){
        return this.constructor.metadata[k]
    }
}
export function Col(options) {
    return function (target, propertyKey) {
        // 确保每个类都有独立的 metadata
        if (!target.constructor.hasOwnProperty('metadata')) {
            Object.defineProperty(target.constructor, 'metadata', {
                value: {}, // 创建一个新的 metadata 对象
                writable: true,
                enumerable: false, // 不让 metadata 枚举，保持类结构干净
                configurable: true
            });
        }

        // 获取或设置 metadata 对象
        const metadata = target.constructor.metadata;

        // 继承父类的 metadata
        if (Object.getPrototypeOf(target.constructor).metadata) {
            Object.assign(metadata, Object.getPrototypeOf(target.constructor).metadata);
        }

        // 添加当前属性的 metadata
        if (!metadata[propertyKey]) {
            options['col'] = propertyKey;
            metadata[propertyKey] = options;
        }

        // 确保 target[propertyKey] 存在并可枚举
        if (!(propertyKey in target)) {
            target[propertyKey] = null;
        }

        // 设置属性的描述符
        Object.defineProperty(target, propertyKey, {
            enumerable: true, // 使属性可枚举
            writable: true,   // 使属性可写
            configurable: true, // 使属性可配置
            value: target[propertyKey] // 设置属性的初始值
        });
    };
}
export function Menu(...name:string[]) {
    return function (target,fn) {
        // 直接将 menu 属性添加到类构造函数上
        Object.defineProperty(target, 'menu', {
            value: name,
            writable: true,
            enumerable: false,
            configurable: true
        });
    };
}

export function log() {
    return function () {
        console.log('log')
    };
}

function nest(data, clazz) {
    console.log(data)
    const m = {};
    const rootMap = {};
    data.forEach(item => {
        let obj = create(clazz, item, m,{})
        rootMap[obj.id] = obj
    })
    return Object.values(rootMap)
}

function create(clazz, row, m,parseMap) {
    parseMap[clazz]=true
    let id = row[`${clazz}_id`]
    let obj = m[`${clazz}_${id}`]
    if (!obj) {
        obj = new classMap[clazz]()
        m[`${clazz}_${id}`] = obj
    }
    delete obj.on
    delete obj.select
    delete obj.where
    delete obj.list
    Object.entries(obj).filter(([k,v])=>!base[k]).forEach(([k, v]) => {
        if (v&&Array.isArray(v)&&!parseMap[k]) {//解决重复赋值和循环依赖
            let obj = create(k, row, m,parseMap)
            console.log(parseMap)
            if (row[k+'_id']&&!v.some(role => role?.id == row[`${k}_id`])) {//数组不需要处理循环依赖
                console.log(k,v)
                v.push(obj);
            }else {
                obj[k]=null
            }
        } else if (v&&typeof v == 'object') {//解决重复赋值和循环依赖
            //console.log(parseMap[k]?`循环依赖${k}`:`${k},raer`)
            console.log('has',row[k+'_id'])
            if (row[k+'_id']&&!v?.id&&!parseMap[k]){
                //console.log(parseMap[k]?`w循环依赖${k}`:`${k},w raer`)
                obj[k]=create(k, row, m,parseMap)
            }else {
                obj[k]=null
            }
        } else {
            obj[k] = row?.[`${clazz}_${k}`]
        }
    })
    return obj
}

let base={list:true,on:true,select:true,where:true}
async function get(u, conn, parseMap,where?) {
    let list=await await gets(u, conn, parseMap,where)
    return list[0]
}
async function gets(u, conn, parseMap,where?) {
    console.log('where,',where)
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    where=where|| Object.entries(u).filter(([key, value]) =>!base[key]&&value && typeof value!='object').map(([k, v]) => {
        console.log('kkkkk',k)
        if (typeof v != 'object') {
            return `"${clazz}".${k}='${v}'`
        } else if (u.select.includes(k)){
            return getwhere(v)
        }
    }).filter(item => item !== undefined).flat().join(' and ')
    where = where || u.where
    where = where ? `where ${where}` : ''
    console.log('where----------',JSON.stringify(where))
    console.log('sel----------',JSON.stringify(u.select))
    if (!u.select||u?.select?.length==0){u.select=['*']}
    let sel = Object.entries(u).filter(([k, v]) =>u.select&&!base[k]&& !parseMap[k]).map(([k, v]) => {
        console.log(k,v)
        if (typeof v != 'object'&&(u.select.includes(k)|u.select.includes('*'))) {
            console.log(typeof v,k,v)
            return `"${clazz}".${k} as ${clazz}_${k}`
        } else if (u.select.includes(k)) {
            let s=getsel(createInstance(k,v), parseMap)
            console.log('roles----------',s)
            return s
        }
    }).filter(item => item !== undefined)
    console.log('sel----------',JSON.stringify(u.select))

    let join = Object.entries(u).filter(([key, value]) =>u.select&&u.select.includes(key)&&value&& key!='list'&&typeof value == 'object'&&!parseMap[key]).map(([k, v]) => {
        let son = k
        let rootjoin=''
        let on=v.on? `on ${v.on}` : ''
        if (u.col(k)?.link == 'n1'){
            rootjoin=`left join ${k} on "${clazz}".${k} = ${k}.id ${on}`
        }else if (u.col(k)?.link == 'nn'){
            rootjoin=`left join lateral unnest("${clazz}".${k}) AS ${k}_id ON true JOIN ${k}  ON ${k}.id = ${k}_id ${on}`
        }else {
            rootjoin=`left join ${son}  ON ${son}.${clazz} = ${clazz}.id ${on}`
        }
        return [rootjoin, ...getjoin(v,parseMap)]
    }).flat().join('\n')

    let main=''
    if (join){
        let where_main=u.on&&!u.on.includes('limit')?`where ${u.on}`:where+u.on
        main=`(select * from "${clazz}" ${where_main}) as "${clazz}"`
    }else {
        where=u.on&&!u.on.includes('limit')?`where ${u.on}`:where+u.on
    }
    main=main||`"${clazz}"`
    let sql = `select ${sel} from ${main} ${join} ${where}`
    console.log('sql',sql)
    let rs = await conn.query(sql)
    console.log(rs.rows)
    return nest(rs.rows, clazz)
}

function getsel(u, parseMap) {
    console.log('select----------',u)
    let clazz = u.constructor.name.toLowerCase()
    if (!u.select||u?.select?.length==0){u.select=['*']}
    let sel = Object.entries(u).filter(([k, v]) =>!base[k]&&!parseMap[k]).map(([k, v]) => {
        if (typeof v != 'object'||!v) {
            return `${clazz}.${k} as ${clazz}_${k}`
        } else if (u.select.includes(k)) {
            return getsel(createInstance(k,v), parseMap)
        }
    }).filter(item => item !== undefined)
    return sel
}

function getjoin(u,parseMap) {
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    let join = Object.entries(u).filter(([key, value]) =>!base[key]&&u.select.includes(key)&&typeof value == 'object'&&!parseMap[key]).map(([k, v]) => {
        let son = v.constructor.name
        let rootjoin=''
        let on=v.on? `on ${v.on}` : ''
        if (u.col(k)?.link == 'n1'){
            rootjoin=`left join ${k} on ${clazz}.${k} = ${k}.id ${on}`
        }else if (u.col(k)?.link == 'nn'){
            rootjoin=`left join lateral unnest(${clazz}.${k}) AS ${k}_id ON true JOIN ${k}  ON ${k}.id = ${k}_id ${on}`
        }else {
            rootjoin=`left join ${son}  ON ${son}.${clazz} = ${clazz}.id ${on}`
        }
        return rootjoin
    })
    return join
}

/*function getwhere(u) {//where和on都支持
    let clazz=u.constructor.name
    let  where=Object.entries(u).filter(([key, value]) => value&&!Array.isArray(value)).map(([k,v])=>{
        if (typeof v!='object'){
            return `${clazz}.${k}='${v}'`
        }else {
            return getwhere(v)
        }
    })
    return where
}*/
async function get1(u: Base, conn, parseMap) {
    console.log(u)
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    let where = Object.entries(u).filter(([key, value]) => value && typeof value != 'object' && key != 'filter').map(([k, v]) => {
        if (typeof v == 'string') {
            return `${clazz}.${k}='${v}'`
        } else if (typeof v == 'number') {
            return `${clazz}.${k}=${v}`
        }
    }).join(' and ')
    let groups = [`${clazz}.id`]
    let sel = Object.entries(u).map(([k, v]) => {
        if (Array.isArray(v)) {
            console.log(k)
            return `jsonb_agg(${getobjSql(new classMap[k], parseMap)}) as ${k}`
        } else if (typeof v == 'object') {
            groups.push(`${v.constructor.name.toLowerCase()}.id`)
            return `${getobjSql(v, parseMap)} as ${k}`
        } else {
            return `${clazz}.${k}`
        }
    })
    /*    let join=Object.entries(u).filter(([k, v]) => typeof v=='object')
            .map(([k,v])=>`join ${k} on ${k}.${clazz} = ${clazz}.id`).join(' ')*/
    //father
    let join = Object.entries(u).filter(([k, v]) => typeof v == 'object' || Array.isArray(v))
        .map(([k, v]) => u.col(k).link == 'n1' ? `join ${k} on ${clazz}.${k} = ${k}.id` :
            `join ${k} on ${k}.${clazz} = ${clazz}.id`).join(' ')
    where = where || u.where
    where = where ? `where ${where}` : ''

    let sql = `select ${sel}
               from ${clazz} ${join} ${where}
               group by ${groups}`
    console.log(sql)
    let rs = await conn.query(sql)
    return rs.rows
}

function getobjSql(u, parseMap) {
    let clazz = u.constructor.name.toLowerCase()
    parseMap[clazz] = true
    let where = Object.entries(u).filter(([key, value]) => value && typeof value != 'object' && key != 'filter').map(([k, v]) => {
        if (typeof v == 'string') {
            return `${k}='${v}'`
        } else if (typeof v == 'number') {
            return `${k}=${v}`
        }
    }).join(' and ')   //循环依赖解决，order.user里面的order被解析过，过滤掉
    let sel = Object.entries(u).filter(([k, v]) => !Array.isArray(v) && !parseMap[k]).map(([k, v]) => {
        if (Array.isArray(k)) {
            return `'${k}'`
        } else if (typeof v == 'object') {
            return `'${k}',(select ${getobjSql(v, parseMap)} as ${k} from ${k} where ${k}.${clazz}=${clazz}.id)`
        } else {
            return `'${k}',${clazz}.${k}`
        }
    })
    //son模式
    let join = Object.entries(u).filter(([k, v]) => typeof v == 'object' || Array.isArray(v))
        .map(([k, v]) => u.col(k).link == 'n1' ? `join ${k} on ${clazz}.${k} = ${k}.id` :
            `join ${k} on ${k}.${clazz} = ${clazz}.id`).join(' ')
    //father模式
    /*    let join=Object.entries(u).filter(([k, v]) => typeof v=='object')
            .map(([k,v])=>`join ${k} on ${clazz}.${k} = ${k}.id`)*/
    where = where || u.where
    where = where ? `where ${where}` : ''

    //let sql=`jsonb_agg(z(${sel}) ${clazz} ${join} ${where})`
    let sql = `jsonb_build_object(${sel})`

    return sql
}

async function add(pname, pid, u, conn) {
    //1.执行自己，2.向下递归对象或者对象数组
    let clazz = u.constructor.name.toLowerCase()
    let sub = []
    if (pid) u[pname] = pid
    let values = Object.entries(u).filter(([k, v]) => {
        if (base[k]){
            return false
        }
        if (typeof v == 'object') {
            if (u.col(k).sel){
                return true
            }
            sub.push(v)
        }
        return !base[k]&&typeof v != 'object' && k != 'id'
    }).map(([k, v]) => {
        if (Array.isArray(v)){
            return `'{${v}}'`
        }
        return `'${v}'` || 'null'
    })
    let keys = Object.entries(u).filter(([k, v]) => {
        if (base[k]){
            return false
        }
        if (typeof v == 'object') {
            if (u.col(k).sel){
                return true
            }
            sub[k] = v
        }
        return !base[k]&&typeof v != 'object' && k != 'id'
    }).map(([k, v]) => {
        return k || 'null'
    })
    //执行sql获取id
    console.log(`insert into "${clazz}" ("${keys}") values (${values})`)
    let sql=`insert into "${clazz}" (${keys})values (${values}) RETURNING id`
    console.log(sql)
    let result = await conn.query(sql)
    let parentId = result.rows[0].id
    console.log('parentId', parentId)
    await Promise.all(sub.map(v =>
        Array.isArray(v)
            ? Promise.all(v.map(item => add(clazz, parentId, item, conn)))
            : add(clazz, parentId, v, conn)
    ));
}

async function update(pname, pid, u,conn,where?) {
    if (typeof u!='object')return
    let clazz = u.constructor.name.toLowerCase()
    let sub = []
    if (pid) u[pname] = pid

    let values = Object.entries(u).filter(([k, v]) => {
        if (base[k]){
            return false
        }
        if (typeof v == 'object') {
            sub.push(v)
        }
        return v && typeof v != 'object'
    }).map(([k, v]) => {
        return `"${k}"='${v}'`
    })
    /*    let where = Object.entries(u).filter(([key, value]) => value && !Array.isArray(value)).map(([k, v]) => {
            if (typeof v != 'object') {
                return `${clazz}.${k}='${v}'`
            } else {
                return getwhere(v)
            }
        }).flat().join(' and ')*/
    where = u.on||where
    console.log('where',where)
    where = where ?'where '+where:`where id=${u.id}`
    //执行sql获取id
    let sql=`update "${clazz}" set ${values} ${where}`
    console.log(sql)
    let result = await conn.query(sql)
    let parentId = Math.random()
    console.log('sub',sub)
    sub.forEach(v => Array.isArray(v) ? v.forEach(v => update(clazz, parentId, v)) : update(clazz, parentId, v))
}

function getwhere(u) {//where和on都支持
    let clazz = u.constructor.name
    let where = Object.entries(u).filter(([key, value]) => value && !Array.isArray(value)).map(([k, v]) => {
        if (typeof v != 'object') {
            return `${clazz}.${k}='${v}'`
        } else if (u.select.includes(k)){
            return getwhere(v)
        }
    }).filter(item => item !== undefined)
    return where
}

async function del(u,conn,where) {
    let clazz = u.constructor.name.toLowerCase()
    where=where|| Object.entries(u).filter(([key, value]) =>!base[key]&&value && typeof value!='object').map(([k, v]) => {
        console.log('kkkkk',k)
        if (typeof v != 'object') {
            return `"${clazz}".${k}='${v}'`
        } else if (u.select.includes(k)){
            return getwhere(v)
        }
    }).filter(item => item !== undefined).flat().join(' and ')
    console.log(u)
    where = where || u.on
    where = where ? `where ${where}` : ''

    let sql = `delete from "${clazz}" ${where}`
    console.log('del',sql)
    let result = await conn.query(sql)
    return result
}
export async function migrateSql(sql:string) {
    console.log(sql)
    const conn = await pool.connect(); // 从连接池获取一个客户端连接
    try {
        await conn.query(sql)
    } catch (err) {
        throw err
    } finally {
        conn.release(); // 释放客户端连接，返回连接池
    }
}
function isEmptyObject(obj) {
    if (!obj){return true}
    return Object.keys(obj).length === 0;
}
function wrapMethods(obj) {
        // 浏览器环境，增强方法并替换为新的逻辑
        for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(obj))) {
            if (typeof obj[key] === 'function' && key !== 'constructor') {
                // 替换方法
                let className = obj.constructor.name.toLowerCase().replaceAll('_','')
                obj[key] =async function (...args) {
                    console.log(`New method logic for ${key} with arguments`, args);
                    // 你可以在这里添加新的逻辑，而不是调用原来的方法
                    let {list,...data}=obj
                    let rsp= await post(className + '/' + key, data)
                    if (rsp?.list){
                        obj.list=rsp?.list
                    }
                    if (rsp?.total){
                        obj.total=rsp?.total
                    }
                    console.log('end',obj)
                    return rsp
                };
            }
        }
}
export const post = async (url, data, header) => {
    try {
        // 创建完整的请求 URL
        const requestUrl =import.meta.env.VITE_BASE_URL+'/' + url;
        // 创建请求配置
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')||'',
                ...header // 合并额外的配置
            },
            body: JSON.stringify(data) // 将数据对象转换为 JSON 字符串
        };

        // 发送请求
        const response = await fetch(requestUrl, requestOptions);

        // 检查响应状态
        if (!response.ok) {
            // 如果响应状态不是 2xx，抛出错误
            const errorData = await response.json();
            if (response.status === 401) {
                console.log('401---');
                // 在 401 错误时重定向到登录页
                window.location.href = '/login';
            }
            throw errorData;
        }
        const responseData = await response.json();
        return responseData;

    } catch (error) {
        console.log('res-----', error);
        throw error;
    }
}
