import React from 'react'
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'
import RenderInBody from './renderInBody.js'
import Popover from 'material-ui/Popover';

class SketchExample extends React.Component {
  state = {
    displayColorPicker: false,
    color: {
      r: '241',
      g: '112',
      b: '19',
      a: '1',
    },
  };

  handleClick = (event) => {
    this.setState({ open: true, anchorEl: event.currentTarget, displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
  };

  render() {

    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
          display: 'block',
          position: 'absolute',
          top: '18px',
          right: '18px'
        },
        popover: {
          position: 'absolute',
          zIndex: 10000,
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });
    return (
      <div>
          <div style={ styles.swatch } onClick={ this.handleClick }>
            <div style={ styles.color } />
          </div>
          { this.state.displayColorPicker ? <Popover onRequestClose={this.handleClose} anchorEl={this.state.anchorEl} open={this.state.displayColorPicker} style={ styles.popover }>
            <div style={ styles.cover } onClick={ this.handleClose }/>
            <SketchPicker color={ this.state.color } onChange={ this.handleChange } />
          </Popover> : null }

        </div>
    )
  }
}

export default SketchExample
