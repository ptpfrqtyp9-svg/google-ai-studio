import UIKit
import SwiftUI

// MARK: - Touch Point Data Model
public struct TouchPoint: Codable, Equatable {
    public let x: CGFloat
    public let y: CGFloat
    public let force: CGFloat
    public let timestamp: TimeInterval
    
    public var cgPoint: CGPoint { CGPoint(x: x, y: y) }
    
    public init(x: CGFloat, y: CGFloat, force: CGFloat = 1.0, timestamp: TimeInterval = Date().timeIntervalSinceReferenceDate) {
        self.x = x
        self.y = y
        self.force = force
        self.timestamp = timestamp
    }
}

// MARK: - Canvas Stroke Data Model
public struct CanvasStroke: Codable, Identifiable, Equatable {
    public let id: UUID
    public var points: [TouchPoint]
    public var colorHex: String
    public var baseLineWidth: CGFloat
    
    public init(id: UUID = UUID(), points: [TouchPoint] = [], colorHex: String = "#000000", baseLineWidth: CGFloat = 4.0) {
        self.id = id
        self.points = points
        self.colorHex = colorHex
        self.baseLineWidth = baseLineWidth
    }
}

// MARK: - High-Performance Canvas View (60 - 120 FPS Apple Pencil)
public class CanvasView: UIView {
    public var strokes: [CanvasStroke] = [] {
        didSet {
            redrawAllStrokes()
        }
    }
    
    public var onStrokeCompleted: ((CanvasStroke) -> Void)?
    public var currentColor: UIColor = .black
    public var currentLineWidth: CGFloat = 4.0
    
    // Backing bitmap image cache for completed strokes (preserves memory & avoids redraw lag)
    private var cachedImage: UIImage?
    private var activeStrokePoints: [TouchPoint] = []
    
    public override init(frame: CGRect) {
        super.init(frame: frame)
        setupCanvas()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupCanvas()
    }
    
    private func setupCanvas() {
        backgroundColor = .white
        isMultipleTouchEnabled = false
        contentMode = .scaleToFill
    }
    
