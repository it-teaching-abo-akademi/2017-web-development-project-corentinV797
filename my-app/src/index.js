import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './index.css';


class Table extends React.Component {
  render() {
    return (
      <table rules="column">
        <thead>
          <tr>
            <th>Name</th>
            <th>Unit value</th>
            <th>Quantity</th>
            <th>Total value</th>
            <th>Select</th>
          </tr>
          <Stock />
        </thead>
      </table> 
    );
  }
}

class Stock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "defaultname",
      value: 0,
      quantity: 0,
      totalvalue: 0,
      selected: "false",
    };
  }
  render() {
    return (
      <tr>
        <th>{this.state.name}</th>
        <th>{this.state.value}</th>
        <th>{this.state.quantity}</th>
        <th>{this.state.totalvalue}</th>
        <th>{this.state.selected}</th>
      </tr>
    );
  }
}

class Portfolio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id:null,
      name: null,
      total: 0,
      currency: "€",
    };
  }
  render() {
    return (

      <div className="portfolio">
        <div>{this.props.name}</div>
        <div>{this.props.id}</div>
        <button onClick={() => this.setState({currency:"€"})}>Show in €</button>
        <button onClick={() => this.setState({currency:"$"})}>Show in $</button>
        <button onClick={() => this.props.onClick(this.props.id)}>X</button>
        <div><Table /></div>
        <div>Total value of {this.state.name} : {this.state.total} {this.state.currency}</div>
        <button >Add stock</button>
        <button >Perf graph</button>
        <button >Remove selected</button>
      </div>
    );
  }
}




class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      isOpen: false,
      portList: [],
      count: 0,
    };
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  addPortFolio(n,i){    
    var newArray = this.state.portList
    newArray.push(<Portfolio id={i} name={n} onClick={() => this.delPortFolio(i)}/>)
    this.setState({portList:newArray})
    var c = this.state.count
    const y = c +1
    this.setState({count:y})
  }
  renderPF(){
    for (var i = 0; i < this.state.portList.length; i++) {
      return this.state.portList[i]
    }
  }
  delPortFolio(i){
    console.log(i)
    var newArray = this.state.portList
    for (var j = 0; j < newArray.length; j++) {
      if(newArray[j].props.id == i){
        newArray.splice(j,1)
      }
    }    
    this.setState({portList:newArray})
  }

  render() {
    return (
      <div className="page">
        <button onClick={() => this.addPortFolio("d",this.state.count)}> Add a Portfolio </button>        
        {this.state.portList.map(portfolio => <div> {portfolio} </div>)} 
        <button onClick={this.toggleModal}>
          Open the modal
        </button>

        <Modal show={this.state.isOpen}
          onClose={this.toggleModal}>
          Here's some content for the modal
        </Modal>
        <div>{this.state.count}</div>
      </div>
    );
  }
}


class Modal extends React.Component {
  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    // The gray background
    const backdropStyle = {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 50
    };

    // The modal "window"
    const modalStyle = {
      backgroundColor: '#fff',
      borderRadius: 5,
      maxWidth: 500,
      minHeight: 300,
      margin: '0 auto',
      padding: 30
    };

    return (
      <div className="backdrop" style={backdropStyle}>
        <div className="modal" style={modalStyle}>
          {this.props.children}

          <div className="footer">
            <button onClick={this.props.onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node
};

// ========================================

ReactDOM.render(
  <Page />,
  document.getElementById('root')
);
