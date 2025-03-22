export interface StudentDetailReqBodyModel {
    branch_id: string;
    cet_score: number;
    college_name: string;
    diploma_score: number;
    jee_score: number;
    packages: string[]; // Array of UUIDs
    parent_contact: string;
    pending_fees: number;
    referred_by: string;
    remark: string;
    status: string;
    student_id: string;
    subjects: string[]; // Array of UUIDs
    total_fees: number;
    transactions: any[];
    university_name: string;
    xii_score: number;
    enrolled: boolean;
}