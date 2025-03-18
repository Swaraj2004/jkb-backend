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