    // MARK: - Touch Pipeline with Coalesced Samples
    public override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: self)
        let force = touch.maximumPossibleForce > 0 ? (touch.force / touch.maximumPossibleForce) : 1.0
        
        activeStrokePoints = [TouchPoint(x: location.x, y: location.y, force: max(0.2, force))]
        setNeedsDisplay()
    }
    
    public override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        
        // Extract high-frequency coalesced touches between frame renders
        if let coalesced = event?.coalescedTouches(for: touch) {
            for t in coalesced {
                let loc = t.location(in: self)
                let f = t.maximumPossibleForce > 0 ? (t.force / t.maximumPossibleForce) : 1.0
                activeStrokePoints.append(TouchPoint(x: loc.x, y: loc.y, force: max(0.2, f)))
            }
        } else {
            let loc = touch.location(in: self)
            let f = touch.maximumPossibleForce > 0 ? (touch.force / touch.maximumPossibleForce) : 1.0
            activeStrokePoints.append(TouchPoint(x: loc.x, y: loc.y, force: max(0.2, f)))
        }
        
        setNeedsDisplay()
    }
    
    public override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        finishActiveStroke()
    }
    
    public override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        finishActiveStroke()
    }
    
    private func finishActiveStroke() {
        guard activeStrokePoints.count > 1 else {
            activeStrokePoints.removeAll()
            return
        }
        
        let hex = currentColor.toHexString()
        let newStroke = CanvasStroke(points: activeStrokePoints, colorHex: hex, baseLineWidth: currentLineWidth)
        strokes.append(newStroke)
        activeStrokePoints.removeAll()
        
        // Flatten stroke into backing image cache
        flattenActiveStrokeToCache(newStroke)
        onStrokeCompleted?(newStroke)
        setNeedsDisplay()
    }
    
    // MARK: - Midpoint Quadratic Bézier Smoothing Algorithm
    public override func draw(_ rect: CGRect) {
        guard let context = UIGraphicsGetCurrentContext() else { return }
        
        // 1. Draw cached completed bitmap
        cachedImage?.draw(in: bounds)
        
        // 2. Draw live active stroke on top
        if activeStrokePoints.count > 1 {
            drawSmoothedStroke(points: activeStrokePoints, color: currentColor, baseWidth: currentLineWidth, in: context)
        }
    }
    
    private func drawSmoothedStroke(points: [TouchPoint], color: UIColor, baseWidth: CGFloat, in context: CGContext) {
        guard points.count > 1 else { return }
        
        context.setStrokeColor(color.cgColor)
        context.setLineCap(.round)
        context.setLineJoin(.round)
        
        let path = UIBezierPath()
        path.move(to: points[0].cgPoint)
        
        if points.count == 2 {
            path.addLine(to: points[1].cgPoint)
            path.lineWidth = baseWidth * points[1].force
            path.stroke()
            return
        }
        
        // Quadratic Bézier curve interpolation via midpoints: M_i = (P_{i-1} + P_i) / 2
        for i in 1..<points.count - 1 {
            let p0 = points[i].cgPoint
            let p1 = points[i + 1].cgPoint
            let midPoint = CGPoint(x: (p0.x + p1.x) / 2.0, y: (p0.y + p1.y) / 2.0)
            
            path.addQuadCurve(to: midPoint, controlPoint: p0)
        }
        
        if let last = points.last {
            path.addLine(to: last.cgPoint)
        }
        
        let avgForce = points.reduce(0.0) { $0 + $1.force } / CGFloat(points.count)
        path.lineWidth = max(1.5, baseWidth * avgForce)
        path.stroke()
    }
    
    private func flattenActiveStrokeToCache(_ stroke: CanvasStroke) {
        guard bounds.width > 0 && bounds.height > 0 else { return }
        let renderer = UIGraphicsImageRenderer(size: bounds.size)
        cachedImage = renderer.image { ctx in
            cachedImage?.draw(in: bounds)
            let color = UIColor(hex: stroke.colorHex) ?? .black
            drawSmoothedStroke(points: stroke.points, color: color, baseWidth: stroke.baseLineWidth, in: ctx.cgContext)
        }
    }
    
    private func redrawAllStrokes() {
        guard bounds.width > 0 && bounds.height > 0 else { return }
        let renderer = UIGraphicsImageRenderer(size: bounds.size)
        cachedImage = renderer.image { ctx in
            UIColor.white.setFill()
            ctx.fill(bounds)
            for stroke in strokes {
                let color = UIColor(hex: stroke.colorHex) ?? .black
                drawSmoothedStroke(points: stroke.points, color: color, baseWidth: stroke.baseLineWidth, in: ctx.cgContext)
            }
        }
        setNeedsDisplay()
    }
    
    public func clear() {
        strokes.removeAll()
        activeStrokePoints.removeAll()
        cachedImage = nil
        setNeedsDisplay()
    }
    
    public func exportAsImage() -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: bounds.size)
        return renderer.image { ctx in
            UIColor.white.setFill()
            ctx.fill(bounds)
            cachedImage?.draw(in: bounds)
        }
    }
}

// MARK: - SwiftUI Bridge: CustomCanvasViewRepresentable
public struct CustomCanvasViewRepresentable: UIViewRepresentable {
    @Binding public var strokes: [CanvasStroke]
    public var currentColor: Color
    public var lineWidth: CGFloat
    
    public func makeUIView(context: Context) -> CanvasView {
        let view = CanvasView()
        view.currentColor = UIColor(currentColor)
        view.currentLineWidth = lineWidth
        view.onStrokeCompleted = { newStroke in
            DispatchQueue.main.async {
                self.strokes.append(newStroke)
            }
        }
        return view
    }
    
    public func updateUIView(_ uiView: CanvasView, context: Context) {
        uiView.currentColor = UIColor(currentColor)
        uiView.currentLineWidth = lineWidth
        if uiView.strokes.count != strokes.count {
            uiView.strokes = strokes
        }
    }
}

// MARK: - Hex Color Extensions
extension UIColor {
    convenience init?(hex: String) {
        var cString: String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        if cString.hasPrefix("#") { cString.remove(at: cString.startIndex) }
        guard cString.count == 6 else { return nil }
        
        var rgbValue: UInt64 = 0
        Scanner(string: cString).scanHexInt64(&rgbValue)
        
        self.init(
            red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
            green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
            blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
            alpha: 1.0
        )
    }
    
    func toHexString() -> String {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        getRed(&r, green: &g, blue: &b, alpha: &a)
        return String(format: "#%02X%02X%02X", Int(r * 255), Int(g * 255), Int(b * 255))
    }
}
