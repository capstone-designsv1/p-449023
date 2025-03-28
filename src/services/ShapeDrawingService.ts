
export interface ShapeDrawingOptions {
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
}

export class ShapeDrawingService {
  static drawCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    options: ShapeDrawingOptions
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    if (options.fillColor) {
      ctx.fillStyle = options.fillColor;
      ctx.fill();
    }
    
    ctx.strokeStyle = options.strokeColor;
    ctx.lineWidth = options.strokeWidth;
    ctx.stroke();
    ctx.restore();
  }
  
  static drawSquare(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    options: ShapeDrawingOptions
  ): void {
    const halfSize = size / 2;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - halfSize, y - halfSize, size, size);
    
    if (options.fillColor) {
      ctx.fillStyle = options.fillColor;
      ctx.fill();
    }
    
    ctx.strokeStyle = options.strokeColor;
    ctx.lineWidth = options.strokeWidth;
    ctx.stroke();
    ctx.restore();
  }
  
  static drawArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    options: ShapeDrawingOptions
  ): void {
    const headLength = 15; // length of arrow head in pixels
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    
    // Draw the arrow head
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    
    ctx.strokeStyle = options.strokeColor;
    ctx.lineWidth = options.strokeWidth;
    ctx.stroke();
    ctx.restore();
  }
}
