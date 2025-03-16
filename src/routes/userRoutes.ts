import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import authController from '../controllers/authController'; // Adjust the import based on your project structure
// import { User, UpdateUser } from '../schemas/userSchemas'; // Adjust the import based on your project structure
// import { Hash } from '../utils/hash'; // Adjust the import based on your project structure

const router = express.Router();
const USER_COLLECTION_NAME = 'users'; // Define your user collection name
const ROLE_COLLECTION_NAME = 'roles'; // Define your role collection name

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: Operations related to user management
 */

/**
 * @swagger
 * /users/{user_id}:
 *   get:
 *     tags: [User Management]
 *     summary: Get a specific user by ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: The ID of the user to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single user object
 */
router.get('/users/:user_id', async (req, res) => {
    // const userId = req.params.user_id; // Get user ID from the path parameters
    // const readRecordId = convertToBsonId(userId); // Convert the user ID to BSON format
    // const user = await authController.get_records(
    //     dbInstance,
    //     readRecordId,
    //     USER_COLLECTION_NAME,
    //     { password: 0, "user_student_details.student_id": 0 }, // Exclude password and student ID
    //     [role_aggregate, user_detail_aggregate]
    // );
    // res.status(200).json(user);
});

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [User Management]
 *     summary: Get all users with optional year filter
 *     parameters:
 *       - in: query
 *         name: year
 *         required: false
 *         description: The year to filter users by creation date
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of user objects
 */
router.get('/users', async (req, res) => {
    // const { year } = req.query; // Get year from query parameters
    // let extraFilter = null;

    // if (year) {
    //     extraFilter = { "$expr": { "$eq": [{ "$year": "$created_at" }, year] } }; // Filter by year
    // }

    // const users = await authController.get_records(
    //     dbInstance,
    //     null,
    //     USER_COLLECTION_NAME,
    //     { password: 0, "user_student_details.student_id": 0 }, // Exclude password and student ID
    //     [role_aggregate, user_detail_aggregate],
    //     extraFilter
    // );
    // res.status(200).json(users);
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [User Management]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The created user object
 */
router.post('/users', async (req, res) => {
    // const createRecord: User = req.body; // Get user data from the request body
    // const hashInstance = new Hash(); // Create a new Hash instance
    // createRecord.set_values(); // Set values for the user record

    // const role = await dbInstance[ROLE_COLLECTION_NAME].findOne({ _id: convertToBsonId(createRecord.role_id) }); // Find role by ID
    // const roleName = role ? role.name : null; // Get role name

    // const valuesToPass = {
    //     role_name: roleName,
    //     username: createRecord.username,
    //     password: createRecord.password,
    // };

    // createRecord.password = hashInstance.encrypt_password(createRecord.password); // Hash the password

    // const newUser = await authController.post_record(
    //     dbInstance,
    //     null,
    //     createRecord,
    //     USER_COLLECTION_NAME,
    //     ["role_id"],
    //     valuesToPass
    // );
    // res.status(201).json(newUser);
});

/**
 * @swagger
 * /users/{user_id}:
 *   delete:
 *     tags: [User Management]
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:user_id', async (req, res) => {
    // const userId = req.params.user_id; // Get user ID from the path parameters
    // await authController.delete_record(
    //     dbInstance,
    //     req.user,
    //     userId,
    //     USER_COLLECTION_NAME
    // );
    // res.status(200).send();
});

/**
 * @swagger
 * /users:
 *   put:
 *     tags: [User Management]
 *     summary: Update a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       202:
 *         description: The updated user object
 */
router.put('/users', async (req, res) => {
    // const updatedRecord: UpdateUser = req.body; // Get updated user data from the request body

    // if (updatedRecord.password) {
    //     const hashInstance = new Hash(); // Create a new Hash instance
    //     updatedRecord.password = hashInstance.encrypt_password(updatedRecord.password); // Hash the new password
    // }

    // const updatedUser = await authController.update_record(
    //     dbInstance,
    //     req.user,
    //     updatedRecord,
    //     USER_COLLECTION_NAME,
    //     ["role_id"]
    // );
    // res.status(202).json(updatedUser);
});

export default router;
