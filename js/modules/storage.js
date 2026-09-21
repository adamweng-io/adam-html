export const HISTORY_KEY='netcalc_history_v1';
export const MAX_HISTORY=50;
export function getHistory(){try{const raw=localStorage.getItem(HISTORY_KEY);if(!raw)return[];const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed.filter(item=>item&&typeof item==='object'):[]}catch{return[]}}
export function saveHistory(list){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(list))}catch{}}
