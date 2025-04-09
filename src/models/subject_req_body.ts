export interface SubjectRequestBody {
    name: string;
    subject_fees: number;
    professor_user_ids: string[]; // array of UUIDs as strings
}