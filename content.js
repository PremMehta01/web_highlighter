// **************************************** 1 WORKING ******************************************* //

// $(document).ready(function() {
//     let imageUrl = '';
//     try {
//         imageUrl = chrome.runtime.getURL('assets/marker-icon.png');
//     } catch (error) {
//         console.error('Error getting image URL:', error);
//     }
    

//     $(document).on('mouseup', function(event) {

//         let selectedText = window.getSelection().toString().trim();
//         if (selectedText.length > 0) {
//             let range = window.getSelection().getRangeAt(0);
//             let rect = range.getBoundingClientRect();
            
//             $('#marker-icon').remove();

//             if (!imageUrl) {
//                 console.error('Image URL not available');
//                 return;
//             }

//             let markerIcon = $('<img>', {
//                 id: 'marker-icon',
//                 src: imageUrl,
//                 css: {
//                     position: 'absolute',
//                     top: `${window.scrollY + rect.top - 5}px`,
//                     left: `${window.scrollX + rect.left + rect.width + 5}px`,
//                     cursor: 'pointer',
//                     width: '24px',  // Adjust the width as needed
//                     height: '24px', // Adjust the height as needed
//                     zIndex: 1000
//                 }
//             });

//             $('body').append(markerIcon);


//             // $('#marker-icon').on('click', function(event) {
//             //     console.log("just before preventing!");
//             //     event.preventDefault(); // Prevent default behavior
    
//             //     console.log("Prevented, now stopping Propagation");
//             //     event.stopPropagation(); // Stop the event from bubbling up
    
//             //     console.log("Marker icon clicked");
//             //     alert('Marker icon clicked!');

//             // });

//             $(document).on('mousedown', function(event) {
//                 console.log("Inside mouseDown");
//                 if (!$(event.target).is('#marker-icon')) {
//                     $('#marker-icon').remove();
//                     console.log("Marker icon removed");
//                 }else{
//                     if (range) {
//                         let highlightSpan = document.createElement('span');
//                         highlightSpan.style.backgroundColor = 'yellow';

//                         try {
//                             let fragment = range.cloneContents();
//                             highlightSpan.appendChild(fragment);
//                             range.deleteContents();
//                             range.insertNode(highlightSpan);
//                         } catch (error) {
//                             console.error('Error highlighting text:', error);
//                         }

//                         $('#marker-icon').remove();
//                     }
//                 }
//             });
            
//         }
//     });

    
// });





// **************************************** 2 WORKING ******************************************* //
// $(document).ready(function() {
//     let imageUrl = '';
//     try {
//         imageUrl = chrome.runtime.getURL('assets/marker-icon.png');
//     } catch (error) {
//         console.error('Error getting image URL:', error);
//     }

//     let selectedRange;

//     function wrapSelectedText(range) {
//         // 1. Get the start and end container and offset
//         let startContainer = range.startContainer;
//         let startOffset = range.startOffset;
//         let endContainer = range.endContainer;
//         let endOffset = range.endOffset;

//         let highlightSpan = document.createElement('span');
//         highlightSpan.className = 'highlight';
//         highlightSpan.style.backgroundColor = 'yellow';

//         // 2. Handle if the start and end are the same
//         if (startContainer === endContainer) {
//             let textNode = startContainer;
//             let beforeText = textNode.textContent.substring(0, startOffset);
//             let selectedText = textNode.textContent.substring(startOffset, endOffset);
//             let afterText = textNode.textContent.substring(endOffset);

//             highlightSpan.textContent = selectedText;

//             let newNode = document.createDocumentFragment();
//             newNode.append(beforeText, highlightSpan, afterText);

//             textNode.replaceWith(newNode);
//         } else {
//             // 3. Handle if the start and end are different
            
//             let fragment = range.cloneContents();
//             highlightSpan.appendChild(fragment);

//             range.deleteContents();
//             range.insertNode(highlightSpan);
//         }

//         // 4. Deselect the text
//         window.getSelection().removeAllRanges();
//     }

//     $(document).on('mouseup', function(event) {
//         let selectedText = window.getSelection().toString().trim();
//         if (selectedText.length > 0) {
//             selectedRange = window.getSelection().getRangeAt(0);
//             let rect = selectedRange.getBoundingClientRect();

//             $('#marker-icon').remove();

