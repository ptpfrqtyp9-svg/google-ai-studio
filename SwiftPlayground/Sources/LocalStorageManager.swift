import Foundation
import SwiftUI
import Combine

// MARK: - Local Progress Manager
public class LocalStorageManager: ObservableObject {
    public static let shared = LocalStorageManager()
    private let storageKey = "com.free.drawcoach.progress"
    
    @Published public var completedStepKeys: Set<String> = []
    @Published public var lessonScores: [String: Int] = [:]
    
    public init() {
        load()
    }
    
    public func markStepComplete(lessonId: String, stepId: Int, score: Int) {
        let key = "\(lessonId)-\(stepId)"
        completedStepKeys.insert(key)
        
        let previousBest = lessonScores[lessonId] ?? 0
        lessonScores[lessonId] = max(previousBest, score)
        save()
    }
    
    public func isStepCompleted(lessonId: String, stepId: Int) -> Bool {
        return completedStepKeys.contains("\(lessonId)-\(stepId)")
    }
    
    private func save() {
        let payload: [String: Any] = [
            "completed": Array(completedStepKeys),
            "scores": lessonScores
        ]
        UserDefaults.standard.set(payload, forKey: storageKey)
    }
    
    private func load() {
        guard let payload = UserDefaults.standard.dictionary(forKey: storageKey) else { return }
        if let completed = payload["completed"] as? [String] {
            self.completedStepKeys = Set(completed)
        }
        if let scores = payload["scores"] as? [String: Int] {
            self.lessonScores = scores
        }
    }
}
