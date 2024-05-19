const { createMint, createAccount, getOrCreateAssociatedTokenAccount, getMint, mintTo, getAssociatedTokenAddressSync } = require("@solana/spl-token");
const { Connection, clusterApiUrl, Keypair, Transaction, SystemProgram, PublicKey } = require("@solana/web3.js");
const fs = require('fs')

const connection = new Connection(clusterApiUrl("devnet"));
const secretP = JSON.parse(fs.readFileSync('PmtpZBi6cesxxasCaooQDt3CpAWbYoFP2PGwZMBBN8a.json'))
const payer = Keypair.fromSecretKey(Uint8Array.from(secretP))

const secretT = JSON.parse(fs.readFileSync('Pmp9Txj6VXpGFH8y71qNHfPecXKQCatvveEGoXE5nuo.json'))
const tokenKeyPair = Keypair.fromSecretKey(Uint8Array.from(secretT))

async function createToken() {
    const tokenMintAddress = await createMint(connection, payer, payer.publicKey, payer.publicKey, 9, tokenKeyPair);

    console.log(tokenMintAddress);
}

async function createTokenAcct() {
    const secretP = JSON.parse(fs.readFileSync('PmtpZBi6cesxxasCaooQDt3CpAWbYoFP2PGwZMBBN8a.json'))
    const payer = Keypair.fromSecretKey(Uint8Array.from(secretP))
    const secretT = JSON.parse(fs.readFileSync('Pmp9Txj6VXpGFH8y71qNHfPecXKQCatvveEGoXE5nuo.json'))
    const tokenKeyPair = Keypair.fromSecretKey(Uint8Array.from(secretT))

    const ata = await getOrCreateAssociatedTokenAccount(connection, payer, tokenKeyPair.publicKey, payer.publicKey)
    console.log(ata.address.toBase58())
}

async function mintTokens() {
    const mint = tokenKeyPair.publicKey;
    const ata = getAssociatedTokenAddressSync(tokenKeyPair.publicKey, payer.publicKey)

    const tokenMinted = await mintTo(
        connection,
        payer,
        mint,
        ata,
        payer.publicKey,
        10 * 9
    )
    console.log(tokenMinted)
}

async function checkMintBalance() {
    const mint = new PublicKey('Pmp9Txj6VXpGFH8y71qNHfPecXKQCatvveEGoXE5nuo');
    const mintInfo = await getMint(
        connection,
        mint
    )
    console.log(mintInfo.supply);
}

// mintTokens()
checkMintBalance()


// Define the presale contract
async function presale(solAmount, buyerPublicKey) {

    // Define the rate at which tokens are issued per SOL
    const TOKENS_PER_SOL = 10;
    // Calculate the number of tokens to issue
    const tokenAmount = solAmount * TOKENS_PER_SOL;

    const secretP = JSON.parse(fs.readFileSync('PmtpZBi6cesxxasCaooQDt3CpAWbYoFP2PGwZMBBN8a.json'))
    const mainAcct = Keypair.fromSecretKey(Uint8Array.from(secretP))
    // Transfer SOL to a particular address
    const transaction = Transaction()
    transaction.add(
        SystemProgram.transfer({
            fromPubkey: buyerPublicKey,
            toPubkey: Keypair.fromSecretKey(Uint8Array.from(secretP)).publicKey,
            lamports: LAMPORTS_PER_SOL * Number(solAmount),
        })
    )

    transaction.feePayer = mainAcct.publicKey;
    let blockhashObj = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhashObj.blockhash;

    let signed = await transaction.sign();
    // The signature is generated
    let signature = await connection.sendRawTransaction(signed.serialize());
    // Confirm whether the transaction went through or not
    let confirmed = await connection.confirmTransaction(signature);


    // Implement Solana DEX router API integration here to get the current SOL price


    // Transfer tokens to the buyer's token account
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, mainAcct, mainAcct.publicKey, mainAcct.publicKey);
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, mainAcct, buyerPublicKey, mainAcct.publicKey);

    signature = await transfer(
        connection,
        mainAcct,
        fromTokenAccount.address,
        toTokenAccount.address,
        mainAcct.publicKey,
        50
    );

    console.log(`Issuing ${tokenAmount} tokens to ${buyerPublicKey.toBase58()} for ${solAmount} SOL`);
}

// Example usage
// const solAmount = 5; // Amount of SOL to purchase tokens with
// const buyerPublicKey = new PublicKey('sjLKJEcuR2xmzffbdSocaRD8HsybFZBJrzkLGaVjRVc');
// presale(solAmount, buyerPublicKey);