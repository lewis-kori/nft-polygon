import { Box, Flex, Grid, Heading, Img, Text } from '@chakra-ui/react';
import axios from 'axios';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Market from '../artifacts/contracts/Market.sol/Market.json';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import DefaultLayout from '../components/layout/DefaultLayout';
import { marketAddress, nftAddress } from '../config';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      marketAddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState('loaded');
  };

  const buyNft = async (nft) => {
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      marketAddress,
      Market.abi,
      signer
    );
    const price = ethers.utils.formatUnits(nft.price.toString(), 'ether');

    const transaction = await marketContract.createMarketSale(
      nftAddress,
      nft.tokenId,
      { value: price }
    );
    await transaction.wait();
    loadNFTs();
  };
  if (loadingState === 'loaded' && !nfts.length)
    return (
      <DefaultLayout>
        <Heading as='h1' paddingX='20' paddingY='10' fontSize='3xl'>
          No items in marketplace
        </Heading>
      </DefaultLayout>
    );
  return (
    <DefaultLayout>
      <Flex justifyContent='center' padding='5'>
        <Box as='div' maxWidth='1600px'>
          <Grid templateColumns='repeat(5, 1fr)' gap={6}>
            {nfts.map((nft, i) => (
              <Box key={i} as='div'>
                <Img src={nft.image} alt={nft.name} />
                <Box as='div' padding='4' w='100%' h='10'>
                  <Text as='span'>{nft.name}</Text>
                </Box>
                <Box as='div' overflow='hidden'>
                  <Text as='p'>{nft.description}</Text>
                </Box>
                <Box padding='5' backgroundColor='blackAlpha.900'>
                  <Text as='p' color='whiteAlpha.900'>{nft.price}</Text>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>
      </Flex>
    </DefaultLayout>
  );
}
