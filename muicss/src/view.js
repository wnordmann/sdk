import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'muicss/lib/react/button';
import Appbar from 'muicss/lib/react/appbar';

class Example extends React.Component {
  render() {
    return (
      <div>
        <span>
          <Appbar />
        </span>
        <div>
          <Button>button</Button>
          <Button color="primary">button</Button>
          <Button color="danger">button</Button>
          <Button color="accent">button</Button>
        </div>
        <div>
          <Button disabled={true}>button</Button>
          <Button color="primary" disabled={true}>button</Button>
          <Button color="danger" disabled={true}>button</Button>
          <Button color="accent" disabled={true}>button</Button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Example />, document.getElementById('example'));
