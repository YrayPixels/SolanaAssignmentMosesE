// Import the necessary modules
const anchor = require('@project-serum/anchor');
const web3 = require('@solana/web3.js');

// Connect to the Solana network
const connection = new web3.Connection(web3.clusterApiUrl('devnet'));

// Define the program ID and provider
const programId = new web3.PublicKey('H52i4cUPbh7CUoqafWm6bpTVFnENAJkrSYrrGB5CYifz');
const provider = new anchor.Provider(connection, new web3.Account(), anchor.Provider.defaultOptions());

// Load the program
const todoListApp = anchor.workspace.TodoListApp;

(async () => {
    // Initialize the program client
    const todoListAppClient = new todoListApp(programId, provider);

    // Call the adding_task method
    async function addTask(text) {
        try {
            const tx = await todoListAppClient.addingTask(new anchor.web3.PublicKey('Hzvbm3tYqvPuHfcQkrjTn97gNu5CubTQDZo8zL1Vwncv'), {
                text: text,
            });
            console.log('Transaction successful:', tx);
        } catch (err) {
            console.error('Error adding task:', err);
        }
    }

    // Call the updating_task method
    async function updateTask(isDone) {
        try {
            const tx = await todoListAppClient.updatingTask(new anchor.web3.PublicKey('YOUR_TASK_ACCOUNT_ADDRESS'), {
                isDone: isDone,
            });
            console.log('Transaction successful:', tx);
        } catch (err) {
            console.error('Error updating task:', err);
        }
    }

    // Call the deleting_task method
    async function deleteTask() {
        try {
            const tx = await todoListAppClient.deletingTask(new anchor.web3.PublicKey('YOUR_TASK_ACCOUNT_ADDRESS'));
            console.log('Transaction successful:', tx);
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    }

    // Example usage
    addTask('Complete JavaScript tutorial');
    // updateTask(true);
    // deleteTask();
})();
