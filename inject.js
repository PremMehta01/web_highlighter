class WebHighlight extends HTMLElement {}
customElements.define('self-web-highlight', WebHighlight);

class WebHighlightPopUpToolBox extends HTMLElement {
    constructor() {
      super(); // Always call super first in constructor

      // Attach a shadow root to the element.
      const shadow = this.attachShadow({ mode: 'open' });

      // Create elements to be included in the shadow DOM
      const wrapper = document.createElement('div');
      wrapper.setAttribute('class', 'wrapper');

      const message = document.createElement('p');
      message.textContent = 'Hello, Shadow DOM!';

      // Apply some styles to the shadow DOM
      const style = document.createElement('style');
      style.textContent = `
        .wrapper {
          background-color: lightgrey;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
        }
        p {
          color: blue;
          font-size: 20px;
        }
      `;

      // Attach the created elements to the shadow DOM
      shadow.appendChild(style);
      shadow.appendChild(wrapper);
      wrapper.appendChild(message);
    }
  }

  // Define the new element
  customElements.define('self-webhighlight-popup-toolbox', WebHighlightPopUpToolBox);
