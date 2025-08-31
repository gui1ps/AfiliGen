import { ServiceResponse } from '../interfaces/service-reponse.interface';

export class ResponseUtil {
  static success<T>(message: string, data?: T): ServiceResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error<T>(message: string, data?: T): ServiceResponse<T> {
    return {
      success: false,
      message,
      data,
    };
  }
}
