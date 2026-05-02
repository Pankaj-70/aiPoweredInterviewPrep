import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAI } from '../services/openRouter.service.js';

export const analyzeResume = async(req, res) => {
    try {
        if(!req.file) {
            res.status(400).json({message: "Resume required"});
        }
        const filePath = req.file.path;
        const fileBuffer = await fs.promises.readFile(filePath);
        const uint8Array = new Uint8Array(fileBuffer);

        const pdf = await pdfjsLib.getDocument({data: uint8Array}).promise;
        

        let resumeText = "";
        for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();

            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText.replace(/\s+/g, " ").trim();
        
       const messages = [
        {
            role: "system",
            content: `
        You are a strict JSON generator.

        Extract structured data from the resume.

        You MUST return ONLY valid JSON.
        No markdown.
        No backticks.
        No explanation.
        No extra text.

        Return format:
        {
        "role": "string",
        "experience": "string",
        "projects": ["string"],
        "skills": ["string"]
        }

        Rules:
        - Output must be pure JSON
        - Do not wrap in \`\`\`json
        - Do not add comments
        - Do not add trailing commas
        `
        },
        {
            role: "user",
            content: resumeText
        }
        ];
        const aiResponse = await askAI(messages);
        const parsed = JSON.parse(aiResponse);
        fs.unlinkSync(filePath);

        return res.status(200).json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills
        });
        
    } catch (error) {
        console.error('AnalyzeResume error: ', error);
        if(req.file && fs.existsSync(req.file.Path)) {
            fs.unlinkSync(req.file.Path);
        }
        return res.status(500).json({message: "Error in analying resume"});
    }   
}


export const generateQuestions = async(req, res) => {
    try {
        const {role, experience, mode, resumeText, projects, skills} = req.body;
        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if(!role || !experience || !mode) 
            return res.status(400).json({message: 'Incomplete data sent'});
        

        const user = await User.findById(req.userId);
        if(!user)
            return res.status(400).json({message: "User not found"});
        if(user.credits < 50)
            return res.status(400).json({
                message: 'Not enough credits, minimum 50 required'
            });
        
        const projectText = Array.isArray(projects) && projects.length?
                            projects.join(", ")
                            : "None";
        
        const skillText = Array.isArray(skills) && skills.length?
                            skills.join(", ")
                            : "None";
        
        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
            Role: ${role},
            Experience: ${experience},
            Projects: ${projectText},
            Skills: ${skillsText},
            Resume: ${safeResume},
            InterviewMode: ${mode}
        `;
        if(!userPrompt.trim()) {
            return res.status(400).json({message: "No user prompt generated"});
        }

        const messages = [
            {
                role: "system",
                content: `
                    You are a real human interviewer conducting a professional interview.

                    Speak in simple english as if you are directly talking to the candidate.

                    Generate exactly 5 interview questions.

                    Strict rules:
                    - Each question must contain between 15 and 25 words.
                    - Each quetsion must be a single complete sentence.
                    - Do not number them.
                    - Do not add explainations.
                    - Do not add extra text before or after the question.
                    - One question per line only.
                    - Keep language simple and conversational.
                    - Questions must feel practical and realistic.
                    
                    Difficult progression:
                    Question 1 -> easy
                    Question 2 -> easy
                    Question 3 -> medium
                    Question 4 -> medium
                    Question 5 -> hard

                    Make questions based on the candidates's role, experience, interviewMode, projects, skills and resume details.

                `
            }, 
            {
                role: "user",
                content: userPrompt
            }
        ];

        const aiResponse = await askAI(messages);
        if(!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({message: 'AI returned empty response'});
        }

        const questionsArray = aiResponse
                               .split("\n")
                               .map(q => q.trim())
                               .filter(q => q.length > 0)
                               .slice(0, 5);

        if(questionsArray.length === 0) {
            return res.status(500).json({message: "Ai failed to generate questions"});
        }

        user.credits -= 1;
        await user.save();

        const interview = new Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, index) => ({
                question: q,
                difficulty: ['easy', 'easy', 'medium', 'medium', 'hard'][index],
                timeLimit: [60, 60, 90, 90, 120][index] 
            }))
        });

        return res.status(200).json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            questions: interview.questions
        });

    } catch (error) {
        console.error("Error in generating questions: ", error);
        return res.status(500).json({
            message: `Internal Server error: ${error}`
        });
    }
}