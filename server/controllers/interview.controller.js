import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAI } from "../services/openRouter.service.js";
import Interview from "../models/interview.model.js";
import User from "../models/userModel.js";


// ================= ANALYZE RESUME =================
export const analyzeResume = async (req, res) => {
  let filePath;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    filePath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filePath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + " ";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
You are a strict JSON generator.

Extract structured data from the resume.

Return ONLY valid JSON.
No markdown.
No backticks.
No explanation.
In role, return a role ON THE BASIS of projects and skills.
In experience return a number, eg. 2yrs
In projects, just return the project name...NO project description


Format:
{
  "role": "string",
  "experience": "string",
  "projects": ["string"],
  "skills": ["string"]
}
        `.trim(),
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAI(messages);

    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({...parsed, resumeText});

  } catch (error) {
    console.error("AnalyzeResume error:", error);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(500).json({ message: "Error analyzing resume" });
  }
};


// ================= GENERATE QUESTIONS =================
export const generateQuestions = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Incomplete data sent" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.credits < 1) {
      return res.status(400).json({
        message: "Not enough credits",
      });
    }

    const projectText =
      Array.isArray(projects) && projects.length
        ? projects.join(", ")
        : "None";

    const skillText =
      Array.isArray(skills) && skills.length
        ? skills.join(", ")
        : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role: ${role}
Experience: ${experience}
Projects: ${projectText}
Skills: ${skillText}
Resume: ${safeResume}
InterviewMode: ${mode}
`;

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer.

Generate exactly 5 interview questions.

Rules:
- 15–25 words each
- One sentence only
- No numbering
- No extra text
- One question per line

Difficulty:
1 easy
2 easy
3 medium
4 medium
5 hard
        `,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAI(messages);

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({ message: "AI failed to generate questions" });
    }

    user.credits -= 1;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, i) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][i],
        timeLimit: [60, 60, 90, 90, 120][i],
      })),
    });

    return res.status(200).json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });

  } catch (error) {
    console.error("GenerateQuestions error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ================= SUBMIT ANSWER =================
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(400).json({ message: "Interview not found" });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ message: "Invalid question index" });
    }

    if (!answer) {
      question.score = 0;
      question.feedback = "No answer submitted";
      await interview.save();
      return res.status(200).json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded";
      await interview.save();
      return res.status(200).json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `
Evaluate answer.

Return JSON:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short feedback"
}
        `,
      },
      {
        role: "user",
        content: `Q: ${question.question} A: ${answer}`,
      },
    ];

    const aiResponse = await askAI(messages);

    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;

    await interview.save();

    return res.status(200).json({ feedback: parsed.feedback });

  } catch (error) {
    console.error("SubmitAnswer error:", error);
    return res.status(500).json({ message: "Error submitting answer" });
  }
};


// ================= FINISH INTERVIEW =================
export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(400).json({ message: "Interview not found" });
    }

    const total = interview.questions.length;

    let score = 0,
      confidence = 0,
      correctness = 0,
      communication = 0;

    interview.questions.forEach((q) => {
      score += q.score || 0;
      confidence += q.confidence || 0;
      correctness += q.correctness || 0;
      communication += q.communication || 0;
    });

    const finalScore = total ? score / total : 0;

    interview.finalScore = finalScore;
    interview.status = "Completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number((confidence / total).toFixed(1)),
      correctness: Number((correctness / total).toFixed(1)),
      communication: Number((communication / total).toFixed(1)),
      questionWiseScore: interview.questions,
    });

  } catch (error) {
    console.error("FinishInterview error:", error);
    return res.status(500).json({ message: "Error finishing interview" });
  }
};



export const getMyInterviews = async(req, res) => {
  try {
    const {id} = req.params;
    const intereviews = await Interview.find({userId: id})
                             .sort({createdAt: -1})
                             .select("role experience mode finalScore status createdAt");
    return res.status(200).json(intereviews);
  } catch(error) {
    console.error("Error in getting interviews: ", error);
    return res.status(500).json({message: `Error in getting interviews: ${error}`});
  }
}


export const getInterviewReport = async(req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if(!interview) {
      return res.status(500).json({message: "Interview not found"});
    }
    const total = interview.questions.length;

    let score = 0,
      confidence = 0,
      correctness = 0,
      communication = 0;

    interview.questions.forEach((q) => {
      confidence += q.confidence || 0;
      correctness += q.correctness || 0;
      communication += q.communication || 0;
    });

    return res.status(200).json({
      finalScore: interview.finalScore,
      confidence: Number((confidence / total).toFixed(1)),
      correctness: Number((correctness / total).toFixed(1)),
      communication: Number((communication / total).toFixed(1)),
      questionWiseScore: interview.questions,
    });
  } catch (error) {
    console.error("Error in generating report: ", error);
    return res.status(500).json({message: `Error in generating report: ${error}`}); 
  }
}