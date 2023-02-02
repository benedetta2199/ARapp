const urlParams = new URLSearchParams(window.location.search);
const img = urlParams.get('img');
const difficult = urlParams.get('difficult');
//const srcImg = 'https://images.ctfassets.net/hrltx12pl8hq/3j5RylRv1ZdswxcBaMi0y7/b84fa97296bd2350db6ea194c0dce7db/Music_Icon.jpg';
//const srcImg = './asset/'+urlParams.get('img')+'.jpg';

// ?img=1&difficult=easy

let srcImg;
switch(img){
  case '1': srcImg='./asset/puzzle/1.jpg';break;
  case '2': srcImg='./asset/puzzle/2.jpg';break;
  case '3': srcImg='./asset/puzzle/3.jpg';break;
  case '4': srcImg='./asset/puzzle/4.jpg';break;
  case '5': srcImg='./asset/puzzle/5.jpg';break;
}

/*let srcImg;
switch('4'){
  case '1': srcImg='https://cdn.wallpapersafari.com/2/67/Ttw8D9.jpg';break;
  case '2': srcImg='http://media.idownloadblog.com/wp-content/uploads/2014/05/Summer_iPhone5_5C_5S.png';break;
  case '3': srcImg='https://png.pngtree.com/thumb_back/fw800/background/20210414/pngtree-decorative-volume-geometric-composition-of-motion-gradient-cylinders-vectors-editable-vertical-image_607109.jpg';break;
  case '4': srcImg='https://i.joecomp.com/img/wallpapers/657/15-best-nature-wallpapers-in-4k-and-full-hd-for-desktop-and-mobile_29.jpg';break;
}*/

