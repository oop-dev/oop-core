export   let conf={}
if (typeof window=='undefined'){
    const fs=require('fs')
    const toml=require('toml')
    const path = import.meta.url.split('node_modules')[0].replaceAll(`file:///`,'');
    console.log(path)
    console.log(__filename)
    const tomlFileContent = fs.readFileSync(`${path}conf.toml`, 'utf-8');
    conf = toml.parse(tomlFileContent);
}
export default conf
