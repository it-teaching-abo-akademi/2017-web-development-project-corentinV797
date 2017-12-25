import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
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
      isOpen: false,
    };
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <tr >
        <td align= "center">{this.props.name}</td>
        <td align= "center">{this.props.value}</td>
        <td align= "center">{this.props.quantity}</td>
        <td align= "center">{this.props.totalvalue}</td>        
        <td align= "center"><input type="checkbox" checked={this.props.selected} onChange={() => this.props.onChange(this.props.idStock)}/></td>
        <td align= "center"><button onClick={() => this.toggleModal()}>Show</button></td>
        <Modal stockname={this.props.name} show={this.state.isOpen}
          onClose={this.toggleModal}>
          Here's some content for the modal
        </Modal>               
      </tr>

    );
  }
}

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stockname: null,
      data: [],
      minDateAvailable: null,
      maxDateAvailable: null,
      firstDate: null,
      secondDate: null,
    };
  }
  handleChangeF(event) {
    this.setState({firstDate: event.target.value});
  }

  handleChangeS(event) {
    this.setState({secondDate: event.target.value});
  }

  getData() {
    this.setState({show:false})
    var client = new XMLHttpRequest();
    var that = this

    client.open("GET", "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + this.props.stockname + "&apikey=AABZ5Q20J049KTFZ", true);
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

        var date = []
        var res = []
        for (t in temp){
            const val = temp[t]["4. close"]
            res.push(val)
            date.push(t)
          count++
        }
        count =0
        that.buildData(res,date)
      };
    };
    client.send();
  }

  buildData(v,d){
    var res = []
    this.setState({minDateAvailable:d[d.length-1]})
    this.setState({maxDateAvailable:d[0]})

    var f = d.length-1
    var s = 0

    if(this.state.firstDate !== null && this.state.secondDate !== null){
      for (var i = v.length-1; i >= 0; i--) {
        if(d[i] === this.state.firstDate){
          f = i
        }
        if(d[i] === this.state.secondDate){
          s = i
        }
      }
    }
    for (var i = f; i >= s; i--) {
      res.push({name: d[i], [this.props.stockname]:parseFloat(v[i])})
    }

    this.setState({data:res})
  }

  componentDidMount(){
    this.getData()
  }

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
      maxWidth: 1500,
      minHeight: 600,
      margin: '0 auto',
      padding: 30
    };


    return (
      <div className="backdrop" style={backdropStyle}>
        <div className="modal" style={modalStyle}>


          <input type="date" name="bday" value={this.state.firstDate} onChange={this.handleChangeF.bind(this)} min={this.state.minDateAvailable} max={this.state.maxDateAvailable}/>
          <input type="date" name="bday" value={this.state.secondDate} onChange={this.handleChangeS.bind(this)} min={this.state.minDateAvailable} max={this.state.maxDateAvailable}/>      

          <button onClick={() => this.getData()}> Plot </button>
          <br/>
          <br/>

          <LineChart width={1400} height={600} data={this.state.data}
                margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend />
            <Line type="monotone" dataKey={this.props.stockname} stroke="#8884d8" activeDot={{r: 8}}/>
          </LineChart>

          <div className="footer">
            <button class="cl" onClick={this.props.onClose}>
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
};

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

  addf(a,c,n,q,v,t,s,that){
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
        func = this.addf(newArray,this.state.countP,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,this.state.stocklist[i].props.value,this.state.stocklist[i].props.totalvalue,!this.state.stocklist[i].props.selected,this)
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

  removeSelected(){
    var funcs =[]
    var newArray = []
    var counter = this.state.countP
    for (var i = 0; i < this.state.stocklist.length; i++) {    
      if(!this.state.stocklist[i].props.selected){
        funcs.push(this.addf(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,this.state.stocklist[i].props.value,this.state.stocklist[i].props.totalvalue,this.state.stocklist[i].props.selected,this))        
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
        funcs.push(this.addf(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,newV,newTotal,this.state.stocklist[i].props.selected,this))
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
        funcs.push(this.addf(newArray,counter,this.state.stocklist[i].props.name,this.state.stocklist[i].props.quantity,newV,newTotal,this.state.stocklist[i].props.selected,this))
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
    return (
      <div className="portfolio">
        <div>{this.props.name}</div>
        {this.state.show &&
        <div >
          <input type="text" placeholder="Stock name" value={this.state.pname} onChange={this.handleChangeN.bind(this)} />
          <input type="text" placeholder="Quantity" value={this.state.pquantity} onChange={this.handleChangeQ.bind(this)} />     
          <button onClick={() => this.add(this.state.pname,this.state.pquantity)}>Validate</button>
        </div>

        }

        <button onClick={() => this.changeToEuro()}>Show in €</button>
        <button onClick={() => this.changeToDollar()}>Show in $</button>
        <button onClick={() => this.refresh()}>Refresh</button>
        <button class="bt" onClick={() => this.props.onClick(this.props.id)}>X</button>
        <table width = "500">
          <thead>
            <tr>
              <th>Name</th>
              <th>Unit value</th>
              <th>Quantity</th>
              <th>Total value</th>
              <th>Select</th>
              <th>Graph</th>
            </tr>
          </thead>
          <tbody>          
            {this.state.stocklist} 
          </tbody>
        </table> 
        <div>Total value of {this.props.name} : {this.state.total} {this.state.currency}</div>
        {this.state.stocklist.length < 50 &&
        <button onClick={() => this.setState({show:true})}>Add stock</button>}
        <button onClick={() => this.removeSelected()}>Remove selected</button>
      </div>
    );
  }
}




class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      portList: [],
      count: 0,
      value: '',
      show: false,
    };
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
      <div>
        {this.state.portList.length < 10 &&
        <button onClick={() => this.setState({show:true}) }> Add a Portfolio </button>}
        {this.state.show &&
          <div>
            <input type="text" placeholder="Portfolio name" value={this.state.value} onChange={this.handleChange.bind(this)} />     
            <button onClick={() => this.addPortFolio(this.state.value,this.state.count)}>Validate</button>
          </div>
        }
        <div className="portfoliopanel">    
          {this.state.portList.slice(0,3).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
        <br/><br/>
        <div className="portfoliopanel">    
          {this.state.portList.slice(3,6).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
        <br/><br/>
        <div className="portfoliopanel">    
          {this.state.portList.slice(6,9).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
        <br/><br/>
        <div className="portfoliopanel">    
          {this.state.portList.slice(9).map(portfolio => <div key={portfolio.props.id}> {portfolio} </div>)}
        </div>
      </div>
    );
  }
}


class App extends React.Component {
  render() {
    return (
      <div>
        <Page />
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
