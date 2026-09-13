import SwiftUI

/// ContentView — The default root view created by Swift Playgrounds on iPadOS & Xcode
public struct ContentView: View {
    @State private var selectedLesson: DrawingLesson = CurriculumRepository.sharedLessons[0]
    @State private var showingLessonPicker: Bool = false
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            DrawingLessonView(lesson: selectedLesson)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Menu {
                            ForEach(CurriculumRepository.sharedLessons) { lesson in
                                Button {
                                    selectedLesson = lesson
                                } label: {
                                    HStack {
                                        Text(lesson.title)
                                        if selectedLesson.id == lesson.id {
                                            Image(systemName: "checkmark")
                                        }
                                    }
                                }
                            }
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "book.pages")
                                Text("Lessons")
                                Image(systemName: "chevron.down")
                                    .font(.caption2)
                            }
                            .font(.subheadline)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(10)
                        }
                    }
                }
        }
    }
}

#Preview {
    ContentView()
}
