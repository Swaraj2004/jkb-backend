interface QuestionAnswer {
  question: string;
  answer: string | string[]; // Because some answers are arrays
}

interface QnaFormResponse {
  name: string;
  email: string;
  contact: string;
  address: string;
  questions: QuestionAnswer[];
}
