# DrawCoach AI — Swift Playgrounds & iPadOS App

This folder contains the complete, native Apple Swift source code for **DrawCoach AI**.

## Directory Structure
- `Package.swift` — Swift Package Manager manifest with AppleProductTypes for iPadOS 16+
- `Sources/App.swift` — Application entry point (@main)
- `Sources/CanvasView.swift` — 60-120 FPS CoreGraphics UIKit drawing engine with quadratic Bézier smoothing
- `Sources/AIArtCoachController.swift` — Multimodal AI grading using `GoogleGenerativeAI` with calibrated scoring
- `Sources/LessonModels.swift` — Simply Draw structured curriculum data models
- `Sources/LocalStorageManager.swift` — 100% Free on-device UserDefaults persistence
- `Sources/DrawingLessonView.swift` — SwiftUI main interface and feedback sheet

## How to Run on iPad in Swift Playgrounds
1. Open the **Swift Playgrounds** app on your iPad.
2. Tap the **+ App** button in the lower left corner.
3. Tap **App Settings** (gear icon) -> **Package Dependencies** -> Add `https://github.com/google/generative-ai-swift`.
4. Copy the code from `Sources/` into your app project.
5. Tap **Run** to launch DrawCoach AI natively on your iPad!
