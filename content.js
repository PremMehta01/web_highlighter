const HIGHLIGHT_METADATA = 'highlightMetadata';


// function restoreHighlights() {
//     console.log('Restoring highlights...');

//     const url = window.location.href;

//     chrome.storage.local.get({ [HIGHLIGHT_METADATA]: {} }, (result) => {
//         const highlights = result[HIGHLIGHT_METADATA][url];

//         if (!highlights) return;

//         highlights.forEach(highlight => {
//             const container = elementFromQuery(highlight.container);
//             if (!container) {
//                 console.error('Could not find container for highlight:', highlight);
//                 return;
//             }

//             const cleanText = getCleanTextContent(container);
//             const startIndex = cleanText.indexOf(highlight.highlightedString);
//             if (startIndex === -1) {
//                 console.error('Could not find original text in container:', highlight);
//                 return;
//             }

//             const endIndex = startIndex + highlight.highlightedString.length;

//             // Find the text nodes and offsets for the start and end of the highlight
//             const selection = findNodesAndOffsets(container, startIndex, endIndex);
//             if (!selection) {
//                 console.error('Could not determine selection for highlight:', highlight);
//                 return;
//             }

//             highlightText(container, selection, highlight.highlightedColor, highlight.textHighlightId);
//         });
//     });
// }



function restoreHighlights() {
    console.log('Restoring highlights...');
    logStorage();

    const url = window.location.href;

    chrome.storage.local.get({ [HIGHLIGHT_METADATA]: {} }, (result) => {
        const highlights = result[HIGHLIGHT_METADATA][url];

        if (!highlights) return;

        highlights.forEach(highlight => {
            const container = elementFromQuery(highlight.container);
            if (!container) {
                console.error('Could not find container for highlight:', highlight);
                return;
            }

            // Check if this highlight already exists
            const existingHighlight = container.querySelector(`[${TEXT_HIGHLIGHT_ID}="${highlight.textHighlightId}"]`);
            if (existingHighlight) {
                console.log('Highlight already exists:', highlight.textHighlightId);
                return;
            }

            const cleanText = getCleanTextContent(container);
            const startIndex = cleanText.indexOf(highlight.highlightedString);

            // const startIndex = cleanText.indexOf(strippedHighlightedString);
            if (startIndex === -1) {
                console.error('Could not find original text in container:', highlight);
                return;
            }

            const strippedHighlightedString = highlight.highlightedString.replace(/\n\n/g, ' ');
            const endIndex = startIndex + strippedHighlightedString.length;

            // Find the text nodes and offsets for the start and end of the highlight
            const selection = findNodesAndOffsets(container, startIndex, endIndex);
            if (!selection) {
                console.error('Could not determine selection for highlight:', highlight);
                return;
            }

            highlightText(container, selection, highlight.highlightedColor, highlight.textHighlightId);
        });
    });
}




// function findNodesAndOffsets(container, startIndex, endIndex) {
//     let currentIndex = 0;
//     let startNode, startOffset, endNode, endOffset;

//     function traverse(node) {
//         if (node.nodeType === Node.TEXT_NODE) {
//             const nodeLength = node.textContent.length;
//             if (!startNode && currentIndex + nodeLength > startIndex) {
//                 startNode = node;
//                 startOffset = startIndex - currentIndex;
//             }
//             if (!endNode && currentIndex + nodeLength >= endIndex) {
//                 endNode = node;
//                 endOffset = endIndex - currentIndex;
//                 return true; // Stop traversal
//             }
//             currentIndex += nodeLength;
//         } else if (node.nodeType === Node.ELEMENT_NODE) {
//             for (const childNode of node.childNodes) {
//                 if (traverse(childNode)) return true;
//             }
//             // Account for spaces or newlines added in getCleanTextContent
//             if (['P', 'DIV', 'BR'].includes(node.nodeName)) {
//                 currentIndex += 1; // Adjust based on your specific needs
//             }
//         }
//         return false;
//     }

//     traverse(container);

//     if (startNode && endNode) {
//         return {
//             anchorNode: startNode,
//             anchorOffset: startOffset,
//             focusNode: endNode,
//             focusOffset: endOffset
//         };
//     }

//     return null;
// }

