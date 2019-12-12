class CallPatient extends HTMLElement {
  constructor() {
    super();

    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(CallPatient.markup().content.cloneNode(true));
    
    this.setElements();
    this.addListeners();
  }

  static get observedAttributes() {
    return ['doctor', 'timer'];
  }

  static markup() {
    const template = document.createElement('template');

    template.innerHTML = `
      <style>
        *,
        *::after,
        *::before {
          margin: 0;
          box-sizing: border-box;
          padding: 0;
        }

        .UMarginBottomDefault {
          margin-bottom: 20px;
        }

        .Button {
          background-color: #FFFFFF;
          border: 1px solid #FFFFFF;
          border-radius: 5px;
          color: #332247;
          cursor: pointer;
          font-weight: 600;
          padding: 10px 15px;
          transition: all 0.5s ease;
          min-width: 105px;
        }

        .Button:disabled {
          opacity: .4;
          pointer-events: none;
        }

        .Button:hover {
          background-color: transparent;
          color: #FFFFFF;
          transform: translateY(-5px);
        }

        .Button:active {
          transform: translateY(0);
        }

        .Button--outlined {
          background-color: transparent;
          color: #FFFFFF;
        }

        .Button--outlined:hover {
          background-color: #FFFFFF;
          color: #332247;
        }

        .CardQueue {
          background-color: #332247;
          border-radius: 5px;
          color: #FFFFFF;
          padding: 30px;
          margin: 15px;
        }

        .CardQueue__Info {
          font-size: 23px;
          text-align: center;
          transition: all 0.5s ease;
        }

        .CardQueue__Info--big {
          font-size: 30px;
        }

        .CardQueue__Info--disabled {
          opacity: .1;
        }

        .CardQueue__Info--animation {
          animation: fadeIn 1s infinite;
        }

        .QueueConfig {
          align-items: center;
          border: 5px solid #332247;
          border-radius: 0 0 5px 5px;
          display: flex;
          justify-content: space-between;
          margin: -19px 15px 15px;
          padding: 15px 30px;
        }

        .QueueConfig__Input {
          border: 1px solid #332247;
          border-radius: 3px;
          font-family: inherit;
          font-size: 15px;
          padding-left: 5px;
          width: 70px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      </style>

      <div class="CardQueue">
        <h5 id="title" class="CardQueue__Title UMarginBottomDefault"></h5>

        <div class="CardQueue__Content">
          <div class="CardQueue__Details UMarginBottomDefault">
            <p id="next-patient" class="CardQueue__Info CardQueue__Info--big  CardQueue__Info--disabled">Next Patient</p>
            <p id="timer" class="CardQueue__Info">00:00</p>
          </div>
          <div class="CardQueue__Options">
            <button id="btnCall" class="Button Button--outlined">Call Patient</button>
            <button id="btnCancel" class="Button">Cancel</button>
          </div>
        </div>
      </div>

      <div class="QueueConfig">
        <p>Time in seconds:</p>
        <input id="timer-value" class="QueueConfig__Input" type="number" min="0" max="3600" title="Max 3600" />
      </div>
    `;

    return template;
  }

  returnTime(time) {
    let minutes = parseInt(time / 60, 10);
    let seconds = parseInt(time % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return { minutes, seconds };
  }

  startTimer() {
    this.$callPatient.disabled = true;

    this.toggleInitialState();

    let timeLeft = this.$timerValue.value;

    this.interval = window.setInterval(() => {
      const { minutes, seconds } = this.returnTime(timeLeft);

      this.$timer.innerHTML = `${minutes}:${seconds}`;

      if (--timeLeft < 0) {
        clearInterval(this.interval);

        this.toggleCallingState();
        
        this.$callPatient.disabled = false;
        this.$callPatient.innerHTML = 'Recall';

        window.dispatchEvent(new CustomEvent('calling-patient', { "detail": this.doctor }));
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);

    this.$timer.innerHTML = '00:00';
    this.$callPatient.innerHTML = 'Call Patient';
    this.$callPatient.disabled = false;

    this.toggleInitialState();
  }

  toggleInitialState() {
    this.addClassElement(this.$nextPatient, 'CardQueue__Info--disabled');
    this.removeClassElement(this.$timer, 'CardQueue__Info--disabled');
    this.removeClassElement(this.$nextPatient, 'CardQueue__Info--animation');
  }

  toggleCallingState() {
    this.addClassElement(this.$timer, 'CardQueue__Info--disabled');
    this.addClassElement(this.$nextPatient, 'CardQueue__Info--animation');
    this.removeClassElement(this.$nextPatient, 'CardQueue__Info--disabled');
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;

    this.render();
  }

  addClassElement(elementName, className) {
    elementName.classList.add(className);
  }

  removeClassElement(elementName, className) {
    elementName.classList.remove(className);
  }

  addListeners() {
    this.$callPatient.addEventListener('click', () => {
      if (!this.$callPatient.disabled) this.startTimer();
    });
    
    this.$cancelCall.addEventListener('click', () => {
      this.stopTimer();
    });

    this.$timerValue.addEventListener('input', () => {
      this.$timerValue.value = Math.abs(this.$timerValue.value);
      this.$timerValue.value = this.$timerValue.value < 3600 ? this.$timerValue.value : 3600;
    });
  }

  setElements() {
    this.$title = this._shadow.querySelector('#title');
    this.$timer = this._shadow.querySelector('#timer');
    this.$callPatient = this._shadow.querySelector('#btnCall');
    this.$cancelCall = this._shadow.querySelector('#btnCancel');
    this.$nextPatient = this._shadow.querySelector('#next-patient');
    this.$timerValue = this._shadow.querySelector('#timer-value');
  }

  render() {
    this.$title.innerHTML = this.doctor;
    this.$timerValue.value = this.timer;
  }
}

customElements.define('call-patient', CallPatient);
