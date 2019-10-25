class Bitset {
  constructor(value){
    this.value = value || 0;  //default value is 0
    this.locked = false;  //whether or not value can be changed (used to prevent movement)
  }
  lock(){
    this.locked = true;
  }
  unlock(){
    this.locked = false;
  }
  bit(index){ //number with a 1 at the given index
    return 1 << index;
  }
  at(index){  //true if value at index is 1, false if 0
    return (this.value & this.bit(index)) > 0;
  }
  set(index){ //if possible, set bit at index in value to 1
    if(!this.locked)
      this.value |= this.bit(index);
  }
  reset(index){ //if possible, set bit at index in value to 0
    if(!this.locked)
      this.value &= ~this.bit(index);
  }
  log2(){ //true if value is an integer power of 2
    let val = Math.log2(this.value);
    return val === parseInt(val);
  }
  lowest(n){  //copies least significant n bits of value into a new Bitset
    return new Bitset(this.value & (this.bit(n) - 1));
  }
  sub(a, b){  //copies the bits from [a, b) into a new Bitset
    let high = (this.bit(b) - 1); //all bits are 1 from [0, b)
    let low = (this.bit(a) - 1);  //all bits are 1 from [0, a)
    high &= ~low;  //all bits are 1 from [a, b)

    let val = this.value & high;  //get only bits in range [a, b) that are also 1 in value
    val >>= a;  //normalize for convenience; bit(a) -> bit(0)
    return new Bitset(val);
  }
  clearSet(index){  //only bit at index is set
    if(!this.locked)
      this.value = this.bit(index);
  }
  lowestBit(){  //returns index of rightmost 1 bit in value
    if(this.value === 0)  //no bits are 1
      return -1;
    return Math.log2(this.value & -this.value); //two's compliment
  }
}
