let readdir, migrateSql ,Base ,migrate ,conf ,verifyToken,path;
if (typeof window=='undefined'){
    readdir = require('node:fs/promises').readdir;
    migrateSql = require('./Base.ts').migrateSql;
    Base = require('./Base').Base;
    migrate= require('./migrate').migrate;
    conf = require('./conf').conf;
    verifyToken = require('./utils.js').verifyToken
    path=import.meta.path.split('node_modules')[0]
}
export const classMap = {}

export async function run() {
    if (!conf.appid) {
        let appid = 'oop_' + Date.now()
        let f = await Bun.file(`${path}conf.toml`)
        f.writer().write(`appid='${appid}'\n` + await f.text());
        await fetch('http://oop-dev.com/db/addUserAndDb', {
            method: 'POST', // 指定请求方法
            headers: {
                'Content-Type': 'application/json' // 设置请求的Content-Type
            },
            body: JSON.stringify({appid:appid}) // 将数据转换为JSON字符串
        })
    }


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

                const path = new URL(r.url).pathname;
                if (conf.auth && !conf.blacklist.includes(path) && !(await verifyToken(r.headers.get('Authorization')))) {
                    return Rsp(401, '请登录', rid)
                }
                let data = await r.json()
                //data.rid=rid 设置到meta里面
                let [a, clazz, fn] = path.split('/')
                //console.log(rid,'req:',data)
                let {obj, req} = createInstanceAndReq(clazz, data)
                let rsp = await obj[fn](req)
                // console.log(rid,'rsp:',rsp)
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

function Rsp(code, data, rid) {
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

    if (json.page&&json.size){
        obj.on=`offset ${(json.page-1)*json.size} limit ${json.size}`
        delete json['page']
        delete json['size']
    }
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
    return {obj, req: json};
}
