import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import webController from '../controllers/webController'; // Adjust the import based on your project structure
// import { StudentDetail, UpdateStudentDetail } from '../schemas/studentSchemas'; // Adjust the import based on your project structure

const router = express.Router();
const STUDENT_DETAIL_COLLECTION_NAME = 'studentDetails'; // Define your student detail collection name
const SUBJECT_COLLECTION_NAME = 'subjects'; // Define your subject collection name
const COURSEPACKAGE_COLLECTION_NAME = 'coursePackages'; // Define your course package collection name
const AUTH_ROLES = ['admin', 'super-admin']; // Define your authorization roles

/**
 * @swagger
 * tags:
 *   - name: Student Management
 *     description: Operations related to student management
 */

/**
 * @swagger
 * /student-details/{student_id}:
 *   get:
 *     tags: [Student Management]
 *     summary: Get a specific student record by ID
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         description: The ID of the user to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single student record object
 */
router.get('/student-details/:student_id', async (req, res) => {
    // const studentId = req.params.student_id; // Get student ID from the path parameters
    // const readRecordId = convertToBsonId(studentId); // Convert the student ID to BSON format

    // try {
    //     const studentRecord = await webController.get_records(
    //         dbInstance,
    //         readRecordId,
    //         STUDENT_DETAIL_COLLECTION_NAME,
    //         null,
    //         null
    //     );
    //     return res.status(200).json(studentRecord); // Return the student record
    // } catch (error) {
    //     return res.status(500).json({ success: false, message: 'Error fetching student record', error });
    // }
});

/**
 * @swagger
 * /student-details:
 *   get:
 *     tags: [Student Management]
 *     summary: Get all student records with optional year filter
 *     parameters:
 *       - in: query
 *         name: year
 *         required: false
 *         description: The year to filter students by creation date
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of student record objects
 */
router.get('/student-details', async (req, res) => {
    // const { year } = req.query; // Get year from query parameters
    // let extraFilter = null;

    // if (year) {
    //     extraFilter = { "$expr": { "$eq": [{ "$year": "$created_at" }, year] } }; // Filter by year
    // }

    // try {
    //     const studentRecords = await webController.get_records(
    //         dbInstance,
    //         null,
    //         STUDENT_DETAIL_COLLECTION_NAME,
    //         null,
    //         null,
    //         extraFilter
    //     );
    //     return res.status(200).json(studentRecords); // Return the student records
    // } catch (error) {
    //     return res.status(500).json({ success: false, message: 'Error fetching student records', error });
    // }
});

/**
 * @swagger
 * /student-details:
 *   post:
 *     tags: [Student Management]
 *     summary: Create a new student record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentDetail'
 *     responses:
 *       201:
 *         description: The created student record object
 */
router.post('/student-details', async (req, res) => {
    // const createRecord: StudentDetail = req.body; // Get student data from the request body
    // let totalAmount = 0;

    // // Calculate total fees based on subjects
    // if (createRecord.subjects && Array.isArray(createRecord.subjects)) {
    //     for (const subjectId of createRecord.subjects) {
    //         const subjectDoc = await dbInstance[SUBJECT_COLLECTION_NAME].findOne({ _id: convertToBsonId(subjectId) });
    //         if (subjectDoc && subjectDoc.subject_fees) {
    //             totalAmount += subjectDoc.subject_fees;
    //         }
    //     }
    // }

    // // Calculate total fees based on packages
    // if (createRecord.packages && Array.isArray(createRecord.packages)) {
    //     for (const packageId of createRecord.packages) {
    //         const packageDoc = await dbInstance[COURSEPACKAGE_COLLECTION_NAME].findOne({ _id: convertToBsonId(packageId) });
    //         if (packageDoc && packageDoc.package_fees) {
    //             totalAmount += packageDoc.package_fees;
    //         }
    //     }
    // }

    // // Set fees details in the record
    // if (totalAmount > 0) {
    //     createRecord.student_fees = totalAmount;
    //     createRecord.num_installments = 1;
    //     createRecord.total_fees = totalAmount;
    //     createRecord.pending_fees = totalAmount;
    // }

    // try {
    //     const newStudentRecord = await webController.post_record(
    //         dbInstance,
    //         null,
    //         createRecord,
    //         STUDENT_DETAIL_COLLECTION_NAME,
    //         ["branch_id", "student_id"]
    //     );
    //     return res.status(201).json(newStudentRecord); // Return the created student record
    // } catch (error) {
    //     return res.status(500).json({ success: false, message: 'Error creating student record', error });
    // }
});

/**
 * @swagger
 * /student-details/{student_detail_id}:
 *   delete:
 *     tags: [Student Management]
 *     summary: Delete a student record by ID
 *     parameters:
 *       - in: path
 *         name: student_detail_id
 *         required: true
 *         description: The ID of the student detail to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Student record deleted successfully
 */
router.delete('/student-details/:student_detail_id', async (req, res) => {
    // const studentDetailId = req.params.student_detail_id; // Get student detail ID from the path parameters
    // try {
    //     await webController.delete_record(
    //         dbInstance,
    //         studentDetailId,
    //         STUDENT_DETAIL_COLLECTION_NAME
    //     );
    //     return res.status(204).send(); // Return no content on successful deletion
    // } catch (error) {
    //     return res.status(500).json({ success: false, message: 'Error deleting student record', error });
    // }
});

/**
 * @swagger
 * /student-details:
 *   put:
 *     tags: [Student Management]
 *     summary: Update a student record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentDetail'
 *     responses:
 *       202:
 *         description: The updated student record object
 */
router.put('/student-details', async (req, res) => {
    // const updatedRecord: UpdateStudentDetail = req.body; // Get updated student data from the request body
    // const currentRecord = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].findOne({ _id: convertToBsonId(updatedRecord.record_id) });

    // // Calculate new fees based on updated subjects and packages
    // let totalAmount = 0;
    // if (updatedRecord.subjects && Array.isArray(updatedRecord.subjects)) {
    //     for (const subjectId of updatedRecord.subjects) {
    //         const subjectDoc = await dbInstance[SUBJECT_COLLECTION_NAME].findOne({ _id: convertToBsonId(subjectId) });
    //         if (subjectDoc && subjectDoc.subject_fees) {
    //             totalAmount += subjectDoc.subject_fees;
    //         }
    //     }
    // }

    // if (updatedRecord.packages && Array.isArray(updatedRecord.packages)) {
    //     for (const packageId of updatedRecord.packages) {
    //         const packageDoc = await dbInstance[COURSEPACKAGE_COLLECTION_NAME].findOne({ _id: convertToBsonId(packageId) });
    //         if (packageDoc && packageDoc.package_fees) {
    //             totalAmount += packageDoc.package_fees;
    //         }
    //     }
    // }

    // // Update fees details
    // if (totalAmount > 0) {
    //     updatedRecord.total_fees = totalAmount;
    // }
    // const pendingAmountBuffer = updatedRecord.student_fees - currentRecord.student_fees;
    // updatedRecord.pending_fees = currentRecord.pending_fees + pendingAmountBuffer;

    // try {
    //     const updatedStudentRecord = await webController.update_record(
    //         dbInstance,
    //         req.user,
    //         updatedRecord,
    //         STUDENT_DETAIL_COLLECTION_NAME,
    //         ["branch_id", "student_id"]
    //     );
    //     return res.status(202).json(updatedStudentRecord); // Return the updated student record
    // } catch (error) {
    //     return res.status(500).json({ success: false, message: 'Error updating student record', error });
    // }
});

export default router;