//             if (!imageUrl) {
//                 console.error('Image URL not available');
//                 return;
//             }

//             let markerIcon = $('<img>', {
//                 id: 'marker-icon',
//                 src: imageUrl,
//                 css: {
//                     position: 'absolute',
//                     top: `${window.scrollY + rect.top - 5}px`,
//                     left: `${window.scrollX + rect.left + rect.width + 5}px`,
//                     cursor: 'pointer',
//                     width: '24px',  // Adjust the width as needed
//                     height: '24px', // Adjust the height as needed
//                     zIndex: 1000
//                 }
//             });

//             $('body').append(markerIcon);
//         }
//     });

//     $(document).on('mousedown', function(event) {
//         if (!$(event.target).is('#marker-icon')) {
//             $('#marker-icon').remove();
//         } else {
//             if (selectedRange) {
//                 try {
//                     wrapSelectedText(selectedRange);
//                 } catch (error) {
//                     console.error('Error highlighting text:', error);
//                 }

//                 $('#marker-icon').remove();
//             }
//         }
//     });

//     // Hover event listeners for displaying tools
//     $(document).on('mouseenter', '.highlight', function() {
//         // Show tools when hovering over the highlight
//         console.log('Hovering over highlight');
//     }).on('mouseleave', '.highlight', function() {
//         // Hide tools when not hovering
//         console.log('No longer hovering over highlight');
//     });
// });







// **************************************** 3 WORKING FOR MULTIPLE PARAGRAPH but not for single paragraph ******************************************* //

// $(document).ready(function() {
//     let imageUrl = '';
//     try {
//         imageUrl = chrome.runtime.getURL('assets/marker-icon.png');
//     } catch (error) {
//         console.error('Error getting image URL:', error);
//     }

//     let selectedRange;

//     function wrapSelectedText(range) {
//         const HIGHLIGHT_CLASS = 'highlight';

//         // Function to recursively wrap text nodes in the highlight span
//         function recursiveWrapper(container, highlightInfo, startFound, charsHighlighted) {
//             const { anchor, focus, anchorOffset, focusOffset, color, selectionString } = highlightInfo;
//             const selectionLength = selectionString.length;

//             container.contents().each((index, element) => {
//                 if (charsHighlighted >= selectionLength) return; // Stop if done highlighting

//                 if (element.nodeType !== Node.TEXT_NODE) {
//                     const jqElement = $(element);
//                     if (jqElement.is(':visible') && getComputedStyle(element).visibility !== 'hidden') {
//                         [startFound, charsHighlighted] = recursiveWrapper(jqElement, highlightInfo, startFound, charsHighlighted);
//                     }
//                     return;
//                 }

//                 let startIndex = 0;
//                 if (!startFound) {
//                     if (!anchor.is(element) && !focus.is(element)) return;

//                     startFound = true;
//                     startIndex = Math.min(...[
//                         ...(anchor.is(element) ? [anchorOffset] : []),
//                         ...(focus.is(element) ? [focusOffset] : []),
//                     ]);
//                 }

//                 const nodeValue = element.nodeValue;
//                 if (startIndex > nodeValue.length) {
//                     throw new Error(`No match found for highlight string '${selectionString}'`);
//                 }

//                 const highlightTextEl = element.splitText(startIndex);
//                 let i = startIndex;
//                 for (; i < nodeValue.length; i++) {
//                     while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) charsHighlighted++;
//                     if (charsHighlighted >= selectionLength) break;

//                     const char = nodeValue[i];
//                     if (char === selectionString[charsHighlighted]) {
//                         charsHighlighted++;
//                     } else if (!char.match(/\s/u)) {
//                         throw new Error(`No match found for highlight string '${selectionString}'`);
//                     }
//                 }

//                 if (element.parentElement.classList.contains(HIGHLIGHT_CLASS)) return;

//                 const elementCharCount = i - startIndex;
//                 const insertBeforeElement = highlightTextEl.splitText(elementCharCount);
//                 const highlightText = highlightTextEl.nodeValue;

//                 if (highlightText.match(/^\s*$/u)) {
//                     element.parentElement.normalize();
//                     return;
//                 }

