import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomNotFoundException extends HttpException {
  constructor(message: string, error: string) {
    super({ response: { message, error, statusCode: HttpStatus.NOT_FOUND } }, HttpStatus.NOT_FOUND);
  }

  // Override the getResponse method to customize the response format
  public getResponse(): any {
    return { response: this.message };
  }
}
