import {run, conf, verifyToken, Rsp} from "./oapi";
run(intercepter)
async function intercepter(r) {
    const path = new URL(r.url).pathname;
    if (conf.auth && !conf.blacklist.includes(path) && !(await verifyToken(r.headers.get('Authorization')))) {
        //返回Response对象或者抛出Error代表终止
        return Rsp(401, 'auth err')
    }
}
