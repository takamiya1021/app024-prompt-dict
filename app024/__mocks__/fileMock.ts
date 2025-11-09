export class MockFile implements File {
  readonly lastModified: number;
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly webkitRelativePath = '';
  private readonly data: Uint8Array;

  constructor(bits: BlobPart[], name: string, options: FilePropertyBag = {}) {
    const blob = new Blob(bits, options);
    this.type = options.type ?? '';
    this.name = name;
    this.lastModified = options.lastModified ?? Date.now();
    this.size = blob.size;
    this.data = new Uint8Array(this.size);
    blob.arrayBuffer().then((buffer) => this.data.set(new Uint8Array(buffer)));
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    return new Blob([this.data.slice(start, end)], { type: contentType });
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return this.data.buffer.slice(0);
  }

  stream(): ReadableStream<Uint8Array> {
    return new ReadableStream();
  }

  text(): Promise<string> {
    return this.arrayBuffer().then((buffer) => new TextDecoder().decode(buffer));
  }
}
