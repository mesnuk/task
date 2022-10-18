type Coord = [number, number];

const fieldCanvas = <HTMLCanvasElement>document.getElementById('fieldTask'),
      ctx = <CanvasRenderingContext2D>fieldCanvas.getContext('2d'),
      rect = fieldCanvas.getBoundingClientRect();
const attributeName = "data-check";
let coords:Array<Coord> = [];
let isClearing : boolean = false;

fieldCanvas.width = window.innerWidth / 2;
fieldCanvas.height = window.innerHeight / 2;
ctx.strokeStyle = 'black';
ctx.lineWidth = 1;

const isIncludes = (start: number, end: number, number: number) : boolean=> {
    const min = Math.min.apply(Math, [start, end]),
        max = Math.max.apply(Math, [start, end]);
    return number > min && number < max;
}

const drawRedDot = (x : number, y : number) : void => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2, true);
    ctx.lineWidth = 1;
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}

const markIntersection :Function = (allCoords : Array<Coord>, cordsToCheck : Array<Coord> = allCoords) : void=> {
    for (let j = 0; j < cordsToCheck.length - 1; j+=2 ) {
        const [[x1, y1], [x2, y2]]: [Coord, Coord] = [cordsToCheck[j], cordsToCheck[j + 1]];

        for (let i = cordsToCheck === allCoords ? j+2 : 0; i < allCoords.length -1; i += 2) {
            const [[x3, y3], [x4, y4]]: Array<Coord> = [allCoords[i], allCoords[i + 1]];
            const c2x : number = x3 - x4,
                c3x : number = x1 - x2,
                c2y : number = y3 - y4,
                c3y : number = y1 - y2;
            const d : number = c3x * c2y - c3y * c2x;

            if (d === 0) {
                continue;
            }

            const u1 : number = x1 * y2 - y1 * x2,
                  u4 : number = x3 * y4 - y3 * x4;


            const px : number = (u1 * c2x - c3x * u4) / d,
                  py : number = (u1 * c2y - c3y * u4) / d;

            const isInlcudesX: boolean = isIncludes(x1, x2, px) && isIncludes(x3, x4, px),
                  isInlcudesY: boolean = isIncludes(y1, y2, py) && isIncludes(y3, y4, py);

            if(isInlcudesX && isInlcudesY ){
                drawRedDot(px, py);
            }
        }
    }

}

const redraw :Function = (coords : Array<Coord>) => {
    for (let i = 0; i < coords.length -1; i += 2) {
        const [[x1, y1], [x2, y2]]: [Coord, Coord] = [coords[i], coords[i + 1]];
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
    markIntersection(coords);
}
const handleFollowing : Function = (event : MouseEvent, coords : Array<Coord>, coordinateX: number, coordinateY: number) : void  => {

    if (fieldCanvas.hasAttribute(attributeName)) {
        ctx.clearRect(0,0, fieldCanvas.width, fieldCanvas.height);
        ctx.beginPath();
        ctx.moveTo(coordinateX, coordinateY);
        ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
        ctx.stroke();
        ctx.closePath();

        redraw(coords);
        markIntersection(coords, [coords[coords.length-1], [event.clientX - rect.left, event.clientY- rect.top]]);
    }
}


const handleDraw : Function = (event : MouseEvent):void => {
    if(isClearing){
        return;
    }

    const coordinateX:number = event.clientX - rect.left,
          coordinateY:number = event.clientY - rect.top;
    coords.push([coordinateX, coordinateY]);
    if(!fieldCanvas.hasAttribute(attributeName)) {
        fieldCanvas.setAttribute(attributeName, 'true');
        fieldCanvas.addEventListener('mousemove',(e) => handleFollowing(e, coords, coordinateX, coordinateY));
    } else {
        fieldCanvas.removeAttribute(attributeName);
    }
}

const handleCancel :Function = (event: MouseEvent):void => {
    event.preventDefault();
    if(fieldCanvas.hasAttribute(attributeName)) {
        ctx.clearRect(0,0, fieldCanvas.width, fieldCanvas.height);
        coords.pop();
        redraw(coords);
        fieldCanvas.removeAttribute(attributeName);
    }
}

const handleClearField : Function = (event: MouseEvent) : void => {
    let xTop:number = 0, yTop:number = 0;
    let xDown = fieldCanvas.width, yDown = fieldCanvas.height;
    isClearing = true;
    handleCancel(event);
    const int = setInterval(() => {
        if(xTop > fieldCanvas.width / 4  && yTop > fieldCanvas.height / 4 ){
            isClearing = false;
            ctx.fillStyle = 'white';
            ctx.fillRect(0,0,fieldCanvas.width, fieldCanvas.height);
            coords = [];
            clearInterval(int);
            return;
        }
        ctx.clearRect(0, 0, xTop + 20, innerHeight);
        ctx.clearRect(0, 0, fieldCanvas.width, yTop+20);
        ctx.clearRect(0, yDown - 20, fieldCanvas.width, fieldCanvas.height);
        ctx.clearRect(xDown-20, 0, fieldCanvas.width, fieldCanvas.height);
        xTop+=5;
        yTop+=5;
        yDown-=5;
        xDown-=5;
    }, 30)
}

fieldCanvas.addEventListener('contextmenu', (e) => handleCancel(e));
document.querySelector('button').addEventListener('click', (event) => handleClearField(event));
fieldCanvas.addEventListener('click', (event) =>  handleDraw(event));