//                 const highlightNode = document.createElement('span');
//                 highlightNode.classList.add(HIGHLIGHT_CLASS);
//                 highlightNode.style.backgroundColor = highlightInfo.color;
//                 highlightNode.textContent = highlightTextEl.nodeValue;
//                 highlightTextEl.remove();
//                 element.parentElement.insertBefore(highlightNode, insertBeforeElement);
//             });

//             return [startFound, charsHighlighted];
//         }

//         const highlightInfo = {
//             color: "yellow",
//             selectionString: range.toString(),
//             anchor: $(range.startContainer),
//             anchorOffset: range.startOffset,
//             focus: $(range.endContainer),
//             focusOffset: range.endOffset,
//         };

//         try {
//             recursiveWrapper($(range.commonAncestorContainer), highlightInfo, false, 0);
//         } catch (e) {
//             console.error('Error highlighting text:', e);
//             return false;
//         }

//         window.getSelection().removeAllRanges();
//         return true;
//     }

//     $(document).on('mouseup', function(event) {
//         let selectedText = window.getSelection().toString().trim();
//         if (selectedText.length > 0) {
//             selectedRange = window.getSelection().getRangeAt(0);
//             let rect = selectedRange.getBoundingClientRect();

//             $('#marker-icon').remove();

//             if (!imageUrl) {
//                 console.error('Image URL not available');
//                 return;
//             }

//             let markerIcon = $('<img>', {
//                 id: 'marker-icon',
//                 src: imageUrl,
//                 css: {
//                     position: 'absolute',
//                     top: `${window.scrollY + rect.top - 5}px`,
//                     left: `${window.scrollX + rect.left + rect.width + 5}px`,
//                     cursor: 'pointer',
//                     width: '24px',
//                     height: '24px',
//                     zIndex: 1000
//                 }
//             });

//             $('body').append(markerIcon);
//         }
//     });

//     $(document).on('mousedown', function(event) {
//         if (!$(event.target).is('#marker-icon')) {
//             $('#marker-icon').remove();
//         } else {
//             if (selectedRange) {
//                 try {
//                     wrapSelectedText(selectedRange);
//                 } catch (error) {
//                     console.error('Error highlighting text:', error);
//                 }
//                 $('#marker-icon').remove();
//             }
//         }
//     });

//     // Hover event listeners for displaying tools
//     $(document).on('mouseenter', '.highlight', function() {
//         console.log('Hovering over highlight');
//     }).on('mouseleave', '.highlight', function() {
//         console.log('No longer hovering over highlight');
//     });
// });





// **************************************** 4 ******************************************* //
// MULTIPLE + SINGLE PARAGRAPH WORKING FINE
// Issue: Modify existing style of selected text

// $(document).ready(function() {
//     let imageUrl = '';
//     try {
//         imageUrl = chrome.runtime.getURL('assets/marker-icon.png');
//     } catch (error) {
//         console.error('Error getting image URL:', error);
//     }

//     let selectedRange;

//     function wrapSelectedText(range) {
//         const HIGHLIGHT_CLASS = 'highlight';

//         function recursiveWrapper(container, highlightInfo, startFound, charsHighlighted) {
//             const { anchor, focus, anchorOffset, focusOffset, color, selectionString } = highlightInfo;
//             const selectionLength = selectionString.length;

//             container.contents().each((index, element) => {
//                 if (charsHighlighted >= selectionLength) return; // Stop if done highlighting

//                 if (element.nodeType !== Node.TEXT_NODE) {
//                     const jqElement = $(element);
//                     if (jqElement.is(':visible') && getComputedStyle(element).visibility !== 'hidden') {
//                         [startFound, charsHighlighted] = recursiveWrapper(jqElement, highlightInfo, startFound, charsHighlighted);
//                     }
//                     return;
//                 }

//                 let startIndex = 0;
//                 if (!startFound) {
//                     if (!anchor.is(element) && !focus.is(element)) return;

//                     startFound = true;
//                     startIndex = Math.min(...[
//                         ...(anchor.is(element) ? [anchorOffset] : []),
//                         ...(focus.is(element) ? [focusOffset] : []),
//                     ]);
//                 }

//                 const nodeValue = element.nodeValue;
//                 if (startIndex > nodeValue.length) {
//                     throw new Error(`No match found for highlight string '${selectionString}'`);
//                 }

