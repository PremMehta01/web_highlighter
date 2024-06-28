class WebHighlight extends HTMLElement {}
customElements.define('self-web-highlight', WebHighlight);

class WebHighlightPopUpToolBox extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        .palette-container {
            display: flex;
            flex-direction: column;
            background-color: #2b2b2b;
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .palette-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .color-tile {
            flex: 1;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            cursor: pointer;
            border: 2px solid transparent;
            box-sizing: border-box;
            margin: 0 1px;
        }

        .color-tile.selected {
            border-color: #fff;
        }

        .color-tile.starred::before {
            content: "★";
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            color: gold;
        }

        .color-yellow { background-color: #F8FD44; }
        .color-orange { background-color: #FFAD2A; }
        .color-green { background-color: #90FEAB; }
        .color-pink { background-color: #FB82B2; }
        .color-purple { background-color: #9C65E2; }
        .color-blue { background-color: #3ABDFA; }

        .color-yellow-light { background-color: #FDFEB3; }
        .color-orange-light { background-color: #F8B7A9; }
        .color-green-light { background-color: #A7E8C8; }
        .color-pink-light { background-color: #F6C3D6; }
        .color-purple-light { background-color: #C2BAEC; }
        .color-blue-light { background-color: #C2EFFD; }
      </style>
      
      <div class="palette-container">
        <div class="palette-row">
            <button class="color-tile color-yellow"></button>
            <button class="color-tile color-orange"></button>
            <button class="color-tile color-green"></button>
            <button class="color-tile color-pink"></button>
            <button class="color-tile color-purple"></button>
            <button class="color-tile color-blue"></button>
        </div>
        <div class="palette-row">
            <button class="color-tile color-yellow-light"></button>
            <button class="color-tile color-orange-light"></button>
            <button class="color-tile color-green-light"></button>
            <button class="color-tile color-pink-light"></button>
            <button class="color-tile color-purple-light"></button>
            <button class="color-tile color-blue-light"></button>
        </div>
     </div>
    `;

    shadow.appendChild(template.content.cloneNode(true));

    // Add event listener for button clicks
    const buttons = shadow.querySelectorAll('.color-tile');
    buttons.forEach(button => {
    button.addEventListener('click', (event) => {
        // Get computed style to access applied CSS styles
        const computedStyle = window.getComputedStyle(event.target);
        const color = computedStyle.backgroundColor;
        
        // Dispatch custom event with color info
        this.dispatchEvent(new CustomEvent('color-tile-click', {
        detail: { color },
        bubbles: true,
        composed: true
        }));
    });
    });

  }
}
customElements.define('self-webhighlight-popup-toolbox', WebHighlightPopUpToolBox);




// class WebHighlightHighlightedClickPopUp extends HTMLElement {
//   constructor() {
//     super();

//     const shadow = this.attachShadow({ mode: 'open' });

//     const template = document.createElement('template');
//     // template.innerHTML = `
//     //   <style>
//     //     .webhighlight-highlighted-navbar {
//     //         display: flex;
//     //         background-color: #2b2b2b;
//     //         padding: 10px;
//     //         border-radius: 8px;
//     //     }

//     //     .webhighlight-highlighted-nav-item {
//     //         margin: 0 5px;
//     //         display: flex;
//     //         justify-content: center;
//     //         align-items: center;
//     //     }

//     //     .webhighlight-highlighted-nav-item img {
//     //         width: 24px;
//     //         height: 24px;
//     //     }

//     //     .highlighted-color {
//     //         width: 24px;
//     //         height: 24px;
//     //         background-color: #ffee58;
//     //         border-radius: 4px;
//     //     }
//     //   </style>
      
//     //   <div class="webhighlight-highlighted-navbar">
//     //     <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-highlighted-color"><div class="highlighted-color"></div></div>
//     //     <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-copy"><img src="./assets/marker-icon.png" alt="Copy"></div>
//     //     <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-quote"><img src="quote-icon.png" alt="Quote"></div>
//     //     <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-delete"><img src="delete-icon.png" alt="Delete"></div>
//     //   </div>
//     // `;

//     template.innerHTML = highlightedClickPopUpTemplate;

//     shadow.appendChild(template.content.cloneNode(true));

//     // Add event listener for button clicks
//     const buttons = shadow.querySelectorAll('.webhighlight-highlighted-nav-item');
//     buttons.forEach(button => {
//       button.addEventListener('click', (event) => {
//           const buttonId = event.target.id;
          
//           // Dispatch custom event with color info
//           this.dispatchEvent(new CustomEvent('webhighlight-highlighted-nav-item-click', {
//             detail: { buttonId },
//             bubbles: true,
//             composed: true
//           }));
//       });
//     });

//   }
// }

class WebHighlightHighlightedClickPopUp extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.define('self-webhighlight-highlighted-click-popup', WebHighlightHighlightedClickPopUp);
