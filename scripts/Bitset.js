class Bitset {
  constructor(value){
    this.value = value || 0;
    this.locked = false;
  }
  lock(){
    this.locked = true;
  }
  unlock(){
    this.locked = false;
  }
  bit(index){
    return 1 << index;
  }
  at(index){
    return (this.value & this.bit(index)) > 0;
  }
  set(index){
    if(!this.locked)
      this.value |= this.bit(index);
  }
  reset(index){
    if(!this.locked)
      this.value &= ~this.bit(index);
  }
  log2(){
    let val = Math.log2(this.value);
    return val === parseInt(val);
  }
  lowest(n){
    return new Bitset(this.value & (this.bit(n) - 1));
  }
  sub(a, b){
    let high = (this.bit(b) - 1);
    let low = (this.bit(a) - 1);
    high -= low;

    let val = this.value & high;
    val >>= a;
    return new Bitset(val);
  }
  clearSet(index){
    if(!this.locked)
      this.value = this.bit(index);
  }
  lowestBit(){
    if(this.value === 0)
      return -1;
    return Math.log2(this.value & -this.value);
  }
}
