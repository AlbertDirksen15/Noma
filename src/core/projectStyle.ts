import {type CSSProperties} from 'react';
export const projectTabClass=(_id:string)=>'project-tab';
export const projectTabStyle=(id:string):CSSProperties=>{let hash=2166136261;for(const char of id)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;return {'--project-tab-color':`hsl(${(hash%36000)/100} 64% 55%)`} as CSSProperties};
