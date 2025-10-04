export interface SubjectRequestBody {
  name: string;
  subject_fees: number;
  year: number;
  professor_user_ids: string[]; // array of UUIDs as strings
}

export interface StudentSubjectPackageBody {
  year: number;
  student_id: string;
  subject_ids: string[];
  package_ids: string[];
}
