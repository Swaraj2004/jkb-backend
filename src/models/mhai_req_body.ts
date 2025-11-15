export interface PredictByScoreRequest {
  exam_type: 'JEE' | 'MHT-CET';
  score: number;
  caste: 'open' | 'sc' | 'st' | 'vjnt' | 'nt1' | 'nt2' | 'nt3' | 'obc' | 'tfws' | 'ews';
  branch: string;
  university: string;
  year: number;
}
