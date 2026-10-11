export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what: string) =>
  new AppError(404, `${what} не знайдено`);
export const badRequest = (msg: string) => new AppError(400, msg);
export const forbidden = (msg: string) => new AppError(403, msg);
