import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import adminController from '../controllers/adminController'; // Adjust the import based on your project structure

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Professor Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /professors:
 *   get:
 *     tags: [Professor Management]
 *     summary: Get all professors and super-admins
 *     responses:
 *       200:
 *         description: A list of professor objects
 */
router.get('/professors', async (req, res) => {
    // // Fetch roles for professors and super-admins
    // const professorRoles = await dbInstance[ROLE_COLLECTION_NAME].find({ name: { $in: ["professor", "super-admin"] } }).toArray();

    // // Extract role IDs from the fetched roles
    // const roleIds = professorRoles.map(role => role._id);

    // // Fetch users with the specified role IDs
    // const professors = await adminController.getRecords(
    //     dbInstance,
    //     null,
    //     USER_COLLECTION_NAME,
    //     { role_id: { $in: roleIds } } // Match users with professor or super-admin roles
    // );

    // res.status(200).json(professors);
});

/**
 * @swagger
 * /professor/subjects:
 *   get:
 *     tags: [Professor Management]
 *     summary: Get subjects for a specific professor
 *     parameters:
 *       - in: query
 *         name: professor_id
 *         required: true
 *         description: The ID of the professor to get subjects of
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of subjects for the professor
 */
router.get('/professor/subjects', async (req, res) => {
  // const professorId = req.query.professor_id as string; // Get professor ID from query parameters
  // try {
  //     const subjects = await dbInstance[SUBJECT_COLLECTION_NAME].find({ professor_user_ids: { $in: [professorId] } }).toArray();

  //     // Convert ObjectId and datetime fields
  //     subjects.forEach(subject => {
  //         subject._id = subject._id.toString(); // Convert ObjectId to string
  //         subject.professor_user_ids = subject.professor_user_ids.map(pid => pid.toString()); // Convert ObjectIds to strings
  //         delete subject.created_at; // Remove created_at field
  //         delete subject.updated_at; // Remove updated_at field
  //     });

  //     return res.json({
  //         success: true,
  //         message: "Subjects fetched successfully",
  //         result: subjects,
  //     });
  // } catch (error) {
  //     return res.status(500).json({ success: false, message: 'Error fetching subjects', error });
  // }
});

/**
* @swagger
* /professor/lectures:
*   get:
*     tags: [Professor Management]
*     summary: Fetch lectures for a specific professor
*     parameters:
*       - in: query
*         name: prof_user_id
*         required: true
*         description: The ID of the professor to get lectures for
*         schema:
*           type: string
*     responses:
*       200:
*         description: A list of lectures for the professor
*/
router.get('/professor/lectures', async (req, res) => {
  // const profUserId = req.query.prof_user_id as string; // Get professor user ID from query parameters
  // const aggregatePipeline = [
  //     { $match: { prof_user_id: convertToBsonId(profUserId) } },
  //     { $lookup: {
  //         from: SUBJECT_COLLECTION_NAME,
  //         localField: 'subject_id',
  //         foreignField: '_id',
  //         as: 'subject_info'
  //     }},
  //     { $unwind: '$subject_info' },
  //     { $project: {
  //         _id: 1,
  //         subject_id: 1,
  //         subject_name: '$subject_info.name',
  //         prof_user_id: 1,
  //         lecture_mode: 1,
  //         remark: 1,
  //         attendance_toggle: 1,
  //         created_at: 1
  //     }},
  //     { $sort: { created_at: -1 } }
  // ];

  // try {
  //     const lectures = await webController.get_records(
  //         dbInstance,
  //         null,
  //         LECTURE_COLLECTION_NAME,
  //         null,
  //         aggregatePipeline
  //     );
  //     return res.json(lectures);
  // } catch (error) {
  //     return res.status(500).json({ success: false, message: 'Error fetching lectures', error });
  // }
});

/**
* @swagger
* /professor/lectures:
*   post:
*     tags: [Professor Management]
*     summary: Add a new lecture
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/LectureCreate'
*     responses:
*       201:
*         description: The created lecture object
*/
router.post('/professor/lectures', async (req, res) => {
  // const lecture: LectureCreate = req.body; // Get lecture data from the request body
  // try {
  //     const newLecture = await webController.post_record(
  //         dbInstance,
  //         req.user,
  //         lecture,
  //         LECTURE_COLLECTION_NAME,
  //         ["subject_id", "prof_user_id"]
  //     );
  //     return res.status(201).json(newLecture); // Return the created lecture
  // } catch (error) {
  //     return res.status(500).json({ success: false, message: 'Error adding lecture', error });
  // }
});

/**
* @swagger
* /professor/lectures/{lecture_id}:
*   delete:
*     tags: [Professor Management]
*     summary: Remove a lecture by ID
*     parameters:
*       - in: path
*         name: lecture_id
*         required: true
*         description: The ID of the lecture to delete
*         schema:
*           type: string
*     responses:
*       204:
*         description: Lecture deleted successfully
*/
router.delete('/professor/lectures/:lecture_id', async (req, res) => {
  // const lectureId = req.params.lecture_id; // Get lecture ID from the path parameters
  // try {
  //     await webController.delete_record(
  //         dbInstance,
  //         lectureId,
  //         LECTURE_COLLECTION_NAME
  //     );
  //     return res.status(204).send(); // Return no content on successful deletion
  // } catch (error) {
  //     return res.status(500).json({ success: false, message: 'Error deleting lecture', error });
  // }
});

export default router;
