class C1 {
  constructor(countdown) {
    if (countdown > 0) {
      this.c2 = new C2(countdown - 1)
    }
    else {
      this.c2 = 0;
    }
    console.log('c1');
  }
}

class C2 {
  constructor(countdown) {
    this.countdown = countdown;
    this.c1 = new C1(countdown - 1);
    console.log('c2');
  }
}

let c = new C1(10);