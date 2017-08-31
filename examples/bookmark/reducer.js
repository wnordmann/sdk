const defaultState = {
  count: 0,
};

export default function bookmarkReducer(state = defaultState, action) {
  switch (action.type) {
    case 'MOVE':
      return { count: action.count };
    default:
      return state;
  }
}
