if (!customElements.get('before-after-slider')) {
  customElements.define(
    'before-after-slider',
    class BeforeAfterSlider extends HTMLElement {
      constructor() {
        super();
        this.handle = this.querySelector('.before-after__handle');
        this.isDragging = false;
        this.bindEvents();
      }

      bindEvents() {
        // Mouse events
        this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());

        // Touch events
        this.handle.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('touchend', () => this.endDrag());

        // Click anywhere to move
        this.addEventListener('click', (e) => this.jumpTo(e));

        // Keyboard support for accessibility
        this.handle.addEventListener('keydown', (e) => this.handleKeydown(e));
      }

      startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.classList.add('is-dragging');
      }

      drag(e) {
        if (!this.isDragging) return;

        // Prevent scrolling while dragging on touch devices
        if (e.cancelable) {
          e.preventDefault();
        }

        const rect = this.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));

        this.style.setProperty('--position', `${percent}%`);
      }

      endDrag() {
        this.isDragging = false;
        this.classList.remove('is-dragging');
      }

      jumpTo(e) {
        // Don't jump if clicking on the handle
        if (e.target.closest('.before-after__handle')) return;

        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));

        // Smooth transition for click
        this.style.transition = '--position 0.3s ease';
        this.style.setProperty('--position', `${percent}%`);

        // Remove transition after animation
        setTimeout(() => {
          this.style.transition = '';
        }, 300);
      }

      handleKeydown(e) {
        const currentStr = getComputedStyle(this).getPropertyValue('--position');
        const current = parseFloat(currentStr) || 50;
        let newPos = current;

        switch (e.key) {
          case 'ArrowLeft':
            newPos = Math.max(5, current - 5);
            break;
          case 'ArrowRight':
            newPos = Math.min(95, current + 5);
            break;
          case 'Home':
            newPos = 5;
            break;
          case 'End':
            newPos = 95;
            break;
          default:
            return;
        }

        if (newPos !== current) {
          e.preventDefault();
          this.style.setProperty('--position', `${newPos}%`);
        }
      }
    }
  );
}
