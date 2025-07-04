import { Request, Response } from 'express';
import { emailPassword, fromEmail, GEMINI_API_KEYS, gemini_url, smtpPort, smtpServer, STATUS_CODES } from '../utils/consts';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { BranchFormResponse, QnaFormResponse } from '../models/miscellaneous_req_bodies';
import { ContactEnquiryReqBody } from '../models/contact_enquiry_req_body';
import { branchPrompt, carrerPrompt } from '../utils/prompts';
import { sendEmail } from '../utils/send_email';
import { FacebookEnquiryReqBody } from '../models/facebook_enq_req_body';

let currentIndex = 0;

export async function getCarrerPrediction(req: Request, res: Response, body: QnaFormResponse, sendEmail: boolean): Promise<void> {
  if (!body.questions || !body.email) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Email and Questions Required", null));
    return;
  }

  // INFO: below 4 lines of code can help you to get all the available models for gemini_url
  // docs - https://ai.google.dev/gemini-api/docs/api-key
  // const LIST_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEYS[0]}`;
  // const listRes = await fetch(LIST_URL);
  // const listData = await listRes.json();
  // console.log("Available models:", listData.models.map((m: any) => m.name));
  const careerData = body.questions;
  const prompt = `Q&A: ${JSON.stringify(careerData)} ${carrerPrompt}`;
  try {
    const user = await prismaClient.qna.findFirst({
      where: {
        OR: [
          { email: body.email },
          { contact: body.contact }
        ]
      },
      select: { id: true }
    });
    if (user) {
      res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("An enquiry with this email or contact no. already exists. Duplicate submissions are not allowed.", null));
      return;
    }

    const newEnquiry = await prismaClient.qna.create({
      data: {
        email: body.email,
        full_name: body.name,
        location: body.address,
        contact: body.contact,
        qna: body.questions
      },
      select: { id: true, email: true }
    });

    if (!newEnquiry) {
      res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("New Enquiry not Created!", null));
      return;
    }

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    const data = await getGeminiResponse(gemini_url, currentIndex, payload);
    if (sendEmail) {
      return sendRespone(data, payload, res, GEMINI_API_KEYS.length, newEnquiry.email);
    }
    return sendRespone(data, payload, res, GEMINI_API_KEYS.length, null);
  } catch (err) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Error occured in either database or AI Model Response!", null));
  }
}

// IMPORTANT: for now i am doing this using local variable as there is only one server but in future if number of servers 
// are increased then we can use redis
async function sendRespone(data: any, payload: any, res: Response, round: number, emailId: string | null): Promise<void> {
  if (round < 1) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("No candidates returned by Gemini", null));
    return;
  }
  if (data.candidates && data.candidates.length > 0) {
    const reply = data.candidates[0].content.parts[0].text;
    if (emailId) {
      const subject = "Your Career Prediction Report";
      const sentEmail = sendEmail(subject, reply, emailId, fromEmail, smtpServer, smtpPort, emailPassword);
      if (!sentEmail) {
        res.status(STATUS_CODES.CREATE_FAILURE).json(successJson("Gemini Response received, but failed to send email!", null));
        return;
      }
      res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Email sent Successfully!", null));
      return;
    }

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("User Enquiry created successfully and Recieved Gemini Response!", reply));
    return;
  }
  // retry with other api key
  currentIndex = (currentIndex + 1) % GEMINI_API_KEYS.length;
  data = await getGeminiResponse(gemini_url, currentIndex, payload);
  return sendRespone(data, payload, res, round - 1, emailId);
}

async function getGeminiResponse(url: string, index: number, payload: any): Promise<any> {
  // console.log('Using api key - ', GEMINI_API_KEYS[index]);
  const fullUrl = url + GEMINI_API_KEYS[index];
  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data;
}

export async function getBranchPrediction(req: Request, res: Response, body: BranchFormResponse, sendEmail: boolean): Promise<void> {
  if (!body.branch_qna || !body.email) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Email and Questions Required", null));
    return;
  }

  const careerData = body.branch_qna;
  const prompt = `Q&A: ${JSON.stringify(careerData)} ${branchPrompt}`;
  try {
    const branchEnquiry = await prismaClient.branchEnquiry.findFirst({
      where: {
        OR: [
          { email: body.email },
          { contact: body.contact }
        ]
      },
      select: { id: true }
    });
    if (branchEnquiry) {
      res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("An enquiry with this email or contact no. already exists. Duplicate submissions are not allowed.", null));
      return;
    }

    const newEnquiry = await prismaClient.branchEnquiry.create({
      data: {
        email: body.email,
        full_name: body.name,
        location: body.address,
        contact: body.contact,
        branch_qna: body.branch_qna
      },
      select: { id: true, email: true }
    });

    if (!newEnquiry) {
      res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("New Enquiry not Created!", null));
      return;
    }

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    const data = await getGeminiResponse(gemini_url, currentIndex, payload);
    // console.log(data);
    if (sendEmail) {
      return sendRespone(data, payload, res, GEMINI_API_KEYS.length, newEnquiry.email);
    }
    return sendRespone(data, payload, res, GEMINI_API_KEYS.length, null);
  } catch (err) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Error occured in either database or AI Model Response!", null));
  }
}

