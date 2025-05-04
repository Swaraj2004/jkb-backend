export interface UserStudentRequestBody {
  full_name?: string;
  email: string;
  phone?: string;
  password: string;
  location?: string;
  otp_code?: string;

  studentDetail: {
    parent_contact?: string;
    branch_id?: string;
    diploma_score?: number;
    xii_score?: number;
    cet_score?: number;
    jee_score?: number;
    college_name?: string;
    referred_by?: string;
    student_fees?: string;   // Decimal, so use string
    total_fees?: string;     // Decimal, so use string
    pending_fees?: string;   // Decimal, so use string
    university_name?: string;
    jkb_centre?: string;
    semester?: string;
    status?: string;
    remark?: string;
    packages: string[]; // Array of UUIDs
    subjects: string[]; // Array of UUIDs
    enrolled?: boolean;
  };
}
