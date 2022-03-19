// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./common/meta-transactions/RandomlyAssigned.sol";

contract FFWClubNFT is ERC721Tradable {
    // using Counters for Counters.Counter;
    // Counters.Counter private currentTokenId;
    
    enum SalePhase { LOCKED, PRESALE, PUBLICSALE }
    
    bytes32 public whitelistMerkleRoot; 
    bytes32 public airdropMerkleRoot; 
    bytes32 public teamMerkleRoot; 

    mapping(address => uint64) public teamCounter;
    mapping(address => uint64) public airdropCounter;
    mapping(address => uint64) public presaleCounter;
    mapping(address => uint64) public publicsaleCounter;

    uint64 totalTeamCounter;
    uint64 totalAirdropCounter;
    uint64 totalPresaleCounter;

    // set these limits as needed
    uint64 TOTAL_TEAM_RESERVE = 200;
    uint64 TOTAL_AIRDROP_RESERVE = 200;
    uint64 TOTAL_PRESALE_RESERVE = 2000;

    uint16 public MAX_PER_TEAM_ADDRESS = 20;
    uint16 public MAX_PER_AIRDROP_ADDRESS = 20;
    uint16 public MAX_PER_PRESALE_ADDRESS = 100;
    uint16 public MAX_PER_PUBLICSALE_ADDRESS = 500;

    SalePhase public phase = SalePhase.LOCKED;

    uint64 public MAX_SUPPLY = 10000;

	uint256 public mintPrice = 0.025 ether;

    string public baseURI = "";

    bool public metadataIsFrozen = false;
    bool public settingsIsFrezen = false;

    struct MintTypes {
		uint256 _numberOfAuthorMintsByAddress;
		uint256 _numberOfMintsByAddress;
	}
    

    constructor(address _proxyRegistryAddress, uint64 maxSupply)
        ERC721Tradable("Furry Fox Woodside Club", "FFWClub", _proxyRegistryAddress)
    {
        MAX_SUPPLY = maxSupply;
    }

    function setPhase(SalePhase _phase) public onlyOwner {
        require(uint8(_phase) > uint8(phase), "can only advance phases");
        phase = _phase;
    }

    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        require(!metadataIsFrozen, "Metadata is permanently frozen");
        baseURI = _baseURI;
    }

    /// Freezes the metadata
	/// @dev sets the state of `metadataIsFrozen` to true
	/// @notice permamently freezes the metadata so that no more changes are possible
	function freezeMetadata() external onlyOwner {
		require(!metadataIsFrozen, "Metadata is already frozen");
		metadataIsFrozen = true;
	}

    function freezeSettings() external onlyOwner {
		require(!settingsIsFrezen, "Settings is already frozen");
		settingsIsFrezen = true;
	}

    function _baseURI() internal override view virtual returns (string memory) {
        return baseURI;
    }

    function setLimits(uint16 teamLimit, uint16 airdropLimit, uint16 preSaleLimit, 
    uint16 publicSaleLimit, uint64 totalTeamReserve, uint64 totalAirdropReserve, uint64 totalPresaleReserve) public onlyOwner {
        require(!settingsIsFrezen, "Settings are permanently frozen");
        MAX_PER_TEAM_ADDRESS = teamLimit;
        MAX_PER_AIRDROP_ADDRESS = airdropLimit;
        MAX_PER_PRESALE_ADDRESS = preSaleLimit;
        MAX_PER_PUBLICSALE_ADDRESS = publicSaleLimit;
        TOTAL_TEAM_RESERVE = totalTeamReserve;
        TOTAL_AIRDROP_RESERVE = totalAirdropReserve;
        TOTAL_PRESALE_RESERVE = totalPresaleReserve;
    }

    function setMerkleRoots(bytes32 _teamRoot, bytes32 _airdropRoot, bytes32 _whitelistRoot) public onlyOwner {
        setTeamMerkleRoot(_teamRoot);
        setAirdropMerkleRoot(_airdropRoot);
        setWhitelistMerkleRoot(_whitelistRoot);
    }

    function setWhitelistMerkleRoot(bytes32 _root) public onlyOwner {
        whitelistMerkleRoot = _root; 
    }  

    function setAirdropMerkleRoot(bytes32 _root) public onlyOwner {
        airdropMerkleRoot = _root; 
    }  

    function setTeamMerkleRoot(bytes32 _root) public onlyOwner {
        teamMerkleRoot = _root; 
    }  

    function _verifyMerkleLeaf(  
        bytes32 _merkleRoot,  
        bytes32[] memory _merkleProof ) internal view returns (bool) {  
            bytes32 leaf = keccak256(abi.encodePacked(_msgSender()));
            require(MerkleProof.verify(_merkleProof, _merkleRoot, leaf), "Incorrect proof");
            return true; // Or you can mint tokens here
    }

    function _validatePresale() internal view {
        require(phase == SalePhase.PRESALE, "Contract not in presale phase");
    }

    function mintToTeam(bytes32[] memory _merkleProof, uint64 count) public {
        require(teamCounter[_msgSender()] + count <= MAX_PER_TEAM_ADDRESS, "You are exceeding limit per wallet");
        require(totalTeamCounter + count <= TOTAL_TEAM_RESERVE, "you are exceeding total team limit");
        teamCounter[_msgSender()] += count;
        totalTeamCounter += count;
        _mintWhitelist(teamMerkleRoot, _merkleProof, count);
    }

    function mintAirdrop(bytes32[] memory _merkleProof, uint64 count) public {
        require(airdropCounter[_msgSender()] + count <= MAX_PER_AIRDROP_ADDRESS, "You are exceeding limit per wallet");
        require(totalAirdropCounter + count <= TOTAL_AIRDROP_RESERVE, "you are exceeding total airdrop limit");
        airdropCounter[_msgSender()] += count;
        totalAirdropCounter += count;
        _mintWhitelist(airdropMerkleRoot, _merkleProof, count);
    }
    
    function mintPresale(bytes32[] memory _merkleProof, uint64 count) public {
        require(presaleCounter[_msgSender()] + count <= MAX_PER_PRESALE_ADDRESS, "You are exceeding limit per wallet");
        require(totalPresaleCounter + count <= TOTAL_PRESALE_RESERVE, "you are exceeding total presale limit");
        presaleCounter[_msgSender()] += count;
        totalPresaleCounter += count;
        _mintWhitelist(whitelistMerkleRoot, _merkleProof, count);
    }

    function _mintWhitelist(bytes32 root, bytes32[] memory proof, uint64 count) internal {
        _validatePresale();
        require(     
        _verifyMerkleLeaf(      
            root,
            proof
        ), "Invalid proof");

        _mint(_msgSender(), count);
    }

    function _mint(address _to, uint64 quantity) internal {
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Supply exceeding");
        _safeMint(_to, quantity);
    }
    
    function mintTo(address _to, uint64 count) public
        validateEthPayment(count)
        payable {
        require(phase == SalePhase.PUBLICSALE, "Contract is not yet open for public sale");
        require(publicsaleCounter[_msgSender()] + count <= MAX_PER_PUBLICSALE_ADDRESS, "You are exceeding max limit per wallet");
        publicsaleCounter[_msgSender()] += count;
        _mint(_to, count);
    }

    function disbursePayments(
		address[] memory payees_,
		uint256[] memory amounts_
	) external onlyOwner {
	    require(payees_.length == amounts_.length,
			"Payees and amounts length mismatch"
		);
		for (uint256 i; i < payees_.length; i++) {
			makePaymentTo(payees_[i], amounts_[i]);
		}
    }

    /// Make a payment
	/// @dev internal fn called by `disbursePayments` to send Ether to an address
	function makePaymentTo(address address_, uint256 amt_) private {
		(bool success, ) = address_.call{value: amt_}("");
		require(success, "Transfer failed.");
	}

    /// Modifier to validate Eth payments on payable functions
	/// @dev compares the product of the state variable `_mintPrice` and supplied `count` to msg.value
	/// @param count factor to multiply by
	modifier validateEthPayment(uint256 count) {
		require(
			mintPrice * count <= msg.value,
			"Ether value sent is not correct"
		);
        _;
	}
}