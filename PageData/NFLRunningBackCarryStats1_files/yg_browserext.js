var yg_frameable=0;
if(yg_frameable&&(top.location!=self.location))top.location=self.location;

if(document.layers){
	yg_onResizeNS4.w=innerWidth;yg_onResizeNS4.h=innerHeight;
	if(document.embeds.length>0)setInterval("yg_onResize()",200);
	else onresize=yg_onResizeNS4;
}else if((navigator.userAgent.indexOf("Mac")!=-1)&&(document.all)){
	onresize=yg_onResizeMacIE;
}else{
//	onresize=init;
//	if(document.getElementById&&!document.all)onresize=init;
//	else onresize=yg_onResizeNS6;
}
function yg_onResizeNS4(){
	if(w!=innerWidth||h!=innerHeight)location.reload();
}
function yg_onResizeMacIE(){
	location.reload();
}
function yg_onResizeNS6(){
	location.reload();
}

function yg_back(){
	history.back();
}
function yg_print(){
	if(print){print();return 1}else return 0;
}
function yg_bookmark(){
	if(window.external){external.AddFavorite(location.href,document.title);return 1}else return 0;
}

function yg_popup(u,n,w,h,k){
	var a=[],o=null,r=arguments;
	a[0]="width="+w+",height="+h;
	a[1]=",scrollbars="+((k&1)?1:0);
	a[2]=",resizable="+((k&2)?1:0);
	a[3]=",toolbar="+((k&4)?1:0);
	a[4]=",status="+((k&8)?1:0);
	a[5]=",location="+((k&16)?1:0);
	a[6]=",menubar="+((k&32)?1:0);
	if(r.length>=6){a[7]=(document.layers)?",screenX="+r[5]:",left="+r[5]}
	if(r.length>=7){a[8]=(document.layers)?",screenY="+r[6]:",top="+r[6]}
	a=a.join("");o=open(u,n,a);o.focus();
	return o;
}

if(!Array.prototype.pop){
	function yg_arrayPop(){
		var a=this[this.length-1];
		this.length=Math.max(this.length-1,0);
		return a;
	}
	Array.prototype.pop=yg_arrayPop;
}

if(Array.prototype.push&&([0].push(true)==true))Array.prototype.push=null;
if(!Array.prototype.push){
	function yg_arrayPush(){
		for(var i=0;i<arguments.length;i++)this[this.length]=arguments[i];
		return this.length;
	}
	Array.prototype.push=yg_arrayPush;
}

if(!Array.prototype.shift){
	function yg_arrayShift(){
		var a=this[0];
		this.reverse();
		this.length=Math.max(this.length-1,0);
		this.reverse();
		return a;
	}
	Array.prototype.shift=yg_arrayShift;
}

if(Array.prototype.splice&&typeof([0].splice(0))=="number")Array.prototype.splice=null;
if(!Array.prototype.splice){
	function yg_arraySplice(n,s){
		if(arguments.length==0)return n;
		if(typeof n!="number")n=0;
		if(n<0)n=Math.max(0,this.length+n);
		if(n>this.length){
			if(arguments.length>2)n=this.length;
			else return [];
		}
		if(arguments.length<2)s=this.length-n;
		s=(typeof s=="number")?Math.max(0,s):0;
		var a=this.slice(n,n+s);
		var b=this.slice(n+s);
		this.length=n;
		for(var i=2;i<arguments.length;i++)this[this.length]=arguments[i];
		for(var i=0;i<b.length;i++)this[this.length]=b[i];
		return a;
	}
	Array.prototype.splice=yg_arraySplice;
}

if((!Array.prototype.unshift)||document.all){
	function yg_arrayUnshift(){
		this.reverse();
		for(var i=arguments.length-1;i>=0;i--)this[this.length]=arguments[i];
		this.reverse();
		return this.length
	}
	Array.prototype.unshift=yg_arrayUnshift;
}