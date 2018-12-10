pragma solidity ^0.4.9;

contract Simple {
    uint128 public num = 5;

    function addToNum(uint128 a) public returns (uint128) {
        return num + a;
    }

    function setNum(uint128 a) public {
        num = a;
    }
}