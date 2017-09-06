const defaultState = {
  count: 0,
};

export default function bookmarkReducer(state = defaultState, action) {
  switch (action.type) {
    case 'MOVE':
			return Object.assign({}, state, { count: action.count });
  	case 'CHANGESOURCE':
			return { source: action.source, count: 0};
  	default:
      return state;
  }
}
