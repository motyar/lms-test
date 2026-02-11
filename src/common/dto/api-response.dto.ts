export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };

  static success<T>(data: T): ApiResponseDto<T> {
    return {
      success: true,
      data,
    };
  }

  static error(code: string, message: string): ApiResponseDto<any> {
    return {
      success: false,
      error: {
        code,
        message,
      },
    };
  }
}
