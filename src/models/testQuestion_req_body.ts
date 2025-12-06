interface Option {
  option_text: string;
  is_correct: boolean;
}

export interface Question {
  test_id: string;
  question_text: string;
  question_marks: string;
  options: Option[];
}
