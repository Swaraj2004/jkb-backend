export type LectureCreateDTO = {
  subject_id: string;
  professor_id: string;
  batch_id: string;
  lecture_mode: string;
  remark?: string | null;
  attendance_toggle?: boolean;
  created_by?: string | null;
};
