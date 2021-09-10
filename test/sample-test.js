const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NFTMarket', function () {
  it('Should create and execute market sales', async function () {
    const Market = await ethers.getContractFactory('Market');
    const market = await Market.deploy();
    await market.deployed();

    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory('NFT');
    const nft = await NFT.deploy(marketAddress);

    const nftContractAddress = nft.address;
    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits('100', 'ether');
    await nft.createToken('https://lewiskori.com');
    await nft.createToken('https://lewiskori2.com');


    await market.createMarketItem(
      nftContractAddress,
      1,
      auctionPrice,
      { value: listingPrice }
    );
    await market.createMarketItem(
      nftContractAddress,
      2,
      auctionPrice,
      { value: listingPrice }
    );

    const [_, buyerAddress] = await ethers.getSigners();

    await market
      .connect(buyerAddress)
      .createMarketSale(nftContractAddress, 1, { value: auctionPrice });
    const items = await market.fetchMarketItems();
    console.log('🚀 ~ file: sample-test.js ~ line 44 ~ items', items);
  });
});
