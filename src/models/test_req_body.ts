export interface TestRequestBody {
  title: string;
  subject_id: string;
  start_time: string;
  test_duration: number;
  test_status: TestStatus;
  conducted: boolean;
}

export enum TestStatus {
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
}
