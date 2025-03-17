import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import authController from '../controllers/authController'; // Adjust the import based on your project structure
// import { Role, UpdateRole } from '../schemas/roleSchemas'; // Adjust the import based on your project structure

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Role Management
 *     description: Operations related to role management
 */

/**
 * @swagger
 * /roles/{role_id}:
 *   get:
 *     tags: [Role Management]
 *     summary: Get a specific role by ID
 *     parameters:
 *       - in: path
 *         name: role_id
 *         required: true
 *         description: The ID of the role to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single role object
 */
router.get('/roles/:role_id', async (req, res) => {
    // const roleId = req.params.role_id; // Get role ID from the path parameters
    // const readRecordId = convertToBsonId(roleId); // Convert the role ID to BSON format
    // const role = await authController.get_records(
    //     dbInstance,
    //     readRecordId,
    //     ROLE_COLLECTION_NAME
    // );
    // res.status(200).json(role);
});

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Role Management]
 *     summary: Get all roles
 *     responses:
 *       200:
 *         description: A list of role objects
 */
router.get('/roles', async (req, res) => {
    // const roles = await authController.get_records(
    //     dbInstance,
    //     null,
    //     ROLE_COLLECTION_NAME
    // );
    // res.status(200).json(roles);
});

/**
 * @swagger
 * /roles:
 *   post:
 *     tags: [Role Management]
 *     summary: Create a new role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: The created role object
 */
router.post('/roles', async (req, res) => {
    // const createRecord: Role = req.body; // Get role data from the request body
    // const newRole = await authController.post_record(
    //     dbInstance,
    //     req.user,
    //     createRecord,
    //     ROLE_COLLECTION_NAME
    // );
    // res.status(201).json(newRole);
});

/**
 * @swagger
 * /roles/{role_id}:
 *   delete:
 *     tags: [Role Management]
 *     summary: Delete a role by ID
 *     parameters:
 *       - in: path
 *         name: role_id
 *         required: true
 *         description: The ID of the role to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Role deleted successfully
 */
router.delete('/roles/:role_id', async (req, res) => {
    // const roleId = req.params.role_id; // Get role ID from the path parameters
    // const usersWithRole = await dbInstance[USER_COLLECTION_NAME].find({ role_id: convertToBsonId(roleId) }).toArray(); // Find users with this role
    // const role = await dbInstance[ROLE_COLLECTION_NAME].findOne({ _id: convertToBsonId(roleId) }); // Find the role

    // // Check if the role is super-admin
    // if (role && role.name === "super-admin") {
    //     return res.status(400).json({ success: false, message: "Record deletion failed! Super admin cannot be deleted!" });
    // }

    // // Check if there are users with this role
    // if (usersWithRole.length > 0) {
    //     return res.status(400).json({ success: false, message: "Record deletion failed! Users exist within this role!" });
    // }

    // await authController.delete_record(
    //     dbInstance,
    //     req.user,
    //     roleId,
    //     ROLE_COLLECTION_NAME
    // );
    // res.status(204).send();
});

/**
 * @swagger
 * /roles:
 *   put:
 *     tags: [Role Management]
 *     summary: Update a role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRole'
 *     responses:
 *       202:
 *         description: The updated role object
 */
router.put('/roles', async (req, res) => {
    // const updatedRecord: UpdateRole = req.body; // Get updated role data from the request body
    // const updatedRole = await authController.update_record(
    //     dbInstance,
    //     req.user,
    //     updatedRecord,
    //     ROLE_COLLECTION_NAME
    // );
    // res.status(202).json(updatedRole);
});

export default router;