//                 const highlightTextEl = element.splitText(startIndex);
//                 let i = startIndex;
//                 for (; i < nodeValue.length; i++) {
//                     while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/u)) charsHighlighted++;
//                     if (charsHighlighted >= selectionLength) break;

//                     const char = nodeValue[i];
//                     if (char === selectionString[charsHighlighted]) {
//                         charsHighlighted++;
//                     } else if (!char.match(/\s/u)) {
//                         throw new Error(`No match found for highlight string '${selectionString}'`);
//                     }
//                 }

//                 if (element.parentElement.classList.contains(HIGHLIGHT_CLASS)) return;

//                 const elementCharCount = i - startIndex;
//                 const insertBeforeElement = highlightTextEl.splitText(elementCharCount);
//                 const highlightText = highlightTextEl.nodeValue;

//                 if (highlightText.match(/^\s*$/u)) {
//                     element.parentElement.normalize();
//                     return;
//                 }

//                 const highlightNode = document.createElement('span');
//                 highlightNode.classList.add(HIGHLIGHT_CLASS);
//                 highlightNode.style.backgroundColor = highlightInfo.color;
//                 highlightNode.textContent = highlightTextEl.nodeValue;
//                 highlightTextEl.remove();
//                 element.parentElement.insertBefore(highlightNode, insertBeforeElement);
//             });

//             return [startFound, charsHighlighted];
//         }

//         const highlightInfo = {
//             color: "yellow",
//             selectionString: range.toString(),
//             anchor: $(range.startContainer),
//             anchorOffset: range.startOffset,
//             focus: $(range.endContainer),
//             focusOffset: range.endOffset,
//         };

//         const commonAncestorContainer = $(range.commonAncestorContainer);
//         const singleElement = highlightInfo.anchor.is(highlightInfo.focus) && highlightInfo.anchor[0].nodeType === Node.TEXT_NODE;

//         try {
//             if (singleElement) {
//                 // Handle the case where the selection is within a single text node
//                 const textNode = highlightInfo.anchor[0];
//                 const beforeText = textNode.textContent.substring(0, highlightInfo.anchorOffset);
//                 const selectedText = textNode.textContent.substring(highlightInfo.anchorOffset, highlightInfo.focusOffset);
//                 const afterText = textNode.textContent.substring(highlightInfo.focusOffset);

//                 const highlightSpan = document.createElement('span');
//                 highlightSpan.className = HIGHLIGHT_CLASS;
//                 highlightSpan.style.backgroundColor = highlightInfo.color;
//                 highlightSpan.textContent = selectedText;

//                 const newNode = document.createDocumentFragment();
//                 newNode.append(beforeText, highlightSpan, afterText);

//                 textNode.replaceWith(newNode);
//             } else {
//                 // Handle the case where the selection spans multiple nodes
//                 recursiveWrapper(commonAncestorContainer, highlightInfo, false, 0);
//             }
//         } catch (e) {
//             console.error('Error highlighting text:', e);
//             return false;
//         }

//         window.getSelection().removeAllRanges();
//         return true;
//     }

//     $(document).on('mouseup', function(event) {
//         let selectedText = window.getSelection().toString().trim();
//         if (selectedText.length > 0) {
//             selectedRange = window.getSelection().getRangeAt(0);
//             let rect = selectedRange.getBoundingClientRect();

//             $('#marker-icon').remove();

//             if (!imageUrl) {
//                 console.error('Image URL not available');
//                 return;
//             }

//             let markerIcon = $('<img>', {
//                 id: 'marker-icon',
//                 src: imageUrl,
//                 css: {
//                     position: 'absolute',
//                     top: `${window.scrollY + rect.top - 5}px`,
//                     left: `${window.scrollX + rect.left + rect.width + 5}px`,
//                     cursor: 'pointer',
//                     width: '24px',
//                     height: '24px',
//                     zIndex: 1000
//                 }
//             });

//             $('body').append(markerIcon);
//         }
//     });

//     $(document).on('mousedown', function(event) {
//         if (!$(event.target).is('#marker-icon')) {
//             $('#marker-icon').remove();
//         } else {
//             if (selectedRange) {
//                 try {
//                     wrapSelectedText(selectedRange);
//                 } catch (error) {
//                     console.error('Error highlighting text:', error);
//                 }
//                 $('#marker-icon').remove();
//             }
//         }
//     });

