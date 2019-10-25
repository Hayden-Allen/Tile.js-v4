class Door extends AnimatedTile { //Tile that transports a Character from one Scene to another
  constructor(src, x, y, frames, time, to, tox, toy, properties){
    super(src, x, y, frames, time, properties);
    this.to = to; //Scene that this Door leads to
    //coordinates in Scene to that this Door transports you to
    this.tox = tox;
    this.toy = toy;
  }
}
