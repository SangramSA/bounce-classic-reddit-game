# User Controls & Input System

## Overview

This document describes the comprehensive user controls and input system implemented for Bounce Original, including aiming mechanisms, platform controls, mobile optimization, and accessibility features.

## Control Architecture

### useControls Hook
The `useControls` hook manages all input types and provides a unified interface for:
- Mouse controls (aiming and platform movement)
- Touch controls (mobile-optimized)
- Keyboard controls (accessibility)
- Input detection and device adaptation

## Aiming Mechanism (AIMING State)

### Visual Aim Indicator
- **Aim Line**: Green line showing current aim direction
- **Arrow Head**: Visual indicator at the end of the aim line
- **Trajectory Preview**: Dotted line showing predicted ball path
- **Power Meter**: Visual power gauge with color coding
- **Angle Display**: Real-time angle and power feedback

### Drag Controls
- **Angle Range**: 0-180 degrees from horizontal
- **Power Range**: 0-100% based on drag distance
- **Start Position**: Ball's current position
- **End Position**: Mouse/touch position
- **Release to Launch**: Natural drag-and-release interaction

### Trajectory Calculation
```typescript
const calculateTrajectoryPoints = (
  startX: number,
  startY: number,
  angle: number,
  power: number,
  config: GameConfig,
  steps: number = 20
): BallPosition[]
```

The trajectory preview shows up to 20 points along the predicted path, accounting for gravity and physics.

## Platform Controls (PLAYING State)

### Keyboard Controls
- **Arrow Keys**: Left/Right movement
- **A/D Keys**: Alternative left/right movement
- **Spacebar**: Pause/Resume game
- **Smooth Movement**: 60fps platform updates
- **Boundary Respect**: Platform cannot move beyond screen edges

### Touch Controls (Mobile)
- **Left Side Touch**: Move platform left
- **Right Side Touch**: Move platform right
- **Center Touch**: Direct platform control
- **Touch Zones**: 80px minimum touch targets
- **Deadzone Prevention**: Prevents accidental touches

### Mouse Controls
- **Mouse Position**: Direct platform X-coordinate control
- **Click Zones**: Left/right of platform for movement
- **Smooth Tracking**: Follows mouse movement precisely

## Control Responsiveness

### Smooth Platform Movement
- **60fps Updates**: Consistent frame rate for smooth movement
- **Interpolation**: Smooth transitions between positions
- **No Jitter**: Stable movement without stuttering

### Boundary Management
- **Buffer Zone**: 10px buffer at screen edges
- **Clamping**: Platform position always within bounds
- **Visual Feedback**: Platform stops at boundaries

### Control Deadzone
- **Touch Accuracy**: 50px minimum touch target size
- **Precision Zones**: Separate areas for different actions
- **Accidental Touch Prevention**: Deadzone around critical areas

## Mobile Optimization

### Touch Device Detection
```typescript
const checkTouchDevice = () => {
  setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
};
```

### Touch-Specific Features
- **Larger Touch Targets**: Minimum 50px touch zones
- **Touch Zone Indicators**: Visual feedback for touch areas
- **Prevent Default**: Blocks conflicting touch behaviors
- **Orientation Support**: Works in landscape and portrait

### Touch Zone Layout
- **Left Zone**: Red indicator for left movement
- **Right Zone**: Green indicator for right movement  
- **Center Zone**: Blue indicator for direct control
- **Zone Size**: 80px × 80px for easy targeting

## Accessibility Features

### Keyboard-Only Playability
- **Full Control**: Complete game control via keyboard
- **Arrow Keys**: Primary movement control
- **Spacebar**: Pause/resume functionality
- **Visual Feedback**: Clear indication of keyboard input

### Visual Feedback
- **Input Type Display**: Shows current input method
- **Control Status**: Indicates active controls
- **Clear Instructions**: Step-by-step control guidance
- **High Contrast**: Clear visual indicators

### Accessibility Standards
- **WCAG Compliance**: Follows accessibility guidelines
- **Screen Reader Support**: Semantic HTML structure
- **Keyboard Navigation**: Tab-accessible interface
- **Focus Management**: Clear focus indicators

## Input State Management

### ControlState Interface
```typescript
type ControlState = {
  inputType: 'mouse' | 'touch' | 'keyboard';
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  currentX: number;
  currentY: number;
  platformTargetX: number;
  keyboardLeft: boolean;
  keyboardRight: boolean;
};
```

### State Transitions
- **Input Detection**: Automatically detects input type
- **State Updates**: Real-time control state updates
- **Cross-Input Support**: Seamless switching between input types
- **State Persistence**: Maintains control state across game states

## Performance Optimizations

### Event Handling
- **Debounced Events**: Prevents excessive event firing
- **Efficient Listeners**: Optimized event listener management
- **Memory Management**: Proper cleanup of event listeners
- **Frame Rate Control**: Consistent 60fps performance

### Input Processing
- **Batch Updates**: Groups related input updates
- **Efficient Calculations**: Optimized trajectory calculations
- **Minimal Re-renders**: Reduces unnecessary component updates
- **Smooth Animations**: Consistent visual feedback

## Visual Enhancements

### Aiming Interface
- **Dynamic Colors**: Power meter changes color based on power level
- **Smooth Animations**: Fluid aim line updates
- **Trajectory Dots**: Clear trajectory preview
- **Angle Indicators**: Real-time angle and power display

### Control Feedback
- **Touch Zones**: Visual touch area indicators
- **Input Status**: Current input method display
- **Control Hints**: Context-sensitive instructions
- **Visual Cues**: Clear feedback for all interactions

## Error Handling

### Input Validation
- **Bounds Checking**: Ensures all inputs are within valid ranges
- **Type Safety**: TypeScript validation for all inputs
- **Fallback Values**: Default values for invalid inputs
- **Error Recovery**: Graceful handling of input errors

### Edge Cases
- **Rapid Input**: Handles rapid successive inputs
- **Simultaneous Inputs**: Manages multiple input types
- **Device Switching**: Adapts to input device changes
- **Focus Loss**: Handles window focus changes

## Testing and Validation

### Control Testing
- **Mouse Controls**: Tested across different mouse types
- **Touch Controls**: Validated on various touch devices
- **Keyboard Controls**: Tested with different keyboard layouts
- **Cross-Platform**: Verified on multiple platforms

### Responsiveness Testing
- **Frame Rate**: Consistent 60fps performance
- **Latency**: Low input-to-visual latency
- **Accuracy**: Precise control response
- **Stability**: Reliable performance across sessions

This comprehensive control system provides an intuitive, accessible, and responsive gaming experience across all input methods and devices.
