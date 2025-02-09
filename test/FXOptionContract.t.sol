import "forge-std/Test.sol";
import "src/FXOptionContract.sol";

contract FXOptionContractTest is Test {
    FXOptionContract fxOption;
    address buyer = address(0x123);

    function setUp() public {
        fxOption = new FXOptionContract();
    }

    receive() external payable {} // 👈 Allows contract to receive ETH

    function testWithdrawFunds() public {
        uint256 optionPrice = 1 ether;
        vm.deal(buyer, 2 ether); // Give the buyer funds

        // Buyer purchases an option
        vm.prank(buyer);
        fxOption.buyOption{value: optionPrice}("call", optionPrice);

        // Ensure contract has received funds
        assertEq(address(fxOption).balance, optionPrice, "Contract should have funds before withdrawal");

        // Ensure owner withdraws funds
        vm.prank(address(this));
        fxOption.withdrawFunds();

        // Verify contract balance is now zero
        assertEq(address(fxOption).balance, 0, "Contract balance should be 0 after withdrawal");
    }
}
