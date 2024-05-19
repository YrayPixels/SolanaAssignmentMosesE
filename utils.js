const { createCreateMetadataAccountV3Instruction } = require("@metaplex-foundation/mpl-token-metadata");
const { createMint, createAccount, getOrCreateAssociatedTokenAccount, getMint, mintTo, getAssociatedTokenAddressSync, transfer } = require("@solana/spl-token");
const { Connection, clusterApiUrl, Keypair, Transaction, SystemProgram, PublicKey, sendAndConfirmTransaction } = require("@solana/web3.js");
const fs = require('fs');
const { get } = require("http");

const connection = new Connection(clusterApiUrl("devnet"));
const payerT = JSON.parse(fs.readFileSync('Tok5cACp9PakSuP7qivY5VyDrvk4LXTFcJYMrG6pTts.json'))
const payer = Keypair.fromSecretKey(Uint8Array.from(payerT))

const tokenT = JSON.parse(fs.readFileSync('MeRScrk9zGLsG5B9o3TEFHZFRWsoPhCXniYcbwskHiK.json'))
const tokenKeyPair = Keypair.fromSecretKey(Uint8Array.from(tokenT))



async function createToken() {

    const tokenMintAddress = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        9,
        tokenKeyPair);

    console.log(tokenMintAddress);
}

// createToken();

async function createMetaData() {
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    const metadataData = {
        name: "Moses Erhinyodavwe Abuja Token",
        symbol: "MEKL",
        // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
        uri: "https://media.licdn.com/dms/image/D4D03AQE2X6963bFGHQ/profile-displayphoto-shrink_200_200/0/1690459995210?e=1721865600&v=beta&t=ZCIw0qWPkimR9Z1IRQr_lnc3Lm1LH6z6p8Lp0ZgPYjg",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
    };


    const metadataPDAAndBump = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            tokenKeyPair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    const metadataPDA = metadataPDAAndBump[0];

    const transaction = new Transaction();

    const createMetadataAccountInstruction =
        createCreateMetadataAccountV3Instruction(
            {
                metadata: metadataPDA,
                mint: tokenKeyPair.publicKey,
                mintAuthority: payer.publicKey,
                payer: payer.publicKey,
                updateAuthority: payer.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    collectionDetails: null,
                    data: metadataData,
                    isMutable: true,
                },
            }
        );

    transaction.add(createMetadataAccountInstruction);

    const transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer]
    );


    console.log(transactionSignature)
}

async function mintTokens() {

    const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 9);

    let amount = 5 * MINOR_UNITS_PER_MAJOR_UNITS;

    let mint = tokenKeyPair.publicKey;

    const submissionAddress = new PublicKey('AJ8ie8RZYczr7L5g9trHvKhkSgyapTyVSLRWGDEEygjN')
    // const ata = await getOrCreateAssociatedTokenAccount(connection, payer, submissionAddress, payer.publicKey)

    const ata = getAssociatedTokenAddressSync(tokenKeyPair.publicKey, submissionAddress)

    console.log(ata.toBase58())

    // return;

    const tokenMinted = await mintTo(
        connection,
        payer,
        mint,
        ata,
        payer.publicKey,
        amount,
    )

    console.log(tokenMinted);
}


async function transferToken() {

    const submissionAddress = new PublicKey('AJ8ie8RZYczr7L5g9trHvKhkSgyapTyVSLRWGDEEygjN')
    // const ata = await getOrCreateAssociatedTokenAccount(connection, payer, submissionAddress, payer.publicKey)

    const fromTokenAccount = getAssociatedTokenAddressSync(tokenKeyPair.publicKey, payer.publicKey);

    const ataSubmissionAddress = getAssociatedTokenAddressSync(tokenKeyPair.publicKey, submissionAddress)


    const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 9);

    let amount = 2 * MINOR_UNITS_PER_MAJOR_UNITS;
    // Transfer tokens to the buyer's token account


    signature = await transfer(
        connection,
        payer,
        fromTokenAccount,
        ataSubmissionAddress,
        payer,
        amount
    );

    console.log(`Issuing ${amount} MEKL tokens to ${submissionAddress.toBase58()}`);
}

