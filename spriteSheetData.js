module.exports = function (data) {
  const spriteSheedObj = JSON.parse(data);
  const frames = spriteSheedObj.frames;
  const frameCount = Object.keys(frames).length;
  let dataUint16 = new Uint16Array(frameCount);
  let index = 0;

  for (const frameObj in frames) {
    //console.log(`frameObj: ${frameObj}`);
    const frame = spriteSheedObj.frames[frameObj].frame;
    //console.log(frame);

    let x = parseInt(frame.x);
    dataUint16[index++] = x;
    let y = parseInt(frame.y);
    dataUint16[index++] = y;
    let w = parseInt(frame.w);
    dataUint16[index++] = w;
    let h = parseInt(frame.h);
    dataUint16[index++] = h;
  }
  return new Buffer.from(dataUint16);
}