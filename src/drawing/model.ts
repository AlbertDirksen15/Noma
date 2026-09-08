export type Point={x:number;y:number};
export type DrawingTool='pencil'|'pen'|'marker'|'eraser';
export type Stroke={id:string;tool:Exclude<DrawingTool,'eraser'>;color:string;width:number;opacity:number;points:Point[]};
export type Drawing={version:1;width:number;height:number;strokes:Stroke[]};
export const emptyDrawing=():Drawing=>({version:1,width:1000,height:700,strokes:[]});
export const pathFor=(points:Point[])=>points.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ');
export function distanceToSegment(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;const t=length?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/length)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)}
export const eraseAt=(drawing:Drawing,point:Point,radius:number):Drawing=>({...drawing,strokes:drawing.strokes.filter(s=>!s.points.some((p,i)=>distanceToSegment(point,s.points[Math.max(0,i-1)],p)<=radius+s.width/2))});
