export function successJson(message: string, result: any) {
    return {
        success: true,
        message: message,
        result: result
    };
}
export function errorJson(message: string, error: any) {
    return {
        success: false,
        message: message,
        error: error
    };
}
export function generateOTP(length : number = 4) : string{
    return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}