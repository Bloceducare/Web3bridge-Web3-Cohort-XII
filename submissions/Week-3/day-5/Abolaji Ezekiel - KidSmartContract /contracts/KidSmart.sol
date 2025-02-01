// SPDX-License-Identifier: MIT
pragma solidity 0.8;



contract KidSmart{
    address Owner;

    constructor(){
        Owner = msg.sender;
    }

    modifier owner{
        require(msg.sender==Owner,"You are not authorized");
        _;
    }

    struct Kids{
        address payable  wallet;
        string firstName;
        string lastName;
        uint256 amount;
        uint256 time;
        bool canWithdraw;

    }

    Kids[] public kid;

    function balanceof() public view returns(uint256){
        return address(this).balance;
    }

    function addKid(address payable  _wallet,string memory _firstName,string memory _lastName,uint256 _amount,uint256 _time,bool _canWithdraw) public owner {

                kid.push(Kids(_wallet,_firstName,_lastName,_amount,_time,_canWithdraw));


    }


    function transfer(address payable _kidwalletaddress) public owner payable {
        uint256 i = getIndex(_kidwalletaddress);

        require(i!=999,"This not a valid kid wallet address");
        
        getkidaddress(_kidwalletaddress);



}
    function withdraw(address payable _kidwallet) public payable {
    uint256 i = getIndex(_kidwallet);
    require(i != 999, "You are not a kid");
    bool status = canwithdraw(_kidwallet);


    require(status, "You are not eligible to withdraw yet");

    kid[i].wallet.transfer(kid[i].amount);



}

    function canwithdraw(address payable _kidwallet) public view returns (bool){
        uint256 i = getIndex(_kidwallet);

        require(i != 999, "You are not a kid");

      

        if(kid[i].time<block.timestamp){
                return  false;
        }
        else return true;



    }

    function getIndex(address _kidwallet) private view returns(uint256){
        for(uint256 i;i<kid.length;i++){
            if(kid[i].wallet==_kidwallet){
                return i;
            }
        }   return 999;
    }

    function getkidaddress(address _kidwalletaddress) internal{
        for(uint i = 0;i<kid.length;i++){
            if(kid[i].wallet == _kidwalletaddress){
                kid[i].amount += msg.value;
            }
        }
    }




}