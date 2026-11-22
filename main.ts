import{readFileSync,mkdirSync,writeFileSync}from'node:fs';
const I=process.env.I||'/input',O=process.env.O||'/output';
for(let n=1;n<=40;n++){
const id='i'+String(n).padStart(3,'0');
const p=new Uint8Array(readFileSync(I+'/'+id+'/program.bin'));
const inp=new Uint8Array(readFileSync(I+'/'+id+'/input.bin'));
const s:number[]=[],c:number[]=[],m=new Int32Array(256);
let pc=0,ip=0,steps=0,exit=0,done=false;
const out:number[]=[];
while(!done){
if(steps>=1e6){exit=10;break}
if(pc<0||pc>=p.length){exit=9;break}
const op=p[pc];
const kn=op==0||op==1||op==2||op==3||op==4||op==5||op==6||op==7||(op>=0x10&&op<=0x1e)||op==0x20||op==0x21||op==0x22||(op>=0x30&&op<=0x34)||op==0x40||op==0x41||op==0x50||op==0x51||op==0x52||op==0x53;
if(!kn){exit=5;break}
const il=op==1?1:op==2?4:(op>=0x30&&op<=0x33)?2:0;
if(pc+1+il>p.length){exit=9;break}
let pops=0,push=0;
if(op==1||op==2||op==0x52)push=1;
else if(op==3||op==0x31||op==0x32||op==0x50||op==0x51||op==0x53)pops=1;
else if(op==4){pops=1;push=2}
else if(op==5){pops=2;push=2}
else if(op==6){pops=2;push=3}
else if(op==7){pops=3;push=3}
else if(op==0x17||op==0x1b){pops=1;push=1}
else if(op>=0x10&&op<=0x22){pops=2;push=1}
else if(op==0x40){pops=1;push=1}
else if(op==0x41)pops=2;
if(s.length<pops){exit=2;break}
if(s.length-pops+push>256){exit=3;break}
steps++;
const nx=pc+1+il;
let a=0,b=0;
switch(op){
case 0:exit=0;done=true;break;
case 1:{let v=p[pc+1];s.push(v>=128?v-256:v);pc=nx;break}
case 2:s.push(p[pc+1]|p[pc+2]<<8|p[pc+3]<<16|p[pc+4]<<24);pc=nx;break;
case 3:s.pop();pc=nx;break;
case 4:s.push(s[s.length-1]);pc=nx;break;
case 5:{const t=s[s.length-1];s[s.length-1]=s[s.length-2];s[s.length-2]=t;pc=nx;break}
case 6:s.push(s[s.length-2]);pc=nx;break;
case 7:{const t=s[s.length-3];s[s.length-3]=s[s.length-2];s[s.length-2]=s[s.length-1];s[s.length-1]=t;pc=nx;break}
case 0x10:case 0x11:case 0x12:case 0x13:case 0x14:case 0x15:case 0x16:case 0x18:case 0x19:case 0x1a:case 0x1c:case 0x1d:case 0x1e:case 0x20:case 0x21:case 0x22:
b=s.pop()!;a=s.pop()!;
if((op==0x13||op==0x14||op==0x15||op==0x16)&&b==0){exit=4;done=true;break}
if(op==0x10)s.push(a+b|0);
else if(op==0x11)s.push(a-b|0);
else if(op==0x12)s.push(Math.imul(a,b));
else if(op==0x13)s.push(a==-2147483648&&b==-1?a:Math.trunc(a/b)|0);
else if(op==0x14)s.push(a%b|0);
else if(op==0x15)s.push(Math.floor((a>>>0)/(b>>>0))|0);
else if(op==0x16)s.push((a>>>0)%(b>>>0)|0);
else if(op==0x18)s.push(a&b);
else if(op==0x19)s.push(a|b);
else if(op==0x1a)s.push(a^b);
else if(op==0x1c)s.push(a<<(b&31));
else if(op==0x1d)s.push(a>>(b&31));
else if(op==0x1e)s.push(a>>>(b&31)|0);
else if(op==0x20)s.push(a==b?1:0);
else if(op==0x21)s.push(a<b?1:0);
else s.push((a>>>0)<(b>>>0)?1:0);
pc=nx;break;
case 0x17:s.push(-s.pop()!|0);pc=nx;break;
case 0x1b:s.push(~s.pop()!);pc=nx;break;
case 0x30:{let o=p[pc+1]|p[pc+2]<<8;pc=nx+(o>=32768?o-65536:o);break}
case 0x31:case 0x32:{let o=p[pc+1]|p[pc+2]<<8;const v=s.pop()!;pc=(op==0x31?v==0:v!=0)?nx+(o>=32768?o-65536:o):nx;break}
case 0x33:{if(c.length>=64){exit=7;done=true;break}c.push(nx);pc=p[pc+1]|p[pc+2]<<8;break}
case 0x34:{if(!c.length){exit=8;done=true;break}pc=c.pop()!;break}
case 0x40:{const d=s.pop()!;if(d<0||d>255){exit=6;done=true;break}s.push(m[d]);pc=nx;break}
case 0x41:{const d=s.pop()!,v=s.pop()!;if(d<0||d>255){exit=6;done=true;break}m[d]=v;pc=nx;break}
case 0x50:{const v=s.pop()!,t=String(v);if(out.length+t.length>65536){exit=11;done=true;break}for(let i=0;i<t.length;i++)out.push(t.charCodeAt(i));pc=nx;break}
case 0x51:{if(out.length>=65536){exit=11;done=true;break}out.push(s.pop()!&255);pc=nx;break}
case 0x52:s.push(ip<inp.length?inp[ip++]:-1);pc=nx;break;
case 0x53:exit=s.pop()!&255;done=true;break;
}
}
mkdirSync(O+'/'+id,{recursive:true});
writeFileSync(O+'/'+id+'/stdout.bin',Buffer.from(out));
writeFileSync(O+'/'+id+'/exit.txt',String(exit)+'\n');
}
