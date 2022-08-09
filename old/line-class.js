export default class Point{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }

  add(x, y){
    this.x += x;
    this.y += y;
  }

  copy(){
    let copy = new Point(this.x, this.y);
    return copy;
  }

  distSqrd(x, y){
    return((this.x - x)**2 + (this.y - y)**2);
  }

  update(x, y){
    this.x = x;
    this.y = y;
  }

  len(){
    return Math.sqrt(this.x**2 + this.y**2);
  }

  normalized(){
    let p = new Point(this.x, this.y);
    p.x /= p.len();
    p.y /= p.len();
    return p;
  }

  dot(a,b){
    return a*this.x + b*this.y;
  }

}

export default class Line{
  constructor(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
    this.move = 0;
    this.drag = false;
  }

  update_corner(which, x, y){
    if(which == 1){
      this.p1.update(x, y);
    }
    else if(which == 2){
      this.p2.update(x, y);
    }
  }

  // verifica se o ponto clicado está na proximidade de um dos cantos
  in_range_corner(radius, x, y){

    let d_p1 = this.p1.distSqrd(x, y);
    let d_p2 = this.p2.distSqrd(x, y);

    if(radius * radius >= d_p1) return 1;
    else if(radius * radius >= d_p2) return 2;
    return 0;
  }

  distSqrd_to_point(x, y){
    let x1 = this.p1.x;
    let x2 = this.p2.x;
    let y1 = this.p1.y;
    let y2 = this.p2.y;
    return Math.abs(((y2 - y1)*x - (x2 - x1)*y + (x2*y1) - (y2*y1))/((y2 - y1)**2 + (x2 - x1)**2));
  }

  get_r(){
    return Math.sqrt((this.p2.x - this.p1.x) * (this.p2.x - this.p1.x) +
                     (this.p2.y - this.p1.y) * (this.p2.y - this.p1.y));
  }

  get_d(x,y, r){
    return ((this.p2.x - this.p1.x) * (this.p1.y - y) -
           (this.p1.x - x) * (this.p2.y - this.p1.y))/r;

  }

  is_between(x,y){
    let x1 = Math.min(this.p1.x, this.p2.x);
    let x2 = Math.max(this.p1.x, this.p2.x);
    let y1 = Math.min(this.p1.y, this.p2.y);
    let y2 = Math.max(this.p1.y, this.p2.y);

    return(x1 <= x && x2 >= x && y1 <= y && y2 >= y );

  }

  get_m(){
    let p = new Point((this.p1.x + this.p2.x)/2,(this.p1.y + this.p2.y)/2);
    return p;
  }

  is_collinear(x, y, eps){
    let t1 = this.p1.normalized();
    let t2 = this.p2.normalized();
    let t3 = new Point(x,y);
    let t4 = t3.normalized();

    let x1 = t1.x;
    let y1 = t1.y;
    let x2 = t2.x;
    let y2 = t2.y;
    let x3 = t4.x;
    let y3 = t4.y;
    let cross = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    console.log(cross);

    return(cross < eps);
  }
}
