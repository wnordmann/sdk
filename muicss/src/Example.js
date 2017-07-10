import React from 'react';
import ReactDOM from 'react-dom';
import { Appbar, Button, Panel } from 'muicss/react';

class Example extends React.Component {
  onClick() {
    console.log('clicked on button');
  }

  render() {
    return (
      <div>
        <Appbar />
        <Container>
          <Panel>
            <Button onClick={this.onClick}>My Button</Button>
          </Panel>
        </Container>
      </div>
    );
  }
}

ReactDOM.render(<Example />, document.getElementById('example'));
