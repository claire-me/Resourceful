import { ethers } from "ethers";
import Router from "next/router";
import { useState, useEffect } from "react";

import abi from "../utils/Resources.json";

const style = {
	createResourceTitle: `text-[2rem] m-4 text-[#f5f5f5] text-center`,
	resourceLink: `text-[#6b21a8] underline`,
	addResourceButton: `border border-[#f5f5f5] mt-2 push rounded-lg bg-[#f5f5f5] p-[0.8rem] text-xl font-semibold`,
	resourcesWrapper: ` justify-center items-center  h-screen w-screen`,
	resourcesList: `flex flex-wrap text-white justify-center items-center`,
	walletConnectWrapper: `flex flex-col justify-center items-center h-screen w-screen bg-[#262e3f]  `,
	button: `border border-[#f5f5f5] bg-[#f5f5f5] p-[0.8rem] text-xl font-semibold rounded-lg cursor-pointer`,
	details: `text-lg text-center text=[#282b2f] font-semibold`,
};

export default function Create() {
	const [ethereum, setEthereum] = useState(undefined);
	const [connectedAccount, setConnectedAccount] = useState(undefined);
const [mining, setMining] = useState(false);
const [resourcesLoading, setResourcesLoading] = useState(false);
	const [title, setTitle] = useState('');
	const [url, setUrl] = useState('');
	const [description, setDescription] = useState("");

	const contractAddress = "0xEB40026995Bf7E7734F864e75329fB5Be65d84cF";
	const contractABI = abi.abi;

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
    useEffect(() => { getConnectedAccount(), [] });

	const connectAccount = async () => {
		if (!ethereum) {
			alert("MetaMask is required to connect an account");
			return;
		}

		const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		handleAccounts(accounts);
	};

	if (!ethereum) {
		return <p>Please install MetaMask to connect to this site</p>;
	}

	if (!connectedAccount) {
		return (
			<div className={style.walletConnectWrapper}>
				<div className="top-bg"></div>
				<div className="bottom-bg">
					<div className={style.details}>
						You need Chrome to be
						<br /> able to run this app.
					</div>
					<div class="">
						<button className={style.button} onClick={connectAccount}>
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

		setMining(true);
		try {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const resourcesContract = new ethers.Contract(
				contractAddress,
				contractABI,
				signer
			);

			const createTxn = await resourcesContract.create(
				title, url, description
			);
			console.log("Create transaction started...", createTxn.hash);

			await createTxn.wait();
			console.log("Created resources!", createTxn.hash);

			Router.push("/");
		} finally {
			setMining(false);
		}
	};


	return (
		<div className="flex flex-col justify-center items-center h-screen w-screen">
			<h1 className={style.createResourceTitle}>Create a Resource</h1>

			<form className="w-full max-w-sm bg-[#262e3f] p-5">
				<div className="px-12 pb-10">
					<div className="mb-6">
						<div className="w-full mb-2">
							<label className="text-white text-base">
								Enter resource title:
							</label>
						</div>
						<div className="">
							<input
								type="text"
								placeholder="Learn Web3 Dao"
								required
								className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 "
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
					</div>
					<div className="mb-6">
						<div className="w-full mb-2">
							<label className="text-white text-base">Resource Url:</label>
						</div>
						<div className="">
							<input
								placeholder="learnweb3.io"
								type="text"
								required
								className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
							/>
						</div>
					</div>
					<div className="mb-6">
						<div className="w-full mb-2">
							<label className="text-white text-base">
								Resource Description:
							</label>
						</div>
						<div className="">
							<input
								placeholder="Learn web3 from scratch"
								type="text"
								className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>
					</div>
				</div>
				<div class="md:flex md:items-center">
					<div class="md:w-[6.3rem]"></div>
					<div class="">
						<button
							className="border-[#f5f5f5] bg-[#f5f5f5] p-[0.6rem] font-semibold rounded-lg cursor-pointer"
							type="submit"
							disabled={mining}
							onClick={submitCreate}
						>
							{mining ? "Creating..." : "Create Resource"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
