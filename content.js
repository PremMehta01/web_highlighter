function injectScript(file) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    (document.head || document.documentElement).appendChild(script);
    script.onload = function() {
        script.remove();
    };
}

window.onload = function() {
    injectScript('inject.js');
};



const extensionURL = chrome.runtime.getURL('');
const HIGHLIGHT_CLASS = 'highlight';
const TEXT_HIGHLIGHT_ID = 'text-highlight-id';
const DEFAULT_HIGHLIGHT_COLOR = 'yellow';

const highlightedClickPopUpTemplate = `
  <style>
    .webhighlight-highlighted-navbar {
      display: flex;
      background-color: #2b2b2b;
      padding: 10px;
      border-radius: 8px;
    }

    .webhighlight-highlighted-nav-item {
      margin: 0 8px;
      display: flex;
      width: 20px;
      height: 20px;
      justify-content: center;
      align-items: center;
    }

    .webhighlight-highlighted-nav-item img {
      width: 24px;
      height: 24px;
    }

    .webhighlight-click-highlighted-color {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }
  </style>
  
  <div class="webhighlight-highlighted-navbar">
    <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-highlighted-color-container"><div class="webhighlight-click-highlighted-color" id="webhighlight-nav-item-highlighted-color"></div></div>
    <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-copy"><img src="${extensionURL}assets/copy_white.png" alt="Copy"></div>
    <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-quote"><img src="${extensionURL}assets/quote_white.png" alt="Quote"></div>
    <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-delete"><img src="${extensionURL}assets/delete_white.png" alt="Delete"></div>
  </div>
`;


function isVisible(element) {
    return element.offsetWidth > 0 || element.offsetHeight > 0;
}

function generateUUID() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);

    return [
        array[0].toString(16).padStart(2, '0') +
        array[1].toString(16).padStart(2, '0') +
        array[2].toString(16).padStart(2, '0') +
        array[3].toString(16).padStart(2, '0'),

        array[4].toString(16).padStart(2, '0') +
        array[5].toString(16).padStart(2, '0'),

        array[6].toString(16).padStart(2, '0') +
        array[7].toString(16).padStart(2, '0'),

        array[8].toString(16).padStart(2, '0') +
        array[9].toString(16).padStart(2, '0'),

        array[10].toString(16).padStart(2, '0') +
        array[11].toString(16).padStart(2, '0') +
        array[12].toString(16).padStart(2, '0') +
        array[13].toString(16).padStart(2, '0') +
        array[14].toString(16).padStart(2, '0') +
        array[15].toString(16).padStart(2, '0')
    ].join('-');
}



