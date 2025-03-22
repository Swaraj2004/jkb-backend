export const TZ_INDIA = "Asia/Kolkata";
export const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24;
export const SECRET_KEY = process.env.SECRET_KEY || "secret_key";
export const ALGORITHM = process.env.ALGORITHM;
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

export const SALT = 10;         // , here 10 is the round of salt that will be added to hash

// const BRANCH_COLLECTION_NAME = 'branches'; // Define your collection name
// const COURSEPACKAGE_COLLECTION_NAME = 'coursePackages'; // Define your collection name
// const STUDENT_DETAIL_COLLECTION_NAME = 'studentDetails'; // Define your student detail collection name
// const USER_COLLECTION_NAME = 'users'; // Define your user collection name
// const PAYMENT_COLLECTION_NAME = 'payments'; // Define your collection name
// const ROLE_COLLECTION_NAME = 'roles'; // Define your role collection name
// const SUBJECT_COLLECTION_NAME = 'subjects'; // Define your subject collection name
export const AUTH_ROLES = ['admin', 'super-admin']; // Define your authorization roles
export const STUDENT_ROLE = 'student';
export const PROFESSOR_ROLE = 'professor';
export const DEFAULT_QUERRY_SKIP = 0;
export const DEFAULT_QUERRY_TAKE = 50;
// const LECTURE_COLLECTION_NAME = 'lectures'; // Define your lecture collection name
// const ATTENDANCE_COLLECTION_NAME = 'attendance'; // Define your attendance collection name