function findNodesAndOffsets(container, startIndex, endIndex) {
    let currentIndex = 0;
    let startNode, startOffset, endNode, endOffset;

    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const nodeLength = node.textContent.length;
            if (!startNode && currentIndex + nodeLength >= startIndex) {
                startNode = node;
                startOffset = startIndex - currentIndex;
            }
            if (!endNode && currentIndex + nodeLength >= endIndex) {
                endNode = node;
                endOffset = endIndex - currentIndex;
                return true; // Stop traversal
            }
            currentIndex += nodeLength;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (const childNode of node.childNodes) {
                if (traverse(childNode)) return true;
            }
            // Account for spaces or newlines added in getCleanTextContent
            if (['P', 'DIV', 'BR'].includes(node.nodeName)) {
                currentIndex += 1; // Adjust based on your specific needs
            }
        }
        return false;
    }

    traverse(container);

    if (startNode && endNode) {
        return {
            anchorNode: startNode,
            anchorOffset: startOffset,
            focusNode: endNode,
            focusOffset: endOffset
        };
    }

    return null;
}



function elementFromQuery(storedQuery) {
    const re = />textNode\(([0-9]+)\)$/ui;
    const result = re.exec(storedQuery);

    if (result) {
        const charOffset = parseInt(result[1], 10);
        storedQuery = storedQuery.replace(re, "");
        const parent = document.querySelector(storedQuery);

        if (!parent) return null;

        const cleanText = getCleanTextContent(parent);
        let currentOffset = 0;
        for (const node of parent.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const nodeLength = node.textContent.length;
                if (currentOffset <= charOffset && charOffset < currentOffset + nodeLength) {
                    return node;
                }
                currentOffset += nodeLength;
            } else if (node.classList && node.classList.contains(HIGHLIGHT_CLASS)) {
                // Skip highlight spans, but add their text content length
                currentOffset += node.textContent.length;
            }
        }
        return null;
    }

    return document.querySelector(storedQuery);
}


function highlightText(container, selection, color, textHighlightId) {
    const range = document.createRange();
    range.setStart(selection.anchorNode, selection.anchorOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);
    
    const selectionString = range.toString();

    recursiveWrapper(container, {
        color: color || DEFAULT_HIGHLIGHT_COLOR,
        selectionString: selectionString,
        anchorNode: selection.anchorNode,
        anchorOffset: selection.anchorOffset,
        focusNode: selection.focusNode,
        focusOffset: selection.focusOffset,
        href: window.location.href,
        createdAt: new Date().toISOString(),
    }, false, 0, textHighlightId);
}



function injectScript(file) {
    console.log(`Injecting ${file}...`);
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    (document.head || document.documentElement).appendChild(script);
    script.onload = function() {
        script.remove();
    };
}

function setupMutationObserver() {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const callback = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check if any removed nodes contained highlights
                const removedHighlights = Array.from(mutation.removedNodes).some(node => 
                    node.nodeType === Node.ELEMENT_NODE && node.querySelector('.highlight')
                );

                // Check if any added nodes might affect our highlights
                const addedNodes = Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === Node.ELEMENT_NODE && 
                    (node.textContent.includes(HIGHLIGHT_CLASS) || node.innerHTML.includes(HIGHLIGHT_CLASS))
                );

                if (removedHighlights || addedNodes) {
                    console.log('Detected changes affecting highlights. Restoring...');
                    debouncedRestoreHighlights();
                    break;  // No need to check further mutations
                }
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

// function observeMutations() {
//     const observer = new MutationObserver(() => {
//         console.log('Mutation detected, restoring highlights...');
//         restoreHighlights();
//     });

//     observer.observe(document.body, {
//         childList: true,
//         subtree: true,
//     });
// }


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedRestoreHighlights = debounce(restoreHighlights, 250);


window.onload = function() {
    injectScript('inject.js');

    setTimeout(restoreHighlights, 1000);

    // PROS and CONS of observeMutations():
    // PROS: It works in one edge case- when there is entirely new div or elements inserted or removed, those newly added/removed elements does not contains $HIGHLIGHT_CLASS. In this case observeMutaion did trigger. But setupMutationObserver() will not trigger as inside this funciton, we have a check on $HIGHLIGHT_CLASS contains.
    // CONS: It will be too heavy as it continuoulsy calls restoreHighlights(). And most of the time it is false positive call.
    // Hence using setupMutationObserver() instead of observeMutations(). Also after enablilng this, delete highlights does not remove background color from deleting text in UI, though it removes from chrome storage. From UI it removes after reloading.

    // observeMutations();

    setupMutationObserver(); // Start observing DOM changes
    
};