//     $(document).on('mouseenter', '.highlight', function() {
//         console.log('Hovering over highlight');
//     }).on('mouseleave', '.highlight', function() {
//         console.log('No longer hovering over highlight');
//     });
// });




// **************************************** 5 ******************************************* //
// 4 + (4 issue fixed)
// Hover to show color, click color to highlight text with the clicked color




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



const HIGHLIGHT_CLASS = 'highlight';
const DEFAULT_HIGHLIGHT_COLOR = 'yellow';


$(document).ready(function() {
    let imageUrl = '';
    try {
        imageUrl = chrome.runtime.getURL('assets/marker-icon.png');
    } catch (error) {
        console.error('Error getting image URL:', error);
    }

    let selectedRange;

    function wrapSelectedText(range, color) {

        function recursiveWrapper(container, highlightInfo, startFound, charsHighlighted) {
            const { anchor, focus, anchorOffset, focusOffset, color, selectionString } = highlightInfo;
            const selectionLength = selectionString.length;

            container.contents().each((index, element) => {
                if (charsHighlighted >= selectionLength) return; // Stop if done highlighting

                if (element.nodeType !== Node.TEXT_NODE) {
                    const jqElement = $(element);
                    if (jqElement.is(':visible') && getComputedStyle(element).visibility !== 'hidden') {
                        [startFound, charsHighlighted] = recursiveWrapper(jqElement, highlightInfo, startFound, charsHighlighted);
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
            if (singleElement) {
                // Handle the case where the selection is within a single text node
                const textNode = highlightInfo.anchor[0];
                const beforeText = textNode.textContent.substring(0, highlightInfo.anchorOffset);
                const selectedText = textNode.textContent.substring(highlightInfo.anchorOffset, highlightInfo.focusOffset);
                const afterText = textNode.textContent.substring(highlightInfo.focusOffset);

                

                // class WebHighlight extends HTMLElement {}
                // customElements.define('web-highlight', WebHighlight);

                const highlightSpan = document.createElement('self-web-highlight');

                highlightSpan.className = HIGHLIGHT_CLASS;
                highlightSpan.style.backgroundColor = highlightInfo.color;
                highlightSpan.textContent = selectedText;

                // highlightSpan.style.fontWeight = highlightInfo.fontWeight;
                // highlightSpan.style.fontStyle = highlightInfo.fontStyle;
                // highlightSpan.style.lineHeight = highlightInfo.lineHeight;
                // highlightSpan.style.cursor = 'pointer !important';

                const newNode = document.createDocumentFragment();
                newNode.append(beforeText, highlightSpan, afterText);

                textNode.replaceWith(newNode);
            } else {
                // Handle the case where the selection spans multiple nodes
                recursiveWrapper(commonAncestorContainer, highlightInfo, false, 0);
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
    
            let popUpToolBox;
            let hideToolBoxTimeout;
    
            markerIcon.hover(
                function() {
                    // Mouse enter action for markerIcon
                    if (!popUpToolBox) {
                        popUpToolBox = document.createElement('self-webhighlight-popup-toolbox');
                        document.body.appendChild(popUpToolBox);
    
                        // Add hover listeners to the popUpToolBox after it's created and appended
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
                    }
                    
                    // Position the pop-up toolbox near the hovered element
                    const rect = this.getBoundingClientRect();
                    popUpToolBox.style.position = 'absolute';
                    popUpToolBox.style.top = `${rect.top + window.scrollY + rect.height}px`;
                    popUpToolBox.style.left = `${rect.left + window.scrollX}px`;
                    popUpToolBox.style.display = 'block';
    
                    clearTimeout(hideToolBoxTimeout); // Clear any existing hide timeout
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
        if (!$(event.target).is('#marker-icon')) {
            $('#marker-icon').remove();
        } else {
            if (selectedRange) {
                try {
                    wrapSelectedText(selectedRange, DEFAULT_HIGHLIGHT_COLOR);
                } catch (error) {
                    console.error('Error highlighting text:', error);
                }
                $('#marker-icon').remove();
            }
        }
    });



    $(document).on('mouseenter', '.highlight', function() {
        console.log('vbxsdfHovering over highlight');
    }).on('mouseleave', '.highlight', function() {
        console.log('No longer hovering over highlight');
    });
    
    
    
});


  
