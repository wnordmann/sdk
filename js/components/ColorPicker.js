import React from 'react'
import reactCSS from 'reactcss'
import {SketchPicker} from 'react-color'
import Popover from 'material-ui/Popover';

export default class ColorPicker extends React.Component {
  static propTypes = {
    /**
     * Callback that is called when a change is made.
     */
    onChange: React.PropTypes.func.isRequired,
    /**
     * Initial color.
     */
    initialColor: React.PropTypes.object
  };

  static defaultProps = {
    initialColor: {
      rgb: {
        r: 255,
        g: 0,
        b: 0,
        a: 0.5
      },
      hex: '#FF0000'
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      color: props.initialColor
    };
  }
  handleClick(event) {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
      displayColorPicker: !this.state.displayColorPicker
    })
  }
  handleClose() {
    this.setState({
      displayColorPicker: false
    });
  }
  handleChange(color) {
    this.setState({
      color: color
    });
    this.props.onChange(color);
  }
  render() {
    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.rgb.r }, ${ this.state.color.rgb.g }, ${ this.state.color.rgb.b }, ${ this.state.color.rgb.a || 1 })`
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          cursor: 'pointer',
          display: 'block',
          position: 'absolute',
          top: '18px',
          right: '18px'
        },
        popover: {
          position: 'absolute',
          zIndex: 10000
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px'
        }
      }
    });
    return (
      <div>
          <div style={ styles.swatch } onClick={ this.handleClick.bind(this) }>
            <div style={ styles.color } />
          </div>
          { this.state.displayColorPicker ? <Popover onRequestClose={this.handleClose.bind(this)} anchorEl={this.state.anchorEl} open={this.state.displayColorPicker} style={ styles.popover }>
            <div style={ styles.cover } onClick={ this.handleClose.bind(this) }/>
            <SketchPicker color={ this.state.color } onChangeComplete={ this.handleChange.bind(this) } />
          </Popover> : null }

        </div>
    );
  }
}
