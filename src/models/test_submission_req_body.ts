export interface TestSubmissionReqBody {
  test_id: string;
  user_id: string;
  answer: TestSubmissionAnswer[];
}
export interface TestSubmissionAnswer {
  question_id: string;
  selected_option_id: string;
}
