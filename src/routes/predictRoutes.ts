import express from 'express';
// import webController from '../controllers/webController'; // Adjust the import based on your project structure
// import { ListCollegesByScore, ListCollegesByLocation } from '../schemas/collegeSchemas'; // Adjust the import based on your project structure

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: College Prediction
 *     description: Operations related to college prediction
 */

/**
 * @swagger
 * /predict-colleges-by-score:
 *   post:
 *     tags: [College Prediction]
 *     summary: Predict colleges based on score
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListCollegesByScore'
 *     responses:
 *       200:
 *         description: A list of predicted colleges based on score
 */
router.post('/predict-colleges-by-score', async (req, res) => {
  // const requestBody: ListCollegesByScore = req.body; // Get request body
  // try {
  //     const predictedColleges = await webController.predict_colleges_by_score(
  //         dbInstance,
  //         requestBody
  //     );
  //     return res.status(200).json(predictedColleges); // Return the predicted colleges
  // } catch (error) {
  //     return res.status(500).json({ success: false, message: 'Error predicting colleges by score', error });
  // }
});

/**
 * @swagger
 * /predict-colleges-by-location:
 *   post:
 *     tags: [College Prediction]
 *     summary: Predict colleges based on location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListCollegesByLocation'
 *     responses:
 *       200:
 *         description: A list of predicted colleges based on location
 */
router.post('/predict-colleges-by-location', async (req, res) => {
  // const requestBody: ListCollegesByLocation = req.body; // Get request body
  // try {
  //     const predictedColleges = await webController.predict_colleges_by_location(
  //         dbInstance,
  //         requestBody
  //     );
  //     return res.status(200).json(predictedColleges); // Return the predicted colleges
  // } catch (error) {
  //     return res.status(500).json({ success: false, message: 'Error predicting colleges by location', error });
  // }
});

export default router;
