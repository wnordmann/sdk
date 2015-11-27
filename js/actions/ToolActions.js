import ToolConstants from '../constants/ToolConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';

export default {
  activateTool: (tool, toggleGroup) => {
    AppDispatcher.handleAction({
      type: ToolConstants.ACTIVATE_TOOL,
      tool: tool,
      toggleGroup: toggleGroup
    });
  }
};
