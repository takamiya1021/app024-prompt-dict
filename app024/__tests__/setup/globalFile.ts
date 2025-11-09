import { Blob } from 'buffer';

class TestFile extends Blob implements File {
  readonly name: string;
  readonly lastModified: number;
  readonly webkitRelativePath = '';

  constructor(bits: BlobPart[], name: string, options: FilePropertyBag = {}) {
    super(bits, options);
    this.name = name;
    this.lastModified = options.lastModified ?? Date.now();
  }
}

Object.defineProperty(global, 'File', {
  value: TestFile,
});
