import express from "express";
import { getProducts } from "../controllers/productController";

const router = express.Router();

/**
 * @swagger
 * /example:
 *   get:
 *     summary: Retrieve an example
 *     responses:
 *       200:
 *         description: A successful response
 */
router.get("/", getProducts);

export default router;
