import React from "react";
import Link from "next/link";
import Head from 'next/head';
// 0x46517b7794a6ddbcfa28ebe30d5310588389bcd1;
import { useState, useEffect } from "react";
import abi from "../utils/Resources.json";
import { ethers } from "ethers";

const style = {
	title: `text-[3rem] text-[#f5f5f5] text-center sm:text-[3rem]`,
	resourceLink: `text-[#7fb1a8] underline not-italic`,
	addResourceButton: `border border-[#f5f5f5] mt-2 push rounded-lg bg-[#f5f5f5] p-[0.8rem] text-xl font-semibold`,
	resourcesWrapper: ` justify-center items-center  h-screen w-screen`,
	resourcesList: `flex flex-wrap text-white justify-center items-center`,
	walletConnectWrapper: `flex flex-col justify-center items-center h-screen w-screen`,
	button: `border border-[#f5f5f5] bg-[#f5f5f5] p-[0.8rem] text-xl font-semibold rounded-lg cursor-pointer`,
	details: `text-lg text-center text-[#ffffff] text-[1rem]`,
};

export default function Home() {
	const [resources, setResources] = useState([]);
	  const [connectedAccount, setConnectedAccount] = useState(undefined);
	const [resourcesLoading, setResourcesLoading] = useState();
	const [ethereum, setEthereum] = useState(undefined);
	const contractAddress = `0xEB40026995Bf7E7734F864e75329fB5Be65d84cF`;
	const contractABI = abi.abi;

	// connect frontend to smart contract
	const createEthereumContract = () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner(
			"0xCcaA18234602311ed50539956897982864096D8f"
		);
		const resourcesContract = new ethers.Contract(
			contractAddress,
			contractABI,
			signer
		);

		return resourcesContract;
	};

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

	//get all resources
	useEffect(() => {
		const getResources = async () => {
			setResourcesLoading(true);
			if (typeof window.ethereum !== "undefined") {
				const resourcesContract = createEthereumContract();
				try {
					const resourcesdata = await resourcesContract.getResources();
					console.log("Retrieved resources...", resources);
					const resources = [...resourcesdata];
					setResources(resources);
				} finally {
					setResourcesLoading(false);
				}
			}
		};
		getResources();
	}, []);

	const connectAccount = async () => {
		if (!ethereum) {
			alert("MetaMask is required to connect an account");
			return;
		}

		const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		handleAccounts(accounts);
	};

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

	// Return all available resources
	return (
		<div>
			<Head>
				<title>Next App</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className={style.resourcesWrapper}>
				<h1 className={style.title}>Web3 Learning Resources</h1>
				<button type="link" className={style.addResourceButton}>
					<Link href="/create">
						<a>Create Resources</a>
					</Link>
				</button>

				<div className={style.resourcesList}>
					{resources.map((data, i) => (
						<div className="m-5 shadow p-2" key={i}>
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
		</div>
	);

	if (resourcesLoading) {
		return (
			<div className="flex flex-col gap-4">
				<button type="link" href="/create">
					<Link href="/create">
						<a>Create Resources</a>
					</Link>
				</button>
			</div>
		);
	}

	// No resources yet
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
