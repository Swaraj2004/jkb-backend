export const TZ_INDIA = "Asia/Kolkata";
export const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 60 * 24;
export const SECRET_KEY = process.env.SECRET_KEY || "secret_key";
export const ALGORITHM = process.env.ALGORITHM;
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
export const GEMINI_API_KEYS = process.env.GEMINI_API_KEYS?.split(",") || [];;
export const gemini_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=`;
export const SALT = 10;         // , here 10 is the round of salt that will be added to hash

export const fromEmail = process.env.FROM_EMAIL || "personalmail@gmail.com";
export const smtpServer = process.env.SMTP_SERVER || "smtp.gmail.com";
export const smtpPort = parseInt(process.env.SMTP_PORT || "587");
export const emailPassword = process.env.GMAIL_APP_PASSWORD;
// const BRANCH_COLLECTION_NAME = 'branches'; // Define your collection name
// const COURSEPACKAGE_COLLECTION_NAME = 'coursePackages'; // Define your collection name
// const STUDENT_DETAIL_COLLECTION_NAME = 'studentDetails'; // Define your student detail collection name
// const USER_COLLECTION_NAME = 'users'; // Define your user collection name
// const PAYMENT_COLLECTION_NAME = 'payments'; // Define your collection name
// const ROLE_COLLECTION_NAME = 'roles'; // Define your role collection name
// const SUBJECT_COLLECTION_NAME = 'subjects'; // Define your subject collection name
export const AUTH_ROLES = ['admin', 'super_admin']; // Define your authorization roles
export const STUDENT_ROLE = 'student';
export const PROFESSOR_ROLE = 'professor';
export const DEFAULT_QUERRY_OFFSET = 0;
export const DEFAULT_QUERRY_LIMIT = 50;
export const GET_ALTERNATIVE = 'alternative';
export const STATUS_CODES = {
  CREATE_SUCCESS: 201,
  CREATE_FAILURE: 500,

  SELECT_SUCCESS: 200,
  SELECT_FAILURE: 404,

  UPDATE_SUCCESS: 200,
  UPDATE_FAILURE: 500,

  DELETE_SUCCESS: 200,
  DELETE_FAILURE: 500,

  BAD_REQUEST: 400,
  FORBIDDEN_REQUEST: 403,
  UNAUTHORIZED: 401
};
// const LECTURE_COLLECTION_NAME = 'lectures'; // Define your lecture collection name
// const ATTENDANCE_COLLECTION_NAME = 'attendance'; // Define your attendance collection name
