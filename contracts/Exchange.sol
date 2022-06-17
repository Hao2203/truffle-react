// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "./MsgCoin.sol";

contract Exchange{
    struct Sale {
        address addr;
        uint price;
        uint256 tokenId;
    }

    struct Bid {
        address customer;
        uint pendingReturns;
        bytes32 blindedBid;
        uint deposit;
    }

    struct Auction {
        uint256 tokenId;
        address payable beneficiary;
        uint biddingEnd;
        uint  revealEnd;
        uint openingBid;
        bool ended;
        address highestBidder;
        uint highestBid;
        Bid[] bids;
    }

    Sale[] private Sales;
    address private Coin;
    Auction[] Auctions;    

    mapping(uint256 => uint256) private IndexOfSale;
    mapping(uint256 => bool) IsSale;
    mapping(uint256 => uint) private IndexOfAuction;
    //mapping(uint => Auction) Auctions;
    // 可以取回的之前的出价uint
    mapping(uint => mapping(address => uint)) IndexOfCustomer;

    modifier onlyBefore(uint _time) { require(block.timestamp < _time); _; }
    modifier onlyAfter(uint _time) { require(block.timestamp > _time); _; }

    event setSaled(uint256 _tokenId, uint price);
    event removeSaled(uint256 _tokenId);
    event finishSale(uint256 _tokenId, address from, address to);
    event AuctionEnded(address winner, uint highestBid);


    constructor (address _Coin){
        Coin = _Coin;
    }

    function getSaleIndex (uint256 _tokenId) public view returns (uint256) {
        require(IsSale[_tokenId]);
        return IndexOfSale[_tokenId];
    } 

    function setSale (uint256 _tokenId, uint _price) external returns (uint256) {
        require(
            MsgCoin(Coin).getApproved(_tokenId) == address(this) 
            || 
            MsgCoin(Coin).isApprovedForAll(msg.sender, address(this) ));
        require(MsgCoin(Coin).ownerOf(_tokenId) == msg.sender);
        require(IsSale[_tokenId] == false);
        Sale memory newSale;
        newSale.addr = MsgCoin(Coin).ownerOf(_tokenId);
        newSale.price = _price;
        newSale.tokenId = _tokenId;
        Sales.push(newSale);
        IndexOfSale[_tokenId] = Sales.length - 1;
        IsSale[_tokenId] = true;
        emit setSaled(_tokenId, _price);
        return IndexOfSale[_tokenId];
    }

    function removeSale (uint256 _tokenId) public {
        require(
            MsgCoin(Coin).getApproved(_tokenId) == address(this) 
            || 
            MsgCoin(Coin).isApprovedForAll(msg.sender, address(this) ));
        require(MsgCoin(Coin).ownerOf(_tokenId) == msg.sender);

        uint256 lastIndex = Sales.length - 1;
        uint256 SaleIndex = getSaleIndex(_tokenId);

        if(lastIndex != SaleIndex){
            Sale memory lastSale = Sales[lastIndex];

            Sales[SaleIndex] = lastSale;
            IndexOfSale[lastSale.tokenId] = SaleIndex;
        }
        delete IndexOfSale[_tokenId];
        Sales.pop();
        IsSale[_tokenId] = false;

        emit removeSaled(_tokenId);
    }

    function paySale (uint256 _tokenId) external payable {
        uint value = msg.value;
        Sale memory _Sale = Sales[getSaleIndex(_tokenId)];
        require(_Sale.price == value);
        address payable ap = payable(MsgCoin(Coin).ownerOf(_tokenId));
        MsgCoin(Coin).safeTransferFrom(MsgCoin(Coin).ownerOf(_tokenId), msg.sender, _tokenId);
        ap.transfer(value);
        uint256 lastIndex = Sales.length - 1;
        uint256 SaleIndex = getSaleIndex(_tokenId);

        if(lastIndex != SaleIndex){
            Sale memory lastSale = Sales[lastIndex];

            Sales[SaleIndex] = lastSale;
            IndexOfSale[lastSale.tokenId] = SaleIndex;
        }
        delete IndexOfSale[_tokenId];
        Sales.pop();
        IsSale[_tokenId] = false;

        emit finishSale(_tokenId, MsgCoin(Coin).ownerOf(_tokenId), msg.sender);
    }

    function getSaleByIndex (uint256 _index) external view returns (Sale memory) {
        return Sales[_index];
    }

    function setAuction (
        uint _biddingTime,
        uint _revealTime,
        uint _openingBid,
        address payable _beneficiary,
        uint256 _tokenId
    ) public {
        uint index = IndexOfAuction[_tokenId];
        require(
            MsgCoin(Coin).getApproved(_tokenId) == address(this) 
            || 
            MsgCoin(Coin).isApprovedForAll(msg.sender, address(this) ));
        require(MsgCoin(Coin).ownerOf(_tokenId) == msg.sender);
        require(IndexOfAuction[_tokenId] == 0);
        require(Auctions.length == 0 || Auctions[index].tokenId != _tokenId);
        Auction storage auc = Auctions.push();
        auc.tokenId = _tokenId;
        auc.beneficiary = _beneficiary;
        auc.biddingEnd = block.timestamp + _biddingTime;
        auc.revealEnd = auc.biddingEnd + _revealTime;
        auc.openingBid = _openingBid;
        IndexOfAuction[_tokenId] = Auctions.length - 1;
    }

    /// 可以通过 `_blindedBid` = keccak256(value, fake, secret)
    /// 设置一个秘密竞拍。
    /// 只有在出价披露阶段被正确披露，已发送的以太币才会被退还。
    /// 如果与出价一起发送的以太币至少为 “value” 且 “fake” 不为真，则出价有效。
    /// 将 “fake” 设置为 true ，然后发送满足订金金额但又不与出价相同的金额是隐藏实际出价的方法。
    function setBid(bytes32 _blindedBid, uint256 _tokenId)
        public
        payable
        onlyBefore(Auctions[IndexOfAuction[_tokenId]].biddingEnd)
    {
        uint index = IndexOfAuction[_tokenId];
        uint indexOfC = IndexOfCustomer[index][msg.sender];
        Auction storage Auc = Auctions[index];
        require(msg.value >= Auc.openingBid);
        if(Auc.bids.length == 0 || Auc.bids[indexOfC].customer != msg.sender){
            Bid storage bid = Auc.bids.push();
            bid.customer = msg.sender;
            bid.pendingReturns = 0;
            bid.blindedBid = _blindedBid;
            bid.deposit = msg.value;
            IndexOfCustomer[index][msg.sender] = Auc.bids.length - 1;

        }
        else if(Auc.bids[indexOfC].customer == msg.sender) {
            uint deposit = Auc.bids[indexOfC].deposit;
            Auc.bids[indexOfC].customer = msg.sender;
            Auc.bids[indexOfC].pendingReturns = 0;
            Auc.bids[indexOfC].blindedBid = _blindedBid;
            Auc.bids[indexOfC].deposit = deposit + msg.value;
        }
    }

    function reveal(
        uint _values,
        bool _fake,
        string memory _secret,
        uint256 _tokenId
    )
        public
        onlyAfter(Auctions[IndexOfAuction[_tokenId]].biddingEnd)
        onlyBefore(Auctions[IndexOfAuction[_tokenId]].revealEnd)
    {
        uint index = IndexOfAuction[_tokenId];
        uint indexOfC = IndexOfCustomer[index][msg.sender];
        Auction storage Auc = Auctions[index];
        Bid storage bid = Auc.bids[indexOfC];
        uint refund;
        (uint value, bool fake, string memory secret) =
                (_values, _fake, _secret);
        if (bid.blindedBid != keccak256(abi.encodePacked(value, fake, secret))) {
            // 出价未能正确披露
            // 不返还订金
            return;
        }
        refund += bid.deposit;
        if (!fake && bid.deposit >= value && Auc.openingBid <= value) {
            if (placeBid(msg.sender, value, _tokenId))
                refund -= value;
        }
        // 使发送者不可能再次认领同一笔订金
        bid.blindedBid = bytes32(0);
        payable(msg.sender).transfer(refund);
    }

    function placeBid(address bidder, uint value, uint256 _tokenId) internal
            returns (bool success)
    {
        uint index = IndexOfAuction[_tokenId];
        Auction storage Auc = Auctions[index];
        uint indexOfC = IndexOfCustomer[index][Auc.highestBidder];
        Bid storage bid = Auc.bids[indexOfC];
        if (value <= Auc.highestBid) {
            return false;
        }
        if (Auc.highestBidder != address(0)) {
            // 返还之前的最高出价
            bid.pendingReturns += Auc.highestBid;
        }
        Auc.highestBid = value;
        Auc.highestBidder = bidder;
        return true;
    }

    /// 取回出价（当该出价已被超越）
    function withdraw(uint256 _tokenId) internal {
        uint index = IndexOfAuction[_tokenId];
        //uint indexOfC = IndexOfCustomer[index][msg.sender];
        Auction storage Auc = Auctions[index];
        for(uint indexOfC = 0; indexOfC < Auc.bids.length; indexOfC++){
            Bid storage bid = Auc.bids[indexOfC];
            uint amount = bid.pendingReturns;
            if (amount > 0) {
                // 这里很重要，首先要设零值。
                // 因为，作为接收调用的一部分，
                // 接收者可以在 `transfer` 返回之前重新调用该函数。
                bid.pendingReturns = 0;
                payable(bid.customer).transfer(amount);
            }
        }      
    }

    /// 结束拍卖，并把最高的出价发送给受益人
    function auctionEnd(uint256 _tokenId)
        public
        onlyAfter(Auctions[IndexOfAuction[_tokenId]].revealEnd)
    {
        uint index = IndexOfAuction[_tokenId];
        require(msg.sender == Auctions[index].beneficiary);
        require(!Auctions[index].ended);
        emit AuctionEnded(Auctions[index].highestBidder, Auctions[index].highestBid);
        withdraw(_tokenId);
        Auctions[index].ended = true;
        Auctions[index].beneficiary.transfer(Auctions[index].highestBid);
        if(Auctions[index].highestBidder != address(0)){
            MsgCoin(Coin).safeTransferFrom(MsgCoin(Coin).ownerOf(_tokenId), Auctions[index].highestBidder, _tokenId);
        }
        removeAuction(_tokenId);

    }

    function getAuction(uint _index) public view returns (Auction memory) {
        return Auctions[_index];
    }

    function removeAuction(uint256 _tokenId) private {
        uint index = IndexOfAuction[_tokenId];
        //uint indexOfC = IndexOfCustomer[index][msg.sender];
        Auction storage Auc = Auctions[index];
        Bid[] storage bids = Auc.bids;
        uint lastIndex = Auctions.length - 1;

        for(uint i = 0; i < bids.length; i++){
            address addr = bids[i].customer;
            delete IndexOfCustomer[index][addr];
         }           

        if(lastIndex != index){
            Auction memory lastAuction = Auctions[lastIndex];
            Auctions[index] = Auctions[lastIndex];
            IndexOfAuction[lastAuction.tokenId] = index;
        }
        delete IndexOfAuction[_tokenId];
        Auctions.pop();
    }

    function getHash (uint value, bool fake, string memory secret) public pure returns (bytes32){
        return keccak256(abi.encodePacked(value, fake, secret));
    }

    function code (uint value, bool fake, string memory secret) public pure returns (bytes memory){
        return abi.encode(value, fake, secret);
    }

    function codeP (uint value, bool fake, string memory secret) public pure returns (bytes memory){
        return abi.encodePacked(value, fake, secret);
    }

    function getIndexOfAuction(uint256 _tokenId) public view returns (uint){
        return IndexOfAuction[_tokenId];
    }

}