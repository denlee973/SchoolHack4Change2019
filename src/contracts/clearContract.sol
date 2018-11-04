pragma solidity 0.4.24;

contract SmartContractFairTrade{
    address public  admin_;
    address public employee_;
    uint256 unlockTime_;
    mapping(address => uint256) public monthlyWage_;

    event SalaryPlaced(uint256 unlockTime, uint256 amount);
    event SalaryClaimed(uint256 amount);
  
    constructor (address _admin, address _employee) public {
          employee_ = _employee;
          admin_ = _admin;
    }
    
    function placeSalary() external payable {
        monthlyWage_[msg.sender] = msg.value;
        unlockTime_ = now + 20 seconds;
       
        emit SalaryPlaced(unlockTime_, msg.value);
    }
    
    function checkBalance() view returns(uint256) {
        return this.balance;
    }
    
    function claimSalary() external payable {
        require(msg.sender == employee_);
        require(now >= unlockTime_, "You are too soon");
        msg.sender.transfer(this.balance);
        emit SalaryClaimed(msg.value);
    }
}