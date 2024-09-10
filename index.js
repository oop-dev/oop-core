import {run, conf, verifyToken, Rsp} from "./oapi";
run(intercepter)
async function intercepter(r) {
    const path = new URL(r.url).pathname;
    if (conf.auth && !conf.blacklist.includes(path) && !(await verifyToken(r.headers.get('Authorization')))) {
        //返回Response对象或者抛出Error代表终止
        return Rsp(401, 'auth err')
    }
}
function has(perm) {
    if (perm=='*'){
        return true
    }
    let user=JSON.parse(localStorage.getItem('user'))
    let permissions=user?.role.flatMap(r=>r.permission)
    console.log('permissions',permissions)
    let has=permissions?.some(p =>['*',perm].includes(p.name))
    console.log('perm',perm,'has',has)
    return has
}
