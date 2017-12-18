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
      selected: false,
    };
  }

  render() {
    return (
      <tr >
        <td align= "center">{this.props.name}</td>
        <td align= "center">{this.props.value}</td>
        <td align= "center">{this.props.quantity}</td>
        <td align= "center">{this.props.totalvalue}</td>        
        <td align= "center"><input type="checkbox" checked={this.props.selected} onChange={() => this.props.onChange(this.props.idStock)}/></td>               
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
      currencyValue: null,
    };
  }

  getCurrencyValue(){
    var that = this
    var client = new XMLHttpRequest();
    client.open("GET", "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=AABZ5Q20J049KTFZ", true);
    client.onreadystatechange = function() {
      if(client.readyState === 4) {
        var obj = JSON.parse(client.responseText);
        console.log(obj["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
        var curr = obj["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
        that.setState({currencyValue:curr})
      };
    };
    client.send();
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
    if(this.state.currency === "€"){
      v = v * this.state.currencyValue
      t = v * q
    }
    var f = this.state.countP
    newArray.push(<Stock key={this.state.countP} idStock={this.state.countP} name={n} quantity={q} value={v} totalvalue={t} selected={false} onChange={() => this.selectStock(f)}/>)
    this.setState({stocklist:newArray}, function() {
      var c = this.state.countP
      const y = c +1
      this.setState({countP:y})
      this.getTotal()
    })

  }

  test(a,c,n,q,v,t,s,that){
    return function(){
      a.push(<Stock key={c} idStock={c} name={n} quantity={q} value={v} totalvalue={t} selected={s} onChange={() => that.selectStock(c)}/>)
    }
  }

  selectStock(idq){
    var func
    var newArray = this.state.stocklist
    var j
    for (var i = 0; i < this.state.stocklist.length; i++) {
      if(this.state.stocklist[i].props.idStock === idq){
        var f = this.state.countP
        func = this.test(newArray,this.state.countP,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,this.state.stocklist[i].props.value,this.state.stocklist[i].props.totalvalue,!this.state.stocklist[i].props.selected,this)
        j=i
      }
    }
    func()
    newArray.splice(j,1)
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

  removeSelected(){
    var funcs =[]
    var newArray = []
    var counter = this.state.countP
    for (var i = 0; i < this.state.stocklist.length; i++) {    
      if(!this.state.stocklist[i].props.selected){
        var f = counter
        funcs.push(this.test(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,this.state.stocklist[i].props.value,this.state.stocklist[i].props.totalvalue,this.state.stocklist[i].props.selected,this))        
      }
      counter++  
    }
    for (var j = 0; j < funcs.length; j++) {
      funcs[j]()
    }
    this.setState({stocklist:newArray},function(){
      this.setState({countP:counter}) 
      this.getTotal()
    })
  }

  refresh(){
    this.getCurrencyValue()
    console.log("yo")
  }

  getTotal(){
    var res=0
    for (var i = 0; i < this.state.stocklist.length; i++) {
      res = res + this.state.stocklist[i].props.totalvalue
    }
    this.setState({total:res})  
  }

  changeToEuro(){
    if(this.state.currency === "$"){
      this.setState({currency:"€"})
      var newArray = []
      var funcs =[]
      var counter = this.state.countP
      for (var i = 0; i < this.state.stocklist.length; i++) {
        var newV = this.state.stocklist[i].props.value * this.state.currencyValue
        var newTotal = newV * this.state.stocklist[i].props.quantity
        var f = counter
        funcs.push(this.test(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,newV,newTotal,this.state.stocklist[i].props.selected,this))
        counter++     
      }
      for (var t = 0; t < funcs.length; t++) {
        funcs[t]()
      }
      this.setState({stocklist:newArray},function(){
        this.setState({countP:counter}) 
        this.getTotal()
      })
    }
  }

  changeToDollar(){
    if(this.state.currency === "€"){
      this.setState({currency:"$"})
      var newArray = []
      var funcs =[]
      var counter = this.state.countP
      for (var i = 0; i < this.state.stocklist.length; i++) {
        var newV = this.state.stocklist[i].props.value / this.state.currencyValue
        var newTotal = newV * this.state.stocklist[i].props.quantity
        var f = counter
        funcs.push(this.test(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,newV,newTotal,this.state.stocklist[i].props.selected,this))
        counter++     
      }
      for (var t = 0; t < funcs.length; t++) {
        funcs[t]()
      }
      this.setState({stocklist:newArray},function(){
        this.setState({countP:counter}) 
        this.getTotal()
      })
    }
  }



  componentDidMount(){
    this.getCurrencyValue()
  }



  render() {
    console.log(this.state.stocklist)
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
        <button onClick={() => this.changeToDollar()}>Show in $</button>
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
        <button onClick={() => this.removeSelected()}>Remove selected</button>
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
