pragma solidity ^0.4.9;

contract WithParams {

    uint128 data;

    event Stored(uint128 theData);

    function WithParams(uint128 _toStore) public {
        data = _toStore;
        Stored(data);
    }
}