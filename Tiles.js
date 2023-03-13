can = document.getElementById("can")
w = 100
h = 100
d = 2
X = w+d
Y = h+d
can.width = 13*X
can.height = 9*Y
rect = can.getBoundingClientRect();
x0 = rect.left + 2
y0 = rect.top + 2
c = can.getContext('2d')
class Box {
    constructor(x,y,Color="Red"){
        this.Color = Color
        this.x = x
        this.y = y
        c.beginPath()
        c.fillStyle = this.Color
        c.fillRect(x-x0,y-y0,w,h)
    }
    Move(x,y){
        this.x = x;
        this.y = y;
        c.beginPath()
        c.fillStyle = this.Color
        c.fillRect(x-x0,y-y0,w,h)
        c.stroke()
    }
    On(x,y){
        let X = x - this.x;
        let Y = y - this.y;
        if((X>0)&&(X<w)&&(Y>0)&&(Y<h)){
            return true;
        }
        return false;
    }
    Overlaps(B2){
        let X =  (Math.abs(this.x - B2.x) <= w ); 
        let Y =  (Math.abs(this.y - B2.y) <= h ); 
        return ( X && Y );
    }
}
class Group {
    constructor(x,y,L,Color="Red"){
        this.head = new Box(x,y,Color)
        this.x = x
        this.y = y
        this.L = [this.head]
        this.Color = Color
        for(var i=0;i<L.length;i++){
            let Coord = L[i];
            (this.L).push(new Box(x+(w+d)*Coord[0],y+(h+d)*Coord[1],Color))
        }
    }
    Rotate(){
        var L = this.L
        for(var i=0;i<L.length;i++){
            let B = L[i]
            c.clearRect(B.x - x0,B.y - y0,w,h)
            let X = B.x + w/2 - this.x
            let Y = B.y + h/2 - this.y
            B.x = this.x - Y - w/2
            B.y = this.y + X - h/2
        }
        Redraw()
        this.Redraw()
    }
    FlipH(){
        console.log("flip about :",this.x,this.y)
        var L = this.L
        for(var i=0;i<L.length;i++){
            let B = L[i]
            console.log(i)
            console.log(B.x,B.y)
            c.clearRect(B.x - x0,B.y - y0,w,h)
            let X = B.x + w/2 - this.x
            B.x = this.x - X -w/2
            console.log(B.x,B.y)
        }
        Redraw()
        this.Redraw()
    }
    
    Redraw(){
        let L = this.L
        for(var i=0;i<L.length;i++){
            let B = L[i];
            c.clearRect(B.x -x0,B.y - y0,w,h)
        }
        for(var i=0;i<L.length;i++){
            let B = L[i];
            B.Move(B.x,B.y)
        }
    }
    Move(x,y){
        let L = this.L
        for(var i=0;i<L.length;i++){
            let B = L[i];
            c.clearRect(B.x -x0,B.y - y0,w,h)
        }
        for(var i=0;i<L.length;i++){
            let B = L[i];
            B.Move(x+B.x-this.x,y+B.y-this.y)
        }
        this.x = x
        this.y = y
    }
    MoveHeadto(x,y){
        let L = this.L
        let head = this.head
        let xh = head.x
        let yh = head.y
        for(var i=0;i<L.length;i++){
            let B = L[i];
            c.clearRect(B.x -x0,B.y - y0,w,h)
        }
        for(var i=0;i<L.length;i++){
            let B = L[i];
            B.Move(x+B.x-xh,y+B.y-yh)
        }
    }
    On(x,y){
        let L = this.L
        for(var i=0;i<L.length;i++){
            let B = L[i];
            if(B.On(x,y)){
                this.x = x
                this.y = y
                this.head = B
                return true
            }
        }
        return false
    }
    Overlaps(G2){
        let L = this.L
        for(var i=0;i<L.length;i++){
            let B = L[i];
            for (var j=0;j<(G2.L).length;j++){
                let B2 = (G2.L)[j]
                if (B.Overlaps(B2)){
                    return true
                }
            }
        }
    }
}
let Shapes = [
    new Group(X*1,Y*1,[[1,0],[2,0],[1,1]],"Green"),
    new Group(X*4,Y*1,[[1,0],[2,0],[0,1]],"Blue"),
    new Group(X*4,Y*3,[[1,0],[2,1],[1,1]],"Orange"),
    new Group(X*1,Y*3,[[1,0],[0,1],[1,1]],"Purple"),
    new Group(X*1,Y*5,[[1,0],[2,0],[3,0]],"Pink"),
];
let SelectedObject = null;
let selected = false;
function Hold(event){
    console.log(event.clientX,event.clientY)
    for(var i=0;i<Shapes.length;i++){
        let Shape = Shapes[i];
        if(Shape.On(event.clientX,event.clientY)){
            SelectedObject = Shape;
            selected = true;
        }
    }
}
function Move(event){
    var x = event.clientX
    var y = event.clientY
    if (selected){
        SelectedObject.Move(x,y)
        Redraw()
        SelectedObject.Redraw()
        Grid("rgb(204, 177, 219)")
    }
    
}
function Release(){
    var x = SelectedObject.head.x
    var y = SelectedObject.head.y
    x = (w+d)*Math.floor(x/(w+d) + 0.5); 
    y = (h+d)*Math.floor(y/(h+d) + 0.5);
    SelectedObject.MoveHeadto(x,y)
    for(var i=0;i<Shapes.length;i++){
        let Shape = Shapes[i];
        if(Shape!=SelectedObject){
            Shape.Redraw()
        }
    }
    SelectedObject.Redraw()
    selected = false
    Grid("white")
}
function Key(event){
    if(event.key == 'f'){
        SelectedObject.FlipH()
    }
    if(event.key == 'r'){
        SelectedObject.Rotate()
    }
    console.log("key presses",event.key)
}
function Grid(color){
    let X0 = X*8 - x0
    let Y0 = Y - y0
    c.lineWidth = 2;
    c.strokeStyle = color
    c.beginPath()
    for(var i=0;i<5;i++){
        c.moveTo(X0+i*X,Y0)
        c.lineTo(X0+i*X,Y0+5*Y)
    }
    for(var i=0;i<6;i++){
        c.moveTo(X0,Y0+i*Y)
        c.lineTo(X0+4*X,Y0+i*Y)
    }
    c.stroke()
}
function Redraw(){
    for(var i=0;i<Shapes.length;i++){
        Shapes[i].Redraw()
    }
}
function FlipH(){
    SelectedObject.FlipH()
}
function Rotate(){
    SelectedObject.Rotate()
}
Grid("white")
document.onmousedown = Hold
document.onmousemove = Move
document.onmouseup = Release
document.onkeydown = Key