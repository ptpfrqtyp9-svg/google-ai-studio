import Foundation
import UIKit
import SwiftUI

// MARK: - Structured Art Assessment Model
public struct ArtAssessment: Codable, Equatable {
    public let score: Int
    public let passed: Bool
    public let compliment: String
    public let coreFlaw: String
    public let actionableAdvice: String
    public let drawingTypeDetected: String
    
    public init(score: Int, passed: Bool, compliment: String, coreFlaw: String, actionableAdvice: String, drawingTypeDetected: String) {
        self.score = score
        self.passed = passed
        self.compliment = compliment
        self.coreFlaw = coreFlaw
        self.actionableAdvice = actionableAdvice
        self.drawingTypeDetected = drawingTypeDetected
    }
}

// MARK: - AI Art Coach Controller (Zero-Dependency Native Apple URLSession + Offline Geometry Engine)
@MainActor
public class AIArtCoachController: ObservableObject {
    @Published public var currentAssessment: ArtAssessment?
    @Published public var isAnalyzing: Bool = false
    @Published public var errorMessage: String?
    
    private let apiKey: String
    
    public init(apiKey: String = "") {
        // Look up key from environment or UserDefaults
        self.apiKey = apiKey.isEmpty ? (UserDefaults.standard.string(forKey: "GEMINI_API_KEY") ?? "") : apiKey
    }
    
    public func evaluateDrawing(image: UIImage, step: LessonStep, strokes: [CanvasStroke] = []) async {
        guard let imageData = image.jpegData(compressionQuality: 0.6) else {
            self.errorMessage = "Failed to process image buffer."
            return
        }
        
        self.isAnalyzing = true
        self.errorMessage = nil
        
        // Compute basic stroke metrics
        let straightness = calculateAverageStraightness(strokes: strokes)
        
        // If no API key is set, use intelligent heuristic evaluation calibrated by stroke geometry
        guard !apiKey.isEmpty else {
            try? await Task.sleep(nanoseconds: 800_000_000)
            
            let isWobblyOrErratic = straightness < 0.85
            let calculatedScore = isWobblyOrErratic ? Int(max(20.0, straightness * 40.0)) : Int(straightness * 100.0)
            let passed = calculatedScore >= 70
            
            self.currentAssessment = ArtAssessment(
                score: calculatedScore,
                passed: passed,
                compliment: passed ? "Confident line execution and steady rhythm." : "Good attempt committing lines across the canvas.",
                coreFlaw: passed ? "Slight wobble near the finish point." : "Heavy waviness, spikes, and curvature deviations detected.",
                actionableAdvice: passed ? "Maintain consistent pressure from start to end." : "Lock your wrist and draw from your shoulder joint to eliminate waving.",
                drawingTypeDetected: step.title
            )
            self.isAnalyzing = false
            return
        }
        
        let systemPrompt = """
        You are a rigorous, master drawing instructor assessing student work.
        Step: \(step.title)
        Instructions: \(step.instructionText)
        Evaluation Criteria: \(step.aiEvaluationCriteria)
        
        CRITICAL GRADING INSTRUCTIONS:
        - Do NOT give polite inflated grades.
        - If the student drew wavy, spiky, humped, or arching lines when asked for straight lines, you MUST fail them (score between 15 and 45).
        - Scores 70+ require genuine straightness and control.
        - Respond ONLY with a valid JSON object:
        {
          "score": integer (0-100),
          "passed": boolean (true if score >= 70, false otherwise),
          "compliment": "string (1 line of genuine praise)",
          "coreFlaw": "string (primary technique issue, e.g. spikes, waviness)",
          "actionableAdvice": "string (concrete biomechanical drafting advice)",
          "drawingTypeDetected": "string"
        }
        """
        
        do {
            // Zero-dependency native URLSession call to Gemini REST API
            let urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\(self.apiKey)"
            guard let url = URL(string: urlString) else {
                throw URLError(.badURL)
            }
            
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let base64Image = imageData.base64EncodedString()
            let requestBody: [String: Any] = [
                "systemInstruction": [
                    "parts": [["text": systemPrompt]]
                ],
                "contents": [
                    [
                        "parts": [
                            ["text": "Evaluate this student drawing attempt for: \(step.instructionText)"],
                            [
                                "inlineData": [
                                    "mimeType": "image/jpeg",
                                    "data": base64Image
                                ]
                            ]
                        ]
                    ]
                ],
                "generationConfig": [
                    "responseMimeType": "application/json"
                ]
            ]
            
            request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
                let errString = String(data: data, encoding: .utf8) ?? "HTTP error"
                throw NSError(domain: "GeminiAPI", code: (response as? HTTPURLResponse)?.statusCode ?? 500, userInfo: [NSLocalizedDescriptionKey: errString])
            }
            
            guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let candidates = json["candidates"] as? [[String: Any]],
                  let firstCandidate = candidates.first,
                  let content = firstCandidate["content"] as? [String: Any],
                  let parts = content["parts"] as? [[String: Any]],
                  let text = parts.first?["text"] as? String,
                  let textData = text.data(using: .utf8) else {
                throw URLError(.cannotParseResponse)
            }
            
            let decoded = try JSONDecoder().decode(ArtAssessment.self, from: textData)
            self.currentAssessment = decoded
            self.isAnalyzing = false
            
            // Provide haptic feedback on Apple devices
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(decoded.passed ? .success : .warning)
            
        } catch {
            self.errorMessage = "Evaluation error: \(error.localizedDescription)"
            self.isAnalyzing = false
        }
    }
    
    private func calculateAverageStraightness(strokes: [CanvasStroke]) -> Double {
        guard !strokes.isEmpty else { return 0.5 }
        var totalRatio = 0.0
        var count = 0
        
        for stroke in strokes {
            guard stroke.points.count > 2 else { continue }
            let p0 = stroke.points.first!
            let pN = stroke.points.last!
            let euclidean = hypot(pN.x - p0.x, pN.y - p0.y)
            
            var arcLength = 0.0
            for i in 1..<stroke.points.count {
                let prev = stroke.points[i - 1]
                let curr = stroke.points[i]
                arcLength += hypot(curr.x - prev.x, curr.y - prev.y)
            }
            
            if arcLength > 0 {
                totalRatio += min(1.0, euclidean / arcLength)
                count += 1
            }
        }
        
        return count > 0 ? (totalRatio / Double(count)) : 0.5
    }
}
