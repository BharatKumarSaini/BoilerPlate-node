declare namespace Express {
    interface Request {
        user?: {
            name?: string,
            email?: string,
            verified?: string,
            password?: string,
            id?: string,
      };
    }
  }