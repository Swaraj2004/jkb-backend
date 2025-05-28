export interface QnaFormResponse {
  name: string;
  email: string;
  contact: string;
  address: string;
  questions: Record<string, string>;
}

export interface BranchFormResponse {
  name: string;
  email: string;
  contact: string;
  address: string;
  branch_qna: Record<string, string>;
}
