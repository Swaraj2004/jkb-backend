export interface TestRequestBody {
  title: string;
  subject_id: string;
  start_time: string;
  test_duration: number;
  test_toggle: boolean;
  conducted: boolean;
}
