import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import JSZip from "jszip";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Direct individual Swift file download endpoint
app.get("/swift/:filename", (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(process.cwd(), "public", "swift", safeFilename);
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    return res.sendFile(filePath);
  }
  return res.status(404).send("File not found");
});

// Download Swift project files as standard .zip (compatible with Apple Archive Utility and iPadOS)
app.get(["/api/download-swift-files", "/api/download-swift-playground"], async (_req, res) => {
  try {
    const staticZipPath = path.join(process.cwd(), "public", "SwiftFiles.zip");
    if (fs.existsSync(staticZipPath)) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="SwiftFiles.zip"');
      return fs.createReadStream(staticZipPath).pipe(res);
    }

    // Dynamic fallback generation
    const zip = new JSZip();
    const playgroundDir = path.join(process.cwd(), "SwiftPlayground");

    function addFiles(dirPath: string, prefix = "") {
      if (!fs.existsSync(dirPath)) return;
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          addFiles(fullPath, `${prefix}${entry.name}/`);
        } else {
          const content = fs.readFileSync(fullPath);
          // Add at root if it's in Sources or top-level
          zip.file(`${prefix}${entry.name}`, content);
          if (prefix.startsWith("Sources/")) {
            zip.file(entry.name, content);
          }
        }
      }
    }

    addFiles(playgroundDir);

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
      platform: "UNIX",
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="SwiftFiles.zip"');
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error("Failed to generate Swift files zip:", err);
    return res.status(500).json({ error: "Failed to create Swift files archive", details: err.message });
  }
});

