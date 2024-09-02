let path=import.meta.path.split('node_modules')[0]

let data = await import(`${path}conf.toml`)
export const conf =  data;
