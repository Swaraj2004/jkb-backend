// this is a custom body which we will receive when creating a new payment
export interface PaymentBody {
  mode: string; // futher improvement can be done by making this of fix enum type
  amount: number;
  // fee_id: string;
  // pending: number;
  is_gst: boolean;
  status: string;
  user_id: string;
  student_id: string;
  year: number;
  staff_id: string;
  remark?: string;
  // receipt_number?: string;
  // subjects: string[];
  // packages: string[];
}

export interface Fee {
  id: string;
  student_id: string;
  student_fees: number;
  total_fees: number;
  year: number;
  created_at: Date;
  updated_at?: Date | null;
}

// payment will be created for Fee for a given year
