import Readable from 'readable-stream';

export class PushStream extends Readable {
  constructor(init) {
    super();
    this._next = this._next.bind(this);
    init(this._next);
  }

  _next(err, data) {
    if (this._destroyed) return;
    if (err) return this.destroy(err);
    if (data === null) return this.push(null);
    this._reading = false;
    this.push(data);
  }
  _read(size) {}

  destroy(err) {
    if (this._destroyed) return;
    this._destroyed = true;
    setTimeout(() => {
      if (err) this.emit('error', err);
      this.emit('close');
    });
  }
}

export default PushStream;
