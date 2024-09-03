function get(classString) {
    const regex = /(\w+):\s*([\w<>,\[\]]+)/g;
    const propertiesMap = new Map<string, string>();

    let match;
    while ((match = regex.exec(classString)) !== null) {
        const propertyName = match[1];
        const propertyType = match[2];
        if (['filter','sel'].includes(propertyName))continue
        propertiesMap.set(propertyName, propertyType);
    }
    return propertiesMap
}

/*let r=new Role()
await initType('./api/Role.ts',r)
console.log(r.cols())*/
console.log(import.meta.path)
let clazz=await loadClass()
let p=new clazz()
clazz.constructor.types=await initType('./api/Permission.ts',p)
console.log(clazz.constructor.types)
let p1=new clazz()
console.log(p1.constructor.types)

async function initType(clazzPath:string,o:any) {
    const classString = await Bun.file(clazzPath).text()
    const regex = /(\w+):\s*([\w<>,\[\]]+)/g;
    const propertiesMap = new Map<string, string>();

    let match;
    while ((match = regex.exec(classString)) !== null) {
        const propertyName = match[1];
        const propertyType = match[2];
        if (['filter','sel'].includes(propertyName))continue
        propertiesMap.set(propertyName, propertyType);
    }
    propertiesMap.forEach((v,k)=>o.col(k).type=v)
    return propertiesMap
}
async function loadClass() {
    // 动态导入模块
    const module = await import('./api/Permission.ts');
    // 访问导入的类
    const MyClass = module['Permission'];
    return MyClass;
}
