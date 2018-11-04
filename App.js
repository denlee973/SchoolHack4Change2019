import React, { Component } from 'react';
import logo from './LOGO.jpg';
import './App.css';
// Import the web3 library
import Web3 from 'web3'

// Material UI
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { BrowserRouter, Route, Link } from 'react-router-dom'

// Import build Artifacts
import clearContractArtifacts from './build/contracts/SmartContractFairTrade.json'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      balance: null,
      balanceDisplay: 0,
      amount: 0,
      amountAbove: false,
      availableAccounts: [],
      defaultAccount: 0,
      ethBalance: 0,
      rate: 1,
      tokenBalance: 0,
      tokenSymbol: 0,
      transferAmount: '',
      transferUser: '',
      clearContract: null, // token contract
    }
  }

  componentDidMount() {
    // Create a web3 connection
    this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    if (this.web3.isConnected()) {
      this.web3.eth.getAccounts((err, accounts) => {
        const defaultAccount = this.web3.eth.accounts[0]
        // Append all available accounts
        for (let i = 0; i < accounts.length; i++) {
          this.setState({
            availableAccounts: this.state.availableAccounts.concat(
              <MenuItem value={i} key={accounts[i]} primaryText={accounts[i]} />
            )
          })
        }

        this.web3.version.getNetwork(async (err, netId) => {
          // Create a reference object to the deployed token contract
          if (netId in clearContractArtifacts.networks) {
            const clearAddress = clearContractArtifacts.networks[netId].address
            const clearContract = this.web3.eth.contract(clearContractArtifacts.abi).at(clearAddress)
            this.setState({ clearContract })
            console.log(clearContract)

            this.loadEventListeners()
          //   this.loadAccountBalances(defaultAccount)
          }
        })
      })
    }
  }

  /**
   * Load the accounts token and ether balances.
   * @param  {Address} account The user's ether address.
   */
  loadAccountBalances(account) {
    if (this.state.token) {
      // Set token balance below
      this.state.token.balanceOf(account, (err, balance) => {
        this.setState({ tokenBalance: balance.toNumber() })
      })

      // Set ETH balance below
      this.web3.eth.getBalance(account, (err, ethBalance) => {
        this.setState({ ethBalance })
      })
    }
  }

  // Create listeners for all events.
  loadEventListeners() {
    // Watch tokens transfer event below
    this.state.clearContract.SalaryPlaced({ fromBlock: 'latest', toBlock: 'latest' })
    .watch((err, emittedEvent) => {
      console.log(emittedEvent)
      console.log(emittedEvent.args.amount.toNumber())
    })

    this.state.clearContract.SalaryClaimed({ fromBlock: 'latest', toBlock: 'latest' })
    .watch((err, emittedEvent) => {
      console.log(emittedEvent)
    })
  }

  // Buy new tokens with eth
  placeSalary(amount) {
    if (this.state.amount< 0.76){
      alert("Below minimum wage!")
    }
    else{
      this.state.clearContract.placeSalary({
        from: this.web3.eth.accounts[0],
        value: amount
      }, (err, txHash) => {
        console.log(txHash)
      })
    }
  }

  claimSalary() {
    this.state.clearContract.claimSalary({
      from: this.web3.eth.accounts[2],
    }, (err, txHash) => {
      console.log(err)
      console.log(txHash)
    })
  }

  async checkBalance() {
    const balance = await this.state.clearContract.checkBalance()
    console.log(balance.toNumber())
    this.setState({balance: balance.toNumber()});
    //return balance.toNumber()
  }

  // When a new account in selected in the available accounts drop down.
  handleDropDownChange = (event, index, defaultAccount) => {
    this.setState({ defaultAccount })
    // this.loadAccountBalances(this.state.availableAccounts[index].key)
    }

  render() {
    
    const admin = (<div>
      <Link to={'employee'}>
          <RaisedButton label=">>> Employee" secondary={true} fullWidth={true}/>
        </Link>

      <h3>Administrator Account</h3>
      <DropDownMenu maxHeight={300} width={500} value={this.state.defaultAccount} onChange={this.handleDropDownChange}>
        {this.state.availableAccounts}
      </DropDownMenu>
      <div>

        <br />
      
        <h3>Employees</h3>
        <div className="container">
            <form>
                <label>
                  <input type="radio" name="employee" value="1" checked={true} />
                  Rob
                </label>
                <label>
                  <input type="radio" name="employee" value="2" />
                  Jane
                </label>
                <label>
                  <input type="radio" name="employee" value="3" />
                  Kim Thuy
                </label>
            </form>
        </div>

        <TextField 
          floatingLabelText="Monthly Wage." 
          style={{width: 200}} 
          value={this.state.amount}
          onChange={(e, amount) => {this.setState({ amount })}} 
          error={this.state.amount< 0.76 ? "true" : "false"} 
          helperText={this.state.amount< 0.76 ? "Below minimum wage!" : ""}
        />

        <RaisedButton label="Place Salary" labelPosition="before" primary={true}
          onClick={() => this.placeSalary(this.state.amount)}/>
        
        <br/>

        <RaisedButton label="Contract Balance" labelPosition="before" primary={true}
          onClick={() => this.checkBalance()}/>
        <p>{this.state.balance}</p>
      </div>
      <br/>

      <RaisedButton label="Help" labelPosition="after" primary={true}
          onClick={()=> this.checkBalance()}/>
      <br/>
    </div>)

    const employee = (<div>
        <Link to={'/'}>
          <RaisedButton label=">>> Admin" secondary={true} fullWidth={true}/>
        </Link>

      <h3>Employee Account Number {this.state.availableAccounts[2]}</h3>

      <div>


        <RaisedButton label="Show Contract Balance" labelPosition="before" primary={true}
          onClick={() => {this.checkBalance()}}
        />
      </div>
      <p>{this.state.balance}</p>
      <br />
      <div>

        <RaisedButton label="Claim Salary" labelPosition="before" primary={true}
          onClick={() => this.claimSalary()}
        />
      </div>
    </div>)


    return (
      <MuiThemeProvider>
        <BrowserRouter>
          <div className="App">
            <header className="App-header">
              <img src={logo} alt="logo" style={{height: '350px', width: '350px',align:'left'}}/>
            </header>
            <Route exact={true} path="/" render={() => admin}/>
            <Route exact={true} path="/employee" render={() => employee}></Route>
            
          </div>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default App;
