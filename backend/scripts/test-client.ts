import { ethers } from 'ethers';
import axios from 'axios';

const SERVER_URL = 'http://localhost:3000/protected';

async function main() {
    console.log("1. Requesting protected resource...");
    try {
        await axios.get(SERVER_URL);
    } catch (error: any) {
        if (error.response && error.response.status === 402) {
            console.log("   Received 402 Payment Required.");
            console.log("   Headers:", error.response.headers['www-authenticate']);
            console.log("   Payment Request:", error.response.data);

            // 2. Simulate User Signing
            const wallet = ethers.Wallet.createRandom();
            console.log(`\n2. User (${wallet.address}) authorizing payment...`);

            // Message MUST match what the server expects (from header or convention)
            // In our middleware, we hardcoded "I authorize payment for x402 content"
            // Ideally, we parse standard HTTP 402 headers for the message.
            const message = "I authorize payment for x402 content";
            const signature = await wallet.signMessage(message);

            console.log(`   Signature: ${signature}`);

            // 3. Retry with Authorization
            console.log("\n3. Retrying with Authorization header...");
            try {
                const response = await axios.get(SERVER_URL, {
                    headers: {
                        'Authorization': `x402 ${signature}`
                    }
                });
                console.log("   Success! Response:", response.data);
            } catch (retryError: any) {
                console.error("   Retry failed:", retryError.response ? retryError.response.data : retryError.message);
            }

        } else {
            console.error("   Unexpected error:", error.message);
        }
    }
}

main();
