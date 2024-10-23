"use client";
import React, { useContext, useEffect, useState } from "react";

import { Navbar, NavbarContent, NavbarItem, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/react";
import {
    AddressPurpose,
    BitcoinNetworkType,
    getAddress,
    signMessage,
} from "sats-connect";
import WalletContext from "../contexts/WalletContext";
import { WalletTypes, SIGN_MESSAGE } from "../utils/utils";
import Notiflix from "notiflix";
import { toast } from "react-toastify";
import WalletConnectIcon from "./Icon/WalletConnectIcon";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [hash, setHash] = useState('');

    const {
        walletType,
        ordinalAddress,
        paymentAddress,
        paymentPublicKey,
        ordinalPublicKey,
        setWalletType,
        setOrdinalAddress,
        setPaymentAddress,
        setPaymentPublicKey,
        setOrdinalPublicKey,
    } = useContext(WalletContext);
    const unisatConnectWallet = async () => {
        try {
            const currentWindow: any = window;
            if (typeof currentWindow?.unisat !== "undefined") {
                const unisat: any = currentWindow?.unisat;
                try {
                    let accounts: string[] = await unisat.requestAccounts();
                    let pubkey = await unisat.getPublicKey();

                    let res = await unisat.signMessage(SIGN_MESSAGE);
                    setHash(res);

                    Notiflix.Notify.success("Connect succes!");
                    setWalletType(WalletTypes.UNISAT);
                    setOrdinalAddress(accounts[0] || "");
                    setPaymentAddress(accounts[0] || "");
                    setOrdinalPublicKey(pubkey);
                    setPaymentPublicKey(pubkey);

                    onClose();
                } catch (e) {
                    Notiflix.Notify.failure("Connect failed!");
                }
            }
        } catch (error) {
            console.log("unisatConnectWallet error ==> ", error);
        }
    };

    const xverseConnectWallet = async () => {
        try {
            await getAddress({
                payload: {
                    purposes: [
                        AddressPurpose.Ordinals,
                        AddressPurpose.Payment,
                        AddressPurpose.Stacks,
                    ],
                    message: "Welcome RuneX",
                    network: {
                        type: BitcoinNetworkType.Testnet,
                    },
                },
                onFinish: async (response) => {
                    const paymentAddressItem = response.addresses.find(
                        (address) => address.purpose === AddressPurpose.Payment
                    );
                    const ordinalsAddressItem = response.addresses.find(
                        (address) => address.purpose === AddressPurpose.Ordinals
                    );

                    await signMessage({
                        payload: {
                            network: {
                                type: BitcoinNetworkType.Testnet,
                            },
                            address: paymentAddressItem?.address as string,
                            message: "Sign in RuneX",
                        },
                        onFinish: (response: any) => {
                            return response;
                        },
                        onCancel: () => alert("Canceled"),
                    });

                    Notiflix.Notify.success("Connect succes!");
                    setWalletType(WalletTypes.XVERSE);
                    setPaymentAddress(paymentAddressItem?.address as string);
                    setPaymentPublicKey(paymentAddressItem?.publicKey as string);
                    setOrdinalAddress(ordinalsAddressItem?.address as string);
                    setOrdinalPublicKey(ordinalsAddressItem?.publicKey as string);
                    onClose();
                },
                onCancel: () => alert("Request canceled"),
            });
            console.log("=====>",
                paymentAddress,
                paymentPublicKey,
                ordinalAddress,
                ordinalPublicKey)
        } catch (error) {
            console.log("xverseConnectWallet error ==> ", error);
        }
    }
    const leatherConnectWallet = async () => {
        try {
            const userAddresses = await (window as any).LeatherProvider?.request("getAddresses");

            const response = await (window as any).LeatherProvider?.request("signMessage", {
                message: "Hello world",
                paymentType: "p2tr",
                network: "testnet",
                account: 0
            });

            console.log("Response:", response);

            // Verify signature
            // try {
            //     const isValid = Verifier.verifySignature(
            //         response.result.address,
            //         response.result.message,
            //         response.result.signature
            //     );

            //     console.log("Signature is valid: ", isValid);
            // } catch (error) {
            //     console.log("Verification error:", error);
            // }
            const usersNativeSegwitAddress = userAddresses.result.addresses.find(
                (address: { type: string }) => address.type === "p2wpkh"
            );
            const usersTaprootAddress = userAddresses.result.addresses.find(
                (address: { type: string }) => address.type === "p2tr"
            );
            console.log(usersNativeSegwitAddress)
            setWalletType(WalletTypes.LEATHER);
            setPaymentAddress(usersNativeSegwitAddress.address as string);
            setPaymentPublicKey(usersNativeSegwitAddress.publicKey as string);
            setOrdinalAddress(usersTaprootAddress.address as string);
            setOrdinalPublicKey(usersTaprootAddress.publicKey as string);

            onClose();
            Notiflix.Notify.success("Connect succes!");
        } catch (error) {
            toast.warn("Please install the leather wallet in your browser");
        }
    };
    return (
        <div className="pl-10 pr-10 shadow-md shadow-[#292b72]  flex gap-3  bg-[#281E35]">
            <Navbar
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
                maxWidth="full"
                height={"80px"}
                className="gap-10 bg-[#281E35]"

            >
                <svg width="307" height="116" viewBox="0 0 307 116" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[150px] h-auto"><g clip-path="url(#clip0_160_654)"><path d="M305.08 68.51C305.08 60.87 302.09 54.04 296.43 48.74C290.85 43.52 283.25 40.88 273.83 40.88C265.82 40.88 258.64 43.48 252.81 48.44V30.4C252.81 27.17 250.94 22.88 245.69 21.39C244.84 21.15 243.86 20.97 242.6 20.82C240.83 20.61 238.37 20.45 235.08 20.34L234.92 20.33H234.76C230.82 20.33 227.84 20.5 225.64 20.83C223.4 21.18 221.65 21.82 220.28 22.62C215.33 20.67 209.8 19.69 203.78 19.69C196.92 19.69 191.15 21.36 186.58 24.65C186.01 24.23 185.36 23.86 184.63 23.54C179.16 20.98 172.89 19.69 165.99 19.69C159.13 19.69 153.36 21.36 148.79 24.65C148.22 24.23 147.57 23.86 146.84 23.54C141.37 20.98 135.1 19.69 128.2 19.69C122.26 19.69 117.14 20.94 112.9 23.41C111.84 22.06 110.85 20.92 110.11 20.06C109.83 19.74 109.59 19.46 109.39 19.22C108.12 16.21 106.12 11.87 104.09 8.31999C103.05 6.50999 101.96 4.81999 100.92 3.60999C100.4 3.00999 99.82 2.43999 99.19 2.04999C98.58 1.66999 97.61 1.27999 96.54 1.62999C93.05 2.78999 89.64 5.43999 87.33 8.49999C85.63 10.75 84.33 13.5 84.29 16.23C81.01 16.27 78.49 17.85 76.74 19.56C75.22 17.67 73.26 15.48 71.23 13.65C69.86 12.42 68.39 11.3 66.94 10.57C65.54 9.85999 63.82 9.33999 62.15 9.89999C57.34 11.5 54.97 16.32 53.88 21.39C52.77 26.56 52.83 32.65 53.4 37.9C53.41 37.98 53.42 38.13 53.43 38.35C53.49 39.3 53.65 41.5 54.15 44.5C50.4 41.47 45.42 40.88 42.19 40.88C37.85 40.88 33.66 42.21 29.72 44.83C26.21 42.24 21.95 40.88 17.28 40.88C13.57 40.88 1.47 42.36 1.47 61.38C1.47 64.81 2.12 67.87 3.39 70.49C4.51 72.79 6.13 74.62 8.07 75.85V103.96C8.07 107.64 10.44 111.88 15.75 113.04C16.55 113.22 17.49 113.35 18.71 113.45C20.53 113.61 23.1 113.73 26.56 113.8H26.66H26.76C30.25 113.8 32.85 113.73 34.71 113.59C36 113.49 37 113.35 37.86 113.15C43.1 111.94 45.44 107.71 45.44 104.05V101.89C46.38 103.31 47.47 104.66 48.69 105.93C53.9 111.36 60.68 114.22 68.27 114.22C74.43 114.22 79.18 112.88 82.82 110.98C86.32 113.13 90.47 114.22 95.2 114.22C98.88 114.22 102.22 112.83 104.87 110.31C105.62 110.9 106.47 111.39 107.41 111.77C108.53 112.23 109.79 112.54 111.36 112.75C113.35 113.02 116.06 113.15 119.63 113.15C123.2 113.15 125.91 113.02 127.9 112.75C129.47 112.54 130.73 112.23 131.85 111.77C135.67 110.21 138.05 106.81 138.05 102.87H139C139 106.8 141.37 110.21 145.2 111.77C146.32 112.23 147.58 112.54 149.15 112.75C151.14 113.02 153.85 113.15 157.42 113.15C160.99 113.15 163.7 113.02 165.69 112.75C167.26 112.54 168.52 112.23 169.64 111.77C173.46 110.21 175.84 106.81 175.84 102.87H176.79C176.79 106.8 179.16 110.21 182.99 111.77C184.11 112.23 185.37 112.54 186.94 112.75C188.93 113.02 191.64 113.15 195.21 113.15C198.78 113.15 201.49 113.02 203.48 112.75C205.05 112.54 206.31 112.23 207.43 111.77C211.25 110.21 213.63 106.81 213.63 102.87L215.43 103.4C215.43 105.4 216.17 111.99 225.66 112.94C227.35 113.11 229.7 113.21 232.83 113.25H232.89H232.95C236.87 113.25 239.79 113.16 241.88 112.98C243.33 112.85 244.46 112.67 245.43 112.42C249.28 111.4 251.37 108.91 252.27 106.37C258.42 111.58 265.8 114.22 274.25 114.22C282.75 114.22 290 112.53 295.81 109.18C298.14 107.94 302.52 104.63 302.52 97.18C302.52 93.73 301.46 90.04 299.29 85.93C302.29 82.43 305.08 76.91 305.08 68.51ZM290.01 87.98C290.01 87.98 290.02 87.97 290.03 87.97C290.04 87.97 290.06 88 290.08 88.01C290.06 88 290.03 87.97 290.01 87.98Z" fill="#2C1D48"></path><path d="M274.26 115.73C266.15 115.73 258.95 113.38 252.84 108.75C251.38 111.27 248.95 113.06 245.83 113.89C244.78 114.17 243.57 114.36 242.03 114.5C239.89 114.69 236.93 114.78 232.96 114.78H232.83C229.66 114.74 227.27 114.64 225.53 114.46C218.95 113.8 215.63 110.44 214.45 106.75C213.37 109.6 211.11 111.92 208.01 113.18C206.77 113.68 205.4 114.03 203.7 114.26C201.64 114.54 198.87 114.67 195.22 114.67C191.58 114.67 188.8 114.53 186.74 114.26C185.04 114.03 183.67 113.69 182.43 113.18C179.63 112.04 177.5 110.02 176.32 107.53C175.15 110.02 173.02 112.04 170.21 113.18C168.97 113.68 167.6 114.03 165.9 114.26C163.84 114.54 161.07 114.67 157.42 114.67C153.77 114.67 151 114.53 148.94 114.26C147.24 114.03 145.87 113.69 144.63 113.18C141.83 112.04 139.7 110.02 138.52 107.53C137.35 110.02 135.22 112.04 132.41 113.18C131.17 113.68 129.8 114.03 128.1 114.26C126.04 114.54 123.27 114.67 119.62 114.67C115.97 114.67 113.2 114.53 111.14 114.26C109.44 114.03 108.07 113.69 106.83 113.18C106.18 112.91 105.56 112.6 104.97 112.23C102.18 114.53 98.82 115.74 95.19 115.74C90.52 115.74 86.34 114.72 82.76 112.71C78.58 114.72 73.71 115.74 68.26 115.74C60.25 115.74 53.11 112.71 47.6 106.98C47.31 106.68 47.02 106.36 46.74 106.05C46.03 109.74 43.3 113.44 38.19 114.62C37.25 114.84 36.18 114.99 34.82 115.09C32.92 115.24 30.28 115.31 26.75 115.31H26.61C23.02 115.23 20.42 115.11 18.56 114.95C17.28 114.84 16.28 114.7 15.41 114.51C9.29 113.17 6.56 108.24 6.56 103.96V76.63C4.68 75.26 3.12 73.38 2.03 71.14C0.7 68.32 0 65.03 0 61.37C0 52.76 2.38 46.51 7.09 42.81C10.89 39.82 15.13 39.37 17.32 39.37C21.91 39.37 26.21 40.63 29.8 43.02C33.73 40.6 37.91 39.37 42.23 39.37C45.06 39.37 48.82 39.78 52.25 41.48C52.09 40.06 52.01 39.02 51.98 38.44C51.97 38.24 51.96 38.12 51.95 38.05C51.27 31.78 51.45 25.75 52.45 21.07C53.89 14.37 57.09 10.01 61.72 8.46999C63.5 7.87999 65.5 8.12999 67.66 9.22999C69.08 9.94999 70.63 11.06 72.28 12.54C74.08 14.16 75.72 15.94 76.97 17.42C78.79 15.99 80.82 15.11 82.96 14.83C83.37 11.88 84.9 9.30999 86.2 7.58999C88.78 4.17999 92.49 1.41999 96.13 0.209993C97.39 -0.210007 98.78 -0.0100069 100.05 0.769993C100.74 1.18999 101.41 1.79999 102.13 2.61999C103.14 3.78999 104.23 5.40999 105.47 7.56999C107.89 11.81 110.03 16.71 110.76 18.42C110.89 18.57 111.03 18.73 111.18 18.91L111.32 19.07C111.84 19.67 112.56 20.51 113.36 21.48C117.59 19.29 122.6 18.19 128.27 18.19C135.39 18.19 141.87 19.53 147.55 22.18C147.99 22.37 148.42 22.59 148.84 22.84C153.53 19.75 159.31 18.19 166.05 18.19C173.17 18.19 179.65 19.53 185.33 22.18C185.77 22.37 186.2 22.59 186.62 22.84C191.31 19.75 197.1 18.19 203.83 18.19C209.76 18.19 215.26 19.13 220.22 20.97C221.73 20.2 223.49 19.65 225.46 19.35C227.73 19 230.79 18.83 234.81 18.83L235.18 18.84C238.51 18.96 241.01 19.12 242.82 19.33C244.15 19.49 245.21 19.68 246.14 19.95C252.2 21.66 254.35 26.65 254.35 30.4V45.38C259.98 41.44 266.66 39.38 273.87 39.38C283.68 39.38 291.63 42.16 297.49 47.64C303.46 53.23 306.62 60.44 306.62 68.5C306.62 75.53 304.77 81.46 301.12 86.13C303.1 90.11 304.07 93.74 304.07 97.19C304.07 105.62 298.82 109.32 296.57 110.51C290.53 113.97 283.02 115.73 274.26 115.73ZM251.59 103.83L253.25 105.24C259.12 110.21 266.19 112.73 274.26 112.73C282.49 112.73 289.49 111.1 295.07 107.89C297.32 106.69 301.02 103.75 301.02 97.19C301.02 93.98 300.02 90.53 297.96 86.65L297.48 85.75L298.14 84.98C301.74 80.76 303.57 75.21 303.57 68.51C303.57 61.3 300.74 54.84 295.39 49.84C290.1 44.89 282.85 42.39 273.82 42.39C266.25 42.39 259.32 44.88 253.78 49.59L251.31 51.69V30.4C251.31 27.7 249.73 24.09 245.28 22.84C244.5 22.62 243.6 22.45 242.42 22.32C240.69 22.12 238.27 21.96 235.02 21.85L234.86 21.84H234.75C230.89 21.84 227.98 22 225.86 22.33C223.98 22.62 222.36 23.16 221.03 23.93L220.4 24.3L219.72 24.03C214.95 22.15 209.58 21.2 203.77 21.2C197.26 21.2 191.77 22.77 187.45 25.88L186.57 26.52L185.69 25.88C185.19 25.51 184.63 25.2 184.04 24.94C178.72 22.46 172.66 21.21 165.99 21.21C159.48 21.21 153.98 22.78 149.67 25.89L148.79 26.53L147.91 25.89C147.41 25.52 146.85 25.21 146.26 24.95C140.94 22.47 134.88 21.22 128.21 21.22C122.56 21.22 117.67 22.4 113.67 24.73L112.54 25.39L111.73 24.36C110.67 23.01 109.66 21.84 108.99 21.06L108.86 20.9C108.63 20.64 108.43 20.41 108.26 20.2L108.11 20.03L108.02 19.82C107.42 18.39 105.25 13.37 102.8 9.07999C101.68 7.11999 100.67 5.60999 99.8 4.60999C99.3 4.02999 98.83 3.59999 98.41 3.34999C97.9 3.02999 97.43 2.93999 97.02 3.07999C93.93 4.10999 90.76 6.47999 88.54 9.42999C86.8 11.73 85.83 14.16 85.8 16.28L85.78 17.74L84.32 17.76C81.94 17.79 79.75 18.76 77.8 20.66L76.62 21.81L75.59 20.52C73.84 18.35 71.94 16.31 70.24 14.79C68.79 13.49 67.45 12.53 66.27 11.93C64.85 11.21 63.62 11.01 62.63 11.34C59.02 12.54 56.57 16.04 55.35 21.72C54.41 26.1 54.25 31.8 54.9 37.76C54.91 37.86 54.92 38.02 54.94 38.24C55 39.18 55.15 41.32 55.65 44.27L56.31 48.17L53.23 45.68C49.69 42.82 44.81 42.39 42.21 42.39C38.17 42.39 34.26 43.64 30.58 46.09L29.7 46.67L28.85 46.04C25.61 43.65 21.62 42.38 17.3 42.38C4.39 42.38 3 55.66 3 61.37C3 64.57 3.6 67.41 4.77 69.82C5.75 71.83 7.18 73.48 8.9 74.57L9.6 75.01V103.95C9.6 107.03 11.61 110.58 16.1 111.57C16.84 111.73 17.72 111.85 18.87 111.96C20.66 112.12 23.2 112.23 26.63 112.31H26.73C30.24 112.31 32.81 112.24 34.63 112.1C35.84 112.01 36.77 111.88 37.56 111.7C41.99 110.68 43.98 107.13 43.98 104.07V96.95L46.73 101.07C47.63 102.42 48.67 103.71 49.81 104.9C54.74 110.03 61.13 112.73 68.31 112.73C73.59 112.73 78.26 111.7 82.17 109.66L82.92 109.27L83.64 109.71C86.9 111.71 90.8 112.73 95.23 112.73C98.48 112.73 101.47 111.52 103.86 109.23L104.8 108.34L105.82 109.14C106.48 109.65 107.21 110.08 108 110.4C109 110.81 110.14 111.09 111.58 111.28C113.5 111.54 116.14 111.67 119.65 111.67C123.16 111.67 125.8 111.54 127.72 111.28C129.16 111.08 130.3 110.8 131.3 110.4C134.55 109.08 136.56 106.2 136.56 102.89V101.39H140.51V102.89C140.51 106.2 142.53 109.08 145.77 110.4C146.77 110.81 147.91 111.09 149.35 111.28C151.27 111.54 153.91 111.67 157.42 111.67C160.93 111.67 163.57 111.54 165.49 111.28C166.93 111.08 168.07 110.8 169.07 110.4C172.32 109.08 174.33 106.2 174.33 102.89V101.39H178.28V102.89C178.28 106.2 180.3 109.08 183.54 110.4C184.54 110.81 185.68 111.09 187.12 111.28C189.04 111.54 191.68 111.67 195.19 111.67C198.7 111.67 201.34 111.54 203.26 111.28C204.7 111.08 205.84 110.8 206.84 110.4C210.09 109.08 212.1 106.2 212.1 102.89V100.88L216.9 102.3V103.42C216.9 105.57 217.77 110.67 225.78 111.47C227.43 111.64 229.74 111.73 232.82 111.77C232.84 111.77 232.86 111.77 232.88 111.77C236.82 111.77 239.68 111.68 241.72 111.5C243.08 111.38 244.13 111.21 245.01 110.98C248.67 110.01 250.19 107.67 250.82 105.88L251.59 103.83Z" fill="white"></path><path d="M37.58 105.42C37.58 105.92 34.35 106.17 27.89 106.17C21.43 106.03 18.2 105.74 18.2 105.32V69.97H15.33C14.19 69.97 13.29 69.28 12.62 67.89C11.95 66.51 11.61 64.79 11.61 62.73C11.61 55.07 13.88 51.23 18.42 51.23C21.61 51.23 24.27 52.21 26.4 54.16C28.53 56.11 29.59 58.33 29.59 60.81C31.08 57.9 33.08 55.58 35.6 53.84C38.12 52.1 40.69 51.23 43.32 51.23C47.44 51.23 49.92 52.29 50.77 54.42C50.98 54.99 51.09 55.82 51.09 56.92C51.09 58.02 50.75 59.99 50.08 62.83C49.4 65.67 48.71 67.73 48 69C47.29 70.28 46.86 70.92 46.72 70.92C46.58 70.92 45.92 70.65 44.75 70.12C43.58 69.59 42.53 69.32 41.61 69.32C38.91 69.32 37.57 71.45 37.57 75.71V105.42H37.58Z" fill="white"></path><path d="M61 66.88C59.01 63.33 58.02 60.44 58.02 58.2C58.02 55.96 58.62 54.53 59.83 53.89C63.87 52.12 69.43 51.23 76.49 51.23C83.55 51.23 88.53 52.88 91.45 56.18C94.36 59.48 95.81 64.36 95.81 70.82V87.64H99.43C100.64 87.64 101.58 88.35 102.25 89.77C102.92 91.19 103.26 93.14 103.26 95.62C103.26 98.1 102.64 100.55 101.4 102.96C100.16 105.37 98.47 106.58 96.34 106.58C92.51 106.58 89.42 105.55 87.08 103.49C86.02 102.64 85.2 101.61 84.63 100.4C81.37 104.52 76.29 106.57 69.41 106.57C64.23 106.57 59.87 104.73 56.32 101.03C52.77 97.34 51 92.98 51 87.94C51 76.37 57.92 70.59 71.76 70.59H77.61V69.53C77.61 67.69 77.31 66.5 76.71 65.96C76.11 65.43 74.7 65.16 72.51 65.16C69.79 65.18 65.96 65.75 61 66.88ZM69.51 86.47C69.51 88.03 69.94 89.22 70.79 90.04C71.64 90.86 72.72 91.26 74.04 91.26C75.35 91.26 76.54 90.73 77.61 89.66V81.46H74.63C71.21 81.47 69.51 83.13 69.51 86.47Z" fill="white"></path><path d="M111.34 66.46H106.12C105.06 66.46 104.52 64.1 104.52 59.38C104.52 54.66 105.05 52.3 106.12 52.3H111.34V49.96C111.34 42.44 112.92 37.24 116.08 34.37C119.24 31.5 123.65 30.06 129.33 30.06C135.01 30.06 140.01 31.09 144.34 33.15C144.91 33.36 145.19 34.13 145.19 35.44C145.19 36.75 144.59 38.86 143.38 41.77C142.17 44.68 141.14 46.35 140.29 46.77C137.88 45.28 135.39 44.54 132.84 44.54C130.07 44.54 128.69 46.39 128.69 50.07V52.31H137.52C138.8 52.31 139.44 54.58 139.44 59.12C139.44 64.09 138.62 66.57 136.99 66.57H130.18V104.25C130.18 105.1 127.04 105.53 120.76 105.53C114.48 105.53 111.34 105.1 111.34 104.25V66.46V66.46Z" fill="#F28C43"></path><path d="M149.13 66.46H143.91C142.85 66.46 142.31 64.1 142.31 59.38C142.31 54.66 142.84 52.3 143.91 52.3H149.13V49.96C149.13 42.44 150.71 37.24 153.87 34.37C157.03 31.5 161.44 30.06 167.12 30.06C172.8 30.06 177.8 31.09 182.13 33.15C182.7 33.36 182.98 34.13 182.98 35.44C182.98 36.75 182.38 38.86 181.17 41.77C179.96 44.68 178.93 46.35 178.08 46.77C175.67 45.28 173.18 44.54 170.63 44.54C167.86 44.54 166.48 46.39 166.48 50.07V52.31H175.31C176.59 52.31 177.23 54.58 177.23 59.12C177.23 64.09 176.41 66.57 174.78 66.57H167.97V104.25C167.97 105.1 164.83 105.53 158.55 105.53C152.27 105.53 149.13 105.1 149.13 104.25V66.46V66.46Z" fill="#F28C43"></path><path d="M186.92 66.46H181.7C180.64 66.46 180.1 64.1 180.1 59.38C180.1 54.66 180.63 52.3 181.7 52.3H186.92V49.96C186.92 42.44 188.5 37.24 191.66 34.37C194.82 31.5 199.23 30.06 204.91 30.06C210.59 30.06 215.59 31.09 219.92 33.15C220.49 33.36 220.77 34.13 220.77 35.44C220.77 36.75 220.17 38.86 218.96 41.77C217.75 44.68 216.72 46.35 215.87 46.77C213.46 45.28 210.97 44.54 208.42 44.54C205.65 44.54 204.27 46.39 204.27 50.07V52.31H213.1C214.38 52.31 215.02 54.58 215.02 59.12C215.02 64.09 214.2 66.57 212.57 66.57H205.76V104.25C205.76 105.1 202.62 105.53 196.34 105.53C190.06 105.53 186.92 105.1 186.92 104.25V66.46V66.46Z" fill="#F28C43"></path><path d="M244.93 104.67C244.93 105.31 241.31 105.63 234.07 105.63C228.39 105.56 225.55 105.28 225.55 104.78V32.29C225.55 31.23 228.99 30.69 235.88 30.69C241.91 30.9 244.93 31.26 244.93 31.75V104.67Z" fill="white"></path><path d="M292.61 102.65C288.14 105.28 282.39 106.59 275.37 106.59C268.35 106.59 262.42 104.19 257.59 99.4C252.76 94.61 250.35 87.98 250.35 79.5C250.35 71.02 252.67 64.19 257.32 59.01C261.97 53.83 267.84 51.24 274.94 51.24C282.04 51.24 287.52 53.05 291.39 56.67C295.26 60.29 297.19 64.69 297.19 69.87C297.19 81.37 290.59 87.11 277.39 87.11H270.05C270.05 89.24 270.63 90.71 271.81 91.53C272.98 92.35 274.7 92.75 276.97 92.75C281.94 92.75 286.66 91.62 291.13 89.34C291.2 89.27 291.52 89.77 292.09 90.83C293.79 93.88 294.64 96.45 294.64 98.55C294.63 100.64 293.96 102.01 292.61 102.65ZM279.31 71.89C279.31 68.91 277.85 67.42 274.95 67.42C273.6 67.42 272.45 67.83 271.49 68.64C270.53 69.46 270.05 70.65 270.05 72.21V75.51H275.8C278.13 75.5 279.31 74.3 279.31 71.89Z" fill="white"></path></g><defs><clipPath id="clip0_160_654"><rect width="306.58" height="115.73" fill="white"></rect></clipPath></defs></svg>
                <NavbarContent justify="end" className="gap-10 bg-[#281E35]">
                    <NavbarItem>
                        <Button
                            color="warning"
                            variant="solid"
                            onPress={() => onOpen()}
                            className="  capitalize bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg h-[50px] font-medium text-lg"
                        >
                            <WalletConnectIcon />
                            {paymentAddress ? <p className="truncate w-28">{paymentAddress}</p> : 'Connect Wallet'}
                        </Button>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
            <Modal
                backdrop='blur'
                isOpen={isOpen}
                onClose={onClose}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                duration: 0.3,
                                ease: "easeOut",
                            },
                        },
                        exit: {
                            y: -20,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn",
                            },
                        }
                    }
                }}
                classNames={{
                    body: "py-6",
                    // backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                    base: "border-[#292f46] bg-[#3e3966] dark:bg-[#3e3966] text-[#a8b0d3]",
                    header: "border-b-[2px] border-[#292f46]",
                    footer: "border-t-[1px] border-[#292f46]",
                    closeButton: "hover:bg-white/5 active:bg-white/10",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-center text-white">Connect Wallet</ModalHeader>
                            <ModalBody>
                                <div className="p-2 pb-10 ">
                                    <div className="  flex flex-col gap-5 justify-center items-center">
                                        <Button onClick={() => unisatConnectWallet()} color="primary" variant="bordered" className="w-[200px]">
                                            Unisat Wallet Connect
                                        </Button>
                                        <Button onClick={() => xverseConnectWallet()} color="success" variant="bordered" className="w-[200px]">
                                            XVerse Wallet Connect
                                        </Button>
                                        <Button onClick={() => leatherConnectWallet()} color="warning" variant="bordered" className="w-[200px]">
                                            Leather Wallet Connect
                                        </Button>
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}
export default Header;