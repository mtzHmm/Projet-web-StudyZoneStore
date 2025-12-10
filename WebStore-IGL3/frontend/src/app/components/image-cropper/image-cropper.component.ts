import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class ImageCropperComponent {
  @Output() imageCropped = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();
  @Input() aspectRatio: number = 1; // 1:1 par défaut (carré)

  imageSource: string = '';
  croppedImage: string = '';
  isVisible: boolean = false;
  
  // Canvas properties
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  image: HTMLImageElement | null = null;
  
  // Crop area
  cropX: number = 0;
  cropY: number = 0;
  cropWidth: number = 200;
  cropHeight: number = 200;
  
  // Mouse tracking
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  isResizing: boolean = false;
  resizeHandle: string = '';

  // Display properties
  displayWidth: number = 0;
  displayHeight: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;

  ngAfterViewInit() {
    // Removed - we'll get canvas on demand
  }

  private getCanvas(): HTMLCanvasElement | null {
    if (!this.canvas) {
      const canvasElement = document.getElementById('cropCanvas') as HTMLCanvasElement;
      if (canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
      }
    }
    return this.canvas;
  }

  openCropper(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSource = e.target.result;
      this.isVisible = true;
      // Wait for DOM to render
      setTimeout(() => {
        const canvas = this.getCanvas();
        if (canvas && this.ctx) {
          this.loadImage(this.imageSource);
        }
      }, 200);
    };
    reader.readAsDataURL(file);
  }

  openCropperFromUrl(imageUrl: string) {
    this.imageSource = imageUrl;
    this.isVisible = true;
    // Wait for DOM to render
    setTimeout(() => {
      const canvas = this.getCanvas();
      if (canvas && this.ctx) {
        this.loadImage(this.imageSource);
      }
    }, 200);
  }

  loadImage(src: string) {
    console.log('🖼️ Loading image:', src.substring(0, 50) + '...');
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    
    this.image.onload = () => {
      console.log('✅ Image loaded successfully:', this.image?.width, 'x', this.image?.height);
      
      const canvas = this.getCanvas();
      if (!canvas || !this.image || !this.ctx) {
        console.error('❌ Canvas or context not available');
        return;
      }
      
      // Calculate display dimensions to fit in viewport (max 700px)
      const maxSize = 700;
      let displayWidth = this.image.width;
      let displayHeight = this.image.height;
      
      if (displayWidth > maxSize || displayHeight > maxSize) {
        const ratio = Math.min(maxSize / displayWidth, maxSize / displayHeight);
        displayWidth = displayWidth * ratio;
        displayHeight = displayHeight * ratio;
      }
      
      this.displayWidth = displayWidth;
      this.displayHeight = displayHeight;
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      console.log('📐 Canvas size:', displayWidth, 'x', displayHeight);
      
      // Initialize crop area in center
      const cropSize = Math.min(displayWidth, displayHeight) * 0.7;
      this.cropWidth = cropSize;
      this.cropHeight = this.aspectRatio === 1 ? cropSize : cropSize / this.aspectRatio;
      this.cropX = (displayWidth - this.cropWidth) / 2;
      this.cropY = (displayHeight - this.cropHeight) / 2;
      
      this.drawCanvas();
    };
    
    this.image.onerror = (error) => {
      console.error('❌ Error loading image:', error);
      alert('Erreur lors du chargement de l\'image. Veuillez réessayer.');
      this.close();
    };
    
    this.image.src = src;
  }

  drawCanvas() {
    if (!this.ctx || !this.canvas || !this.image) {
      console.error('❌ Cannot draw: missing ctx, canvas, or image');
      return;
    }
    
    console.log('🎨 Drawing canvas...');
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw image
    this.ctx.drawImage(this.image, 0, 0, this.displayWidth, this.displayHeight);
    
    // Draw dark overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Clear crop area
    this.ctx.clearRect(this.cropX, this.cropY, this.cropWidth, this.cropHeight);
    
    // Redraw image in crop area
    const sourceX = (this.cropX / this.displayWidth) * this.image.width;
    const sourceY = (this.cropY / this.displayHeight) * this.image.height;
    const sourceWidth = (this.cropWidth / this.displayWidth) * this.image.width;
    const sourceHeight = (this.cropHeight / this.displayHeight) * this.image.height;
    
    this.ctx.drawImage(
      this.image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      this.cropX, this.cropY, this.cropWidth, this.cropHeight
    );
    
    // Draw crop border
    this.ctx.strokeStyle = '#9236FF';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.cropX, this.cropY, this.cropWidth, this.cropHeight);
    
    // Draw corner handles
    this.drawHandle(this.cropX, this.cropY); // top-left
    this.drawHandle(this.cropX + this.cropWidth, this.cropY); // top-right
    this.drawHandle(this.cropX, this.cropY + this.cropHeight); // bottom-left
    this.drawHandle(this.cropX + this.cropWidth, this.cropY + this.cropHeight); // bottom-right
  }

  drawHandle(x: number, y: number) {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#9236FF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  onMouseDown(event: MouseEvent) {
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    console.log('🖱️ Mouse down:', mouseX, mouseY);
    
    // Check if clicking on handles
    const handleSize = 15;
    const handles = [
      { x: this.cropX, y: this.cropY, name: 'tl' },
      { x: this.cropX + this.cropWidth, y: this.cropY, name: 'tr' },
      { x: this.cropX, y: this.cropY + this.cropHeight, name: 'bl' },
      { x: this.cropX + this.cropWidth, y: this.cropY + this.cropHeight, name: 'br' }
    ];
    
    for (const handle of handles) {
      if (Math.abs(mouseX - handle.x) < handleSize && Math.abs(mouseY - handle.y) < handleSize) {
        this.isResizing = true;
        this.resizeHandle = handle.name;
        this.dragStartX = mouseX;
        this.dragStartY = mouseY;
        console.log('📐 Resizing from handle:', handle.name);
        return;
      }
    }
    
    // Check if clicking inside crop area
    if (mouseX >= this.cropX && mouseX <= this.cropX + this.cropWidth &&
        mouseY >= this.cropY && mouseY <= this.cropY + this.cropHeight) {
      this.isDragging = true;
      this.dragStartX = mouseX - this.cropX;
      this.dragStartY = mouseY - this.cropY;
      console.log('✋ Dragging crop area');
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging && !this.isResizing) return;
    
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    if (this.isDragging) {
      // Move crop area
      this.cropX = Math.max(0, Math.min(mouseX - this.dragStartX, this.displayWidth - this.cropWidth));
      this.cropY = Math.max(0, Math.min(mouseY - this.dragStartY, this.displayHeight - this.cropHeight));
    } else if (this.isResizing) {
      // Resize crop area
      const deltaX = mouseX - this.dragStartX;
      const deltaY = mouseY - this.dragStartY;
      
      switch (this.resizeHandle) {
        case 'tl':
          this.cropX += deltaX;
          this.cropY += deltaY;
          this.cropWidth -= deltaX;
          this.cropHeight -= deltaY;
          break;
        case 'tr':
          this.cropWidth += deltaX;
          this.cropY += deltaY;
          this.cropHeight -= deltaY;
          break;
        case 'bl':
          this.cropX += deltaX;
          this.cropWidth -= deltaX;
          this.cropHeight += deltaY;
          break;
        case 'br':
          this.cropWidth += deltaX;
          this.cropHeight += deltaY;
          break;
      }
      
      // Keep minimum size
      this.cropWidth = Math.max(50, this.cropWidth);
      this.cropHeight = Math.max(50, this.cropHeight);
      
      // Keep within bounds
      this.cropX = Math.max(0, Math.min(this.cropX, this.displayWidth - this.cropWidth));
      this.cropY = Math.max(0, Math.min(this.cropY, this.displayHeight - this.cropHeight));
      
      this.dragStartX = mouseX;
      this.dragStartY = mouseY;
    }
    
    this.drawCanvas();
  }

  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }

  cropImage() {
    if (!this.image) return;
    
    // Create a temporary canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    
    if (!cropCtx) return;
    
    // Set output size (800x800 max)
    const maxOutputSize = 800;
    const outputWidth = Math.min(maxOutputSize, (this.cropWidth / this.displayWidth) * this.image.width);
    const outputHeight = Math.min(maxOutputSize, (this.cropHeight / this.displayHeight) * this.image.height);
    
    cropCanvas.width = outputWidth;
    cropCanvas.height = outputHeight;
    
    // Calculate source coordinates
    const sourceX = (this.cropX / this.displayWidth) * this.image.width;
    const sourceY = (this.cropY / this.displayHeight) * this.image.height;
    const sourceWidth = (this.cropWidth / this.displayWidth) * this.image.width;
    const sourceHeight = (this.cropHeight / this.displayHeight) * this.image.height;
    
    // Draw cropped image
    cropCtx.drawImage(
      this.image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, outputWidth, outputHeight
    );
    
    // Convert to PNG to preserve transparency
    this.croppedImage = cropCanvas.toDataURL('image/png');
    this.imageCropped.emit(this.croppedImage);
    this.close();
  }

  cancel() {
    this.cancelled.emit();
    this.close();
  }

  close() {
    this.isVisible = false;
    this.imageSource = '';
    this.croppedImage = '';
  }
}
