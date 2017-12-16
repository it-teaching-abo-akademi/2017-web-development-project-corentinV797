import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './index.css';




class Stock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      idStock:null,
      name: null,
      value: 0,
      quantity: 0,
      totalvalue: 0,
      selected: "false",
    };
  }

  render() {
    return (
      <tr >
        <td align= "center">{this.props.name}</td>
        <td align= "center">{this.props.value}</td>
        <td align= "center">{this.props.quantity}</td>
        <td align= "center">{this.props.totalvalue}</td>
        <td align= "center">{this.state.selected}</td>
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
      currency: "$",
      stocklist: [],
      countP: 0,
      pname: '',
      pquantity: '',
      show: false,
    };
  }

  add(n,q){
    this.setState({show:false})
    var that = this
    var client = new XMLHttpRequest();
    client.open("GET", "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + n +"&interval=1min&apikey=AABZ5Q20J049KTFZ", true);
    client.onreadystatechange = function() {
      if(client.readyState === 4) {
        var obj = JSON.parse(client.responseText)
        var count = 0
        var t
        for (t in obj){
          if (count === 1) {
            var temp = obj[t]
          }
          count++   
        }
        count = 0

        for (t in temp){
          if(count === 0){
            const val = temp[t]["4. close"]
            const tot = val * q
            that.addStock(n,q,val,tot)
          }count++
        }
        count =0
      };
    };
    client.send();
  }


  addStock(n,q,v,t){     
    var newArray = this.state.stocklist
    newArray.push(<Stock key={this.state.countP} idStock={this.state.countP} name={n} quantity={q} value={v} totalvalue={t}/>)
    this.setState({stocklist:newArray})
    var c = this.state.countP
    const y = c +1
    this.setState({countP:y})
    this.getTotal()
  }

  handleChangeN(event) {
    this.setState({pname: event.target.value});
  }
  handleChangeQ(event) {
    this.setState({pquantity: event.target.value});
  }

  Wrapper(callback,that) {    
        var value;
        this.set = function(v) {
            value = v;
            callback(this,that);
        }
        this.get = function() {
            return value;
        }  
  }

  callback(wrapper,that) {
    //console.log(that)
    //that.addStock(that.state.stocklist[0].props.name,that.state.stocklist[0].props.quantity+1,that.state.stocklist[0].props.value,that.state.stocklist[0].props.totalvalue); //get lines when url value is defined
    that.getTotal()
  }



  refresh(){
    var that = this
    var url = new this.Wrapper(this.callback,that)
    var a = this.state.stocklist
    /*var n = []
    var co= this.state.countP
    for (var i = 0; i < a.length; i++) {
      n.push(<Stock key={co} idStock={co} name={a[i].props.name} quantity={a[i].props.quantity} value={a[i].props.value+1} totalvalue={a[i].props.totalvalue}/>)      
      co ++
    }
    this.setState({countP:co})
    this.setState({stocklist:n})*/


    var client = new XMLHttpRequest();
    client.open("GET", "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + "AAPL" + "&interval=1min&apikey=AABZ5Q20J049KTFZ", true);
    client.onreadystatechange = function() {
      if(client.readyState === 4) {
        var obj = JSON.parse(client.responseText);
        var count = 0;
        var t;
        for (t in obj){
          if (count === 1) {
            var temp = obj[t]
          }
          count++ 
        }
        count = 0

        for (t in temp){
          if(count === 0){
            console.log(temp[t]["4. close"])            
            url.set(1)
          }count++
        }
        count =0
      };
    };
    client.send();
 }

  getTotal(){
    var res=0
    for (var i = 0; i < this.state.stocklist.length; i++) {
      res = res + this.state.stocklist[i].props.totalvalue
    }
    this.setState({total:res})  
  }

  changeToEuro(){
    if (this.state.currency === "$") {
      this.setState({currency:"€"})
      var newArray = []
      var a = this.state.stocklist
      for (var i = 0; i < a.length; i++) {
        var newV = a[i].props.value * 0.8
        var newT = newV * a[i].props.quantity
        newArray.push(<Stock key={this.state.countP} idStock={this.state.countP} name={a[i].props.name} quantity={a[i].props.quantity} value={newV} totalvalue={newT}/>)
        var c = this.state.countP
        const y = c +1
        this.setState({countP:y})       
      }
      this.setState({stocklist:newArray},function(){
        this.getTotal();
      })     
    }
  }

  render() {
    return (
      <div className="portfolio">
        <div>{this.props.name}</div>
        {this.state.show &&
        <div >
          <input type="text" value={this.state.pname} onChange={this.handleChangeN.bind(this)} />
          <input type="text" value={this.state.pquantity} onChange={this.handleChangeQ.bind(this)} />     
          <button onClick={() => this.add(this.state.pname,this.state.pquantity)}>Validate</button>
        </div>

        }

        <button onClick={() => this.changeToEuro()}>Show in €</button>
        <button onClick={() => this.setState({currency:"$"})}>Show in $</button>
        <button onClick={() => this.refresh()}>Refresh</button>
        <button onClick={() => this.props.onClick(this.props.id)}>X</button>
        <table width = "500">
          <thead>
            <tr>
              <th>Name</th>
              <th>Unit value</th>
              <th>Quantity</th>
              <th>Total value</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>          
            {this.state.stocklist} 
          </tbody>
        </table> 
        <div>Total value of {this.state.name} : {this.state.total} {this.state.currency}</div>
        <button onClick={() => this.setState({show:true})}>Add stock</button>
        <button onClick={() => this.refresh()}>Perf graph</button>
        <button>Remove selected</button>
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
      value: '',
      show: false,
    };
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  addPortFolio(n,i){     
    var newArray = this.state.portList
    newArray.push(<Portfolio id={i} name={n} onClick={() => this.delPortFolio(i)}/>)
    this.setState({portList:newArray})
    var c = this.state.count
    const y = c +1
    this.setState({count:y})
    this.setState({show:false})
  }


  delPortFolio(i){
    var newArray = this.state.portList
    for (var j = 0; j < newArray.length; j++) {
      if(newArray[j].props.id === i){
        newArray.splice(j,1)
      }
    }    
    this.setState({portList:newArray})
  }


  render() {
    return (
      <div >

        <button onClick={() => this.setState({show:true}) }> Add a Portfolio </button>
        {this.state.show &&
        <div>
          <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />     
          <button onClick={() => this.addPortFolio(this.state.value,this.state.count)}>Validate</button>
        </div>
        }


        <div className="portfoliopanel">      
          {this.state.portList.map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)} 
        </div>
          <button onClick={this.toggleModal}>
            Open the modal
          </button>

          <Modal show={this.state.isOpen}
            onClose={this.toggleModal}>
            Here's some content for the modal
          </Modal>
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
