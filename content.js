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

$(document).ready(function() {
    let imageUrl = '';
    try {
        imageUrl = chrome.runtime.getURL('assets/marker-icon.png');
    } catch (error) {
        console.error('Error getting image URL:', error);
    }

    let selectedRange;

    function wrapSelectedText(range) {
        const HIGHLIGHT_CLASS = 'highlight';
        const color = 'yellow';

        function createHighlightSpan() {
            const highlightSpan = document.createElement('span');
            highlightSpan.className = HIGHLIGHT_CLASS;
            highlightSpan.style.backgroundColor = color;
            return highlightSpan;
        }

        function wrapTextNode(node, start, end) {
            const highlightSpan = createHighlightSpan();
            const highlightedText = node.splitText(start);
            highlightedText.splitText(end - start);
            highlightSpan.appendChild(highlightedText.cloneNode(true));
            highlightedText.replaceWith(highlightSpan);
        }

        if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
            wrapTextNode(range.startContainer, range.startOffset, range.endOffset);
        } else {
            const fragment = range.cloneContents();
            const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, null, false);

            let node;
            const nodesToHighlight = [];
            while (node = walker.nextNode()) {
                nodesToHighlight.push(node);
            }

            nodesToHighlight.forEach((node, index) => {
                const start = index === 0 ? range.startOffset : 0;
                const end = index === nodesToHighlight.length - 1 ? range.endOffset : node.nodeValue.length;
                wrapTextNode(node, start, end);
            });

            range.deleteContents();
            range.insertNode(fragment);
        }

        window.getSelection().removeAllRanges();
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
        }
    });

    $(document).on('mousedown', function(event) {
        if (!$(event.target).is('#marker-icon')) {
            $('#marker-icon').remove();
        } else {
            if (selectedRange) {
                try {
                    wrapSelectedText(selectedRange);
                } catch (error) {
                    console.error('Error highlighting text:', error);
                }
                $('#marker-icon').remove();
            }
        }
    });

    $(document).on('mouseenter', '.highlight', function() {
        console.log('vHovering over highlight');
    }).on('mouseleave', '.highlight', function() {
        console.log('No longer hovering over highlight');
    });
});





