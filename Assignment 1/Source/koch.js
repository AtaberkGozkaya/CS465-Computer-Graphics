/*
 * This project is to draw a koch snowflake
 * Bilkent University
 * CS465 Computer Graphics HW #1
 * Ataberk Gözkaya
 * 21501928
*/
var canvas;
var gl;
var points = [];
var iterationCount = 0; 
var vertices = [];
var index = 0;
var check = true;
var begin = true;
var maxNumVertices  = 200;
var fColorLocation;


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    

    document.getElementById("slider").onchange = function () {
        iterationCount = event.srcElement.value;
        //console.log(iterationCount);
    };

    var but = document.getElementById("Button1")
    but.addEventListener("click", function(){
    check = false;
    //console.log(iterationCount);
    koch(vertices, iterationCount);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    
    render();
    });
    
    
    

    canvas.addEventListener("click", function(event){
        t  = vec2(2*event.clientX/canvas.width-1, 
           2*(canvas.height-event.clientY)/canvas.height-1);

        
        vertices.push(t);
        var a = vertices[0][0] - vertices[vertices.length-1][0];
        var b = vertices[0][1] - vertices[vertices.length-1][1];

        var c = Math.sqrt( a*a + b*b );
        
        if(vertices.length>1)
        {
            if(Math.abs(c)<0.1)
            {
                vertices.pop();
                begin = false;
            }
        }
        
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));
        index++;
        render();      
    } );


    


    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );


    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    fColorLocation = gl.getUniformLocation(program, "fColor");

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    

    //var bufferId2 = gl.createBuffer();
   //gl.bindBuffer( gl.ARRAY_BUFFER, bufferId1 );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
    


    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    
    render();
    
};


function koch(arr, count){
    for(let i = 0; i < arr.length; i++){
        if(i != arr.length-1){
            divideLine(arr[i], arr[i+1], count);
            //console.log("son değil: "+ arr[i]);
        }
        else{
            divideLine(arr[i], arr[0], count);
            //console.log("son : "+ arr[i]);
        }
    }
}
//this function for divide each line and draw the koch line
function divideLine(a, b,count)
{
  if(count === 0){
    var left;
    var middle;
    var right;
    left = mix(a,b,1/4);
    middle = mix(a,b,2/4);
    right = mix(a,b,3/4);
    var f = calculatePoint(left,middle);
    var g = calculatePoint(middle, right);
    var h = calculateUnderPoint(middle, right);
    var i = calculatePoint(right, middle);
    drawLine(a,left,f,g,h,i,right,b);
  }
  else {
    var ab = mix (a,b,0.25);
    var half = mix(a,b,0.5);
    var ba = mix (b,a,0.25);
    

    var f = calculatePoint(ab,half);
    var g = calculatePoint(half, ba);
    var h = calculateUnderPoint(half, ba);
    var i = calculatePoint(ba, half);
    count --;
    divideLine(a,ab,count);
    divideLine(ab,f,count);
    divideLine(f,g,count);
    divideLine(g,h,count);
    divideLine(h,i,count);
    divideLine(i,ba,count);
    divideLine(ba,b,count);

  }
    return f;
}
//this function is to rotate the line and find the point
function calculatePoint(source, p){
  var angleInDegrees = 90;
  var angleInRadians = angleInDegrees * Math.PI / 180;
  var s1 = Math.sin(angleInRadians);
  var c1 = Math.cos(angleInRadians);
  var x1 = (p[0] - source[0])*c1 - (p[1] - source[1])*s1 + source[0];
  var y1 = (p[0] - source[0])*s1 + (p[1] - source[1])*c1 + source[1];
  var res = vec2(x1,y1);
  return res;
}
function calculateUnderPoint(source, p){
  var angleInDegrees = 270;
  var angleInRadians = angleInDegrees * Math.PI / 180;
  var s1 = Math.sin(angleInRadians);
  var c1 = Math.cos(angleInRadians);
  var x1 = (p[0] - source[0])*c1 - (p[1] - source[1])*s1 + source[0];
  var y1 = (p[0] - source[0])*s1 + (p[1] - source[1])*c1 + source[1];
  var res = vec2(x1,y1);
  return res;
}
//this function is to draw a line with 8 points, since our rule includes 8 lines
function drawLine(a,b,c,d,e,f,g,h){
    points.push(a,b);
    points.push(b,c);
    points.push(c,d);
    points.push(d,e);
    points.push(e,f);
    points.push(f,g);
    points.push(g,h);
}



function render() {
    if(!check){
        var hexBackgroundColor = document.getElementById("bgColorInput").value;
        var hexLineColor = document.getElementById("lineColorInput").value;

        var backGroundColor = [];
        var lineColor = [];

    //convert hex colors into rgb
        var rgbBackground = hexToRgb(hexBackgroundColor);
        backGroundColor[0] = rgbBackground.r / 255.0;
        backGroundColor[1] = rgbBackground.g / 255.0;
        backGroundColor[2] = rgbBackground.b / 255.0;

        

    //clear buffer with new background color
        gl.clearColor(backGroundColor[0], backGroundColor[1], backGroundColor[2], 1.0);

    // change fragment shader during render time
        var rgbLineColor = hexToRgb(hexLineColor);
        lineColor[0] = rgbLineColor.r / 255.0;
        lineColor[1] = rgbLineColor.g / 255.0;
        lineColor[2] = rgbLineColor.b / 255.0;
        gl.uniform4f(fColorLocation, lineColor[0], lineColor[1], lineColor[2], 1.0);

       
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINES, 0, points.length);
    }else{
        if(begin)
        {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.LINE_STRIP, 0, vertices.length);
        }else{
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.LINE_LOOP, 0, vertices.length);
        }
        
    }
    
    
    

}
/*
 * This method translates color in hex format to rgb answered Apr 11 '11 at 16:04
 * Tim Down
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