// if (document.readyState === 'loading') {
//     console.log('Page is still loading... removing and then restoring highlights...');
//     document.removeEventListener('DOMContentLoaded', restoreHighlights()); // Prevent duplicates
//     document.addEventListener('DOMContentLoaded', restoreHighlights());
// } else {
//     console.log('Page is already loaded... restoring highlights...');
//     // Run immediately if the page is already loaded
//     restoreHighlights();
// }





const extensionURL = chrome.runtime.getURL('');
const HIGHLIGHT_CLASS = 'highlight';
const TEXT_HIGHLIGHT_ID = 'text-highlight-id';
const DEFAULT_HIGHLIGHT_COLOR = 'yellow';
const manifestVersion = chrome.runtime.getManifest().version;


const highlightedClickPopUpTemplate = `
  <style>
    .webhighlight-highlighted-navbar {
      display: flex;
      background-color: #2b2b2b;
      padding: 10px;
      border-radius: 8px;
      position: relative;
      z-index: 100;
    }

    .webhighlight-highlighted-nav-item {
      margin: 0 8px;
      display: flex;
      width: 20px;
      height: 20px;
      justify-content: center;
      align-items: center;
      cursor: pointer;
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

    .webhighlight-tooltip {
        visibility: hidden;
        background-color: #555;
        color: #fff;
        text-align: center;
        border-radius: 5px;
        padding: 5px;
        font-size: 9px;
        position: absolute;
        z-index: 1000;
        bottom: 100%; /* Position the tooltip above the navbar */
        left: 40%;
        transform: translateX(-50%);
        margin-bottom: 5px; /* Add some space between the navbar and tooltip */
        opacity: 0;
        transition: opacity 0.3s;
    }

    .webhighlight-tooltip.show {
        visibility: visible;
        opacity: 0.9;
    }
  </style>
  
  <div class="webhighlight-highlighted-navbar">
    <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-highlighted-color-container"><div class="webhighlight-click-highlighted-color" id="webhighlight-nav-item-highlighted-color"></div></div>
    <div class="webhighlight-highlighted-nav-item" id="webhighlight-nav-item-copy">
        <img src="${extensionURL}assets/copy_white.png" alt="Copy">
        <div class="webhighlight-tooltip" id="webhighlight-copy-tooltip">Copied!</div>
    </div>
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


// function recursiveWrapper(container, highlightInfo, startFound, charsHighlighted, textHighlightId) {
//     const { anchorNode, focusNode, anchorOffset, focusOffset, selectionString } = highlightInfo;
//     const selectionLength = selectionString.length;

//     container.childNodes.forEach((element) => {
//         if (charsHighlighted >= selectionLength) return;

//         if (element.nodeType !== Node.TEXT_NODE) {
//             if (element.nodeType === Node.ELEMENT_NODE && element.offsetParent !== null) {
//                 [startFound, charsHighlighted] = recursiveWrapper(element, highlightInfo, startFound, charsHighlighted, textHighlightId);
//             }
//             return;
//         }

//         let startIndex = 0;
//         if (!startFound) {
//             if (element !== anchorNode && element !== focusNode) return;

//             startFound = true;
//             startIndex = Math.min(
//                 ...(element === anchorNode ? [anchorOffset] : []),
//                 ...(element === focusNode ? [focusOffset] : [])
//             );
//         }

//         const nodeValue = element.nodeValue;
//         if (startIndex > nodeValue.length) {
//             throw new Error(`No match found for highlight string '${selectionString}'`);
//         }

//         const highlightTextEl = element.splitText(startIndex);
//         let i = startIndex;
//         for (; i < nodeValue.length; i++) {
//             while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) charsHighlighted++;
//             if (charsHighlighted >= selectionLength) break;

//             const char = nodeValue[i];
//             if (char === selectionString[charsHighlighted]) {
//                 charsHighlighted++;
//             } else if (!char.match(/\s/u)) {
//                 throw new Error(`No match found for highlight string '${selectionString}'`);
//             }
//         }

//         if (element.parentElement.classList.contains(HIGHLIGHT_CLASS)) return;

//         const elementCharCount = i - startIndex;
//         const insertBeforeElement = highlightTextEl.splitText(elementCharCount);
//         const highlightText = highlightTextEl.nodeValue;

//         if (highlightText.match(/^\s*$/u)) {
//             element.parentElement.normalize();
//             return;
//         }

//         const highlightNode = document.createElement('self-web-highlight');
//         highlightNode.classList.add(HIGHLIGHT_CLASS);
//         highlightNode.setAttribute(TEXT_HIGHLIGHT_ID, textHighlightId);
//         highlightNode.style.backgroundColor = highlightInfo.color;
//         highlightNode.textContent = highlightTextEl.nodeValue;

//         highlightTextEl.remove();
//         element.parentElement.insertBefore(highlightNode, insertBeforeElement);
//     });

//     return [startFound, charsHighlighted];
// }


// function recursiveWrapper(container, highlightInfo, startFound, charsHighlighted, textHighlightId) {
//     const { anchorNode, focusNode, anchorOffset, focusOffset, color, selectionString } = highlightInfo;
//     const selectionLength = selectionString.length;

//     const $container = $(container);  // Convert container to jQuery object

//     console.log('Container:', $container); // Log container to see if it's correct
//     console.log('Container contents:', $container.contents());

//     $container.contents().each((index, element) => {
//         if (charsHighlighted >= selectionLength) return; // Stop if done highlighting

//         if (element.nodeType !== Node.TEXT_NODE) {
//             const jqElement = $(element);
//             if (jqElement.is(':visible') && getComputedStyle(element).visibility !== 'hidden') {
//                 [startFound, charsHighlighted] = recursiveWrapper(jqElement[0], highlightInfo, startFound, charsHighlighted, textHighlightId);
//             }
//             return;
//         }

//         let startIndex = 0;
//         if (!startFound) {
//             if (!anchorNode.is(element) && !focusNode.is(element)) return;

//             startFound = true;
//             startIndex = Math.min(...[
//                 ...(anchorNode.is(element) ? [anchorOffset] : []),
//                 ...(focusNode.is(element) ? [focusOffset] : []),
//             ]);
//         }

//         const nodeValue = element.nodeValue;
//         if (startIndex > nodeValue.length) {
//             throw new Error(`No match found for highlight string '${selectionString}'`);
//         }

//         const highlightTextEl = element.splitText(startIndex);
//         let i = startIndex;
//         for (; i < nodeValue.length; i++) {
//             while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) charsHighlighted++;
//             if (charsHighlighted >= selectionLength) break;

//             const char = nodeValue[i];
//             if (char === selectionString[charsHighlighted]) {
//                 charsHighlighted++;
//             } else if (!char.match(/\s/u)) {
//                 throw new Error(`No match found for highlight string '${selectionString}'`);
//             }
//         }

//         if (element.parentElement.classList.contains(HIGHLIGHT_CLASS)) return;

//         const elementCharCount = i - startIndex;
//         const insertBeforeElement = highlightTextEl.splitText(elementCharCount);
//         const highlightText = highlightTextEl.nodeValue;

//         if (highlightText.match(/^\s*$/u)) {
//             element.parentElement.normalize();
//             return;
//         }

//         const highlightNode = document.createElement('self-web-highlight');
//         highlightNode.classList.add(HIGHLIGHT_CLASS);
//         highlightNode.setAttribute(TEXT_HIGHLIGHT_ID, textHighlightId);
//         highlightNode.style.backgroundColor = highlightInfo.color;
//         highlightNode.textContent = highlightTextEl.nodeValue;


//         highlightTextEl.remove();
//         element.parentElement.insertBefore(highlightNode, insertBeforeElement);
//     });

//     return [startFound, charsHighlighted];
// }


function recursiveWrapper(container, highlightInfo, startFound, charsHighlighted, textHighlightId) {
    const { anchorNode, focusNode, anchorOffset, focusOffset, selectionString } = highlightInfo;
    const selectionLength = selectionString.length;

    const childNodes = Array.from(container.childNodes);

    childNodes.forEach((element) => {
        if (charsHighlighted >= selectionLength) return;

        if (element.nodeType !== Node.TEXT_NODE) {
            if (element.nodeType === Node.ELEMENT_NODE && element.offsetParent !== null) {
                [startFound, charsHighlighted] = recursiveWrapper(element, highlightInfo, startFound, charsHighlighted, textHighlightId);
            }
            return;
        }

        let startIndex = 0;
        if (!startFound) {
            if (element !== anchorNode && element !== focusNode) return;

            startFound = true;
            startIndex = Math.min(
                ...(element === anchorNode ? [anchorOffset] : []),
                ...(element === focusNode ? [focusOffset] : [])
            );
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


function wrapSelectedText(selection, color) {

    const range = selection.getRangeAt(0);


    let container = range.commonAncestorContainer;
    // while (container.nodeType !== Node.ELEMENT_NODE) {
    //     container = container.parentNode;
    // }

    while (!container.innerHTML) {
        container = container.parentNode;
    }

    const highlightInfo = {
        color: color || DEFAULT_HIGHLIGHT_COLOR,
        selectionString: selection.toString(),
        anchorNode: range.startContainer,
        anchorOffset: range.startOffset,
        focusNode: range.endContainer,
        focusOffset: range.endOffset,
        href: window.location.href,
        createdAt: new Date().toISOString(),
        selectionAnchorNode: getQuery(selection.anchorNode),
        selectionFocusNode: getQuery(selection.focusNode),
        container: getQuery(container),
    };

    const singleElement = highlightInfo.anchorNode === highlightInfo.focusNode && highlightInfo.anchorNode.nodeType === Node.TEXT_NODE;

    try {
        let textHighlightId = generateUUID();
        if (singleElement) {
            const textNode = highlightInfo.anchorNode;
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
            recursiveWrapper(container, highlightInfo, false, 0, textHighlightId);
        }

        chrome.storage.local.get({ [HIGHLIGHT_METADATA]: {} }, (result) => {
            const highlights = result[HIGHLIGHT_METADATA];
            const url = highlightInfo.href;

            if (!highlights[url]) highlights[url] = [];

            highlights[url].push({
                version: manifestVersion,
                highlightedString: highlightInfo.selectionString,
                container: highlightInfo.container,
                anchorNode: highlightInfo.selectionAnchorNode,
                anchorOffset: highlightInfo.anchorOffset,
                focusNode: highlightInfo.selectionFocusNode,
                focusOffset: highlightInfo.focusOffset,
                highlightedColor: highlightInfo.color,
                href: highlightInfo.href,
                textHighlightId: textHighlightId,
                createdAt: highlightInfo.createdAt
            });

            chrome.storage.local.set({ [HIGHLIGHT_METADATA]: highlights });

            console.log('Highlight saved: ' + JSON.stringify(result, null, 2));
        });

    } catch (e) {
        console.error('Error highlighting text:', e);
        return false;
    }

    window.getSelection().removeAllRanges();
    return true;
}


function getCleanTextContent(node) {
    let text = '';
    node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            text += getCleanTextContent(child);
            if (['P', 'DIV'].includes(child.nodeName)) {
                text += '\n\n'; // Adds newlines for block-level elements.
            } else if (child.nodeName === 'BR') {
                text += '\n'; // Adds a single newline for line breaks.
            }
        }
    });
    return text;
}



function getQuery(element) {
    if (element.id) return `#${escapeCSSString(element.id)}`;
    if (element.localName === 'html') return 'html';

    const parent = element.parentNode;
    const parentSelector = getQuery(parent);

    if (element.nodeType === Node.TEXT_NODE) {
        const cleanText = getCleanTextContent(parent);
        let offset = cleanText.indexOf(element.textContent);
        return `${parentSelector}>textNode(${offset})`;
    } else {
        const index = Array.from(parent.children).filter(child => child.localName === element.localName).indexOf(element) + 1;
        return `${parentSelector}>${element.localName}:nth-of-type(${index})`;
    }
}

