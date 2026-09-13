import { DrawingLesson } from '../types';

export const CURRICULUM_LESSONS: DrawingLesson[] = [
  {
    id: 1,
    title: 'Straight Lines & Parallel Spacing',
    subtitle: 'Build line confidence, eliminate wobble, and master shoulder pivot',
    category: 'Foundations',
    levelNumber: 1,
    estimatedMinutes: 5,
    steps: [
      {
        id: 1,
        title: 'Horizontal Guide Set',
        instructionText: 'Draw 4 horizontal parallel lines across the screen. Lock your wrist and pull steadily from your shoulder joint.',
        referenceSvg: 'M 60 120 L 540 120 M 60 200 L 540 200 M 60 280 L 540 280 M 60 360 L 540 360',
        targetGuidePathData: 'M 60 120 L 540 120 M 60 200 L 540 200 M 60 280 L 540 280 M 60 360 L 540 360',
        aiEvaluationCriteria: 'Verify parallel orientation, uniform distance (~80px apart), minimal line curvature, and consistent stroke speed without hesitation.',
        draftingTip: 'Ghost the line 2-3 times hovering above the canvas before touching down with your stylus or pencil.'
      },
      {
        id: 2,
        title: '45° Diagonal Hatching',
        instructionText: 'Draw a set of 5 crisp 45-degree diagonal strokes. Keep spacing uniform and prevent lines from tapering erratically at the ends.',
        referenceSvg: 'M 100 380 L 260 140 M 160 380 L 320 140 M 220 380 L 380 140 M 280 380 L 440 140 M 340 380 L 500 140',
        targetGuidePathData: 'M 100 380 L 260 140 M 160 380 L 320 140 M 220 380 L 380 140 M 280 380 L 440 140 M 340 380 L 500 140',
        aiEvaluationCriteria: 'Evaluate stroke parallelism at approximately 45 degrees, consistent stroke lengths, and clean lift-offs.',
        draftingTip: 'Keep your gaze focused on the target destination point rather than staring at the tip of your pen.'
      }
    ]
  },
  {
    id: 2,
    title: 'Circles & Smooth Ellipses',
    subtitle: 'Rotate through the shoulder to construct symmetrical rounded volumes',
    category: 'Foundations',
    levelNumber: 1,
    estimatedMinutes: 6,
    steps: [
      {
        id: 1,
        title: 'Perfect Circle Rehearsal',
        instructionText: 'Trace the central circle in a single continuous fluid motion. Do not chicken-scratch or stop halfway.',
        referenceSvg: 'M 300 100 A 150 150 0 1 1 299.9 100',
        targetGuidePathData: 'M 300 100 A 150 150 0 1 1 299.9 100',
        aiEvaluationCriteria: 'Check circular eccentricity (aspect ratio close to 1:1), continuous closed line without gap, and absence of flat sides.',
        draftingTip: 'Make circular hovering motions in the air for momentum, then drop the pencil gently to complete 1.5 rotations.'
      },
      {
        id: 2,
        title: 'Perspective Ellipse Degree',
        instructionText: 'Draw a tilted horizontal ellipse representing a disc viewed in perspective. Keep the major and minor axes symmetrical.',
        referenceSvg: 'M 300 150 A 200 85 0 1 1 299.9 150',
        targetGuidePathData: 'M 300 150 A 200 85 0 1 1 299.9 150',
        aiEvaluationCriteria: 'Assess curvature smoothness at the outer tips (no pointy football corners) and balanced top-to-bottom symmetry.',
        draftingTip: 'Ellipses viewed in perspective must have rounded curved ends, never pinched sharp vertices.'
      }
    ]
  },
  {
    id: 3,
    title: 'Curves & Continuous Contours',
    subtitle: 'Train flow, S-curves, and graceful line weight transition',
    category: 'Foundations',
    levelNumber: 1,
    estimatedMinutes: 5,
    steps: [
      {
        id: 1,
        title: 'The Harmonic S-Curve',
        instructionText: 'Trace the flowing S-curve from top to bottom. Allow your pressure to increase slightly through the convex apex.',
        referenceSvg: 'M 160 80 C 440 120 420 280 300 300 C 180 320 160 460 440 480',
        targetGuidePathData: 'M 160 80 C 440 120 420 280 300 300 C 180 320 160 460 440 480',
        aiEvaluationCriteria: 'Examine path smoothness, absence of abrupt sharp kinks, natural inflection at the midpoint, and fluid velocity.',
        draftingTip: 'Release grip tension. A lighter grip allows your arm to sweep smoothly across the entire digital screen or paper.'
      }
    ]
  },
  {
    id: 4,
    title: '3D Cubes & Vanishing Points',
    subtitle: 'Construct believable volumetric depth with linear perspective',
    category: 'Form & Perspective',
    levelNumber: 2,
    estimatedMinutes: 8,
    steps: [
      {
        id: 1,
        title: 'Front Plane Setup',
        instructionText: 'Draw the square front facing plane of the cube with four clean 90° corners.',
        referenceSvg: 'M 140 160 L 320 160 L 320 340 L 140 340 Z',
        targetGuidePathData: 'M 140 160 L 320 160 L 320 340 L 140 340 Z',
        aiEvaluationCriteria: 'Check square aspect ratio, horizontal and vertical alignment, and clean corner intersections.',
        draftingTip: 'Make sure your vertical lines stay truly perpendicular to the horizon.'
      },
      {
        id: 2,
        title: 'Perspective Depth & Back Plane',
        instructionText: 'Project the receding lines upward and to the right at 30 degrees, then cap with the top and side parallel edges.',
        referenceSvg: 'M 140 160 L 320 160 L 320 340 L 140 340 Z M 140 160 L 240 80 L 420 80 L 320 160 M 420 80 L 420 260 L 320 340',
        targetGuidePathData: 'M 140 160 L 320 160 L 320 340 L 140 340 Z M 140 160 L 240 80 L 420 80 L 320 160 M 420 80 L 420 260 L 320 340',
        aiEvaluationCriteria: 'Verify parallel vanishing angle of all receding lines (~30° to 45°), correct volumetric enclosure, and clean edges.',
        draftingTip: 'All receding parallel lines should slightly converge or remain parallel, never diverge outward.'
      }
    ]
  },
  {
    id: 5,
    title: 'Cylinders & Rounded Volumes',
    subtitle: 'Combine ellipses and straight contour edges into 3D forms',
    category: 'Form & Perspective',
    levelNumber: 2,
    estimatedMinutes: 7,
    steps: [
      {
        id: 1,
        title: 'Top Ellipse & Vertical Walls',
        instructionText: 'Draw the open top ellipse, followed by two parallel vertical bounding walls extending downward.',
        referenceSvg: 'M 300 120 A 120 45 0 1 1 299.9 120 M 180 120 L 180 380 M 420 120 L 420 380',
        targetGuidePathData: 'M 300 120 A 120 45 0 1 1 299.9 120 M 180 120 L 180 380 M 420 120 L 420 380',
        aiEvaluationCriteria: 'Check top ellipse symmetry, vertical plumb alignment of both side walls, and tangent intersections.',
        draftingTip: 'The side lines must touch the exact widest points (extrema) of the top ellipse.'
      },
      {
        id: 2,
        title: 'Base Curve Closure',
        instructionText: 'Connect the bottom with an ellipse arc that curves downward MORE deeply than the top ellipse.',
        referenceSvg: 'M 300 120 A 120 45 0 1 1 299.9 120 M 180 120 L 180 380 M 420 120 L 420 380 M 180 380 A 120 60 0 0 0 420 380',
        targetGuidePathData: 'M 300 120 A 120 45 0 1 1 299.9 120 M 180 120 L 180 380 M 420 120 L 420 380 M 180 380 A 120 60 0 0 0 420 380',
        aiEvaluationCriteria: 'Inspect bottom arc curvature: it must have a fuller curvature than the top ellipse to account for eye level perspective.',
        draftingTip: 'As forms move further below eye level, their cross-section ellipses appear rounder.'
      }
    ]
  },
  {
    id: 6,
    title: 'Spheres, Light Source, & Basic Shading',
    subtitle: 'Render light, terminator line, core shadow, and reflected light',
    category: 'Form & Perspective',
    levelNumber: 2,
    estimatedMinutes: 9,
    steps: [
      {
        id: 1,
        title: 'Circle & Crescent Core Shadow',
        instructionText: 'With light coming from top-left, draw the outer sphere and trace the curved crescent terminator line of shadow.',
        referenceSvg: 'M 300 100 A 140 140 0 1 1 299.9 100 M 360 120 C 270 200 280 320 360 370',
        targetGuidePathData: 'M 300 100 A 140 140 0 1 1 299.9 100 M 360 120 C 270 200 280 320 360 370',
        aiEvaluationCriteria: 'Verify sphere roundness, correct placement of the crescent core shadow facing opposite the light source.',
        draftingTip: 'The shadow edge on a sphere curves smoothly around the sphere like a longitude line on a globe.'
      },
      {
        id: 2,
        title: 'Cast Shadow Projection',
        instructionText: 'Add the horizontal flat ellipse shadow cast on the table surface to ground the sphere firmly in space.',
        referenceSvg: 'M 300 100 A 140 140 0 1 1 299.9 100 M 360 120 C 270 200 280 320 360 370 M 270 375 A 150 40 0 0 0 540 385',
        targetGuidePathData: 'M 300 100 A 140 140 0 1 1 299.9 100 M 360 120 C 270 200 280 320 360 370 M 270 375 A 150 40 0 0 0 540 385',
        aiEvaluationCriteria: 'Assess grounding cast shadow, horizontal ellipse orientation, and darkest occlusion zone beneath the sphere.',
        draftingTip: 'The cast shadow is darkest right where the sphere touches the ground (ambient occlusion).'
      }
    ]
  },
  {
    id: 7,
    title: 'Constructive Animal Sketching',
    subtitle: 'Deconstruct living creatures into foundational geometric volumes',
    category: 'Applied Drawing',
    levelNumber: 3,
    estimatedMinutes: 10,
    steps: [
      {
        id: 1,
        title: 'Ribcage, Pelvis, & Cranium Masses',
        instructionText: 'Block in the 3 main masses of the cat: cranium circle, oval ribcage, and tilted rear pelvis.',
        referenceSvg: 'M 180 180 A 55 55 0 1 1 179.9 180 M 280 230 A 75 55 15 1 1 279.9 230 M 410 240 A 60 55 0 1 1 409.9 240',
        targetGuidePathData: 'M 180 180 A 55 55 0 1 1 179.9 180 M 280 230 A 75 55 15 1 1 279.9 230 M 410 240 A 60 55 0 1 1 409.9 240',
        aiEvaluationCriteria: 'Analyze relative proportion between the three volumes, anatomical spacing, and baseline tilt.',
        draftingTip: 'Never draw outer details like fur or whiskers before establishing the solid volumetric bone masses.'
      },
      {
        id: 2,
        title: 'Spine, Legs, & Ear Contours',
        instructionText: 'Connect the masses with a sweeping spine curve, add triangle ears, and block in the front and back paw pillars.',
        referenceSvg: 'M 180 180 A 55 55 0 1 1 179.9 180 M 280 230 A 75 55 15 1 1 279.9 230 M 410 240 A 60 55 0 1 1 409.9 240 M 140 145 L 160 120 L 175 145 M 195 145 L 210 120 L 225 145 M 180 135 C 240 160 340 170 410 190 M 240 280 L 230 380 M 280 280 L 270 380 M 400 290 L 390 380 M 440 290 L 430 380 M 440 210 C 490 230 500 310 470 340',
        targetGuidePathData: 'M 180 180 A 55 55 0 1 1 179.9 180 M 280 230 A 75 55 15 1 1 279.9 230 M 410 240 A 60 55 0 1 1 409.9 240 M 140 145 L 160 120 L 175 145 M 195 145 L 210 120 L 225 145 M 180 135 C 240 160 340 170 410 190 M 240 280 L 230 380 M 280 280 L 270 380 M 400 290 L 390 380 M 440 290 L 430 380 M 440 210 C 490 230 500 310 470 340',
        aiEvaluationCriteria: 'Assess gesture line flow along the spine, balanced leg angles, and recognizability of the animal anatomy.',
        draftingTip: 'Think of the legs as cylinders supporting real mechanical weight on the ground plane.'
      }
    ]
  },
  {
    id: 8,
    title: 'Human Face Proportions & Alignment',
    subtitle: 'Master the classic Loomis thirds and facial feature landmarks',
    category: 'Applied Drawing',
    levelNumber: 3,
    estimatedMinutes: 12,
    steps: [
      {
        id: 1,
        title: 'Cranial Ball & Proportional Thirds',
        instructionText: 'Draw the head oval and divide with a vertical centerline and horizontal brow, nose, and chin lines.',
        referenceSvg: 'M 300 120 A 110 150 0 1 1 299.9 120 M 300 70 L 300 420 M 200 210 L 400 210 M 220 280 L 380 280 M 240 350 L 360 350',
        targetGuidePathData: 'M 300 120 A 110 150 0 1 1 299.9 120 M 300 70 L 300 420 M 200 210 L 400 210 M 220 280 L 380 280 M 240 350 L 360 350',
        aiEvaluationCriteria: 'Check head symmetry, equal vertical thirds (hairline to brow, brow to nose base, nose base to chin).',
        draftingTip: 'The distance between the eyes is roughly equal to the width of one single eye.'
      },
      {
        id: 2,
        title: 'Feature Landmarks Placement',
        instructionText: 'Sketch in the almond eye outlines on the mid-line, nose wedge on the second third, and lips midway to chin.',
        referenceSvg: 'M 300 120 A 110 150 0 1 1 299.9 120 M 300 70 L 300 420 M 200 210 L 400 210 M 220 280 L 380 280 M 240 350 L 360 350 M 240 230 Q 260 215 280 230 Q 260 245 240 230 M 320 230 Q 340 215 360 230 Q 340 245 320 230 M 295 270 L 305 270 L 300 280 Z M 275 325 Q 300 320 325 325 Q 300 340 275 325',
        targetGuidePathData: 'M 300 120 A 110 150 0 1 1 299.9 120 M 300 70 L 300 420 M 200 210 L 400 210 M 220 280 L 380 280 M 240 350 L 360 350 M 240 230 Q 260 215 280 230 Q 260 245 240 230 M 320 230 Q 340 215 360 230 Q 340 245 320 230 M 295 270 L 305 270 L 300 280 Z M 275 325 Q 300 320 325 325 Q 300 340 275 325',
        aiEvaluationCriteria: 'Assess eye level alignment, nose keel length, lip placement, and facial structural balance.',
        draftingTip: 'Keep features soft and simplified in initial construction; portrait likeness depends on placement first, detail second.'
      }
    ]
  }
];
