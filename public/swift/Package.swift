// swift-tools-version: 5.9
// The Package.swift for Swift Playgrounds on iPadOS & iOS — 100% Zero Dependencies
import PackageDescription
import AppleProductTypes

let package = Package(
    name: "DrawCoachAI",
    platforms: [
        .iOS("16.0")
    ],
    products: [
        .iOSApplication(
            name: "DrawCoach AI",
            targets: ["AppModule"],
            bundleIdentifier: "com.free.drawcoach.ai",
            teamIdentifier: "",
            displayVersion: "1.0",
            bundleVersion: "1",
            appIcon: .placeholder(icon: .paintbrush),
            accentColor: .presetColor(.blue),
            supportedDeviceFamilies: [
                .pad,
                .phone
            ],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft,
                .portraitUpsideDown
            ],
            capabilities: [
                .camera(purposeString: "Scan physical paper drawings for AI evaluation and feedback")
            ]
        )
    ],
    dependencies: [
        // Zero external dependencies needed!
        // Uses native Apple Foundation URLSession for direct Gemini REST API calls.
    ],
    targets: [
        .executableTarget(
            name: "AppModule",
            dependencies: [],
            path: "Sources"
        )
    ]
)
