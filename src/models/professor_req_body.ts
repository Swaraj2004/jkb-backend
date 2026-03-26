export type LectureCreateDTO = {
  subject_id: string;
  professor_id: string;
  batch_id: string;
  lecture_mode: string;
  remark?: string | null;
  attendance_toggle?: boolean;
  created_by?: string | null;
};

export type UpdateProfessorBatchDTO = {
  batch_id: string;
  name?: string;
  student_ids?: string[];
  // Assign multiple professors to the batch (BatchProfessor.professor_id -> User.id)
  professor_ids?: string[];
};
