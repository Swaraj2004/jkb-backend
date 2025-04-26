import express, { Request, Response } from 'express';
import { gemini_url, STATUS_CODES } from '../utils/consts';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { QnaFormResponse } from '../models/qna_req_body';
import { ContactEnquiryReqBody } from '../models/contact_enquiry_req_body';

export async function getGeminiResponse(req: Request, res: Response, body: QnaFormResponse): Promise<void> {
  if (!body.questions || !body.email) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Email and Questions Required", null));
    return;
  }

  // INFO: below 4 lines of code can help you to get all the available models for gemini_url
  // const LIST_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  // const listRes = await fetch(LIST_URL);
  // const listData = await listRes.json();
  // console.log("Available models:", listData.models.map((m: any) => m.name));
  const careerData = body.questions;
  const prompt = `Q&A: ${JSON.stringify(careerData)}
  You are a professional career coach specializing in providing actionable career guidance tailored to individual needs. Based on the user’s inputs and interests, offer the best career option for them, focusing on their skills, interests, goals, and opportunities in their region (India). Provide actionable insights in a clear and concise manner. Follow these guidelines:

  Best Career Option:
  Focus on recommending one career option that aligns best with the user's preferences and abilities.
  Consider industry growth and job opportunities in India.

  Alternate Career Option:
  Suggest one alternate career if the primary option is highly competitive or requires backup planning.

  Industry Overview in India:
  Highlight the career’s scope and where most opportunities are available in India (industries, regions, or cities).

  Top Institutes:
  Recommend the best institutes in or near the user's location (city and area, if mentioned).
  If no local options exist, suggest leading institutes across India.
  Provide website links for each institute.

  Preparation Plan:
  Suggest a preparation plan tailored to the user’s current education and grade level.
  Include actionable steps to prepare effectively.

  Entrance Tests and Websites:
  List relevant entrance exams for the career path.
  Provide eligibility criteria, cutoff scores (if available), and preparation resources (with links).

  Eligibility and Admission Criteria:
  Specify required qualifications, score targets, and key deadlines.

  User-Centric Approach:
  Avoid overwhelming the user with too many options.
  Focus on practical, personalized advice.

  DISCLAIMER:
  Add this disclaimer at the end of your response:

  THIS RESPONSE IS BASED ON YOUR INPUTS, INTEREST, AND POTENTIAL AS OF TODAY. THIS IS SUBJECT TO CHANGE BASED ON YOUR NEW INTEREST AND POTENTIAL IN FUTURE.`;
  try {
    await prismaClient.qna.create({
      data: {
        email: body.email,
        full_name: body.name,
        location: body.address,
        contact: body.contact,
        qna: body.questions
      }
    });

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };
    const response = await fetch(gemini_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Temprory User created successfully and Recieved Gemini Response!", reply));
      return;
    }

    res.status(STATUS_CODES.SELECT_FAILURE).json({ error: 'No candidates returned by Gemini' });
  } catch (err) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Error occured in either database or AI Model Response!", null));
  }
}

export async function createContactEnquiry(req: Request, res: Response, body: ContactEnquiryReqBody): Promise<void> {
  try {
    const contactEnquiry = await prismaClient.contactEnquiry.create({
      data: {
        email: body.email,
        full_name: body.full_name,
        location: body.location,
        contact: body.contact,
        message: body.message
      }
    });

    res.status(STATUS_CODES.SELECT_FAILURE).json(successJson("Contact Saved Successfully!", contactEnquiry.id));
  } catch (err) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Error occured in either database or AI Model Response!", null));
  }
}

export async function getContactEnquiry(req: Request, res: Response, body: ContactEnquiryReqBody): Promise<void> {
  try {
    // const contactEnquiry = await prismaClient.contactEnquiry.findMany({
    //
    // });

    res.status(STATUS_CODES.SELECT_FAILURE).json(successJson("Contact Saved Successfully!", 1));
  } catch (err) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Error occured in either database or AI Model Response!", null));
  }
}
