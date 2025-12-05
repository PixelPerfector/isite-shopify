if (!customElements.get('price-calculator')) {
  customElements.define(
    'price-calculator',
    class PriceCalculator extends HTMLElement {
      constructor() {
        super();
        this.currentStep = 1;
        this.totalSteps = 4;
        this.data = {
          type: '',
          pages: '5',
          design: '',
          name: '',
          email: '',
          phone: ''
        };

        // Get configurable prices from data attributes (set via Liquid)
        this.prices = {
          landing: parseInt(this.dataset.priceLanding) || 500,
          presentation: parseInt(this.dataset.pricePresentation) || 1000,
          ecommerce: parseInt(this.dataset.priceEcommerce) || 2500,
          custom: parseInt(this.dataset.priceCustom) || 5000,
          perPage: parseInt(this.dataset.pricePerPage) || 100,
          designBasic: parseFloat(this.dataset.designBasic) || 1,
          designPremium: parseFloat(this.dataset.designPremium) || 1.5,
          designCustom: parseFloat(this.dataset.designCustom) || 2
        };

        this.init();
      }

      init() {
        this.steps = this.querySelectorAll('.calc-step');
        this.progressFill = this.querySelector('.calc-progress__fill');
        this.progressSteps = this.querySelectorAll('.calc-progress__step');
        this.prevBtn = this.querySelector('[data-calc-prev]');
        this.nextBtn = this.querySelector('[data-calc-next]');
        this.form = this.querySelector('.calc-form');

        this.bindEvents();
        this.showStep(1);
      }

      bindEvents() {
        this.prevBtn?.addEventListener('click', () => this.prevStep());
        this.nextBtn?.addEventListener('click', () => this.nextStep());

        // Option card selections
        this.querySelectorAll('.calc-option').forEach(opt => {
          opt.addEventListener('click', () => this.selectOption(opt));
        });

        // Form inputs
        this.querySelectorAll('input, select').forEach(input => {
          input.addEventListener('input', (e) => {
            this.data[e.target.name] = e.target.value;
            this.validateCurrentStep();
          });
        });

        // Prevent form submission on enter
        this.form?.addEventListener('submit', (e) => {
          e.preventDefault();
          if (this.currentStep === this.totalSteps) {
            this.submit();
          }
        });
      }

      selectOption(el) {
        const field = el.dataset.field;
        const value = el.dataset.value;

        // Update UI
        el.closest('.calc-options')
          .querySelectorAll('.calc-option')
          .forEach(o => o.classList.remove('calc-option--selected'));
        el.classList.add('calc-option--selected');

        // Store data
        this.data[field] = value;
        this.validateCurrentStep();
      }

      showStep(n) {
        this.steps.forEach((step, i) => {
          step.classList.toggle('calc-step--active', i === n - 1);
        });

        // Update progress
        const progress = ((n - 1) / (this.totalSteps - 1)) * 100;
        if (this.progressFill) {
          this.progressFill.style.width = `${progress}%`;
        }

        this.progressSteps.forEach((step, i) => {
          step.classList.toggle('calc-progress__step--active', i < n);
          step.classList.toggle('calc-progress__step--current', i === n - 1);
        });

        // Update buttons
        this.prevBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
        this.nextBtn.textContent = n === this.totalSteps ? 'Vezi Oferta' : 'Continua';

        this.validateCurrentStep();
      }

      validateCurrentStep() {
        let isValid = false;

        switch (this.currentStep) {
          case 1:
            isValid = !!this.data.type;
            break;
          case 2:
            isValid = !!this.data.pages && parseInt(this.data.pages) > 0;
            break;
          case 3:
            isValid = !!this.data.design;
            break;
          case 4:
            isValid = !!this.data.name && !!this.data.phone && this.isValidPhone(this.data.phone);
            break;
        }

        this.nextBtn.disabled = !isValid;
        return isValid;
      }

      isValidPhone(phone) {
        // Basic phone validation - at least 10 digits
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10;
      }

      isValidEmail(email) {
        if (!email) return true; // Email is optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }

      nextStep() {
        if (!this.validateCurrentStep()) return;

        if (this.currentStep === this.totalSteps) {
          this.submit();
        } else {
          this.currentStep++;
          this.showStep(this.currentStep);
        }
      }

      prevStep() {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.showStep(this.currentStep);
        }
      }

      calculatePrice() {
        // Base price by type
        const basePrices = {
          landing: this.prices.landing,
          presentation: this.prices.presentation,
          ecommerce: this.prices.ecommerce,
          custom: this.prices.custom
        };

        let base = basePrices[this.data.type] || 1000;

        // Pages cost (first 5 included)
        const pages = parseInt(this.data.pages) || 5;
        const extraPages = Math.max(0, pages - 5);
        const pagesCost = extraPages * this.prices.perPage;

        // Design multiplier
        const designMultipliers = {
          basic: this.prices.designBasic,
          premium: this.prices.designPremium,
          custom: this.prices.designCustom
        };
        const multiplier = designMultipliers[this.data.design] || 1;

        // Calculate total
        const total = (base + pagesCost) * multiplier;
        const min = Math.round(total * 0.9);
        const max = Math.round(total * 1.1);

        return { min, max, total: Math.round(total) };
      }

      getTypeName(type) {
        const names = {
          landing: 'Landing Page',
          presentation: 'Site de Prezentare',
          ecommerce: 'Magazin Online',
          custom: 'Aplicatie Custom'
        };
        return names[type] || type;
      }

      getDesignName(design) {
        const names = {
          basic: 'Basic',
          premium: 'Premium',
          custom: 'Custom'
        };
        return names[design] || design;
      }

      submit() {
        const price = this.calculatePrice();

        const params = new URLSearchParams({
          name: this.data.name,
          phone: this.data.phone,
          email: this.data.email || '',
          type: this.data.type,
          typeName: this.getTypeName(this.data.type),
          pages: this.data.pages,
          design: this.data.design,
          designName: this.getDesignName(this.data.design),
          priceMin: price.min,
          priceMax: price.max
        });

        window.location.href = `/pages/oferta?${params.toString()}`;
      }
    }
  );
}
