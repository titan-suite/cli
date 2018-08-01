pragma solidity ^0.4.9;

contract Owned {

    address owner;

    function Owned() public {
        owner = msg.sender;
    }
}

contract Many is Owned {

    string creator;

    event Log(address _owner, string _creator);

    function Many(string _name) public {
        creator = _name;
        Log(owner, creator);
    }
}