import {conf} from "./conf.js";

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
