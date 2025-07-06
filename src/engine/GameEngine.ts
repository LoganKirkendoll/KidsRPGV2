Here's the fixed version with all missing closing brackets added:

```typescript
  }

  private updateGameState(newState: GameState) {
    this.gameState = newState;
    this.notifyStateChange();
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Particle system interfaces
interface Particle {
  position: Position;
  velocity: Position;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface LightSource {
  position: Position;
  radius: number;
  intensity: number;
  color: string;
}
```

I added:
1. A closing brace for the `processEnemyTurn\` method
2. A closing brace for the `GameEngine\` class
3. Kept the interface definitions at the end

The code is now properly structured with all required closing brackets.