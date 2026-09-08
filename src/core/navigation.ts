/** Core navigation metadata. Future extensions can contribute entries through a versioned API. */
export type View='all'|'today'|'inbox'|'archive'|'trash';
export const navigationItems=[
 {id:'all',path:'/',label:'Все заметки'},
 {id:'today',path:'/today',label:'План на сегодня'},
 {id:'inbox',path:'/inbox',label:'На обработку'},
 {id:'archive',path:'/archive',label:'Архив'},
 {id:'trash',path:'/trash',label:'Корзина'},
] as const;
export const paths=Object.fromEntries(navigationItems.map(n=>[n.id,n.path])) as Record<View,string>;
export const labels=Object.fromEntries(navigationItems.map(n=>[n.id,n.label])) as Record<View,string>;
export const viewFor=(path:string):View=>navigationItems.find(n=>n.path===path)?.id??'all';
