import { Button, Flex, Img, Input } from '@chakra-ui/react';
import Onboard from 'bnc-onboard';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import DefaultLayout from '../components/layout/DefaultLayout';
import { marketAddress, nftAddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/Market.sol/Market.json';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

let provider;

const onBoard = Onboard({
  hideBranding: true,
  networkId: 1337,
  networkName: 'local',
  subscriptions: {
    wallet: (wallet) => {
      provider = new ethers.providers.Web3Provider(wallet.provider);
      console.log(`${wallet.name} is now connected`);
    },
  },
});

const CreateItem = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
  });
  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log(
        '🚀 ~ file: create-item.js ~ line 20 ~ onChange ~ error',
        error
      );
    }
  }

  async function createItem() {
    const { name, price, description } = formInput;
    if (!name || !description || !price) return;
    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (error) {
      console.log(
        '🚀 ~ file: create-item.js ~ line 43 ~ createItem ~ error',
        error
      );
    }
  }

  async function createSale(url) {
    const signer = provider.getSigner();
    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);

    let tx = await transaction.wait();

    let event = tx.events[0];
    let value = event.args[2];
    
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, 'ether');

    contract = new ethers.Contract(marketAddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftAddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push('/');
  }
  return (
    <DefaultLayout>
      <Flex justify='center'>
        <Flex as='div' direction='column' paddingBottom='12'>
          <Input
            required
            mt='5'
            placeholder='Asset Name'
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <Input
            required
            mt='5'
            placeholder='Asset Description'
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <Input
            required
            mt='2'
            placeholder='asset price in matic'
            onChange={(e) =>
              updateFormInput({ ...formInput, price: e.target.value })
            }
          />
          <Input required type='file' name='Asset' onChange={onChange} mt='2' mb='2' />
          {fileUrl && <Img margin='4' width='350' src={fileUrl} alt='nft' />}
          <Button onClick={() => createItem()} colorScheme='teal'>
            Create Digital Asset
          </Button>
        </Flex>
      </Flex>
    </DefaultLayout>
  );
};

export default CreateItem;
