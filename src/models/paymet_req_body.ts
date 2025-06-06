// this is a custom body which we will receive when creating a new payment
export interface PaymentBody {
  mode: string;           // futher improvement can be done by making this of fix enum type
  amount: number;
  pending: number;
  is_gst: boolean;
  status: string;
  student_id: string;
  staff_id: string;
  remark?: string;
  receipt_number?: string;
  subjects: string[];
  packages: string[];
}
