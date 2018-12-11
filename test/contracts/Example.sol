pragma solidity ^0.4.9;

contract Example {

    event Deployed(address deployer);

    function Example() public {
        Deployed(msg.sender);
    }

    function add(uint128 a) public returns (uint128) {
        return uint128(a+5);
    }

}