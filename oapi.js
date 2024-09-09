import {initdb} from "./Base";
let readdir, migrateSql ,Base ,migrate ,config ,path;
if (typeof window=='undefined'){
    path=import.meta.path.split('node_modules')[0]
    //path='./'
    readdir = require('node:fs/promises').readdir;
    migrateSql = require('./Base.ts').migrateSql;
    Base = require('./Base').Base;
    migrate= require('./migrate').migrate;
    config = toml(path);
}
export const conf=config
export const classMap = {}

export async function run(intercepter) {
    if (!conf.pg) {
        let name = UUID()
        let pwd = UUID()
        let db = UUID()
        let dsn=`postgres://${name}:${pwd}@oop-dev.com:5432/${db}`
        let f = await Bun.file(`${path}conf.toml`)
        f.writer().write(await f.text()+`[pg]\ndsn='${dsn}'\n`);
        let rsp=await fetch('http://oop-dev.com/db/addUserAndDb', {
            method: 'POST', // 指定请求方法
            headers: {
                'Content-Type': 'application/json' // 设置请求的Content-Type
            },
            body: JSON.stringify({name,pwd,db}) // 将数据转换为JSON字符串
        })
        conf.pg= {dsn:dsn}
        console.log(rsp)
    }
    initdb()
    await loadClass()
    console.log(classMap)
//migrate page and table
    migrate(classMap)
    Bun.serve({
        port: conf.port,
        async fetch(r) {
            let rid = Date.now()
            try {
                if (r.method == "OPTIONS") {
                    return Rsp(204, '', rid)
                }
                if (intercepter){
                    let rsp=await intercepter(r)
                    if (rsp){return rsp}
                }
                let data = await r.json()
                //data.rid=rid 设置到meta里面
                const path = new URL(r.url).pathname;
                let [a, clazz, fn] = path.split('/')
                //console.log(rid,'req:',data)
                let {obj, req} = createInstanceAndReq(clazz, data)
                if (!obj[fn])throw 'method not found'
                let rsp = await obj[fn](req,r)
                if (rsp instanceof Response){
                    return  rsp
                }
                return Rsp(200, rsp, rid);
            } catch (e) {
                let msg = typeof e == 'string' ? e : e.message
                console.error('msg:', msg);
                console.error('stack:', e.stack);
                return Rsp(500, msg, rid)
            }
        }
    });
    console.log(`Listening on ${conf.port}`);
}

export function Rsp(code, data, rid='') {
    let rsp = Response.json(data, {status: code});
    rsp.headers.set('Access-Control-Allow-Origin', '*');
    rsp.headers.set('Access-Control-Allow-Methods', '*');
    rsp.headers.set('Access-Control-Allow-Headers', '*');
    rsp.headers.set('rid', rid)
    if (typeof data == 'string' && data.startsWith('http')) {
        rsp = new Response('', {status: 302});
        rsp.headers.set('Location', res);
    }
    return rsp
}


async function loadClass() {
    for (const item of await readdir(`${path}api`, {recursive: true})) {
        const module = await import(`${path}api/${item}`);
        let className = item.replace(".ts", "")
        // @ts-ignore
        classMap[className.toLowerCase()] = module[className]
    }
}

export function createInstance(className, json) {
    const Class = classMap[className];
    if (!Class) {
        throw new Error(`${className} not found`);
    }
    let obj = new Class()//代理子类，子类没重写增删改查，调用父类代理的增删改查,重写了调用子

    Object.entries(obj).forEach(([k, v]) => {
        if (json[k] && Array.isArray(v)) {
            obj[k] = v.map(v => createInstance(k, json[k]))
        } else if (json[k] && typeof v == 'object') {
            obj[k] = createInstance(k, json[k])
        } else if (json?.[k]) {
            obj[k] = json?.[k]
        }
    })
    obj['select'] = json?.['select']
    return obj;
}

export function createInstanceAndReq(className, json) {
    const Class = classMap[className];
    if (!Class) {
        throw new Error(`${className} not found`);
    }
    //Object.setPrototypeOf(Class.prototype, NewBase(Base));//代理父类增删改查
    let obj = new Class()//代理子类，子类没重写增删改查，调用父类代理的增删改查,重写了调用子类
    let req
    if (Array.isArray(json)){
        Object.entries(obj).forEach(([k, v]) => {
            if (json[0][k] && Array.isArray(v)) {//可能是对象数组，可能是普通数组
                obj[k] = json[0]?.[k].map(v => typeof v == 'object' ? createInstance(k, json[0][k]) : v)
            } else if (json[0][k] && typeof v == 'object') {
                obj[k] = createInstance(k, json[0][k])
            } else if (json[0]?.[k]) {
                obj[k] = json[0]?.[k]
            }
            delete json[0][k]
        })
        req=json[1]
    }else {
        Object.entries(obj).forEach(([k, v]) => {
            if (json[k] && Array.isArray(v)) {//可能是对象数组，可能是普通数组
                obj[k] = json?.[k].map(v => typeof v == 'object' ? createInstance(k, json[k]) : v)
            } else if (json[k] && typeof v == 'object') {
                obj[k] = createInstance(k, json[k])
            } else if (json?.[k]) {
                obj[k] = json?.[k]
            }
            delete json[k]
        })
        req=json
    }
    return {obj, req: req};
}
function UUID() {
    const timestamp = Date.now().toString(36); // 使用36进制转换时间戳
    const randomPart = Math.random().toString(36).substring(2, 10); // 随机数的一部分，转换为36进制并取前9位
    return `${timestamp}${randomPart}`;
}
function toml(path) {
    path=path.replaceAll(`file:///`,'')
    const fs=require('fs')
    const toml=require('toml')
    const tomlFileContent = fs.readFileSync(`${path}conf.toml`, 'utf-8');
    return  toml.parse(tomlFileContent);
}
export async function getJwt(token) {
    return JSON.parse(atob(token))
}
export async function jwtToken(obj) {
    const sign = await sha256(JSON.stringify(obj))
    let jwt={payload:obj,sign:sign}
    console.log(base64(JSON.stringify(jwt)))
    return base64(JSON.stringify(jwt))
}
export async function verifyToken(token){
    if (!token)return false
    let jwt=JSON.parse(deBase64(token))
    return token==await jwtToken(jwt.payload)
}
export async function sha256(message) {
    // 将字符串编码为 Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message+conf.secret);

    // 计算 SHA-256 哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // 将 ArrayBuffer 转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
export function base64(input) {
    // 将输入字符串转换为 Buffer 对象，并编码为 Base64
    return Buffer.from(input).toString('base64');
}
export function deBase64(encoded) {
    // 将 Base64 编码的字符串转换为 Buffer 对象，并解码为 UTF-8 字符串
    return Buffer.from(encoded, 'base64').toString('utf-8');
}