// AI Evaluation endpoint for drawing lessons with constructive master-atelier coach
app.post("/api/evaluate-drawing", async (req, res) => {
  const { imageBase64, instructionText, aiEvaluationCriteria, stepTitle, strokeMetrics, strictness = "balanced" } = req.body;

  try {
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const ai = getAiClient();

    // Clean base64 data
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    let mimeType = "image/png";
    if (imageBase64.startsWith("data:image/jpeg")) {
      mimeType = "image/jpeg";
    }

    // Algorithmic metrics
    const algorithmicScore = strokeMetrics?.algorithmicScore ?? 75;
    const waviness = strokeMetrics?.wavinessCount ?? 0;
    const maxDev = strokeMetrics?.maxDeviationPixels ?? 0;
    const straightnessPct = strokeMetrics?.averageStraightnessPct ?? 82;
    const algorithmicStrengths = strokeMetrics?.strengths ?? [];
    const algorithmicFlaws = strokeMetrics?.flaws ?? [];
    const pillars = strokeMetrics?.pillars ?? {
      flowAndRhythm: 82,
      formAccuracy: 80,
      lineConfidence: 85,
      proportions: 84,
    };

    const passThreshold = strictness === "encouraging" ? 60 : strictness === "atelier" ? 75 : 68;

    // Badges generator based on performance
    const getBadge = (score: number) => {
      if (score >= 90) return { name: "Master Draughtsman", icon: "👑", description: "Flawless shoulder line control!" };
      if (score >= 80) return { name: "Smooth Navigator", icon: "🌊", description: "Confident rhythm and steady velocity!" };
      if (score >= 70) return { name: "Solid Foundation", icon: "🎯", description: "Clear path intent and clean release!" };
      return { name: "Courageous Explorer", icon: "✨", description: "Great line commitment—keep building muscle memory!" };
    };

    // Offline / No API key fallback
    if (!ai) {
      const isPassed = algorithmicScore >= passThreshold;
      return res.json({
        score: algorithmicScore,
        passed: isPassed,
        coachingMode: strictness,
        compliment: algorithmicStrengths[0] || "Great hand commitment across the entire canvas plane!",
        coreFlaw: algorithmicFlaws[0] || (isPassed ? "Minor end-point deceleration." : "Slight wobble through the midsection of the stroke."),
        actionableAdvice: isPassed
          ? "Keep your wrist gently locked and glide your whole forearm for even higher precision."
          : "Ghost the line twice in the air without touching the screen, then pull smoothly from your shoulder socket.",
        drawingTypeDetected: stepTitle || "Drawing Exercise",
        pillars,
        earnedBadge: getBadge(algorithmicScore),
        notice: "Evaluated with on-device CoreGraphics geometric engine.",
      });
    }

    const systemPrompt = `You are a world-class drawing mentor (like a master classical atelier instructor with a warm, encouraging, Glen Keane style).
Coaching Mode: "${strictness}" (encouraging, balanced, or atelier)
Exercise Step: "${stepTitle || ""}"
Instructions: "${instructionText || ""}"
Criteria: ${aiEvaluationCriteria || "Check line confidence, straightness, parallel spacing, and smooth stroke execution."}

${strokeMetrics ? `
MEASURED TELEMETRY:
- Straightness Ratio: ${straightnessPct}%
- Wobbles / Jitter Count: ${waviness}
- Max Perpendicular Drift: ${maxDev}px
- Baseline Algorithmic Score: ${algorithmicScore} / 100
` : ""}

COACHING GUIDELINES:
1. Be warm, uplifting, and constructively pedagogical. Acknowledge that human drawing on touch glass has natural micro-variations.
2. Highlight a specific strength first (e.g. stroke boldness, commitment, proportions, steady speed).
3. Give 1 specific, physical biomechanical tip (e.g. "Draw with your shoulder pivot rather than bending the wrist", "Ghost the path before touching down", "Rest your pinky knuckle as a steady glide guide").
4. Grade fairly:
   - Strong work: 82-96
   - Solid attempt with minor wobble: 70-81 (Passing)
   - Developing attempt with uneven lines: 58-69
   - Very loose scribble: 40-55
   - Pass threshold for this mode is ${passThreshold}.

Respond ONLY with a valid JSON object matching this schema:
{
  "score": integer (0-100),
  "passed": boolean,
  "compliment": "string (1-2 encouraging sentences highlighting what worked)",
  "coreFlaw": "string (1 gentle, precise observation on what to improve)",
  "actionableAdvice": "string (practical biomechanical drafting technique)",
  "drawingTypeDetected": "string",
  "pillars": {
    "flowAndRhythm": integer (0-100),
    "formAccuracy": integer (0-100),
    "lineConfidence": integer (0-100),
    "proportions": integer (0-100)
  },
  "badge": {
    "name": "string (e.g. 'Shoulder Master', 'Silky Stroke', 'Swift Archer')",
    "icon": "string (emoji)",
    "description": "string"
  }
}`;

    // Resilient model fallback list
    const candidateModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
    let responseText = "";

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `Evaluate this student's drawing attempt for "${instructionText}". Provide warm, motivating, and specific feedback.`,
              },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Score from 0 to 100" },
                passed: { type: Type.BOOLEAN, description: `True if >= ${passThreshold}` },
                compliment: { type: Type.STRING, description: "Encouraging praise" },
                coreFlaw: { type: Type.STRING, description: "Constructive technique observation" },
                actionableAdvice: { type: Type.STRING, description: "Actionable drafting tip" },
                drawingTypeDetected: { type: Type.STRING, description: "Drawing subject identified" },
                pillars: {
                  type: Type.OBJECT,
                  properties: {
                    flowAndRhythm: { type: Type.INTEGER },
                    formAccuracy: { type: Type.INTEGER },
                    lineConfidence: { type: Type.INTEGER },
                    proportions: { type: Type.INTEGER },
                  },
                  required: ["flowAndRhythm", "formAccuracy", "lineConfidence", "proportions"],
                },
                badge: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    icon: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "icon", "description"],
                },
              },
              required: ["score", "passed", "compliment", "coreFlaw", "actionableAdvice", "drawingTypeDetected", "pillars"],
            },
          },
        });

        if (response.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (modelErr: any) {
        const status = modelErr?.status || modelErr?.code;
        console.warn(`Model ${modelName} unavailable (${status || modelErr.message}), trying next...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!responseText) {
      throw new Error("All AI models currently busy");
    }

    const parsed = JSON.parse(responseText);
    const finalScore = Math.max(30, Math.min(99, parsed.score || algorithmicScore));
    const isPassed = finalScore >= passThreshold;

    return res.json({
      score: finalScore,
      passed: isPassed,
      coachingMode: strictness,
      compliment: parsed.compliment,
      coreFlaw: parsed.coreFlaw,
      actionableAdvice: parsed.actionableAdvice,
      drawingTypeDetected: parsed.drawingTypeDetected || stepTitle || "Drawing Exercise",
      pillars: parsed.pillars || pillars,
      earnedBadge: parsed.badge || getBadge(finalScore),
    });
  } catch (err: any) {
    console.warn("AI Evaluation fallback invoked:", err.message || err);
    const algScore = strokeMetrics?.algorithmicScore ?? 75;
    const passThreshold = strictness === "encouraging" ? 60 : strictness === "atelier" ? 75 : 68;
    const isPassed = algScore >= passThreshold;

    return res.json({
      score: algScore,
      passed: isPassed,
      coachingMode: strictness,
      compliment: strokeMetrics?.strengths?.[0] || "Solid commitment and clear stroke velocity!",
      coreFlaw: strokeMetrics?.flaws?.[0] || "Slight line variation through the mid-sweep.",
      actionableAdvice: "Lock your wrist and draw with a smooth, continuous pull from your shoulder joint.",
      drawingTypeDetected: stepTitle || "Drawing Attempt",
      pillars: strokeMetrics?.pillars ?? {
        flowAndRhythm: 80,
        formAccuracy: 78,
        lineConfidence: 82,
        proportions: 80,
      },
      earnedBadge: {
        name: isPassed ? "Steady Hand" : "Pencil Pioneer",
        icon: isPassed ? "🌟" : "✏️",
        description: "Great practice round—keep sketching!",
      },
      notice: "Evaluated with on-device stroke geometry engine.",
    });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DrawCoach server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
