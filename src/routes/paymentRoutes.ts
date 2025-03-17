import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import paymentController from '../controllers/paymentController'; // Adjust the import based on your project structure
// import { Payment, UpdatePayment } from '../schemas/paymentSchemas'; // Adjust the import based on your project structure

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Payment Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /payments/{payment_id}:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get a specific payment by ID
 *     parameters:
 *       - in: path
 *         name: payment_id
 *         required: true
 *         description: The ID of the payment to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single payment object
 */
router.get('/payments/:payment_id', async (req, res) => {
    // const paymentId = req.params.payment_id;
    // const readRecordId = convertToBsonId(paymentId); // Convert the payment ID to BSON format
    // const payment = await paymentController.getRecords(
    //     dbInstance,
    //     readRecordId,
    //     PAYMENT_COLLECTION_NAME,
    //     { password: 0 }, // Exclude password field from the response
    //     [student_aggregate] // Include any necessary aggregation
    // );
    // res.status(200).json(payment);
});

/**
 * @swagger
 * /payments:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get all payments with optional date filtering
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: false
 *         description: Start date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *       - in: query
 *         name: end_date
 *         required: false
 *         description: End date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of payment objects
 */
router.get('/payments', async (req, res) => {
    // const { start_date, end_date } = req.query; // Extract query parameters for date filtering
    // let extraFilter = null;

    // try {
    //     const currentDate = new Date(); // Get the current date
    //     let startDate = start_date ? new Date(start_date) : new Date(currentDate.setHours(0, 0, 0, 0)); // Set start date
    //     let endDate = end_date ? new Date(end_date) : new Date(currentDate.setHours(23, 59, 59, 999)); // Set end date

    //     // Validate date range
    //     if (startDate > endDate) {
    //         return res.status(400).json({ success: false, message: "End date must be greater than or equal to start date." });
    //     }

    //     // Create filter for payments based on date range
    //     extraFilter = {
    //         created_at: {
    //             $gte: startDate,
    //             $lte: endDate,
    //         },
    //     };
    // } catch (error) {
    //     return res.status(400).json({ success: false, message: "Improper date format! Please use YYYY-MM-DD." });
    // }

    // const payments = await paymentController.getRecords(
    //     dbInstance,
    //     null,
    //     PAYMENT_COLLECTION_NAME,
    //     { password: 0 }, // Exclude password field from the response
    //     [student_aggregate], // Include any necessary aggregation
    //     extraFilter // Apply the date filter
    // );
    // res.status(200).json(payments);
});

/**
 * @swagger
 * /student-payments/{student_id}:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get payments for a specific student
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get payments of
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of payment objects for the student
 */
router.get('/student-payments/:student_id', async (req, res) => {
    // const studentId = req.params.student_id;
    // const studentPayments = await dbInstance[PAYMENT_COLLECTION_NAME]
    //     .find({ student_id: convertToBsonId(studentId) }) // Find payments by student ID
    //     .sort({ created_at: 1 }) // Sort by creation date ascending
    //     .toArray();

    // return res.status(200).json({
    //     success: true,
    //     message: "Records fetched successfully",
    //     result: studentPayments,
    // });
});

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payment Management]
 *     summary: Create a new payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: The created payment object
 */
router.post('/payments', async (req, res) => {
    // const createRecord: Payment = req.body; // Get the payment data from the request body
    // const studentDetail = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].findOne({ student_id: convertToBsonId(createRecord.student_id) }); // Find student details

    // // Logic for generating receipt number based on GST status
    // const currentYear = new Date().getFullYear();
    // const nextYear = (currentYear % 100) + 1;

    // if (createRecord.is_gst) {
    //     const lastPayment = await dbInstance[PAYMENT_COLLECTION_NAME]
    //         .find({ is_gst: true, $expr: { $eq: [{ $year: "$created_at" }, currentYear] } })
    //         .sort({ created_at: -1 })
    //         .limit(1)
    //         .toArray();

    //     createRecord.receipt_number = lastPayment.length
    //         ? "G" + currentYear + nextYear + String(parseInt(lastPayment[0].receipt_number.slice(-4)) + 1).padStart(4, '0')
    //         : "G" + currentYear + nextYear + "0001";
    // } else {
    //     const lastPayment = await dbInstance[PAYMENT_COLLECTION_NAME]
    //         .find({ is_gst: false, $expr: { $eq: [{ $year: "$created_at" }, currentYear] } })
    //         .sort({ created_at: -1 })
    //         .limit(1)
    //         .toArray();

    //     createRecord.receipt_number = lastPayment.length
    //         ? "NG" + currentYear + nextYear + String(parseInt(lastPayment[0].receipt_number.slice(-4)) + 1).padStart(4, '0')
    //         : "NG" + currentYear + nextYear + "0001";
    // }

    // // Validate payment amount against pending fees
    // if (studentDetail) {
    //     const pendingFees = studentDetail.pending_fees;
    //     const amountPaid = createRecord.amount;

    //     if (pendingFees < amountPaid) {
    //         return res.status(400).json({ success: false, message: "Amount paid cannot be greater than pending fees." });
    //     }

    //     createRecord.pending = pendingFees - amountPaid; // Update pending fees
    //     const response = await paymentController.postRecord(dbInstance, req.user, createRecord, PAYMENT_COLLECTION_NAME, ["student_id", "staff_id"]);
    //     return res.status(201).json(response);
    // }

    // return res.status(400).json({ success: false, message: "Operation failed." });
});

