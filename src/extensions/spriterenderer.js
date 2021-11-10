let wasmFile = 'I need to put this all in a function';

// I think i need a function that returns these values
const game2dHTML = `<html><head><style>
body {
background-color: #000;
text-align: center;
}</style></head>
<body><canvas width="${width}" height="${height}" id="cnvs"></canvas>
<script type="module">
import { game2d } from "./game2d.js";
run2dGame("${wasmFile}", "cnvs");
</script></body></html>`;

const vertexShader = `#version 300 es
precision highp float;

in vec2 position;
in vec2 tex_coord;

out vec2 tc;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  tc = tex_coord;
}
`;

const fragmentShader = `#version 300 es
precision highp float;

in vec2 tc;

uniform sampler2D sampler;

out vec4 color;

void main() {
  color = texture( sampler, tc );
}
`;

const game2dJS = `
  const vertexShader = '${vertexShader}';
  const fragmentShader = '${fragmentShader}';
  const cnvs = document.getElementById('cnvs');
  const gl = cnvs.getContext('webgl2');
  if( !gl ) {
    console.log('could not get webgl context');
    return;
  }
`;