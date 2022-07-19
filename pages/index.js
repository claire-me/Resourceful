import React from "react";
import Link from 'next/link'
// 0x46517b7794a6ddbcfa28ebe30d5310588389bcd1;
import { useState, useEffect } from "react";
import TipButton from "../components/tipButton";
import abi from '../utils/Resources.json';
import { ethers } from 'ethers'
import addressesEqual from "../utils/addressesEqual";
import { IoPersonCircleOutline } from "react-icons/io";
import data  from '../data'

const style = {
	title: `text-[3rem] text-[#f5f5f5] text-center`,
	resourceLink: `text-[#7fb1a8] underline not-italic`,
	addResourceButton: `border border-[#f5f5f5] mt-2 push rounded-lg bg-[#f5f5f5] p-[0.8rem] text-xl font-semibold`,
	resourcesWrapper: ` justify-center items-center  h-screen w-screen`,
	resourcesList: `flex flex-wrap text-white justify-center items-center`,
	walletConnectWrapper: `flex flex-col justify-center items-center h-screen w-screen`,
	button: `border border-[#f5f5f5] bg-[#f5f5f5] p-[0.8rem] text-xl font-semibold rounded-lg cursor-pointer`,
	details: `text-lg text-center text-[#ffffff] text-[1rem]`,
};

export default function Home() {
  const [ethereum, setEthereum] = useState(undefined);
  const [connectedAccount, setConnectedAccount] = useState(undefined);
  const [resources, setResources] = useState([])
  const [newResource, setNewResource] = useState(); 
	const { ethers } = require("ethers");
	const [resourcesLoading, setResourcesLoading] = useState()
	
  const contractAddress = `0xEB40026995Bf7E7734F864e75329fB5Be65d84cF`;
  const contractABI = abi.abi

  const handleAccounts = (accounts) => {
    if (accounts.length > 0) {
      const account = accounts[0];
      console.log("We have an authorized account: ", account);
      setConnectedAccount(account);
    } else {
      console.log("No authorized accounts yet");
    }
  };

  const getConnectedAccount = async () => {
    if (window.ethereum) {
      setEthereum(window.ethereum);
    }

    if (ethereum) {
      const accounts = await ethereum.request({ method: "eth_accounts" });
      handleAccounts(accounts);
    }
  };
  useEffect(() => {
    getConnectedAccount(), []
  });

 const getResources = async () => {
		if (ethereum && connectedAccount) {
			setResourcesLoading(true);
			try {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const resourcesContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				const resources = await resourcesContract.getResources();
				console.log("Retrieved resources...", resources);

				setResources(resources);
			} finally {
				setResourcesLoading(false);
			}
		}
 };
  useEffect(() => { getResources(), [connectedAccount] });

const connectAccount = async () => {
	if (!ethereum) {
		alert("MetaMask is required to connect an account");
		return;
	}

	const accounts = await ethereum.request({ method: "eth_requestAccounts" });
	handleAccounts(accounts);
};


  if (!ethereum) {
    return <p>Please install MetaMask to connect to this site</p>
  }

  if (!connectedAccount) {
    return (
		<div className={style.walletConnectWrapper}>
			<div className='top-bg'></div>
			<div className="bottom-bg">
				   <div className={style.details}>
            You need Chrome to be
            <br /> able to run this app.
          </div>
				<div>
					<button
					className={style.button}
					onClick={connectAccount}
					>
							Connect MetaMask Wallet
					</button>
				</div>
			</div>
		</div>
	);
  }

  const submitCreate = async (e) => {
		e.preventDefault();

		if (!ethereum) {
			console.error("Ethereum object is required to create a keyboard");
			return;
		}

		const provider = new ethers.providers.Web3Provider(ethereum);
		const signer = provider.getSigner();
		const resourcesContract = new ethers.Contract(
			contractAddress,
			contractABI,
			signer
		);

		const createTxn = await resourcesContract.create(newResource);
		console.log("Create transaction started...", createTxn.hash);

		await createTxn.wait();
		console.log("Created keyboard!", createTxn.hash);

		await getResources();
	};

   if (resources.length > 0) {
    return (
			<div className={style.resourcesWrapper}>
				<h1 className={style.title}>Web3 Learning Resources</h1>
				<button type="link" className={style.addResourceButton}>
					<Link href="/create">
						<a>Create Resources</a>
					</Link>
				</button>
				<div className={style.resourcesList}>
					{resources.map((data) => (
						<div className="m-5 shadow p-2">
							<h3 className="text-[1rem]">
								<b>Title:</b> {data.title}
							</h3>
							<Link href={`https://www.${data.url}`}>
								<a>
									<b className="text-white no-underline">Link: </b>
									<em className={style.resourceLink}>{data.url}</em>
								</a>
							</Link>
							<h3>
								<b>Description: </b>
								{data.description}
							</h3>
						</div>
					))}
				</div>
			</div>
		);
   }
  
//   if (resourcesLoading) {
// 		return (
// 			<div className="flex flex-col gap-4">
// 				<button type="link" href="/create">
// 					<Link href="/create">
// 						<a>Create Resources</a>
// 					</Link>
// 				</button>
// 			</div>
// 		);
// 	}


  // No keyboards yet
  return (
		<div className={style.walletConnectWrapper}>
			<div className="top-bg"></div>
			<div className="bottom-bg">
				<div className={style.details}>No Resources yet!</div>
				<Link href="/create" class="">
					<a>
						<button className={style.button}>Create Resources</button>
					</a>
				</Link>
			</div>
		</div>
	);
}
