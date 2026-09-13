import Foundation

// MARK: - Lesson Step Model
public struct LessonStep: Identifiable, Codable, Equatable {
    public let id: Int
    public let title: String
    public let instructionText: String
    public let draftingTip: String
    public let targetGuidePathData: String
    public let referenceSvg: String
    public let aiEvaluationCriteria: String
    
    public init(id: Int, title: String, instructionText: String, draftingTip: String, targetGuidePathData: String, referenceSvg: String, aiEvaluationCriteria: String) {
        self.id = id
        self.title = title
        self.instructionText = instructionText
        self.draftingTip = draftingTip
        self.targetGuidePathData = targetGuidePathData
        self.referenceSvg = referenceSvg
        self.aiEvaluationCriteria = aiEvaluationCriteria
    }
}

// MARK: - Drawing Lesson Model
public struct DrawingLesson: Identifiable, Codable, Equatable {
    public let id: String
    public let title: String
    public let subtitle: String
    public let category: String
    public let levelNumber: Int
    public let estimatedMinutes: Int
    public let steps: [LessonStep]
    
    public init(id: String, title: String, subtitle: String, category: String, levelNumber: Int, estimatedMinutes: Int, steps: [LessonStep]) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.category = category
        self.levelNumber = levelNumber
        self.estimatedMinutes = estimatedMinutes
        self.steps = steps
    }
}

// MARK: - Curriculum Repository
public struct CurriculumRepository {
    public static let sharedLessons: [DrawingLesson] = [
        DrawingLesson(
            id: "1",
            title: "Straight Lines & Muscle Memory",
            subtitle: "Train your shoulder joint to draw confident, straight strokes without ruler",
            category: "Foundations",
            levelNumber: 1,
            estimatedMinutes: 8,
            steps: [
                LessonStep(
                    id: 1,
                    title: "Horizontal Guide Set",
                    instructionText: "Draw 4 horizontal parallel lines across the screen. Lock your wrist and pull steadily from your shoulder joint.",
                    draftingTip: "Do not plant your palm on the screen. Let your hand glide across the glass.",
                    targetGuidePathData: "M 100 120 L 500 120 M 100 200 L 500 200 M 100 280 L 500 280 M 100 360 L 500 360",
                    referenceSvg: "M 100 120 L 500 120 M 100 200 L 500 200 M 100 280 L 500 280 M 100 360 L 500 360",
                    aiEvaluationCriteria: "Verify 4 horizontal parallel lines. Check for straightness, lack of waviness or spikes, consistent parallelism, and confident line weight."
                ),
                LessonStep(
                    id: 2,
                    title: "45-Degree Diagonal Hatching",
                    instructionText: "Fill the target square with evenly spaced 45-degree diagonal lines. Aim for identical spacing.",
                    draftingTip: "Maintain steady stroke speed. Too slow causes wobble; too fast causes curve hooks.",
                    targetGuidePathData: "M 150 150 L 150 350 L 350 350 L 350 150 Z M 160 340 L 340 160 M 180 340 L 340 180 M 200 340 L 340 200",
                    referenceSvg: "M 150 150 L 150 350 L 350 350 L 350 150 Z M 160 340 L 340 160 M 180 340 L 340 180 M 200 340 L 340 200",
                    aiEvaluationCriteria: "Check 45-degree angle consistency, equidistant spacing, and clean line ends without hooking."
                )
            ]
        ),
        DrawingLesson(
            id: "2",
            title: "Circles & Pure Ellipses",
            subtitle: "Master circular momentum, major and minor axes, and smooth closures",
            category: "Foundations",
            levelNumber: 1,
            estimatedMinutes: 10,
            steps: [
                LessonStep(
                    id: 1,
                    title: "Continuous Orbital Circle",
                    instructionText: "Ghost the circular motion in the air 2 times, then touch down and draw a smooth circle with a single confident stroke.",
                    draftingTip: "Speed provides smoothness. Slow drawing creates potato shapes.",
                    targetGuidePathData: "M 300 100 A 150 150 0 1 0 300 400 A 150 150 0 1 0 300 100",
                    referenceSvg: "M 300 100 A 150 150 0 1 0 300 400 A 150 150 0 1 0 300 100",
                    aiEvaluationCriteria: "Evaluate roundness, aspect ratio close to 1:1, smooth closure at meeting point, and lack of flat segments."
                )
            ]
        )
    ]
}