function escapeCSSString(cssString) {
    return cssString.replace(/(:)/ug, "\\$1");
}





$(document).ready(function() {
    let imageUrl = '';
    try {
        imageUrl = chrome.runtime.getURL('assets/marker-icon.png');
    } catch (error) {
        console.error('Error getting image URL:', error);
    }

    let selection;

    $(document).on('mouseup', function(event) {
        // let selectedText = window.getSelection().toString().trim();
        // if (selectedText.length > 0) {

        selection = window.getSelection();
        
        if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
            let selectedRange = selection.getRangeAt(0);
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
                        console.log("at time of clicking color, selection: ", selection);
                        console.log("at time of clicking color, selection.rangeCount: ", selection.rangeCount);
                        if (selection.rangeCount > 0) {
                            wrapSelectedText(window.getSelection(), color);

                            popUpToolBox.style.display = 'none';
                            $('#marker-icon').remove();
                            console.log('removed marker icon');
                        }else {
                            console.error('No valid selection found');
                        }
                    });
                    
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
            if (selection) {
                try {
                    wrapSelectedText(window.getSelection(), DEFAULT_HIGHLIGHT_COLOR);
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
                        detail: { buttonId, currentTextHighlightId, highlightedClickPopUpToolBox },
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
        let highlightedClickPopUpToolBox = event.detail.highlightedClickPopUpToolBox;

        switch(buttonId) {
            case 'webhighlight-nav-item-highlighted-color-container':
                console.log('Highlighted color button clicked');
                break;
            case 'webhighlight-nav-item-copy':
                // console.log('Text Highlight ID:', currentTextHighlightId);
                
                const textElementsWithCurrentTextHighlightId = document.querySelectorAll('self-web-highlight[text-highlight-id="' + currentTextHighlightId + '"]');
                let text = '';
                let prevTopLevelParent = null;
                let prevElement = null;
                const blockLevelElements = ['p', 'div', 'article', 'section', 'blockquote', 'header', 'footer', 'aside', 'main', 'nav', 'figure'];
                const listItemTag = 'li';


                textElementsWithCurrentTextHighlightId.forEach(element => {
                    // console.log('Each textElementsWithCurrentTextHighlightId:', element.textContent);

                    let topLevelParent = blockLevelElements.map(tag => element.closest(tag)).filter(el => el !== null)[0];
                    let isListItem = element.closest(listItemTag);
                    
                    // console.log("Prev top level parent:", prevTopLevelParent);
                    // console.log("Curr top level parent:", topLevelParent);
                    
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

                    // console.log("prevElement: " + prevElement);
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
    
                    text += element.textContent;
    
                    prevTopLevelParent = topLevelParent;
                    prevElement = element;
                });


                navigator.clipboard.writeText(text).then(() => {
                    const shadowRoot = highlightedClickPopUpToolBox.shadowRoot;
                    const tooltip = shadowRoot.querySelector('#webhighlight-copy-tooltip');

                    if (tooltip) {
                        tooltip.classList.add('show');
    
                        // Hide the tooltip after 1 seconds
                        setTimeout(() => {
                            console.log('Hiding tooltip');
                            tooltip.classList.remove('show');
                        }, 1000);
                    }
                });

                break;
            case 'webhighlight-nav-item-quote':
                console.log('Quote button clicked');
                clearStorage();
                break;
            case 'webhighlight-nav-item-delete':
                console.log('Delete button clicked');
            
                // Find all elements with the current text highlight ID
                const highlightedElements = document.querySelectorAll(`self-web-highlight[text-highlight-id="${currentTextHighlightId}"]`);
            
                highlightedElements.forEach(element => {
                    console.log("Deleting text: " + element.textContent);
                    // Get the parent node
                    const parent = element.parentNode;
            
                    // Create a text node with the highlighted content
                    const textNode = document.createTextNode(element.textContent);
            
                    // Replace the highlighted element with the text node
                    parent.replaceChild(textNode, element);
                    parent.normalize();
                });
            
                // Normalize the parent to merge adjacent text nodes
                // document.body.normalize();
                
            
                // Remove the highlight data from storage
                chrome.storage.local.get({ [HIGHLIGHT_METADATA]: {} }, (result) => {
                    const highlights = result[HIGHLIGHT_METADATA];
                    const url = window.location.href;
            
                    if (highlights[url]) {
                        highlights[url] = highlights[url].filter(highlight => highlight.textHighlightId !== currentTextHighlightId);
            
                        // If no highlights left for this URL, remove the URL entry
                        if (highlights[url].length === 0) {
                            delete highlights[url];
                        }
            
                        chrome.storage.local.set({ [HIGHLIGHT_METADATA]: highlights }, () => {
                            console.log('Highlight removed from storage');
                            logStorage();
                        });
                    }
                });
            
                // Hide the popup
                if (highlightedClickPopUpToolBox) {
                    highlightedClickPopUpToolBox.style.display = 'none';
                }
            
                break;
            default:
                console.log('Unknown button clicked');
        }
    });
    
    
});



function logStorage() {
    chrome.storage.local.get({ [HIGHLIGHT_METADATA]: {} }, (result) => {
        const highlights = result[HIGHLIGHT_METADATA];
        console.log("Storage: ", JSON.stringify(highlights, null, 2));
    });
}


function clearStorage() {
    console.log("Clearing Chrome storage...");
    chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
            console.error("Error clearing Chrome storage:", chrome.runtime.lastError);
        } else {
            console.log("Chrome storage cleared successfully.");
        }
    });
}



// clearStorage();