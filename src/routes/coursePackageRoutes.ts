import express, { Request, Response } from 'express';
import { createCoursePackage, deleteCoursePackage, getAllCoursePackages, getAllCoursePackagesIdName, getCoursePackageById, getProfessors, getStudentPackages, getSubjectPackageUsers, updateCoursePackage } from '../controllers/coursePackageController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { GET_ALTERNATIVE, PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Course Package Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /api/v3/admin/course-packages/{course_package_id}:
 *   get:
 *     tags: [Course Package Management]
 *     summary: Get a specific course package by ID
 *     parameters:
 *       - in: path
 *         name: course_package_id
 *         required: true
 *         description: The ID of the course package to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single course package object
 */
router.get('/course-packages/:course_package_id', async (req: Request, res: Response) => {
    return getCoursePackageById(req, res, req.params.course_package_id);
});

/**
 * @swagger
 * /api/v3/admin/course-packages:
 *   get:
 *     tags: [Course Package Management]
 *     summary: Get all course packages
 *     responses:
 *       200:
 *         description: A list of course package objects
 */
// It is an open route ask Swaraj Bhaiya
router.get('/course-packages', async (req: Request, res: Response) => {
    const { type } = req.query;

    if (type === GET_ALTERNATIVE) {
        return getAllCoursePackagesIdName(req, res);
    }

    return getAllCoursePackages(req, res);
});

/**
 * @swagger
 * /api/v3/admin/package-users:
 *   get:
 *     tags: [Course Package Management]
 *     summary: Get users enrolled in a specific subject package
 *     parameters:
 *       - in: query
 *         name: subject_package_id
 *         required: true
 *         description: The ID of the subject package
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         required: false
 *         description: The year to filter by
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of users enrolled in the subject package
 */

// this function requires nice testing
router.get('/package-users', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    return getSubjectPackageUsers(req, res);
});

/**
 * @swagger
 * /api/v3/admin/student-packages/{student_id}:
 *   get:
 *     tags: [Course Package Management]
 *     summary: Get course packages for a specific student
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get packages of
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of course packages for the student
 */
router.get('/student-packages/:student_id', authMiddleware, authorizeRoles([PROFESSOR_ROLE, STUDENT_ROLE]), async (req: AuthenticatedRequest, res: Response) => {
    // if (!req.user) {
    //     res.status(401).json(errorJson("Please log in first", null));
    //     return;
    // }

    // if (
    //     !AUTH_ROLES.includes(req.user.role_name) &&
    //     req.user.role_name !== PROFESSOR_ROLE &&
    //     req.user.id != req.params.user_id
    // ) {
    //     res.status(403).json(errorJson("Unauthorized", null));
    //     return;
    // }
    return getStudentPackages(req, res, req.params.student_id);
});

/**
 * @swagger
 * /api/v3/admin/course-packages:
 *   post:
 *     tags: [Course Package Management]
 *     summary: Create a new course package
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoursePackage'
 *     responses:
 *       201:
 *         description: The created course package object
 */
router.post('/course-packages', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    return createCoursePackage(req, res);
});

/**
 * @swagger
 * /api/v3/admin/course-packages/{course_package_id}:
 *   delete:
 *     tags: [Course Package Management]
 *     summary: Delete a course package by ID
 *     parameters:
 *       - in: path
 *         name: course_package_id
 *         required: true
 *         description: The ID of the course package to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Course package deleted successfully
 */
router.delete('/course-packages/:course_package_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    return deleteCoursePackage(req, res, req.params.course_package_id);
});

/**
 * @swagger
 * /api/v3/admin/course-packages:
 *   put:
 *     tags: [Course Package Management]
 *     summary: Update a course package
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCoursePackage'
 *     responses:
 *       202:
 *         description: The updated course package object
 */
router.put('/course-packages', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    return updateCoursePackage(req, res);
});

/**
 * @swagger
 * /api/v3/admin/professors:
 *   get:
 *     tags: [Professor Management]
 *     summary: Get all professors and super-admins
 *     responses:
 *       200:
 *         description: A list of professor objects
 */
router.get('/professors', authMiddleware, authorizeRoles(), async (req:Request, res:Response) => {
    return getProfessors(req, res);
});

export default router;
