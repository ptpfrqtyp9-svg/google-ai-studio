import SwiftUI

public struct DrawingLessonView: View {
    public let lesson: DrawingLesson
    @State private var currentStepIndex: Int = 0
    @State private var canvasStrokes: [CanvasStroke] = []
    @State private var selectedColor: Color = .black
    @State private var lineWidth: CGFloat = 4.0
    @State private var showFeedbackSheet: Bool = false
    @StateObject private var aiCoach = AIArtCoachController()
    
    private var currentStep: LessonStep {
        lesson.steps[currentStepIndex]
    }
    
    public init(lesson: DrawingLesson) {
        self.lesson = lesson
    }
    
    public var body: some View {
        VStack(spacing: 0) {
            // Header Bar
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Step \(currentStepIndex + 1) of \(lesson.steps.count)")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                    Text(currentStep.title)
                        .font(.headline)
                        .foregroundColor(.primary)
                }
                Spacer()
                
                // Color Picker & Tools
                HStack(spacing: 12) {
                    Button(action: { canvasStrokes.removeAll() }) {
                        Image(systemName: "trash")
                            .foregroundColor(.red)
                    }
                }
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            
            // Instruction Banner
            HStack(spacing: 8) {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(.orange)
                Text(currentStep.instructionText)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color(UIColor.tertiarySystemBackground))
            
            // Canvas Area
            ZStack {
                Color.white
                CustomCanvasViewRepresentable(
                    strokes: $canvasStrokes,
                    currentColor: selectedColor,
                    lineWidth: lineWidth
                )
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Bottom Action Bar
            HStack {
                Text("\(canvasStrokes.count) strokes recorded")
                    .font(.footnote)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button(action: {
                    Task {
                        let renderer = ImageRenderer(content: Text("Snapshot"))
                        let image = renderer.uiImage ?? UIImage()
                        await aiCoach.evaluateDrawing(image: image, step: currentStep, strokes: canvasStrokes)
                        showFeedbackSheet = true
                    }
                }) {
                    if aiCoach.isAnalyzing {
                        ProgressView()
                            .padding(.horizontal, 16)
                    } else {
                        Label("Check My Work", systemImage: "sparkles")
                            .bold()
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(aiCoach.isAnalyzing || canvasStrokes.isEmpty)
            }
            .padding()
            .background(Color(UIColor.systemBackground))
        }
        .sheet(isPresented: $showFeedbackSheet) {
            if let report = aiCoach.currentAssessment {
                AIFeedbackView(assessment: report) {
                    if report.passed && currentStepIndex < lesson.steps.count - 1 {
                        currentStepIndex += 1
                        canvasStrokes.removeAll()
                    }
                    showFeedbackSheet = false
                }
            }
        }
    }
}

// MARK: - AIFeedbackView
public struct AIFeedbackView: View {
    public let assessment: ArtAssessment
    public let onContinue: () -> Void
    
    public var body: some View {
        VStack(spacing: 18) {
            Text(assessment.passed ? "Exercise Mastered!" : "Keep Practicing")
                .font(.title)
                .bold()
                .foregroundColor(assessment.passed ? .green : .orange)
            
            Text("Score: \(assessment.score) / 100")
                .font(.title2)
                .bold()
            
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "hand.thumbsup.fill")
                        .foregroundColor(.green)
                    Text(assessment.compliment)
                        .font(.body)
                }
                
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                    Text(assessment.coreFlaw)
                        .font(.body)
                }
                
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "lightbulb.fill")
                        .foregroundColor(.blue)
                    Text(assessment.actionableAdvice)
                        .font(.body)
                        .bold()
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color(UIColor.secondarySystemBackground)))
            
            Button(action: onContinue) {
                Text(assessment.passed ? "Next Step" : "Try Again")
                    .bold()
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(assessment.passed ? Color.green : Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .padding(.top, 10)
        }
        .padding()
    }
}