const app = new Vue({
  el: '#zim',
  data: {
    message: 'Vue + ZIM',
    rectWidth: 200 },

  mounted() {
    // store a reference to vue for inside the ZIM Frame
    const vue = this;
    const frame = new Frame("fit", 750, 1000, '#00000000', '#00000000', srcImg,);
      frame.on("ready", () => {// ES6 Arrow Function - similar to function(){} {ready, assets:"SpecialElite-Regular.ttf", path:"/assets/font"}
        //zog("ready from ZIM Frame"); // logs in console (F12 - choose console)
        frame.loadAssets({font: "Elite", src:"./asset/font/SpecialElite-Regular.ttf"});
        frame.on("complete", ()=>{

          // often need below - so consider it part of the template
          let stage = frame.stage;
          let stageW = frame.width;
          let stageH = frame.height;

          // REFERENCES for ZIM at http://zimjs.com
          // see http://zimjs.com/learn.html for video and code tutorials
          // see http://zimjs.com/docs.html for documentation
          // see https://www.youtube.com/watch?v=pUjHFptXspM for INTRO to ZIM
          // see https://www.youtube.com/watch?v=v7OT0YrDWiY for INTRO to CODE

          // CODE HERE
        
          const mob = mobile();
          
          // ~~~~~~~~~~~~~~~~~~~~~
          // CLASS to make JigSaw piece with bumps out or in or no bump on any four edges
          class Piece extends Shape {
              // format is 1 for bump out, -1 for bump in and 0 for no bump
              constructor(w=100,h=100,format=[1,1,1,1],s=black,ss=4,f=white) {
                  super(w,h);
                  const p = Piece.part; // static property - defined below class
                  const g = Piece.gap;
                  this.s(s).ss(ss).f(f).mt(0,0);
                  if (format[0]==0) this.lt(w,0); // top left-right
                  else {
                      this.lt(w*p,0);
                      let s = format[0]==1?-1:1; // sign                
                      this.ct(w*(p-g/2), s*w*g, w/2, s*w*g); // curve left to middle
                      this.ct(w*(p+g+g/2), s*w*g, w*(1-p), 0); // curve middle to right           
                      this.lt(w,0)
                  }            
                  if (format[1]==0) this.lt(w,h); // right top-bottom
                  else {
                      this.lt(w,h*p);
                      let s = format[1]==1?1:-1; 
                      this.ct(w+s*w*g, h*(p-g/2), w+s*w*g, h/2);
                      this.ct(w+s*w*g, h*(p+g+g/2), w, h*(1-p));                
                      this.lt(w,h)
                  }            
                  if (format[2]==0) this.lt(0,h); // bottom right-left
                  else {
                      this.lt(w*(1-p),h);
                      let s = format[2]==1?1:-1;           
                      this.ct(w*(p+g+g/2), h+s*w*g, w/2, h+s*w*g);
                      this.ct(w*(p-g/2), h+s*w*g, w*p, h+0);                
                      this.lt(0,h)
                  }            
                  if (format[3]==0) this.lt(0,0); // left bottom-top
                  else {
                      this.lt(0,h*(1-p));
                      let s = format[3]==1?-1:1;             
                      this.ct(s*w*g, h*(p+g+g/2), s*w*g, h/2);
                      this.ct(s*w*g, h*(p-g/2), 0, h*p);             
                      this.lt(0,0)
                  }
                  this.cp(); // close path
              }        
          }
          Piece.part = .37; // part of the edge with no gap ratio
          Piece.gap = 1-Piece.part*2; // gap ratio of edge
          
          
          // ~~~~~~~~~~~~~~~~~~~~~
          // PUZZLE SIZE
          
          let numX = 2;
          let numY = 3; 
          switch(difficult){
            case 'easy': numX = 2; numY = 3;break;
            case 'medium': numX = 3; numY = 4;break;
            case 'hard': numX = 4; numY = 6;break;
          }
          const obj = getQueryString(); // note, getQueryString returns {} now if no query string    
          if (obj.col) numX = Math.min(10, Number(obj.col)); // or we would have to start chaching things...
          if (obj.row) numY = Math.min(14, Number(obj.row));
          
          // ~~~~~~~~~~~~~~~~~~~~~
          // PICTURE
          
          const pic = asset(srcImg).clone().center().alp(.3).vis(false); // checkbox later to turn on
          const w = pic.width/numX;
          const h = pic.height/numY;   
          
          // chop the picture into bitmaps
          // false is for an array rather than the default Tile output 
          // extra is because bumps go outside the width and height
          const extra = Math.max(w,h)*Piece.gap; 
          const pics = chop(asset(srcImg), numX, numY, false, extra); 
              
              
          // ~~~~~~~~~~~~~~~~~~~~~
          // PIECES
          
          // makePieces gets called from Tile - for each piece
          let count=0;
          let lastX = rand()>.5?1:-1; // 1 or -1 for out or in horizontally
          let lastYs = []; // 1 or -1 vertically - remember with array and modulus
          loop(numX, i=>{lastYs.push(rand()>.5?1:-1);});
          function makePiece() {   
              
              // prepare format for jigsaw piece [1,0,-1,0] 
              // 1 bump out, 0 no bump, -1 bump in, etc.
              let currentX = lastX*-1; // opposite of last x
              let currentY = lastYs[count%numX]*-1; // opposite of last y
              let nextX = rand()>.5?1:-1; // randomize the next 1 or -1 for out or in horizontally
              let nextY = rand()>.5?1:-1; // and vertically
              // top, right, bottom, left
              let format = [currentY, nextX, nextY, currentX]; 
              lastX = nextX;
              lastYs[count%numX] = nextY;       
              
              // override edges to 0
              if (count < numX) format[0] = 0;
              else if (count >= numX*numY-numX) format[2] = 0;
              if (count%numX==0) format[3] = 0;
              else if ((count-numX+1)%numX==0) format[1] = 0;
              
              // make a container to hold jigsaw shape and later picture part
              let piece = new Container(w,h).centerReg({add:false});
              piece.puzzle = new Piece(w, h, format).addTo(piece);      
              piece.mouseChildren = false;  
              count++;
              return piece;
          }
              
          const pieces = new Tile({
              obj:makePiece, 
              cols:numX, 
              rows:numY,
              clone:false // otherwise makes clone of piece
          }).center()
              .drag(stage).animate({
                  props:{alpha:1},
                  time:.1,
                  sequence:.05
              });
          
          
          // ~~~~~~~~~~~~~~~~~~~~~
          // HINT AND SNAP HIT BOX
          
          // tidy up alpha setting on hint around border
          const outline = new Rectangle(pic.width,pic.height,clear,mist,4).center().ord(-1) // under pieces    
          const hint = pieces.clone(true) // exact
              .center()
              .ord(-1) // under pieces     
              .cache(-5,-5,pic.width+10,pic.height+10) // cache by default does not include outside border 
              .alp(.2)
              .vis(0); // checkbox below to show
          
          // make a little box to do hit test to see if in right place
          const snap = 50; // pixel distance considered correct
          loop(hint, h=>{
              h.box = new Rectangle(snap,snap).centerReg(h).vis(0); // do not use alpha=0 as that will make it not hittable        
          });
          
          
          // ~~~~~~~~~~~~~~~~~~~~~
          // ADD PICTURE TO PIECES, ADD EVENTS, ROTATE AND SCRAMBLE
          
          const padding = 50;
          const rotate = true;
          loop(pieces, (piece,i)=>{
              piece.alp(0); // sequence animation above will animate in alpha
              pics[i].addTo(piece).setMask(piece.puzzle);  
              // test on mobile and see if you need to cache...
              // usually this is just cache() but the bumps are outside the piece 
              // and the cache size really does not make a difference if rest is background transparent 
              if (mob) piece.cache(-100,-100,piece.width+200,piece.width+200);
              if (rotate) {
                  piece.rotation = shuffle([0,90,180,270])[0];
                  piece.tap({
                      time:.5, // within .5 seconds
                      call:() => {   
                          pieces.noMouse(); // do not let anything happen while animating until done
                          piece.animate({
                              props:{rotation:String(frame.shiftKey?-90:90)}, // string makes relative
                              time:.2,
                              call:() => {
                                  pieces.mouse();
                                  test(piece);
                              }
                          });                
                          stage.update();
                      }, 
                      call2:() => { // if no tap
                          test(piece);   
                      }                
                  }); 
              } else {
                  piece.on("change", () => {
                      test(piece); 
                  });
              }        
              piece.on("change", () => {
                  // shadows are expensive on mobile
                  // could add it to container so shadow inside container 
                  // then cache the container but might not be worth it
                  if (!mob) piece.sha("rgba(0,0,0,.4)",5,5,5);
              });
              
              // scramble location     
              piece.loc(padding+w/2+rand(stageW-w-padding*2)-pieces.x, padding+h/2+rand(stageH-h-padding*2)-pieces.y);        
          }); 
          
          
          // ~~~~~~~~~~~~~~~~~~~~~
          // EMITTER
          const emitter = new Emitter({
              obj:new Poly({min:40, max:70}, [5,6], .5, [orange, blue, green]),
              num:2,
              force:6,
              startPaused:true
          });  
     

          // ~~~~~~~~~~~~~~~~~~~~~
          // MESSAGE LABEL

          const num = numX * numY;
          let placed = 0;
          STYLE = { color: '#EFE7DE', size: 26, font: 'Elite' };
          const stats = new Label({
            text: `Posizionat${placed == 1 ? "o" : "i"} ${placed} pezz${placed == 1 ? "o" : "i"} su ${num}`,
            italic: true,
            align: CENTER }).
          centerReg().pos(0, 100, CENTER, TOP);


          // ~~~~~~~~~~~~~~~~~~~~~
          // TEST FOR PIECE IN RIGHT PLACE AND END 

          function test(piece) {
            piece.sha(-1);
            let box = hint.items[piece.tileNum].box;
            if (piece.rotation % 360 == 0 && box.hitTestReg(piece)) {
              piece.loc(box).bot().noMouse();
              emitter.loc(box).spurt(30);
              placed++;
              if (placed == num) {
                stats.text = `Complimenti ${num} tutti i pezzi sono stati posizionati!`;
                stats.pos(0, 50, CENTER, TOP);
                timeout(1, function () {
                  emitter.emitterForce = 8;
                  emitter.center().mov(0, -170).spurt(100);
                });
                timeout(2, function () {
                  hintCheck.removeFrom();
                  picCheck.removeFrom();
                  picCheck.checked = true;
                  pieces.animate({ alpha: 0 }, .7);
                  outline.animate({ alpha: 0 }, .7);
                  hint.animate({ alpha: 0 }, .7);
                  pic.alp(0).animate({ alpha: 1 }, .7);
                  new Button({
                    label: "Gioca ancora",
                    color: '#EFE7DE',
                    corner: 10,
                    backgroundColor: "#2c3e3d"}).

                  sca(.8).
                  pos(0, 80, CENTER, BOTTOM).
                  alp(0).
                  animate({ alpha: 1 })
                  // normally just zgo("index.html") to reload 
                  // but it is different in CodePen and they have disabled document.location.reload()
                  // so not sure what to do... here is a the puzzle on ZIM
                  .tap(() => {zgo("./index.html");});
                });
              } else stats.text = `Posizionat${placed == 1 ? "o" : "i"} ${placed} pezz${placed == 1 ? "o" : "i"} su ${num}`;
            } else stage.update();
          }

          // ~~~~~~~~~~~~~~~~~~~~~
          // CHECKBOXES AND FINISHING TOUCHES

          Style.addType("CheckBox", { backgroundColor: '#00000000',borderColor: '#EFE7DE', font: 'Elite', });
          const hintCheck = new CheckBox(26, "Aggiungi contorno").alp(.8).pos(0, 120, CENTER, BOTTOM).wire({ target: hint, prop: "visible", input: "checked" });
          const picCheck = new CheckBox(26, "Aggiungi figura").alp(.8).pos(0, 80, CENTER, BOTTOM).wire({ target: pic, prop: "visible", input: "checked" });
          

          pieces.top(); // add pieces above everything

          stage.update(); // needed to view changes

      })});
  },

  methods: {} });