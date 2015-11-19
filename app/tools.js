import color from 'color';

const Tools = {

  map( num, min1, max1, min2, max2 ) {

    let num1 = ( num - min1 ) / ( max1 - min1 )
    let num2 = ( num1 * ( max2 - min2 ) ) + min2

    return num2;

  },

  hex2rgb( hex ) {
    hex = (hex.substr(0,1)=="#") ? hex.substr(1) : hex;
    return [parseInt(hex.substr(0,2), 16), parseInt(hex.substr(2,2), 16), parseInt(hex.substr(4,2), 16)];
  },

  hsl2hex(h, s, l) {
    let c = color().hsl([h, s, l]);
    c = c.rgb();
    return this.rgb2hex(c.r, c.g, c.b);
  },

  rgb2hex(r, g, b) {
    return ( (r * Math.pow(16, 4)) + (g * Math.pow(16, 2)) + b);
  },

  random(min, max) {
    return min + (Math.random() * (max - min) );
  },

  toRadians( degree ) {

    return degree * ( Math.PI / 180 );

  },

  toDegree( radians ) {

    return radians * ( 180 / Math.PI );

  }

};

export default Tools;
