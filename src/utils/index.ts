import { EditorState, Modifier, RawDraftContentState, RichUtils } from 'draft-js';
import { deflateSync, inflateSync } from 'zlib';
import DOMPurify from 'dompurify';
import draftToHtml from 'draftjs-to-html';
import { ContentState, convertToRaw } from 'draft-js';

// Encodes Uint8Array to a string.
export const encoder = new TextEncoder();

// Decodes a string to a Uint8Array.
export const decoder = new TextDecoder();

export const isClientSide = () => {
  return typeof window !== 'undefined';
};

export const exportDataToFile = (data: Uint8Array) => {
  const filename = 'speakeasyIdentity.json';

  const file = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};

export const byEntryTimestamp = (x: [string, unknown], y: [string, unknown]) => new Date(x[0]).getTime() - new Date(y[0]).getTime()

const sanitize = (markup: string) => DOMPurify.sanitize(markup, {
  ALLOWED_TAGS: ['p', 'a', 'br', 'code', 'ol', 'ul', 'li', 'pre', 'i', 'strong', 'b', 'em'],
  ALLOWED_ATTR: ['target', 'href', 'rel', 'class', 'style']
});;


type Entity = {
  type: string;
  text: string;
  depth: number;
  data: {
    url: string;
  }
}

const customEntityTransform = (entity: Entity, text: string) => {
  if (entity.type === 'LINK') {
    const target = '_blank';
    return `<a rel="noopener" href="${entity.data.url ?? ''}" target="${target}">${text}</a>`;
  }
}

export const deflatedMessageToMarkup = (content: string) => {
  let inflated: RawDraftContentState;
  try {
    inflated = JSON.parse(inflateSync(Buffer.from(content, 'base64')).toString()) as RawDraftContentState;
    // Change code-blocks to code because library is poopy
    inflated.blocks = inflated.blocks.map((block) => ({
      ...block,
      type: block.type === 'code-block' ? 'code' : block.type
    }))
  } catch (e) {
    // Probably a message from before rich text format was implemented 
    inflated = convertToRaw(ContentState.createFromText(content));
  }

  return sanitize(draftToHtml(inflated, undefined, undefined, customEntityTransform));
}

export const deflateContent = (content: string) => deflateSync(content).toString('base64');


const removeSelectedBlocksStyle = (editorState: EditorState): EditorState => {
  const newContentState = RichUtils.tryToRemoveBlockStyle(editorState);
  if (newContentState) {
    return EditorState.push(editorState, newContentState, 'change-block-type');
  }
  return editorState;
}

export const resetEditorState = (editorState: EditorState): EditorState => {
  const blocks = editorState
    .getCurrentContent()
    .getBlockMap()
    .toList();

  const updatedSelection = editorState.getSelection().merge({
    anchorKey: blocks.first().get('key'),
    anchorOffset: 0,
    focusKey: blocks.last().get('key'),
    focusOffset: blocks.last().getLength(),
  });

  const newContentState = Modifier.removeRange(
    editorState.getCurrentContent(),
    updatedSelection,
    'forward'
  );

  const newState = EditorState.push(editorState, newContentState, 'remove-range');
  
  return removeSelectedBlocksStyle(newState);
}