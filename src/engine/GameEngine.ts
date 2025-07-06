// Here's the fixed version with all missing closing brackets added:

// ```typescript
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