$(document).ready(function() {
    let imageUrl = '';
    try {
        imageUrl = chrome.runtime.getURL('assets/marker-icon.png');
    } catch (error) {
        console.error('Error getting image URL:', error);
    }

    let selectedRange;

    function wrapSelectedText(range, color) {

        function recursiveWrapper(container, highlightInfo, startFound, charsHighlighted, textHighlightId) {
            const { anchor, focus, anchorOffset, focusOffset, color, selectionString } = highlightInfo;
            const selectionLength = selectionString.length;

            container.contents().each((index, element) => {
                if (charsHighlighted >= selectionLength) return; // Stop if done highlighting

                if (element.nodeType !== Node.TEXT_NODE) {
                    const jqElement = $(element);
                    if (jqElement.is(':visible') && getComputedStyle(element).visibility !== 'hidden') {
                        [startFound, charsHighlighted] = recursiveWrapper(jqElement, highlightInfo, startFound, charsHighlighted, textHighlightId);
                    }
                    return;
                }

                let startIndex = 0;
                if (!startFound) {
                    if (!anchor.is(element) && !focus.is(element)) return;

                    startFound = true;
                    startIndex = Math.min(...[
                        ...(anchor.is(element) ? [anchorOffset] : []),
                        ...(focus.is(element) ? [focusOffset] : []),
                    ]);
                }

                const nodeValue = element.nodeValue;
                if (startIndex > nodeValue.length) {
                    throw new Error(`No match found for highlight string '${selectionString}'`);
                }

                const highlightTextEl = element.splitText(startIndex);
                let i = startIndex;
                for (; i < nodeValue.length; i++) {
                    while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) charsHighlighted++;
                    if (charsHighlighted >= selectionLength) break;

                    const char = nodeValue[i];
                    if (char === selectionString[charsHighlighted]) {
                        charsHighlighted++;
                    } else if (!char.match(/\s/u)) {
                        throw new Error(`No match found for highlight string '${selectionString}'`);
                    }
                }

                if (element.parentElement.classList.contains(HIGHLIGHT_CLASS)) return;

                const elementCharCount = i - startIndex;
                const insertBeforeElement = highlightTextEl.splitText(elementCharCount);
                const highlightText = highlightTextEl.nodeValue;

                if (highlightText.match(/^\s*$/u)) {
                    element.parentElement.normalize();
                    return;
                }

                const highlightNode = document.createElement('self-web-highlight');
                highlightNode.classList.add(HIGHLIGHT_CLASS);
                highlightNode.setAttribute(TEXT_HIGHLIGHT_ID, textHighlightId);
                highlightNode.style.backgroundColor = highlightInfo.color;
                highlightNode.textContent = highlightTextEl.nodeValue;


                highlightTextEl.remove();
                element.parentElement.insertBefore(highlightNode, insertBeforeElement);
            });

            return [startFound, charsHighlighted];
        }

        const highlightInfo = {
            color: color || DEFAULT_HIGHLIGHT_COLOR,
            selectionString: range.toString(),
            anchor: $(range.startContainer),
            anchorOffset: range.startOffset,
            focus: $(range.endContainer),
            focusOffset: range.endOffset,
        };

        const commonAncestorContainer = $(range.commonAncestorContainer);
        const singleElement = highlightInfo.anchor.is(highlightInfo.focus) && highlightInfo.anchor[0].nodeType === Node.TEXT_NODE;

        try {
            let textHighlightId = generateUUID();
            if (singleElement) {
                // Handle the case where the selection is within a single text node
                const textNode = highlightInfo.anchor[0];
                const beforeText = textNode.textContent.substring(0, highlightInfo.anchorOffset);
                const selectedText = textNode.textContent.substring(highlightInfo.anchorOffset, highlightInfo.focusOffset);
                const afterText = textNode.textContent.substring(highlightInfo.focusOffset);

                const highlightSpan = document.createElement('self-web-highlight');

                highlightSpan.className = HIGHLIGHT_CLASS;
                highlightSpan.setAttribute(TEXT_HIGHLIGHT_ID, textHighlightId);
                highlightSpan.style.backgroundColor = highlightInfo.color;
                highlightSpan.textContent = selectedText;

                const newNode = document.createDocumentFragment();
                newNode.append(beforeText, highlightSpan, afterText);

                textNode.replaceWith(newNode);
            } else {
                // Handle the case where the selection spans multiple nodes
                recursiveWrapper(commonAncestorContainer, highlightInfo, false, 0, textHighlightId);
            }
        } catch (e) {
            console.error('Error highlighting text:', e);
            return false;
        }

        window.getSelection().removeAllRanges();
        return true;
    }

    $(document).on('mouseup', function(event) {
        let selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 0) {
            selectedRange = window.getSelection().getRangeAt(0);
            let rect = selectedRange.getBoundingClientRect();
    
            $('#marker-icon').remove();
    
            if (!imageUrl) {
                console.error('Image URL not available');
                return;
            }
    
            let markerIcon = $('<img>', {
                id: 'marker-icon',
                src: imageUrl,
                css: {
                    position: 'absolute',
                    top: `${window.scrollY + rect.top - 5}px`,
                    left: `${window.scrollX + rect.left + rect.width + 5}px`,
                    cursor: 'pointer',
                    width: '24px',
                    height: '24px',
                    zIndex: 1000
                }
            });
    
            $('body').append(markerIcon);
    
            let popUpToolBox = document.querySelector('self-webhighlight-popup-toolbox');;
            let hideToolBoxTimeout;
    
            markerIcon.hover(
                function() {
                    if (!popUpToolBox) {
                        popUpToolBox = document.createElement('self-webhighlight-popup-toolbox');
                        document.body.appendChild(popUpToolBox);
                    }
    
                        $(popUpToolBox).hover(
                            function() {
                                // Mouse enter action for popUpToolBox
                                clearTimeout(hideToolBoxTimeout); // Clear hide timeout when hovering on toolbox
                            },
                            function() {
                                // Mouse leave action for popUpToolBox
                                hideToolBoxTimeout = setTimeout(() => {
                                    if (popUpToolBox) {
                                        popUpToolBox.style.display = 'none';
                                    }
                                }, 30);
                            }
                        );

                        $(popUpToolBox).on('color-tile-click', function(event) {
                            const color = event.detail.color;
                            wrapSelectedText(selectedRange, color);

                            popUpToolBox.style.display = 'none';
                            $('#marker-icon').remove();
                            console.log('removed marker icon');
                        });
                    // }
                    
                    const rect = this.getBoundingClientRect();
                    popUpToolBox.style.position = 'absolute';
                    popUpToolBox.style.top = `${rect.top + window.scrollY + rect.height}px`;
                    popUpToolBox.style.left = `${rect.left + window.scrollX}px`;
                    popUpToolBox.style.display = 'block';
    
                    clearTimeout(hideToolBoxTimeout); 
                }, 
                function() {
                    // Mouse leave action for markerIcon
                    hideToolBoxTimeout = setTimeout(() => {
                        if (popUpToolBox) {
                            popUpToolBox.style.display = 'none';
                        }
                    }, 30); 
                }
            );
        }
    });
    
    

    $(document).on('mousedown', function(event) {
        const highlightedClickPopUp = document.querySelector('self-webhighlight-highlighted-click-popup');
        const markerIconClickPopUp = document.querySelector('self-webhighlight-popup-toolbox');
        
        if (highlightedClickPopUp && !highlightedClickPopUp.contains(event.target) && !event.target.classList.contains('highlight')) {
            highlightedClickPopUp.remove();
        }
        
        if ($(event.target).is('#marker-icon')) {
            if (selectedRange) {
                try {
                    wrapSelectedText(selectedRange, DEFAULT_HIGHLIGHT_COLOR);
                } catch (error) {
                    console.error('Error highlighting text:', error);
                }
                $('#marker-icon').remove();
                if(markerIconClickPopUp) {
                    console.log('removing marker icon popup');
                    markerIconClickPopUp.remove();
                }
            }
        }else if (!$(event.target).is('self-webhighlight-popup-toolbox')) {
            $('#marker-icon').remove();
            if(markerIconClickPopUp) {
                console.log('removing marker icon popup');
                markerIconClickPopUp.remove();
            }
        }
    });



    // $(document).on('mouseenter', '.highlight', function() {
    //     console.log('vbxsdfHovering over highlight');
    // }).on('mouseleave', '.highlight', function() {
    //     console.log('No longer hovering over highlight');
    // });



    // $(document).on('click', '.highlight', function() {
    //     console.log('Clicked on highlight:', $(this).text());

    //     let highlightedClickPopUpToolBox = document.querySelector('self-webhighlight-highlighted-click-popup');

    //     if (highlightedClickPopUpToolBox  && isVisible(highlightedClickPopUpToolBox)) { 
    //         highlightedClickPopUpToolBox.remove();
    //     } else {
    //         if (!highlightedClickPopUpToolBox) {
    //             highlightedClickPopUpToolBox = document.createElement('self-webhighlight-highlighted-click-popup');
    //             document.body.appendChild(highlightedClickPopUpToolBox);
    //             highlightedClickPopUpToolBox.attachShadow({ mode: 'open' }).innerHTML = highlightedClickPopUpTemplate;
    //         }


    //         const rect = this.getBoundingClientRect();
    //         highlightedClickPopUpToolBox.style.position = 'absolute';
    //         highlightedClickPopUpToolBox.style.top = `${rect.top + window.scrollY + rect.height}px`;
    //         highlightedClickPopUpToolBox.style.left = `${rect.left + window.scrollX}px`;
    //         highlightedClickPopUpToolBox.style.display = 'block';
    //     }


        
    // });

    $(document).on('click', '.highlight', function() {
        console.log('Clicked on highlight:', $(this).text());
    
        let highlightedClickPopUpToolBox = document.querySelector('self-webhighlight-highlighted-click-popup');
    
        if (highlightedClickPopUpToolBox && isVisible(highlightedClickPopUpToolBox)) {
            highlightedClickPopUpToolBox.remove();
        } else {
            
            if (!highlightedClickPopUpToolBox) {
                highlightedClickPopUpToolBox = document.createElement('self-webhighlight-highlighted-click-popup');
                document.body.appendChild(highlightedClickPopUpToolBox);
                highlightedClickPopUpToolBox.attachShadow({ mode: 'open' }).innerHTML = highlightedClickPopUpTemplate;
            }

            const rect = this.getBoundingClientRect();
            highlightedClickPopUpToolBox.style.position = 'absolute';
            highlightedClickPopUpToolBox.style.top = `${rect.top + window.scrollY + rect.height}px`;
            highlightedClickPopUpToolBox.style.left = `${rect.left + window.scrollX}px`;
            highlightedClickPopUpToolBox.style.display = 'block';

            const backgroundColor = window.getComputedStyle(this).backgroundColor || DEFAULT_HIGHLIGHT_COLOR;
            const colorDiv = highlightedClickPopUpToolBox.shadowRoot.querySelector('#webhighlight-nav-item-highlighted-color');
            if (colorDiv) {
                colorDiv.style.backgroundColor = backgroundColor;
            }

            let currentTextHighlightId;
            const selfWebHighlightElement = this.closest('self-web-highlight');
            if (selfWebHighlightElement) {
                currentTextHighlightId = selfWebHighlightElement.getAttribute('text-highlight-id');
                console.log('Text Highlight ID:', currentTextHighlightId);
            } else {
                console.log('No self-web-highlight element found');
            }


            // Add event listener for button clicks
            const buttons = highlightedClickPopUpToolBox.shadowRoot.querySelectorAll('.webhighlight-highlighted-nav-item');
            buttons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const buttonId = event.currentTarget.id;
    
                    // Dispatch custom event with button id
                    highlightedClickPopUpToolBox.dispatchEvent(new CustomEvent('webhighlight-highlighted-nav-item-click', {
                        detail: { buttonId, currentTextHighlightId },
                        bubbles: true,
                        composed: true
                    }));
                });
            });
        }
    });


    document.addEventListener('webhighlight-highlighted-nav-item-click', (event) => {
        let buttonId = event.detail.buttonId;
        let currentTextHighlightId = event.detail.currentTextHighlightId;
        switch(buttonId) {
            case 'webhighlight-nav-item-highlighted-color-container':
                console.log('Highlighted color button clicked');
                break;
            case 'webhighlight-nav-item-copy':
                console.log('Text Highlight ID:', currentTextHighlightId);
                
                const textElements = document.querySelectorAll('self-web-highlight[text-highlight-id="' + currentTextHighlightId + '"]');
                let text = '';
                let prevTopLevelParent = null;
                let prevElement = null;
                const blockLevelElements = ['p', 'div', 'article', 'section', 'blockquote', 'header', 'footer', 'aside', 'main', 'nav', 'figure'];
                const listItemTag = 'li';


                textElements.forEach(element => {
                    console.log('Each textElement:', element.textContent);

                    let topLevelParent = blockLevelElements.map(tag => element.closest(tag)).filter(el => el !== null)[0];
                    let isListItem = element.closest(listItemTag);
                    
                    console.log("Prev top level parent:", prevTopLevelParent);
                    console.log("Curr top level parent:", topLevelParent);
                    
                    // Add newline if we moved to a new paragraph
                    if (prevTopLevelParent && topLevelParent !== prevTopLevelParent) {
                        console.log("Adding double newline");
                        text += '\n';
                        text += '\n';
                    }

                    // Add newline if there is <li>
                    if (prevElement && isListItem && prevElement.closest(listItemTag) !== isListItem) {
                        text += '\n';
                    }

                    console.log("prevElement: " + prevElement);
                    if (prevElement) {
                        let sibling = prevElement.nextSibling;
                        while (sibling && sibling !== element) {
                            if (sibling.nodeName === 'BR') {
                                console.log(count + ": Adding newline at sibling BR");
                                text += '\n';
                            }
                            sibling = sibling.nextSibling;
                        }
                    }
    
                    // Append the text content of the current element
                    text += element.textContent;
    
                    prevTopLevelParent = topLevelParent;
                    prevElement = element;
                });

                navigator.clipboard.writeText(text);
                break;
            case 'webhighlight-nav-item-quote':
                console.log('Quote button clicked');
                break;
            case 'webhighlight-nav-item-delete':
                console.log('Delete button clicked');
                break;
            default:
                console.log('Unknown button clicked');
        }
    });
    
});



