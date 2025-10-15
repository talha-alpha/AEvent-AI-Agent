# AI Agent Web Application - Design Guidelines

## Design Approach

**Selected Approach:** Design System + Reference Hybrid
- **Primary System:** Linear Design System (clean, focused productivity)
- **Secondary References:** Loom (video UI), Zoom (communication controls), Cursor AI (AI interaction patterns)
- **Justification:** This is a utility-focused application requiring clarity, efficient information display, and sophisticated real-time interaction controls. The design must prioritize functionality while maintaining modern aesthetics.

## Core Design Principles

1. **Clarity First:** Every UI element serves a clear purpose in the AI interaction workflow
2. **Real-time Feedback:** Visual indicators for active audio, video, and AI processing states
3. **Minimal Cognitive Load:** Streamlined interface that doesn't distract from the AI conversation
4. **Professional Precision:** Clean, modern aesthetic suitable for business and professional use

## Color Palette

### Light Mode
- **Background Primary:** 0 0% 100% (pure white)
- **Background Secondary:** 240 5% 96% (subtle gray)
- **Background Tertiary:** 240 5% 92% (card backgrounds)
- **Primary Brand:** 250 95% 60% (vibrant purple for key actions)
- **Primary Hover:** 250 95% 55%
- **Text Primary:** 240 10% 10% (near black)
- **Text Secondary:** 240 5% 45% (muted gray)
- **Border:** 240 6% 90% (subtle divisions)
- **Success (Active):** 142 76% 45% (green for active states)
- **Warning (Recording):** 25 95% 53% (red for recording indicators)

### Dark Mode
- **Background Primary:** 240 10% 8% (deep charcoal)
- **Background Secondary:** 240 8% 12% (elevated surfaces)
- **Background Tertiary:** 240 8% 16% (card backgrounds)
- **Primary Brand:** 250 95% 65% (vibrant purple)
- **Primary Hover:** 250 95% 70%
- **Text Primary:** 0 0% 95% (near white)
- **Text Secondary:** 240 5% 65% (muted light gray)
- **Border:** 240 8% 20% (subtle divisions)
- **Success (Active):** 142 76% 50% (green for active states)
- **Warning (Recording):** 25 95% 58% (red for recording indicators)

## Typography

**Font Stack:** Inter (via Google Fonts CDN) for all text

**Hierarchy:**
- **Hero/Main Title:** 600 weight, 2.5rem (40px), -0.02em tracking
- **Section Headers:** 600 weight, 1.75rem (28px), -0.01em tracking
- **UI Labels:** 500 weight, 0.875rem (14px), normal tracking
- **Body Text:** 400 weight, 1rem (16px), normal tracking, 1.6 line-height
- **Agent Messages:** 400 weight, 1.125rem (18px), 1.7 line-height
- **Timestamps/Meta:** 400 weight, 0.8125rem (13px), text-secondary color

## Layout System

**Spacing Primitives:** Tailwind units of 2, 3, 4, 6, 8, 12, 16, 24
- Micro spacing: p-2, gap-2 (8px)
- Component padding: p-4, p-6 (16px, 24px)
- Section spacing: p-8, p-12 (32px, 48px)
- Major gaps: gap-16, gap-24 (64px, 96px)

**Grid Structure:**
- Main container: max-w-7xl mx-auto
- Communication panel: 2-column split (video feed 60% / controls 40% on desktop)
- Chat messages: max-w-4xl for optimal readability
- Mobile: Single column stack with priority to active interaction area

## Component Library

### A. Main Interface Layout

**Split-Screen Design:**
- **Left Panel (Primary):** AI agent video/avatar display with status indicators
- **Right Panel (Secondary):** Chat transcript, controls, and input options
- **Bottom Bar:** Persistent control strip for audio/video/screenshare toggle

**Video Display Area:**
- 16:9 aspect ratio container with rounded-lg borders
- Floating status pills (top-right): "Agent Listening", "Agent Thinking", "Agent Speaking"
- Subtle gradient overlay at bottom for controls visibility
- Participant indicators when screen sharing or video active

### B. Chat Interface

**Message Display:**
- User messages: Right-aligned, background-tertiary, rounded-2xl, max 75% width
- Agent messages: Left-aligned, background-secondary with primary brand subtle accent, rounded-2xl, max 80% width
- Typing indicators: Animated dots in agent message style
- Timestamps: Above each message cluster, text-secondary, text-xs

