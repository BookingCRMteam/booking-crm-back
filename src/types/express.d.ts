declare global {
  namespace Express {
    // Optional to avoid type errors where rawBody isn't set
    interface Request {
      rawBody?: Buffer;
    }
  }
}

export {};
