export const LENGTH_FACTORS_MM=Object.freeze({mm:1,cm:10,m:1000,inch:25.4,ft:304.8,yd:914.4});
export const WEIGHT_FACTORS_G=Object.freeze({kg:1000,g:1,lb:453.59237,oz:28.349523125});
export function convert(value,fromUnit,toUnit){if(fromUnit===toUnit)return value;return value*LENGTH_FACTORS_MM[fromUnit]/LENGTH_FACTORS_MM[toUnit]}
export function convertWeight(value,fromUnit,toUnit){if(fromUnit===toUnit)return value;return value*WEIGHT_FACTORS_G[fromUnit]/WEIGHT_FACTORS_G[toUnit]}
export function formatNumber(value){if(!Number.isFinite(value)||value===null||value===undefined)return'0.00';return value.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:Math.abs(value)>=1000?2:3})}
export function escapeHtml(value){return String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
export function downloadText(filename,content,type='text/plain;charset=utf-8'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
