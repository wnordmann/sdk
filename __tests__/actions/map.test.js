import * as actions from '../../src/actions/map'
import { MAP } from '../../src/action-types';

describe('actions', () => {
  it('should create an action to set the view', () => {
    const center = [5, 5];
    const zoom = 10;
    const expectedAction = {
      type: MAP.SET_VIEW,
      view: {
        center,
        zoom
      }
    }
    expect(actions.setView(center, zoom)).toEqual(expectedAction)
  })
})