**Message Composition Area:**
- Multi-input tab system: Text | Voice | Image | Screen
- Active tab indicator with primary brand color underline (h-0.5 border)
- Text input: Minimal border, focus:ring-2 ring-primary
- File upload zone: Dashed border, hover state with background-secondary
- Send button: Primary brand, circular, positioned bottom-right of input

### C. Control Bar (Bottom Persistent)

**Layout:** Centered controls with equal spacing (gap-6)

**Controls (Left to Right):**
1. **Microphone Toggle:** Circular button, success color when active, muted when off, with waveform animation when speaking
2. **Video Toggle:** Circular button, primary color when active, muted when off
3. **Screen Share:** Circular button, warning color when active
4. **Settings:** Circular button, ghost style, opens modal
5. **End Session:** Rectangular pill button, destructive red color

**Visual Treatment:**
- All circular controls: 48px diameter, shadow-md
- Active state: Filled background with white icon
- Inactive state: Ghost style with border-2
- Hover: Scale 1.05 transform

### D. Status Indicators

**Agent State Pills:**
- Positioned: Floating top-right of video area
- Style: Semi-transparent background (backdrop-blur-md), rounded-full, px-4 py-2
- Colors: 
  - Listening: Success green with pulse animation
  - Thinking: Primary purple with subtle shimmer
  - Speaking: Primary purple with audio wave animation

**Connection Quality:**
- Top-left corner: Small pill showing latency/connection strength
- Green: <100ms, Yellow: 100-300ms, Red: >300ms
- Icon + text format

### E. Modal Overlays

**Settings Modal:**
- Centered overlay: max-w-2xl, rounded-xl, shadow-2xl
- Sections: Audio Settings | Video Settings | Agent Configuration | Data Sources
- Toggle switches: Primary brand color
- Dropdown selects: Minimal style with border focus states
- Close button: Ghost style, top-right

**Data Integration Panel:**
- Slide-in from right: w-96, full-height
- API endpoint list with status badges
- Add/Edit controls with inline forms
- Connected services: Card grid with service icons

## Images

**Hero Section:** 
Use a modern, abstract illustration or 3D render showing AI/human interaction
- Placement: Landing page hero, left side (40% width)
- Style: Gradient-based tech illustration with purple/blue tones
- Alt approach: Animated Lottie showing voice waveforms and AI processing

**Dashboard Empty State:**
When no active session, display centered illustration
- Subject: Friendly AI assistant visual waiting to start
- Style: Clean, simple line art with primary brand color accents
- Size: 300px width, centered in video panel

**Authentication Pages:**
No large hero image - focus on clean, minimal login/signup forms with subtle brand gradient background

## Animations

**Sparingly Used - Functional Only:**
- Microphone active: Subtle radial pulse (2s infinite)
- Agent thinking: Gentle shimmer effect on status pill (3s infinite)
- Message appear: Fade-in + slide-up (200ms ease-out)
- Modal entry: Fade + scale from 0.95 to 1 (250ms ease-out)
- Button hover: Scale 1.02 (150ms ease-in-out)

**Audio Visualizations:**
- Real-time waveform display when agent speaking (canvas-based, 60fps)
- User audio input: Circular ripple effect on microphone button

## Accessibility & Responsive Behavior

**Breakpoints:**
- Desktop (lg): Full split-screen layout
- Tablet (md): Stacked panels with tabbed switching
- Mobile (base): Single column, bottom-sheet controls

**Dark Mode:**
- Toggle in settings, persist to localStorage
- Consistent implementation across all components including inputs, modals
- Smooth transition (200ms) between modes

**Focus States:**
- All interactive elements: ring-2 ring-primary ring-offset-2
- Keyboard navigation: Clear visual indicators
- Screen reader: Proper ARIA labels for all controls

## Unique Design Considerations

**Real-time Feedback Priority:**
- Visual latency indicators prominent throughout
- Audio processing states clearly visible
- Multimodal input options always accessible

**Professional Polish:**
- Subtle shadows for depth (shadow-sm, shadow-md)
- Consistent 8px border-radius system (rounded-lg standard)
- Ample whitespace prevents claustrophobia (min gap-4 between major elements)

This design creates a sophisticated, utility-focused AI interaction platform that balances modern aesthetics with functional clarity, ensuring users can seamlessly communicate with the AI agent across all modalities.