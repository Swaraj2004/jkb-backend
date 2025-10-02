export interface StudentDetailReqBodyModel {
  branch_id: string;
  cet_score: number;
  college_name: string;
  diploma_score: number;
  jee_score: number;
  packages: string[]; // Array of UUIDs
  parent_contact: string;
  pending_fees: number;
  student_fees: number;
  referred_by: string;
  remark: string;
  jkb_centre: string;
  semester: string;
  status: string;
  student_id: string;
  subjects: string[]; // Array of UUIDs
  total_fees: number;
  university_name: string;
  xii_score: number;
  fee_year: number;
  enrolled: boolean;
}

export interface SubjectYear {
  subjectId: string;
  year: number;
}
export interface PackageYear {
  packageId: string;
  year: number;
}
