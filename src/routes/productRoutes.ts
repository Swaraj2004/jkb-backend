import express from "express";
import { getProducts } from "../controllers/productController";
import { BASE_URLS } from '../swagger/swaggerConfig';


const router = express.Router();
const BASE_URL = BASE_URLS.PRODUCTS;


/**
 * @swagger
 * ${BASE_URL}/example:
 *   get:
 *     summary: Retrieve an example
 *     responses:
 *       200:
 *         description: A successful response
 */
router.get("/", getProducts);

export default router;
