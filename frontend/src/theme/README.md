# Growth Journey Theme System

## 🎨 Color Palette

### Primary Colors (Purple-Pink Gradient)
- **Primary**: Purple gradient (`#d946ef` to `#ec4899`)
- **Secondary**: Indigo-Purple-Pink gradient
- **Background**: Light gradient (`#eef2ff` to `#fdf4ff`)

### Status Colors
- **Success**: Green (`#22c55e`)
- **Warning**: Yellow (`#f59e0b`)
- **Error**: Red (`#ef4444`)

### Neutral Colors
- **Gray scale**: From `#fafafa` to `#171717`

## 🧩 Components

### Button Variants
- `primary`: Purple-pink gradient with hover effects
- `secondary`: Gray background with hover
- `ghost`: Transparent with subtle hover

### Card Variants
- `default`: White glassmorphism
- `glass`: More transparent glass effect
- `gradient`: Purple-pink gradient background

### Status States
- `active`: Purple theme
- `completed`: Green theme
- `locked`: Gray theme

## 🎯 Usage Examples

```jsx
import { useTheme } from '../hooks/useTheme'
import { Button, Card } from '../components'

function MyComponent() {
  const { gradients, status } = useTheme()
  
  return (
    <div className={gradients.background}>
      <Card variant="glass">
        <Button variant="primary" size="lg">
          Action Button
        </Button>
      </Card>
    </div>
  )
}
```

## 📱 Responsive Design

All components are built with responsive design in mind:
- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Flexible grid system

## 🎨 Design Principles

1. **Consistency**: All components use the same color palette
2. **Accessibility**: High contrast ratios and focus states
3. **Modern**: Glassmorphism and gradient effects
4. **Interactive**: Smooth transitions and hover effects 