export async function createContactEnquiry(req: Request, res: Response, body: ContactEnquiryReqBody): Promise<void> {
  if (!body.contact) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Contact number is Required", null));
    return;
  }
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

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Contact Saved Successfully!", contactEnquiry.id));
  } catch (err) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Contact not saved Unsuccessful!", null));
  }
}

export async function getContactEnquiry(req: Request, res: Response, reqLimit: string, reqOffset: string): Promise<void> {
  try {
    if (!reqLimit && !reqOffset) {
      const contactEnquiry = await prismaClient.contactEnquiry.findMany();
      res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Contact Fetched Successfully!", contactEnquiry));
      return;
    }

    const limit = parseInt(reqLimit);
    const offset = parseInt(reqOffset);

    if (isNaN(limit) || isNaN(offset)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Limit or offset is NaN", null));
      return;
    }

    const contactEnquiry = await prismaClient.contactEnquiry.findMany({
      skip: offset,
      take: limit
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Contact Fetched Successfully!", contactEnquiry));
  } catch (err) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Contact fetch Unsuccessful!", null));
  }
}
export async function getQnaEnquiry(req: Request, res: Response, reqLimit: string, reqOffset: string): Promise<void> {
  try {
    if (!reqLimit && !reqOffset) {
      const contactEnquiry = await prismaClient.qna.findMany({
        select: { id: true, full_name: true, contact: true, created_at: true, email: true, location: true }
      });
      res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Qna Fetched Successfully!", contactEnquiry));
      return;
    }

    const limit = parseInt(reqLimit);
    const offset = parseInt(reqOffset);

    if (isNaN(limit) || isNaN(offset)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Limit or offset is NaN", null));
      return;
    }

    const contactEnquiry = await prismaClient.qna.findMany({
      skip: offset,
      take: limit,
      select: { id: true, full_name: true, contact: true, created_at: true, email: true, location: true }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Qna Fetched Successfully!", contactEnquiry));
  } catch (err) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Qna fetch Unsuccessful!", null));
  }
}
export async function getBranchEnquiry(req: Request, res: Response, reqLimit: string, reqOffset: string): Promise<void> {
  try {
    if (!reqLimit && !reqOffset) {
      const branchEnquiries = await prismaClient.branchEnquiry.findMany({
        select: { id: true, full_name: true, contact: true, created_at: true, email: true, location: true }
      });
      res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Branch Enquiry Fetched Successfully!", branchEnquiries));
      return;
    }

    const limit = parseInt(reqLimit);
    const offset = parseInt(reqOffset);

    if (isNaN(limit) || isNaN(offset)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Limit or offset is NaN", null));
      return;
    }

    const branchEnquiries = await prismaClient.branchEnquiry.findMany({
      skip: offset,
      take: limit,
      select: { id: true, full_name: true, contact: true, created_at: true, email: true, location: true }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Branch Enquiry Fetched Successfully!", branchEnquiries));
  } catch (err) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Branch Enquiry fetch Unsuccessful!", err));
  }
}

// Facebook enquiry controller
export async function createFacebookEnquiry(req: Request, res: Response, body: FacebookEnquiryReqBody): Promise<void> {
  if (!body.contact || !body.email) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Contact number and email is Required", null));
    return;
  }
  try {
    const facebookEnquiry = await prismaClient.facebookEnquiry.create({
      data: {
        email: body.email,
        full_name: body.full_name,
        location: body.location,
        contact: body.contact,
        message: body.message
      }
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Facebook Enquiry Saved Successfully!", facebookEnquiry.id));
  } catch (err) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Facebook Enquiry not saved Unsuccessful!", null));
  }
}
export async function getFacebookEnquiry(req: Request, res: Response, reqLimit: string, reqOffset: string): Promise<void> {
  try {
    if (!reqLimit && !reqOffset) {
      const facebookEnquiries = await prismaClient.facebookEnquiry.findMany();
      res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Facebook Enquiry Fetched Successfully!", facebookEnquiries));
      return;
    }

    const limit = parseInt(reqLimit);
    const offset = parseInt(reqOffset);

    if (isNaN(limit) || isNaN(offset)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Limit or offset is NaN", null));
      return;
    }

    const facebookEnquiries = await prismaClient.facebookEnquiry.findMany({
      skip: offset,
      take: limit
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Facebook Enquiry Fetched Successfully!", facebookEnquiries));
  } catch (err) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Facebook Enquiry fetch Unsuccessful!", null));
  }
}