/**
 * @swagger
 * /payments/{payment_id}:
 *   delete:
 *     tags: [Payment Management]
 *     summary: Delete a payment by ID
 *     parameters:
 *       - in: path
 *         name: payment_id
 *         required: true
 *         description: The ID of the payment to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Payment deleted successfully
 */
router.delete('/payments/:payment_id', async (req, res) => {
    // const paymentId = req.params.payment_id;
    // const payment = await dbInstance[PAYMENT_COLLECTION_NAME].findOne({ _id: convertToBsonId(paymentId) }); // Find payment by ID

    // if (payment) {
    //     const studentDetail = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].findOne({ student_id: payment.student_id }); // Find student details

    //     if (studentDetail) {
    //         const transactions = studentDetail.transactions || [];
    //         const response = await paymentController.deleteRecord(dbInstance, paymentId, PAYMENT_COLLECTION_NAME); // Delete payment

    //         if (response.success) {
    //             const pendingFees = studentDetail.pending_fees + payment.amount; // Update pending fees
    //             transactions.remove(convertToBsonId(paymentId)); // Remove payment from transactions
    //             await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].updateOne(
    //                 { student_id: payment.student_id },
    //                 { $set: { transactions, pending_fees } }
    //             );
    //             return res.status(204).send();
    //         }
    //     }
    // }

    // return res.status(400).json({ success: false, message: "Operation failed." });
});

/**
 * @swagger
 * /payments:
 *   put:
 *     tags: [Payment Management]
 *     summary: Update a payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePayment'
 *     responses:
 *       202:
 *         description: The updated payment object
 */
router.put('/payments', async (req, res) => {
    // const updatedRecord: UpdatePayment = req.body; // Get the updated payment data from the request body
    // const studentDetail = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].findOne({ student_id: convertToBsonId(updatedRecord.student_id) }); // Find student details
    // const prevPayment = await dbInstance[PAYMENT_COLLECTION_NAME].findOne({ _id: convertToBsonId(updatedRecord.record_id) }); // Find previous payment

    // if (studentDetail) {
    //     const pendingFees = studentDetail.pending_fees + prevPayment.amount; // Update pending fees
    //     const amountPaid = updatedRecord.amount;

    //     if (pendingFees < amountPaid) {
    //         return res.status(400).json({ success: false, message: "Amount paid cannot be greater than pending fees." });
    //     }

    //     updatedRecord.pending = pendingFees - amountPaid; // Update pending fees
    //     const response = await paymentController.updateRecord(dbInstance, req.user, updatedRecord, PAYMENT_COLLECTION_NAME, ["student_id", "staff_id"]);
    //     return res.status(202).json(response);
    // }

    // return res.status(400).json({ success: false, message: "Operation failed." });
});

/**
 * @swagger
 * /student/payments:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get payments for a specific student
 *     parameters:
 *       - in: query
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get payments for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of payment records for the student
 */
router.get('/student/payments', async (req, res) => {
  // const studentId = req.query.student_id as string; // Get student ID from query parameters
  // const extraFilter = { student_id: convertToBsonId(studentId) }; // Create filter for student ID

  // try {
  //     const payments = await webController.get_records(
  //         dbInstance,
  //         null,
  //         PAYMENT_COLLECTION_NAME,
  //         null,
  //         null,
  //         extraFilter
  //     );
  //     return res.status(200).json(payments); // Return the payment records
  // } catch (error) {
  //     return res.status(500).json({ success: false, message: 'Error fetching payments', error });
  // }
});

export default router;
