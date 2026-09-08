export const projectTabClass=(id:string)=>{let hash=0;for(const char of id)hash=(hash*31+char.charCodeAt(0))>>>0;return `project-tab-${hash%12}`};
