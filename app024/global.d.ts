declare global {
  // provided by node:buffer starting in Node 20
  const File: {
    prototype: File;
    new (bits: BlobPart[], name: string, options?: FilePropertyBag): File;
  };
}

export {};
