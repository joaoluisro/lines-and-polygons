class Point{
  constructor(x0, y0){
    this.x = x0;
    this.y = y0;
  }
}

class Line{
  constructor(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
    this.update = true;
    this.grab = false;
    this.slope = (p2.y - p1.y)/(p2.x - p1.x);
    this.linear_c = p1.y - (this.slope*p1.x);
    this.update_corner = 0;
  }

  in_range_corner(radius, x, y){
    let d1 = Math.abs(this.p1.x - x) + Math.abs(this.p1.y - y);
    let d2 = Math.abs(this.p2.x - x) + Math.abs(this.p2.y - y);
    return (d1 <= radius * radius) + 2*(d2 <= radius * radius);
  }

  in_range_split(tol, x, y){
    let eq = y - (this.slope)* x;

    let on_line = (eq >= this.linear_c - tol) && (eq <= this.linear_c + tol);
    let on_range_x = Math.max(this.p1.x, this.p2.x) >= x && Math.min(this.p1.x, this.p2.x) <= x;
    let on_range_y = Math.max(this.p1.y, this.p2.y) >= y && Math.min(this.p1.y, this.p2.y) <= y;

    return (on_line) && (on_range_x) && (on_range_y);
  }

  update_point(x, y){
    if (this.update_corner == 1){
      this.p1.x = x;
      this.p1.y = y;
    }else{
      this.p2.x = x;
      this.p2.y = y;
    }
  }

  add_eps(eps_x, eps_y){
    this.p1.x += eps_x;
    this.p2.x += eps_x;
    this.p1.y += eps_y;
    this.p2.y += eps_y;
  }

  get_r(){
    return Math.sqrt((this.p2.x - this.p1.x) * (this.p2.x - this.p1.x) +
                     (this.p2.y - this.p1.y) * (this.p2.y - this.p1.y));
  }

  get_distance(x,y, r){
    return ((this.p2.x - this.p1.x) * (this.p1.y - y) -
           (this.p1.x - x) * (this.p2.y - this.p1.y))/r;

  }

}

function addPolygon(canvas, n_sides){
  return;
}

function updateCanvas(canvas, lines){
  let ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let i=0; i < lines.length; i++){
    let l = lines[i];
    if(l.update){

      ctx.moveTo(l.p1.x, l.p1.y);
      ctx.lineTo(l.p2.x, l.p2.y);
      ctx.lineWidth=5;
      ctx.strokeStyle="red";
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.fillRect(l.p1.x - 3, l.p1.y - 3, 12, 12);
      ctx.fillRect(l.p2.x - 3, l.p2.y - 3, 12, 12);
      ctx.stroke();
    }

  }

}


window.addEventListener("load", () => {

  let canvas = document.getElementById("canvas-line");
  let div = document.getElementById("canvas-1");
  canvas.width = div.clientWidth;
  canvas.height = div.clientHeight;

  // pontos iniciais
  let p1 = new Point(200, 200);
  let p2 = new Point(800, 500);
  let p3 = new Point(100, 100);
  let p4 = new Point(150, 150);
  let lines = [];
  let l1 = new Line(p1, p2);
  let l2 = new Line(p3, p4);
  lines.push(l2);
  lines.push(l1);
  let block_split = false;
  let refresh_canvas = false;
  updateCanvas(canvas, lines);

  canvas.addEventListener('mousedown', () =>{
    refresh_canvas = true;
    block_split = true;
    const rect = canvas.getBoundingClientRect();
    let x = event.pageX - rect.left;
    let y = event.pageY - rect.top;

    let radius = 6;
    let tol = 10;

    for(let i=0; i < lines.length; i++){
      let l = lines[i];
      let corner = l.in_range_corner(radius, x, y);
      l.update_corner = corner;

      let grab = l.in_range_split(tol, x, y);
      if(grab && corner == 0){
        console.log("yes");
        l.grab = true;
      }
    }
    block_split = false;
  });

  canvas.addEventListener('mouseup', ()=>{
    refresh_canvas = false;
  });


  canvas.addEventListener('contextmenu', (event) =>{
    event.preventDefault();
    if(block_split){
      console.log("split blocked");
    }

    const rect = canvas.getBoundingClientRect();
    let x = event.pageX - rect.left;
    let y = event.pageY - rect.top;

    let radius = 6;
    let tol = 12;

    for(let i=0; i < lines.length; i++){
      let l = lines[i];

      let split = l.in_range_split(tol, x, y);
      if(split){

        p_intersection = new Point(x,y);
        p_1 = new Point(l.p1.x, l.p1.y);

        let new_line = new Line(p_1, p_intersection);
        l.update_point(1, x, y);
        lines.push(new_line);
        updateCanvas(canvas, lines);
        return;

      }
    }
  });

  canvas.addEventListener('mousemove', ()=>{
    if(!refresh_canvas) return;

    block_split = true;
    const rect = canvas.getBoundingClientRect();
    let x = event.pageX - rect.left;
    let y = event.pageY - rect.top;

    let radius = 6;
    let tol = 8;
    let update = false;

    function compare_dist(pa, pb){
      if(pa.get_distance(x,y) < pb.get_distance(x,y)){
        return -1;
      }
      if(pb.get_distance(x,y) > pb.get_distance(x,y)){
        return 1;
      }
      return 0;
    }

    lines.sort(compare_dist);


    let i = 0;
    while(i < lines.length && !update){
      let l = lines[i];

      let corner = l.in_range_corner(radius, x, y);
      l.update_corner = corner;
      if(corner > 0){
        l.update_point(x,y);
        update = true;
      }

      let grab = l.in_range_split(tol, x,y);
      if(l/grab && corner == 0){
        // vertical
        let r = l.get_r();
        let d = l.get_distance(x,y, r);
        let dx = (d/r)*(l.p1.y - l.p2.y);
        let dy = (d/r)*(l.p2.x - l.p1.x);


        l.add_eps(-dx/10, -dy/10);
        update = true;
        // horizontal


      }
      i += 1;
    }


    updateCanvas(canvas, lines);
    block_split = false;
  });


});
