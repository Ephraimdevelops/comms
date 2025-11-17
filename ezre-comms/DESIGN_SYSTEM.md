# Premium Design System - Apple-Inspired

## Overview

This design system is inspired by Apple's premium aesthetic, focusing on:
- Clean, minimal interfaces
- Smooth animations and transitions
- Premium typography
- Thoughtful spacing and hierarchy
- Glass morphism effects
- Gradient accents

## Typography

### Font Family
- **Primary**: Inter (similar to SF Pro)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold)

### Type Scale

```css
.text-display     /* 6xl-8xl, semibold, -0.02em tracking */
.text-headline    /* 4xl-6xl, semibold, -0.015em tracking */
.text-title       /* 2xl-3xl, semibold, -0.01em tracking */
.text-subhead     /* lg-xl, medium */
.text-body        /* base, relaxed line-height */
.text-caption     /* sm, muted color */
```

## Colors

### Primary Palette
- **Background**: `#ffffff` (white)
- **Foreground**: `#1d1d1f` (near black)
- **Muted**: `#f5f5f7` (light gray)
- **Muted Foreground**: `#86868b` (medium gray)
- **Border**: `#d2d2d7` (light border)
- **Accent**: `#0071e3` (Apple blue)

### Gradients
- Primary: `from-accent to-blue-600`
- Success: `from-green-500 to-green-600`
- Warning: `from-amber-500 to-amber-600`
- Error: `from-red-500 to-red-600`

## Components

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Get Started
</button>
```
- Rounded-full (pill shape)
- Smooth hover scale effect
- Focus ring for accessibility

#### Secondary Button
```tsx
<button className="btn-secondary">
  Learn More
</button>
```
- Transparent with border
- Hover background change

#### Ghost Button
```tsx
<button className="btn-ghost">
  Cancel
</button>
```
- Minimal styling
- Hover background only

### Cards

#### Standard Card
```tsx
<div className="card">
  Content
</div>
```
- Rounded-2xl
- Border with hover shadow
- Smooth transitions

#### Elevated Card
```tsx
<div className="card-elevated">
  Content
</div>
```
- Pre-applied shadow
- More prominent

### Navigation

- Sticky top navigation
- Glass morphism effect (backdrop-blur)
- Active state highlighting
- Smooth transitions

## Spacing

- **Tight**: 0.5rem (8px)
- **Base**: 1rem (16px)
- **Comfortable**: 1.5rem (24px)
- **Spacious**: 2rem (32px)
- **Generous**: 3rem (48px)

## Animations

### Fade In
```tsx
<div className="animate-fade-in delay-100">
  Content
</div>
```
- Smooth opacity and translate
- Staggered delays for sequences

### Hover Effects
- Scale: `hover:scale-[1.02]`
- Shadow: `hover:shadow-lg`
- Color transitions: `transition-colors duration-200`

## Best Practices

### 1. Spacing
- Use consistent spacing scale
- Generous whitespace for premium feel
- Group related elements

### 2. Typography
- Use appropriate type scale
- Maintain hierarchy
- Negative letter spacing for large text

### 3. Colors
- Use muted colors for secondary text
- Accent color sparingly for CTAs
- Maintain contrast ratios

### 4. Interactions
- Smooth transitions (200-300ms)
- Subtle hover effects
- Clear focus states

### 5. Layout
- Max-width containers (7xl)
- Responsive padding
- Grid systems for consistency

## Component Examples

### Hero Section
- Large display text
- Gradient text for emphasis
- Animated background elements
- Clear CTA hierarchy

### Dashboard Cards
- Elevated cards for stats
- Icon + gradient backgrounds
- Hover scale effects
- Clean data presentation

### Navigation
- Glass morphism
- Active state indicators
- Smooth mobile menu
- User avatar with gradient

## Accessibility

- Focus rings on interactive elements
- Proper color contrast
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid systems
- Touch-friendly targets (min 44px)

